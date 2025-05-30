import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1, description: 'ID of the doctor' })
  @IsNumber()
  @IsNotEmpty()
  doctorId: number;

  @ApiProperty({ example: 2, description: 'ID of the patient' })
  @IsNumber()
  @IsNotEmpty()
  patientId: number;

  @ApiProperty({
    example: [3, 4],
    description: 'Array of report IDs',
    type: [Number],
  })
  @IsArray()
  reports: number[];

  @ApiProperty({
    example: [5, 6],
    description: 'Array of prescription IDs',
    type: [Number],
  })
  @IsArray()
  prescriptions: number[];

  @ApiProperty({ example: 30, description: 'Access time in minutes' })
  @IsNumber()
  @IsNotEmpty()
  accessTime: number;

  @IsString()
  @IsNotEmpty()
  appointmentSlot: String;
}
