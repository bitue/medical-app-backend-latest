import { IsNotEmpty, IsDateString } from 'class-validator';

export class CreateExperienceDto {
  @IsNotEmpty()
  hospitalName: string;

  @IsNotEmpty()
  designation: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;
}
