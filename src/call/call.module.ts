import { Module } from '@nestjs/common';
import { CallGateway } from './call.gateway';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [CallGateway, ChatGateway],
  exports: [ChatGateway],
})
export class CallModule {}
