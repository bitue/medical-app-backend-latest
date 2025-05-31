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

@WebSocketGateway({
  cors: {
    origin: '*', // Allow connections from any origin
  },
})
export class CallGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<
    string,
    { doctorId?: number; callerId?: number }
  >();

  afterInit(server: Server) {
    console.log('Socket.io server initialized');
  }

  handleConnection(socket: Socket) {
    const doctorId = socket.handshake.query.doctorId
      ? Number(socket.handshake.query.doctorId)
      : null;
    const callerId = socket.handshake.query.callerId
      ? Number(socket.handshake.query.callerId)
      : null;

    if (doctorId || callerId) {
      this.activeUsers.set(socket.id, { doctorId, callerId });
      console.log(
        `User connected: DoctorID: ${doctorId}, CallerID: ${callerId}`,
      );
      socket.data.user = callerId;
    }

    // Emit updated user list
    this.server.emit('activeUsers', this.getActiveUsers());
  }

  handleDisconnect(socket: Socket) {
    this.activeUsers.delete(socket.id);
    console.log(`User disconnected: ${socket.id}`);

    // Emit updated user list
    this.server.emit('activeUsers', this.getActiveUsers());
  }

  @SubscribeMessage('getActiveUsers')
  sendActiveUsers(@ConnectedSocket() socket: Socket) {
    socket.emit('activeUsers', Array.from(this.activeUsers.values()));
  }

  @SubscribeMessage('call')
  handleCall(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    const { calleeId, rtcMessage } = data;
    console.log('data', data);

    this.server.to(calleeId).emit('newCall', {
      callerId: socket.data.user,
      rtcMessage,
    });
  }

  @SubscribeMessage('answerCall')
  handleAnswerCall(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const { callerId, rtcMessage } = data;

    this.server.to(callerId).emit('callAnswered', {
      callee: socket.data.user,
      rtcMessage,
    });
  }

  @SubscribeMessage('ICEcandidate')
  handleICECandidate(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const { calleeId, rtcMessage } = data;

    console.log('ICEcandidate data.calleeId', calleeId);
    console.log('socket.user emit', socket.data.user);

    this.server.to(calleeId).emit('ICEcandidate', {
      sender: socket.data.user,
      rtcMessage,
    });
  }

  getActiveDoctors(): Map<number, number | null> {
    const activeDoctors = new Map<number, number | null>();
    this.activeUsers.forEach(({ doctorId, callerId }) => {
      if (doctorId) {
        activeDoctors.set(doctorId, callerId || null);
      }
    });
    return activeDoctors;
  }

  getActiveUsers(): { doctorId?: number; callerId?: number }[] {
    return Array.from(this.activeUsers.values());
  }
}
