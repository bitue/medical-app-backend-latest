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

    // Define the system prompt
    const systemPrompt = {
      role: 'user',
      parts: [
        {
          text:
            "You are a helpful medical assistant. You are setup on a doctor appointment app where hundreds of doctors & hospitals are connected in the same platform. Only answer questions that are related to medicine, health, or healthcare. If a question is not related to medical topics, politely refuse to answer and remind the user that this chat is for medical-related queries only. " +
            "You can also use the following information as context for your answers:\n" +
            "- [Example] For emergencies, call 999 or visit the nearest hospital.\n" +
            "- [Example] We have all kinds of medical specialists.\n" +
            "- [Example] Our doctors are certified.\n" +
            "- [Example] To book an appointment, look for your favorite doctor, press on book doctor, upload your reports and prescriptions (optional), select date & time and hit book appointment. It's done.\n" +
            "- [Example] In emergency cases ask necessary questions and provide instructions.\n" +
            "- [Example] If a patient doesn't know which specialist is good for him/her, ask necessary questions and provide instructions.",
        }
      ]
    };

    let contents = [];

    // If there are no messages, just start with the system prompt
    if (!messages || messages.length === 0) {
      contents = [systemPrompt];
    } else {
      // If the first message is not the system prompt, add it
      // We assume the system prompt is always the first message and has role 'user' and the same text as above
      const firstMessage = messages[0];
      const isSystemPrompt =
        firstMessage.role === 'user' &&
        firstMessage.message &&
        firstMessage.message.startsWith("You are a helpful medical assistant");

      if (!isSystemPrompt) {
        // Prepend the system prompt to the conversation
        contents = [
          systemPrompt,
          ...messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.message }],
          })),
        ];
      } else {
        // If the system prompt is already present, just map the messages
        contents = messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.message }],
        }));
      }
    }

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
