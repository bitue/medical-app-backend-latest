import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from './email.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[TypeOrmModule.forFeature([Message]), UsersModule],
  controllers: [MessageController],
  providers: [MessageService, EmailService],
  exports : [MessageService]
})
export class MessageModule {}
