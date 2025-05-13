import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dtos/create-users.dto';
import { User } from 'src/users/users.entity';
import { JwtService } from '@nestjs/jwt';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AuthDto } from './dtos/auth.dto';
import { ApiResponse } from '@nestjs/swagger';
import { LoginDto } from 'src/users/dtos/login.dto';
import * as bcrypt from 'bcryptjs';
import { MessageService } from 'src/message/message.service';
import { DoctorService } from '@/doctor/doctor.service';
import { PatientService } from '@/patient/patient.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private messageService: MessageService,
    private readonly doctorService: DoctorService,
    private readonly patientService: PatientService,
  ) {}

  @Post('signup')
  @ApiResponse({
    status: 201,
    description: 'User successfully signed up.',
    type: AuthDto,
    example: {
      code: 201,
      message: 'User successfully signed up!',
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        email: 'john@example.com',
        username: 'john_doe',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request. User already exists or password confirmation does not match.',
    type: AuthDto,
    example: {
      code: 400,
      message: 'User already exists!',
      data: null,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error. An unexpected error occurred.',
    type: AuthDto,
    example: {
      code: 500,
      message: 'Internal Server Error!',
      data: null,
    },
  })
  async signup(@Body() createUserDto: CreateUserDto): Promise<AuthDto> {
    const existingUser = await this.usersService.findOne(createUserDto.email);

    if (existingUser) {
      throw new BadRequestException('User already exists!');
    }
    if (createUserDto?.password !== createUserDto?.confirmPassword) {
      throw new BadRequestException(
        "Password and confirm password does't match!",
      );
    }

    const data = await this.messageService.findOne(createUserDto.email);

    if (!data || !data.isVerified) {
      throw new BadRequestException('Please verify your email!');
    }

    const user = await this.usersService.create(createUserDto);
    const token = await this.jwtService.signAsync(
      { id: user.id, email: user.email, username: user.username },
      { expiresIn: '7d' },
    );

    let newUser;

    if (createUserDto.role === 'doctor') {
      newUser = await this.doctorService.create({ user: user });
    }

    if (createUserDto?.role === 'patient') {
      newUser = await this.patientService.create({ user: user });
    }

    return {
      code: '201',
      message: 'User successfully signed up.',
      data: {
        token,
        email: user.email,
        username: user.username,
        id: user?.id,
        role: user?.role,
        patientOrDoctorId: newUser?.id,
      },
      status: true,
    };
  }

  @Post('signin')
  @ApiResponse({
    status: 200,
    description: 'User successfully signed up.',
    type: AuthDto,
    example: {
      code: 200,
      message: 'User successfully signed in!',
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        email: 'john@example.com',
        username: 'john_doe',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
    type: AuthDto,
    example: {
      code: 400,
      message: 'Invalid credientials!',
      data: null,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error. An unexpected error occurred.',
    type: AuthDto,
    example: {
      code: 500,
      message: 'Internal Server Error!',
      data: null,
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthDto> {
    const user = await this.usersService.findOne(loginDto.email);
    if (!user) {
      throw new BadRequestException('Invalid credentials!');
    }
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      username: user.username,
    });
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials!');
    }

    let newUser;

    if (user.role === 'doctor') {
      newUser = await this.doctorService.findByUserId(user?.id);
    }

    if (user?.role === 'patient') {
      newUser = await this.patientService.findByUserId(user?.id);
    }
    return {
      code: '200',
      message: 'User successfully sign in!.',
      data: {
        token,
        email: user.email,
        username: user.username,
        id: user?.id,
        role: user?.role,
        patientOrDoctorId: newUser?.id,
      },
      status: true,
    };
  }
}
