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
    });
  }

  /** Patients can send message to a doctor */
  @SubscribeMessage('messageToDoctor')
  handleMessageToDoctor(
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
    this.server.to(doctorSocketId).emit('patientMessage', {
      patientId: senderInfo.userId,
      message: data.message,
    });

    // Optionally, confirm to patient that message was sent
    socket.emit('messageSent', { doctorId: data.doctorId });
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
    });
  }
}
