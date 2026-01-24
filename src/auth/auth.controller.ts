import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
    private readonly messageService: MessageService,
    private readonly doctorService: DoctorService,
    private readonly patientService: PatientService,
    private readonly s3Service: S3Service,
  ) { }

  @Post('signup')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
          return callback(
            new BadRequestException('Only JPG and PNG files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async signup(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
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
      let profileImage = null;
      if (file) {
        const uploadResult = await this.s3Service.uploadFile(file);
        profileImage = uploadResult.key;
      }
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
          profileImage: profileImage ? await this.s3Service.getPresignedUrl(profileImage) : null,
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

    // Refresh profile image URL (it might have expired since findOne called at start?)
    // Actually findOne was called at start. Just use that user object.
    // If findOne logic generates URL, user.profileImage has it.

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
        profileImage: user?.profileImage,
        patientOrDoctorId: newUser?.id,
      },
      status: true,
    };
  }
}
