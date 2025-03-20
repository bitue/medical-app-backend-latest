import { IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrentMedicationDto {
  @ApiProperty({
    description: 'Doctor id which doctor prescribed it',
    example: '1',
  })
  @IsNotEmpty()
  doctorId: number;

  @ApiProperty({
    description: 'The doses of the medication prescribed',
    example: ['10mg of Medication A', '5mg of Medication B'],
  })
  @IsNotEmpty()
  doses: string[];

  @ApiProperty({
    description: 'The start date of the education',
    example: '2020-01-01',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the education',
    example: '2023-01-01',
  })
  @IsDateString()
  endDate: Date;
}
