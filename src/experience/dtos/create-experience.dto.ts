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

// import { IsNotEmpty, IsDateString } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class CreateExperienceDto {
//   @ApiProperty({
//   description: 'The name of the hospital where the experience was gained',
//   example: 'General Hospital',
//   })
//   @IsNotEmpty()
//   hospitalName: string;

//   @ApiProperty({
//   description: 'The designation or job title held during the experience',
//   example: 'Senior Surgeon',
//   })
//   @IsNotEmpty()
//   designation: string;

//   @ApiProperty({
//   description: 'The start date of the experience',
//   example: '2020-01-01',
//   })
//   @IsDateString()
//   startDate: Date;

//   @ApiProperty({
//     description: 'The end date of the experience',
//     example: '2023-01-01',
//   })
//   @IsDateString()
//   endDate: Date;
// }
