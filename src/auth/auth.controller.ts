import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
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
import { S3Service } from '@/s3/s3.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private messageService: MessageService,
    private readonly doctorService: DoctorService,
    private readonly patientService: PatientService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: any,
  ): Promise<AuthDto> {
    try {
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

      // for the image upload profile image
      const profileImage = file ? await this.s3Service.uploadFile(file) : null;
      createUserDto.profileImage = profileImage;

      const user = await this.usersService.create(createUserDto);
      const token = await this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        { expiresIn: '7d' },
      );

      let newUser: any;

      if (createUserDto?.role === 'doctor') {
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
    } catch (error) {
      throw new BadRequestException(error?.message || 'Signup failed!');
    }
  }

  @Post('signin')
  async login(@Body() loginDto: LoginDto): Promise<AuthDto> {
    const user = await this.usersService.findOne(loginDto.email);
    if (!user) {
      throw new BadRequestException('Invalid credentials!');
    }
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
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
