import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
  NotFoundException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@/users/users.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { RoleGuard } from '@/common/guards/role.guard';

@Controller('doctors')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  async getAllDoctors(@Query() query: any): Promise<Doctor[]> {
    const { isApproved } = query;
    return this.doctorService.findAll(isApproved);
  }

  @Post('findByEmail')
  @UseGuards(AuthGuard)
  async findDoctorByEmail(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email must be provided');
    }

    const doctor = await this.doctorService.findDoctorByEmail(email);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      code: 200,
      message: 'Doctor found successfully',
      data: doctor,
      status: true,
    };
  }

  @Get('findByUserId/:id')
  @UseGuards(AuthGuard)
  async getDoctorById(@Param('id') id: number): Promise<Doctor> {
    const doctor = await this.doctorService.findDoctorById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  @Get('with-status')
  async getAllActiveDoctors() {
    return this.doctorService.getAllDoctorsWithStatus();
  }
  @Patch(':doctorId/approve')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('doctor')
  @ApiOperation({ summary: 'Approve or disapprove a doctor' })
  @ApiParam({ name: 'doctorId', example: 1, description: 'ID of the doctor' })
  @ApiResponse({
    status: 200,
    description: 'Doctor approval status updated',
    type: Doctor,
  })
  async updateApproval(@Param('doctorId') doctorId: number) {
    const doctor = await this.doctorService.findOne(doctorId);

    if (!doctor) {
      return {
        code: '404',
        message: 'Doctor not found!',
        data: null,
        status: false,
      };
    }

    this.doctorService.updateApprovalStatus(doctor);

    return {
      code: '200',
      message: 'Doctor Approval successfully!',
      data: doctor,
      status: true,
    };
  }

  @Patch(':doctorId/disapproved')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('doctor')
  async updateDisapproval(@Param('doctorId') doctorId: number) {
    const doctor = await this.doctorService.findOne(doctorId);

    if (!doctor) {
      return {
        code: '404',
        message: 'Doctor not found!',
        data: null,
        status: false,
      };
    }

    this.doctorService.updateDisapproveStatus(doctor);

    return {
      code: '200',
      message: 'Doctor Disapproval successfully!',
      data: doctor,
      status: true,
    };
  }
}
