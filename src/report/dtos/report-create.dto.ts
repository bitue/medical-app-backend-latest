import { Doctor } from '@/doctor/doctor.entity';
import { Patient } from '@/patient/patient.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { Education } from 'src/education/education.entity';
import { Experience } from 'src/experience/experience.entity';

export class CreateReportDto {
  @ApiProperty({
    description: 'The ID of the patient',
    example: 1,
  })
  patient: Patient;

  @ApiProperty({
    description: 'The report title',
    example: 'Report one',
  })
  title: string;

  @ApiProperty({
    description: 'The doc path',
    example: 's3.file.com/files/photo.jpg',
  })
  docPath: string;

  @ApiProperty({
    description: 'The prescription date',
    example: '2020-01-01',
  })
  @IsDateString()
  reportDate: Date;
  
}




