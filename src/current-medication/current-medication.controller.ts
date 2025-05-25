import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentMedicationService } from './current-medication.service';
import { PatientService } from 'src/patient/patient.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateCurrentMedicationDto } from './dtos/create-current-medication.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { DoctorService } from 'src/doctor/doctor.service';
import { AuthGuard } from '@/common/guards/auth.guard';

@Controller('current-medication')
export class CurrentMedicationController {
  constructor(
    private readonly currentMedicationService: CurrentMedicationService,
    private readonly patientService: PatientService,
    private readonly doctorService: DoctorService,
  ) {}

  @Get('patient/:patientId/medications')
  async getMedicationsByPatient(@Param('patientId') patientId: string) {
    return this.currentMedicationService.getMedicationsByPatientId(+patientId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() currentMedicationData: CreateCurrentMedicationDto,
    @CurrentUser() user: User,
  ) {
    try {
      console.log(0);
      const [existingPatient] = await Promise.all([
        this.patientService.findByUserId(user?.id),
      ]);

      if (!existingPatient) {
        throw new BadRequestException('Patient  not found!');
      }

      console.log(1);

      const currentMedication = await this.currentMedicationService.create({
        doses: currentMedicationData?.doses,
        startDate: currentMedicationData?.startDate,
        endDate: currentMedicationData?.endDate,
        isRunning: currentMedicationData.isRunning,
        patient: existingPatient,
        appointment: null,
      });

      await this.patientService.update(existingPatient.id, {
        currentMedications: [
          ...existingPatient?.currentMedications,
          currentMedication,
        ],
      });

      return {
        code: '201',
        message: 'Current medication data created successfully!',
        data: currentMedication,
        status: true,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
