import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOTPDto {
  @ApiProperty({
    description: 'The OTP That verify email!',
    example: '12345',
  })
  @IsNotEmpty()
  @IsString()
  otp: string;
}