import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { AuthGuard } from '@/common/guards/auth.guard';
import axios from 'axios';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  @UseGuards(AuthGuard)
  async getChatHistory(
    @Query('sender') sender: number,
    @Query('receiver') receiver: number,
  ): Promise<Chat[]> {
    if (!sender || !receiver) {
      throw new Error('user1 and user2 are required');
    }

    return this.chatService.getChatHistory(sender, receiver);
  }

  @Post('gemini')
  async handleChat(
    @Body() body: { messages: { message: string; role: 'user' | 'model' }[] },
  ) {
    const { messages } = body;

    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.message }],
    }));

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyDLhrA9nZh_CVakH06reaQxgodvnQtx5Gs`,
        {
          contents,
          generationConfig: {
            maxOutputTokens: 300, // Roughly ~200 words
            temperature: 0.7,
            topP: 1,
            topK: 40,
          },
        },

        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(reply, '--->>');
      return { reply };
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      throw new HttpException(
        {
          message: 'Failed to generate response',
          error: error.response?.data || error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async handleChat(@Body('message') message: string) {
  //   try {
  //     const response = await axios.post(
  //       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDLhrA9nZh_CVakH06reaQxgodvnQtx5Gs`,
  //       {
  //         contents: [{ role: 'user', parts: [{ text: message }] }],
  //       },

  //     );

  //     const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
  //     return { reply };
  //   } catch (error) {
  //     console.log(error.message);
  //     throw new HttpException(
  //       {
  //         message: 'Failed to generate response',
  //         error: error.message,
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
