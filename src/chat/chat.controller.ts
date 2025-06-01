import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getChatHistory(
    @Query('sender') sender: number,
    @Query('receiver') receiver: number,
  ): Promise<Chat[]> {
    if (!sender || !receiver) {
      throw new Error('user1 and user2 are required');
    }

    return this.chatService.getChatHistory(sender, receiver);
  }
}
