import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dtos/create-message-dto';
import { generateOtp } from './utils/otp.util';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { MoreThan } from 'typeorm';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VerifyOTPDto } from './dtos/verify-otp.dto';
import { UsersService } from 'src/users/users.service';

@Controller('message')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private userService: UsersService,
  ) {}

  @ApiResponse({
    status: 201,
    description: 'Send OTP successfully!.',
    example: {
      code: 201,
      message: 'Send OTP successfully!',
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        email: 'john@example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.Email already exists!',
    example: {
      code: 400,
      message: 'User already exists!',
      data: null,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error. An unexpected error occurred.',
    example: {
      code: 500,
      message: 'Internal Server Error!',
      data: null,
    },
  })
  @Post('send-otp')
  async create(@Body() body: CreateMessageDto) {
    // console.log(body, '---------------------');
    const now = new Date();
    const otp = generateOtp(4);
    console.log(otp);
    const [existingMessage, existingUser] = await Promise.all([
      this.messageService.findOne(body.email),
      this.userService.findOne(body.email),
    ]);

    if (existingUser) {
      throw new BadRequestException('Email already verified!');
    }
    // console.log(1);

    if (existingMessage) {
      await this.messageService.update(
        body.email,
        otp,
        new Date(now.getTime() + 600 * 60 * 1000),
        false,
      );
    } else {
      await this.messageService.create({
        email: body.email,
        otp,
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      });
    }
    console.log('final--');

    this.emailService.sendEmail({
      subject: 'Medical App - Account Verification',
      recipients: [body.email],
      html: `<p>Dear Customer,</p><p>Thank you for choosing MedicalApp.</p><p>You may verify your MedicalApp account using the following OTP:</p><p style="font-size: 24px; font-weight: 700; margin: 10px 0;">${otp}</p><p>Please note, this OTP is valid for the next 10 minutes. For your security, it will expire after this time.</p><p>If you did not request this code, please ignore this message or contact our support team.</p><p>Regards,<br />The MedicalApp Team</p>`,
    });
    const token = await this.jwtService.signAsync(
      { email: body.email, otp },
      { expiresIn: '10m' },
    );
    return {
      message: `Send OTP ${otp} on Your Email!`,
      data: { token, email: body.email },
      code: '200',
      status: true,
    };
  }

  @UseGuards(AuthGuard)
  @Post('verify-otp')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully!.',
    example: {
      code: 201,
      message: 'OTP verified successfully!',
      data: null,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.Invalid OTP. OTP expired!',
    example: {
      code: 400,
      message: 'Invalid OTP!',
      data: null,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error. An unexpected error occurred.',
    example: {
      code: 500,
      message: 'Internal Server Error!',
      data: null,
    },
  })
  async verifyOtp(@Body() body: VerifyOTPDto, @Request() req) {
    console.log('1');
    const otp = req.user.otp;
    console.log(otp, '------------------------------');
    if (otp !== body.otp) {
      throw new BadRequestException('Invlid OTP!');
    }
    const data = await this.messageService.findOne(req.user.email);
    const isExpire = data?.expiresAt < new Date();

    if (isExpire) {
      throw new BadRequestException('OTP Expired!');
    }
    await this.messageService.update(
      data.email,
      data.otp,
      data.expiresAt,
      true,
    );
    return {
      code: '200',
      message: 'OTP verified successfully!',
      data: null,
      status: true,
    };
  }
}
