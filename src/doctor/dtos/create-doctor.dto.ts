import { User } from '@/users/users.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Education } from 'src/education/education.entity';
import { Experience } from 'src/experience/experience.entity';

export class CreateDoctorDto {
  user: User;

  education: Education;

  experience: Experience;
}
