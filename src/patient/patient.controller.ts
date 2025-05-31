import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Patient } from './patient.entity';
import { AuthGuard } from '@/common/guards/auth.guard';

@Controller('patient')
export class PatientController {
  constructor(private readonly patentService: PatientService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllPatients(): Promise<Patient[]> {
    return this.patentService.findAll();
  }

  @Get('findByUserId/:id')
  @UseGuards(AuthGuard)
  async getAllPatientById(@Param('id') id: number): Promise<Patient> {
    return this.patentService.findByUserId(id);
  }

  @Post('getPatientByEmail')
  @UseGuards(AuthGuard)
  async getPatientByEmail(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email must be provided');
    }

    const data = await this.patentService.findPatientByEmail(email);

    if (!data) {
      throw new NotFoundException('Patient not found');
    }

    return {
      code: 200,
      message: 'Patient retrieved successfully!',
      data,
      status: true,
    };
  }
}
