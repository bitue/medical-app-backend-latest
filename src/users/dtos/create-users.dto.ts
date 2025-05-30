import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, UserRole } from '../users.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'strongpassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  dob: string;

  @ApiProperty({
    description: 'The confirm password of the user',
    example: 'strongpassword123',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    description: 'The role of the user, either patient or doctor',
    example: 'patient',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(Gender)
  gender: UserRole;
}
