import { IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrentMedicationDto {
  @IsNotEmpty()
  doctorId: number;

  @IsNotEmpty()
  doses: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: Date | null;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date | null;

  isRunning: boolean;
}

// export class CreateCurrentMedicationDto {

//   @IsNotEmpty()
//   doctorId: number;

//   @IsNotEmpty()
//   doses: string[];

//   @ApiProperty({
//     description: 'The start date of the education',
//     example: '2020-01-01',
//   })
//   @IsDateString()
//   startDate: Date;

//   @ApiProperty({
//     description: 'The end date of the education',
//     example: '2023-01-01',
//   })
//   @IsDateString()
//   endDate: Date;
// }
