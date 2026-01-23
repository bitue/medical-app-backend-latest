import { PartialType } from '@nestjs/swagger';
import { CreateCurrentMedicationDto } from './create-current-medication.dto';

export class UpdateCurrentMedicationDto extends PartialType(
    CreateCurrentMedicationDto,
) { }
