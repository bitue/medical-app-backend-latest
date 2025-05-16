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

  // @Post()
  // @UseGuards(AuthGuard, RoleGuard)
  // @Roles('patient')
  // async create(
  //   @Body() healthStatusData: HealthStatusCreateDto,
  //   @CurrentUser() user: User,
  // ) {
  //   try {
  //     const existingPatient = await this.patientService.findByUserId(user?.id);
  //     const healthStatus =
  //       await this.HealthStatusService.create(healthStatusData);

  //     //  if(!existingPatient){
  //     //    await this.patientService.create({user : user, healthStatus})
  //     //     return {
  //     //      code : '201',
  //     //      message : "Health status data created successfully!",
  //     //      data : healthStatus,
  //     //      status : true,
  //     //     }
  //     //  }
  //     if (!existingPatient) {
  //       throw new BadRequestException(
  //         'Patient  profile not found. Please create Patiend  profile first.',
  //       );
  //     }
  //     await this.patientService.update(existingPatient.id, {
  //       healthStatuses: [...existingPatient.healthStatuses, healthStatus],
  //     });
  //     return {
  //       code: '201',
  //       message: 'Health status data created successfully!',
  //       data: healthStatus,
  //       status: true,
  //     };
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // }

  // @Post()
  // @UseGuards(AuthGuard, RoleGuard)
  // @Roles('patient')
  // async createOrUpdateHealthStatus(
  //   @Body() healthStatusData: HealthStatusCreateDto,
  //   @CurrentUser() user: User,
  // ) {
  //   try {
  //     const existingPatient = await this.patientService.findByUserId(user?.id);
  //     if (!existingPatient) {
  //       throw new BadRequestException(
  //         'Patient profile not found. Please create patient profile first.',
  //       );
  //     }

  //     // Check if patient already has a health status record (assuming one per patient)
  //     let healthStatus = existingPatient.healthStatuses?.[0];

  //     if (healthStatus) {
  //       // Update existing health status
  //       healthStatus = await this.HealthStatusService.update(
  //         healthStatus.id,
  //         healthStatusData,
  //       );
  //     } else {
  //       // Create new health status and associate it with patient
  //       healthStatus = await this.HealthStatusService.create(healthStatusData);
  //       await this.patientService.update(existingPatient.id, {
  //         healthStatuses: [healthStatus],
  //       });
  //     }

  //     return {
  //       code: 201,
  //       message: 'Health status data saved successfully!',
  //       data: healthStatus,
  //       status: true,
  //     };
  //   } catch (err) {
  //     console.error(err.message);
  //     throw new InternalServerErrorException(
  //       'Failed to save health status data.',
  //     );
  //   }
  // }

  // @Post()
  // @UseGuards(AuthGuard, RoleGuard)
  // @Roles('patient')
  // async createOrUpdateHealthStatus(
  //   @Body() healthStatusData: HealthStatusCreateDto,
  //   @CurrentUser() user: User,
  // ) {
  //   const patient = await this.patientService.findByUserId(user.id);
  //   if (!patient) {
  //     throw new BadRequestException('Patient profile not found.');
  //   }

  //   const healthStatus =
  //     await this.healthStatusService.createOrUpdateHealthStatus(
  //       patient.id,
  //       healthStatusData,
  //     );

  //   return {
  //     code: 201,
  //     message: 'Health status saved successfully',
  //     data: healthStatus,
  //     status: true,
  //   };
  // }

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
      // You can log the error here if needed
      // console.error(error);

      // Re-throw known NestJS HTTP exceptions
      if (error instanceof BadRequestException) {
        throw error;
      }

      // For any other errors, throw an InternalServerErrorException
      throw new InternalServerErrorException('Failed to save health status');
    }
  }
}
