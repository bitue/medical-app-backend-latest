import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dtos/create-education.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { DoctorService } from 'src/doctor/doctor.service';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}
}
