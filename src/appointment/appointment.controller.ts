import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateApprovalDto } from './dtos/appointment.dto';
import { User } from '@/users/users.entity';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AddMedicationDto } from './dtos/addMedication.dto';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('doctor/addMedicationByDoctor')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('doctor')
  async addMedication(@Body() dto: AddMedicationDto) {
    return this.appointmentService.addMedicationByDoctor(dto);
  }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('patient')
  async create(@Body() dto: CreateAppointmentDto) {
    const data = await this.appointmentService.createAppointment(dto);
    console.log(data);
    return {
      code: '201',
      message: 'Appointment created successfully!',
      data,
      status: true,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllAppointments(): Promise<{
    code: number;
    message: string;
    data: Appointment[];
    status: boolean;
  }> {
    const data = await this.appointmentService.getAllAppointments();

    return {
      code: 200,
      message: 'All appointments retrieved successfully!',
      data,
      status: true, // p3572rob 3mimci65
    };
  }

  @Get(':appointmentId')
  @UseGuards(AuthGuard)
  async getAppointmentById(@Param('appointmentId') appointmentId: number) {
    const data =
      await this.appointmentService.getAppointmentById(appointmentId);

    return {
      code: 200,
      message: 'Appointment retrieved successfully!',
      data,
      status: true,
    };
  }

  @Get('patient/:patientId')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('patient')
  async getByPatient(
    @Param('patientId') patientId: number,
  ): Promise<Appointment[]> {
    return this.appointmentService.getAppointmentsByPatient(patientId);
  }

  @Get('doctor/:doctorId')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('doctor')
  async getAppointmentByDoctor(
    @Param('doctorId') doctorId: number,
  ): Promise<Appointment[]> {
    return this.appointmentService.getAppointmentsByDoctor(doctorId);
  }

  @Patch(':appointmentId/approve')
  async updateApproval(
    @Param('appointmentId') appointmentId: number,
    @CurrentUser() user: User,
  ) {
    const appointment = await this.appointmentService.findOne(appointmentId);

    if (!appointment) {
      return {
        code: '404',
        message: 'Appointment not found!',
        data: null,
        status: false,
      };
    }
    this.appointmentService.updateApprovalStatus(appointment);

    return {
      code: '200',
      message: 'Appointment Approval successfully!',
      data: appointment,
      status: true,
    };
  }
}
