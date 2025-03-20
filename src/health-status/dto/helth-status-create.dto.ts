import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class HealthStatusCreateDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Indicates if the patient is a smoker',
    example: true,
  })
  smokingStatus: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Indicates if the patient exercises regularly',
    example: false,
  })
  exercise: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Indicates if the patient consumes alcohol',
    example: true,
  })
  alcoholStatus: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Indicates if the patient has received a COVID-19 vaccination',
    example: true,
  })
  covidVaccination: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Indicates if the patient has any allergies',
    example: false,
  })
  allergy: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Indicates if the patient has diabetes',
    example: false,
  })
  diabeticsStatus: boolean;

}
