import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
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

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('doctor/addMedicationByDoctor')
  async addMedication(@Body() dto: AddMedicationDto) {
    return this.appointmentService.addMedicationByDoctor(dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment successfully created',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Doctor or Patient not found' })
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
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({
    status: 200,
    description: 'List of all appointments',
    type: [Appointment],
  })
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
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiParam({
    name: 'appointmentId',
    example: 1,
    description: 'ID of the appointment',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment details',
    type: Appointment,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
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
  @ApiOperation({ summary: 'Get all appointments for a specific patient' })
  @ApiParam({ name: 'patientId', example: 2, description: 'ID of the patient' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments',
    type: [Appointment],
  })
  async getByPatient(
    @Param('patientId') patientId: number,
  ): Promise<Appointment[]> {
    return this.appointmentService.getAppointmentsByPatient(patientId);
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get all appointments for a specific doctor' })
  @ApiParam({ name: 'doctorId', example: 1, description: 'ID of the doctor' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments',
    type: [Appointment],
  })
  async getByDoctor(
    @Param('doctorId') doctorId: number,
  ): Promise<Appointment[]> {
    return this.appointmentService.getAppointmentsByDoctor(doctorId);
  }

  @Patch(':appointmentId/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or disapprove an appointment' })
  @ApiParam({
    name: 'appointmentId',
    example: 1,
    description: 'ID of the appointment',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment approval status updated',
    type: Appointment,
  })
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
