import { ChatService } from '@/chat/chat.service';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgoraService } from './agoraToken';

interface UserInfo {
  userId: number;
  role: 'doctor' | 'patient';
  available?: boolean; // For doctors: toggle availability
}

@WebSocketGateway({
  cors: {
    origin: '*', // letter add app url
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly agoraService: AgoraService,
  ) {}

  @WebSocketServer()
  server: Server;

  // socket.id => UserInfo
  private activeUsers = new Map<string, UserInfo>();

  // userId => socket.id (for quick lookups)
  private userSocketMap = new Map<number, string>();

  afterInit(server: Server) {
    console.log('Socket.io server initialized');
  }

  handleConnection(socket: Socket) {
    // Get role and userId from handshake query
    const role = socket.handshake.query.role as
      | 'doctor'
      | 'patient'
      | undefined;
    const userIdRaw = socket.handshake.query.userId;
    const userId = userIdRaw ? Number(userIdRaw) : null;

    if (!role || !userId) {
      console.log(
        `Connection rejected: missing role or userId - socketId: ${socket.id}`,
      );
      socket.disconnect(true); // disconnect invalid clients
      return;
    }

    // if same userId connection  then disconnect it now

    if (this.userSocketMap.has(userId)) {
      const existingSocketId = this.userSocketMap.get(userId);
      console.log(
        `Duplicate connection attempt: userId ${userId} already connected as socket ${existingSocketId}`,
      );

      socket.emit('error', {
        message: '⚠️ You are already connected from another device.',
      });

      socket.disconnect(true);
      return;
    }

    const userInfo: UserInfo = {
      userId,
      role,
      available: role === 'doctor' ? true : undefined, // Doctors start as available by default (you can change this)
    };

    this.activeUsers.set(socket.id, userInfo);
    this.userSocketMap.set(userId, socket.id);

    socket.data.user = userId;
    socket.data.role = role;
    socket.data.available = userInfo.available;

    console.log(
      `User connected: ${role} with ID ${userId} (socket ${socket.id})`,
    );

    // Emit updated counts and lists to all
    this.emitUserStats();
  }

  handleDisconnect(socket: Socket) {
    const userInfo = this.activeUsers.get(socket.id);
    if (userInfo) {
      this.userSocketMap.delete(userInfo.userId);
      this.activeUsers.delete(socket.id);
      console.log(
        `User disconnected: ${userInfo.role} with ID ${userInfo.userId} (socket ${socket.id})`,
      );
    } else {
      console.log(`Unknown user disconnected (socket ${socket.id})`);
    }

    this.emitUserStats();
  }

  /** Emit stats about online doctors and patients */
  private emitUserStats() {
    const doctors = Array.from(this.activeUsers.values()).filter(
      (u) => u.role === 'doctor' && u.available,
    );
    const patients = Array.from(this.activeUsers.values()).filter(
      (u) => u.role === 'patient',
    );

    // Send counts and list of available doctors to everyone
    this.server.emit('userStats', {
      onlineDoctorsCount: doctors.length,
      onlinePatientsCount: patients.length,
      availableDoctors: doctors.map((d) => ({ doctorId: d.userId })),
      avaiablePatients: patients.map((p) => ({ patientId: p.userId })),
    });
  }

  /** Patients can send message to a doctor */
  @SubscribeMessage('messageToDoctor')
  async handleMessageToDoctor(
    @MessageBody() data: { doctorId: number; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const senderInfo = this.activeUsers.get(socket.id);
    if (!senderInfo || senderInfo.role !== 'patient') {
      socket.emit('error', {
        message: 'Only patients can send messages to doctors.',
      });
      return;
    }

    const doctorSocketId = this.userSocketMap.get(data.doctorId);
    if (!doctorSocketId) {
      socket.emit('error', { message: 'Doctor is not online.' });
      return;
    }

    // Forward the message to the doctor

    //
    this.server.to(doctorSocketId).emit('patientMessage', {
      patientId: senderInfo.userId,
      message: data.message,
    });

    // building logic to save to database here

    await this.chatService.saveMessage(
      senderInfo.userId,
      data.doctorId,
      data.message,
    );

    // Optionally, confirm to patient that message was sent
    socket.emit('messageSent', { doctorId: data.doctorId }); // isMessageSent or not
  }

  /** Doctors can send message reply to a patient */
  @SubscribeMessage('messageToPatient')
  async handleMessageToPatient(
    @MessageBody() data: { patientId: number; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const senderInfo = this.activeUsers.get(socket.id);
    if (!senderInfo || senderInfo.role !== 'doctor') {
      socket.emit('error', {
        message: 'Only doctors can send messages to patients.',
      });
      return;
    }

    const patientSocketId = this.userSocketMap.get(data.patientId);
    if (!patientSocketId) {
      socket.emit('error', { message: 'Patient is not online.' });
      return;
    }

    // Forward the message to the patient
    this.server.to(patientSocketId).emit('doctorMessage', {
      doctorId: senderInfo.userId,
      message: data.message,
    });

    await this.chatService.saveMessage(
      senderInfo.userId,
      data.patientId,
      data.message,
    );

    // Optionally, confirm to doctor that message was sent
    socket.emit('messageSent', { patientId: data.patientId });
  }

  /** Doctor can toggle availability */
  @SubscribeMessage('toggleAvailability')
  handleToggleAvailability(
    @MessageBody() data: { available: boolean },
    @ConnectedSocket() socket: Socket,
  ) {
    const userInfo = this.activeUsers.get(socket.id);
    if (!userInfo || userInfo.role !== 'doctor') {
      socket.emit('error', {
        message: 'Only doctors can toggle availability.',
      });
      return;
    }

    userInfo.available = data.available;
    socket.data.available = data.available;
    this.activeUsers.set(socket.id, userInfo);

    console.log(
      `Doctor ${userInfo.userId} availability set to ${data.available}`,
    );

    this.emitUserStats(); // update all clients about availability change
  }

  /** Optionally, send full user lists on demand */
  @SubscribeMessage('getUserStats')
  sendUserStats(@ConnectedSocket() socket: Socket) {
    const doctors = Array.from(this.activeUsers.values()).filter(
      (u) => u.role === 'doctor' && u.available,
    );
    const patients = Array.from(this.activeUsers.values()).filter(
      (u) => u.role === 'patient',
    );

    socket.emit('userStats', {
      onlineDoctorsCount: doctors.length,
      onlinePatientsCount: patients.length,
      availableDoctors: doctors.map((d) => ({ doctorId: d.userId })),
      availablePatients: patients.map((d) => ({ patientId: d.userId })),
    });
  }

  // ========================AGORA EVENTS ====================================

  @SubscribeMessage('getAgoraToken')
  async handleGetAgoraToken(
    @MessageBody()
    data: {
      channelName: string;
      uid: number;
      role?: 'publisher' | 'subscriber';
    },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!data.channelName || !data.uid) {
        socket.emit('error', { message: 'channelName and uid are required' });
        return;
      }
      // Default role to publisher if not specified
      const role = data.role || 'publisher';
      const token = this.agoraService.generateRtcToken(
        data.channelName,
        data.uid,
        role,
      );
      socket.emit('agoraToken', {
        token,
        channelName: data.channelName,
        uid: data.uid,
      });
    } catch (err) {
      socket.emit('error', {
        message: 'Failed to generate Agora token',
        details: err.message,
      });
    }
  }

  // call singnal

  @SubscribeMessage('callUser')
  handleCallUser(
    @MessageBody() data: { toUserId: number; channelName: string; uid: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const callerInfo = this.activeUsers.get(socket.id);
    if (!callerInfo) {
      socket.emit('error', { message: 'Caller info not found' });
      return;
    }

    const receiverSocketId = this.userSocketMap.get(data.toUserId);
    if (!receiverSocketId) {
      socket.emit('error', { message: 'User is not online' });
      return;
    }

    // Notify the callee about incoming call with channel info  // SERVER SENT EVENTS
    this.server.to(receiverSocketId).emit('incomingCall', {
      fromUserId: callerInfo.userId,
      channelName: data.channelName,
      uid: data.uid,
    });
  }

  @SubscribeMessage('answerCall') //// SERVER SENT EVENTS
  handleAnswerCall(
    @MessageBody() data: { toUserId: number; accepted: boolean },
    @ConnectedSocket() socket: Socket,
  ) {
    const answererInfo = this.activeUsers.get(socket.id);
    if (!answererInfo) {
      socket.emit('error', { message: 'User info not found' });
      return;
    }

    const callerSocketId = this.userSocketMap.get(data.toUserId);
    if (!callerSocketId) {
      socket.emit('error', { message: 'Caller is not online' });
      return;
    }

    this.server.to(callerSocketId).emit('callAnswered', {
      fromUserId: answererInfo.userId,
      accepted: data.accepted,
    });
  }
}
