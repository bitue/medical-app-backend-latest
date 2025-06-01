import { Module } from '@nestjs/common';
import { CallGateway } from './call.gateway';
import { ChatGateway } from './chat.gateway';
import { ChatModule } from '@/chat/chat.module';

@Module({
  imports: [ChatModule],
  providers: [CallGateway, ChatGateway],
  exports: [ChatGateway],
})
export class CallModule {}
