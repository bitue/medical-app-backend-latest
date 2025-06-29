import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from '@nestjs/swagger';
import { AuthDto } from '@/auth/dtos/auth.dto';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { LoginDto } from '@/users/dtos/login.dto';
import * as bcrypt from 'bcryptjs';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  async signup(@Body() createAdminDto: CreateAdminDto) {
    const existingAdmin = await this.adminService.findOne(createAdminDto.email);

    if (existingAdmin) {
      throw new BadRequestException('Admin already exists!');
    }

    const admin = await this.adminService.create(createAdminDto);
    const token = await this.jwtService.signAsync(
      { id: admin.id, email: admin.email, name: admin.name },
      { expiresIn: '7d' },
    );

    return {
      code: '201',
      message: 'Admin successfully Created.',
      data: { token, email: admin.email, name: admin.name, id: admin?.id },
      status: true,
    };
  }

  @Post('signin')
  async login(@Body() loginDto: LoginDto) {
    const admin = await this.adminService.findOne(loginDto.email);
    if (!admin) {
      throw new BadRequestException('Invalid credentials!');
    }
    const token = this.jwtService.sign({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials!');
    }

    return {
      code: '200',
      message: 'Admin successfully sign in!.',
      data: { token, email: admin.email, name: admin.name, id: admin?.id },
      status: true,
    };
  }
}
