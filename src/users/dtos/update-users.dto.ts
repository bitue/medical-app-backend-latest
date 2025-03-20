import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../users.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'The role of the user.',
    example: 'patient',
  })
  @IsOptional()
  role?: UserRole;
}

