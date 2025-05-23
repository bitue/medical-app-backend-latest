import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString()
  name: string;

  @IsString()
  typicalName: string;

  @IsNumber()
  totalDoctor: number;

  @IsString()
  professionName: string;

  @IsNumber()
  value: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  icon?: { src: string };

  @IsNumber()
  shouldAutoVerified: number;
}
