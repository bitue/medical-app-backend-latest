import { Module } from '@nestjs/common';
import { CallGateway } from './call.gateway';
import { ChatGateway } from './chat.gateway';
import { ChatModule } from '@/chat/chat.module';
import { AgoraService } from './agoraToken';

@Module({
  imports: [ChatModule],
  providers: [CallGateway, ChatGateway, AgoraService],
  exports: [ChatGateway],
})
export class CallModule {}
