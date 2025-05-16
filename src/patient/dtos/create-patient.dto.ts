import { User } from '@/users/users.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CurrentMedication } from 'src/current-medication/current-medication.entity';
import { HealthStatus } from 'src/health-status/health-status.entity';
import { OperationHistory } from 'src/operation-history/operation-history.entity';

export class CreatePatientDto {
  @ApiProperty({
    description: 'The ID of the user associated with the patient',
    example: 1,
  })
  user: User;

  @ApiProperty({
    description: 'currentMedication record associated with the patient',
    type: CurrentMedication,
  })
  currentMedication: CurrentMedication;

  @ApiProperty({
    description: 'operationHistory record associated with the patient',
    type: CurrentMedication,
  })
  operationHistory: OperationHistory;

  @ApiProperty({
    description: 'healthStatus record associated with the patient',
    type: HealthStatus,
  })
  healthStatus: HealthStatus;
}
