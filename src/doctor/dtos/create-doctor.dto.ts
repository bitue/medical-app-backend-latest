import { Specialty } from '@/specialties/entities/specialty.entity';
import { User } from '@/users/users.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNumber, IsOptional } from 'class-validator';
import { Education } from 'src/education/education.entity';
import { Experience } from 'src/experience/experience.entity';

export class CreateDoctorDto {
  @IsOptional()
  user: User;
  @IsOptional()
  education: Education[];

  @IsOptional()
  experience: Experience[];

  @IsOptional()
  introduction?: string;

  @IsOptional()
  BMDC?: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  specialtyIds?: number[];
}
