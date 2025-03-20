import { Doctor } from '@/doctor/doctor.entity';
import { Patient } from '@/patient/patient.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { Education } from 'src/education/education.entity';
import { Experience } from 'src/experience/experience.entity';

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'The ID of the patient',
    example: 1,
  })
  patient: Patient;

  @ApiProperty({
    description: 'The ID of the doctor',
    example: 1,
  })
  doctor: Doctor;

  @ApiProperty({
    description: 'The doc path',
    example: 's3.file.com/files/photo.jpg',
  })
  docPath: string;

  @ApiProperty({
    description: 'The prescription title',
    example: 'prescription one',
  })
  title: string;

  @ApiProperty({
    description: 'The prescription date',
    example: '2020-01-01',
  })
  @IsDateString()
  prescriptionDate: Date;
  
}




