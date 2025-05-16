import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dtos/create-message-dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
  ) {}

  async create({ email, otp, expiresAt }) {
    const message = await this.messageRepository.create({
      email,
      otp,
      expiresAt,
    });
    return this.messageRepository.save(message);
  }

  async update(
    email: string,
    otp: string,
    expiresAt: Date,
    isVerified: boolean,
  ) {
    const message = await this.findOne(email);
    if (!message) {
      throw new Error('Message not found');
    }
    message.otp = otp;
    message.expiresAt = expiresAt;
    message.isVerified = isVerified;
    return this.messageRepository.save(message);
  }

  async findOne(email: string) {
    try {
      return await this.messageRepository.findOne({ where: { email } });
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error; // optionally rethrow if you want the error to propagate
    }
  }
  // async findOne(email: string) {

  //   return this.messageRepository.findOne({ where: { email } });
  // }
}
