import { IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEducationDto {
  @ApiProperty({
    description: 'The name of the degree',
    example: 'Bachelor of Science in Computer Science',
  })
  @IsNotEmpty()
  degreeName: string;

  @ApiProperty({
    description: 'The name of the institute',
    example: 'University of Example',
  })
  @IsNotEmpty()
  instituteName: string;

  @ApiProperty({
    description: 'The start date of the education',
    example: '2020-01-01',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the education',
    example: '2023-01-01',
  })
  @IsDateString()
  endDate: Date;
}
