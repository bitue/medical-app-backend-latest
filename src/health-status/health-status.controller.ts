import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HealthStatusService } from './health-status.service';
import { PatientService } from 'src/patient/patient.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { HealthStatusCreateDto } from './dto/helth-status-create.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('health-status')
export class HealthStatusController {
  constructor(
    private readonly healthStatusService: HealthStatusService,
    private readonly patientService: PatientService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('patient')
  async createOrUpdateHealthStatus(
    @Body() healthStatusData: HealthStatusCreateDto,
    @CurrentUser() user: User,
  ) {
    try {
      const patient = await this.patientService.findByUserId(user.id);
      if (!patient) {
        throw new BadRequestException('Patient profile not found.');
      }

      console.log('yes');

      const healthStatus =
        await this.healthStatusService.createOrUpdateHealthStatus(
          patient.id,
          healthStatusData,
        );

      return {
        code: 201,
        message: 'Health status saved successfully',
        data: healthStatus,
        status: true,
      };
    } catch (error) {
      console.log(error.message);

      if (error instanceof BadRequestException) {
        throw error;
      }

      // For any other errors, throw an InternalServerErrorException
      throw new InternalServerErrorException('Failed to save health status');
    }
  }
}
