import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}

  async saveMessage(
    senderId: number,
    receiverId: number,
    message: string,
  ): Promise<Chat> {
    const chat = this.chatRepository.create({ senderId, receiverId, message });
    return this.chatRepository.save(chat);
  }

  async getChatHistory(senderId: number, receiverId: number): Promise<Chat[]> {
    return this.chatRepository.find({
      where: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }, // reverse match
      ],
      order: { timestamp: 'ASC' }, // 👈 Oldest to newest
    });
  }
}
