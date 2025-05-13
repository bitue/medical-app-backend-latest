import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CurrentMedicationService } from './current-medication.service';
import { PatientService } from 'src/patient/patient.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateCurrentMedicationDto } from './dtos/create-current-medication.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { DoctorService } from 'src/doctor/doctor.service';

@Controller('current-medication')
export class CurrentMedicationController {
  constructor(
    private readonly currentMedicationService: CurrentMedicationService,
    private readonly patientService: PatientService,
    private readonly doctorService: DoctorService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Current medication successfully created.',
    type: CreateCurrentMedicationDto,
    example: {
      code: 201,
      message: 'Current medication data created successfully!',
      data: {
        doctorId: '1',
        doses: [],
        startDate: '2020-01-01',
        endDate: '2023-01-01',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid education data.',
    type: CreateCurrentMedicationDto,
    example: {
      code: 400,
      message: 'Invalid education data!',
      data: null,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error. An unexpected error occurred.',
    type: CreateCurrentMedicationDto,
    example: {
      code: 500,
      message: 'Internal Server Error!',
      data: null,
    },
  })
  async create(
    @Body() currentMedicationData: CreateCurrentMedicationDto,
    @CurrentUser() user: User,
  ) {
    try {
      const [existingPatient, doctor] = await Promise.all([
        this.patientService.findByUserId(user?.id),
        this.doctorService.findOne(currentMedicationData?.doctorId),
      ]);

      if (!doctor) {
        throw new BadRequestException('Doctor not found!');
      }

      const currentMedication = await this.currentMedicationService.create({
        doctor,
        doses: currentMedicationData?.doses,
        startDate: currentMedicationData?.startDate,
        endDate: currentMedicationData?.endDate,
      });

      if (!existingPatient) {
        await this.patientService.create({ user: user, currentMedication });
        return {
          code: '201',
          message: 'Current medication data created successfully!',
          data: currentMedication,
          status: true,
        };
      }
      await this.patientService.update(existingPatient.id, {
        currentMedications: [
          ...existingPatient.currentMedications,
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
