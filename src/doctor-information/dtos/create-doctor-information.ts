import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDoctorInformationDto {
  @IsNumber()
  @IsNotEmpty()
  doctorId: number;

  @IsNumber()
  @IsNotEmpty()
  paymentAmount: number;

  @IsArray()
  @IsNotEmpty()
  schedule: string[];
}
