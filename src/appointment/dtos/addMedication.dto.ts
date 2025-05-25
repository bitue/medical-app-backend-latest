import { CurrentMedication } from '@/current-medication/current-medication.entity';

import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddMedicationDto {
  @IsNumber()
  @IsNotEmpty()
  appointmentId: number;

  @IsNumber()
  @IsNotEmpty()
  patientId: number;

  @IsNotEmpty()
  medications: CurrentMedication[];
}
