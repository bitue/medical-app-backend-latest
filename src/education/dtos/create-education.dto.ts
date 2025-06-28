import { IsNotEmpty, IsDateString } from 'class-validator';

export class CreateEducationDto {
  @IsNotEmpty()
  degreeName: string;

  @IsNotEmpty()
  instituteName: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;
}
