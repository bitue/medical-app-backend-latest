import { IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOperationHistoryDto {
  @ApiProperty({
    description: 'Operation Description',
    example: ['heart atack operation', 'brain stock operation'],
  })
  @IsNotEmpty()
  descriptions: string[];

  @ApiProperty({
    description: 'The start date of the operation',
    example: '2020-01-01',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the operation',
    example: '2023-01-01',
  })
  @IsDateString()
  endDate: Date;
}
