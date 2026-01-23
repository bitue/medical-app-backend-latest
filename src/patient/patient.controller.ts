import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './patient.entity';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UpdatePatientDto } from './dtos/update-patient.dto';

@Controller('patient')
export class PatientController {
  constructor(private readonly patentService: PatientService) { }

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

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    const updatedPatient = await this.patentService.update(
      +id,
      updatePatientDto,
    );
    return {
      code: '200',
      message: 'Patient updated successfully',
      data: updatedPatient,
      status: true,
    };
  }
}
