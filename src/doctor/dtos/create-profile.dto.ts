import { ArrayNotEmpty, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateProfileDto {
  @IsOptional()
  introduction?: string;

  @IsOptional()
  BMDC?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  specialtyIds?: number[];
}
