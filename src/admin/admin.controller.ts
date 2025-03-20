import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from '@nestjs/swagger';
import { AuthDto } from '@/auth/dtos/auth.dto';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { LoginDto } from '@/users/dtos/login.dto';
import * as bcrypt from 'bcrypt';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService, private readonly jwtService: JwtService) { }


    @Post('signup')
    @ApiResponse({
        status: 201,
        description: 'Admin successfully signed up.',
        type: AuthDto,
        example: {
            code: 201,
            message: 'Admin successfully signed up!',
            data: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                email: 'john@example.com',
                name: 'john_doe',
            }
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request. User already exists or password confirmation does not match.',
        type: AuthDto,
        example: {
            code: 400,
            message: 'Admin already exists!',
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
    async signup(@Body() createAdminDto: CreateAdminDto) {



        const existingAdmin = await this.adminService.findOne(createAdminDto.email);

        if (existingAdmin) {
            throw new BadRequestException('Admin already exists!');
        }

        const admin = await this.adminService.create(createAdminDto);
        const token = await this.jwtService.signAsync(
            { id: admin.id, email: admin.email, name: admin.name },
            { expiresIn: '7d' }
        );

        return {
            code: '201',
            message: 'Admin successfully Created.',
            data: { token, email: admin.email, name: admin.name, id: admin?.id },
            status: true
        }

    }


    @Post('signin')
    @ApiResponse({
        status: 200,
        description: 'Admin successfully login.',
        type: AuthDto,
        example: {
            code: 200,
            message: 'Admin successfully signed in!',
            data: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                email: 'john@example.com',
                name: 'john_doe',
            }
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
    async login(@Body() loginDto: LoginDto) {
        const admin = await this.adminService.findOne(loginDto.email);
        if (!admin) {
            throw new BadRequestException('Invalid credentials!');
        }
        const token = this.jwtService.sign({ id: admin.id, email: admin.email, name: admin.name });
        const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);

        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials!');
        }

        return {
            code: '200',
            message: 'Admin successfully sign in!.',
            data: { token, email: admin.email, name: admin.name, id: admin?.id },
            status: true
        }
    }

}
