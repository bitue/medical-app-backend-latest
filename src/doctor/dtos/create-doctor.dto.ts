import { User } from '@/users/users.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Education } from 'src/education/education.entity';
import { Experience } from 'src/experience/experience.entity';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'The ID of the user associated with the doctor',
    example: 1,
  })
  user: User;

  @ApiProperty({
    description: 'An education record associated with the doctor',
    type: Education,
  })
  education: Education;

  @ApiProperty({
    description: 'An experience records associated with the doctor',
    type: Experience,
  })
  experience: Experience;
}




