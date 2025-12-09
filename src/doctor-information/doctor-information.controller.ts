import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { DoctorInformationService } from './doctor-information.service';
import { CreateDoctorInformationDto } from './dtos/create-doctor-information';
import { UpdateDoctorInformationDto } from './dtos/update-doctor-information';
import { RoleGuard } from '@/common/guards/role.guard';
import { AuthGuard } from '@/common/guards/auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('doctor-information')
export class DoctorInformationController {
  constructor(private readonly service: DoctorInformationService) {}

  @Post()
  create(@Body() dto: CreateDoctorInformationDto) {
    return this.service.create(dto);
  }

  @Get(':doctorId')
  getByDoctor(@Param('doctorId') doctorId: number) {
    return this.service.findByDoctorId(doctorId);
  }

  @Patch('update/:id')
  update(@Param('id') id: number, @Body() dto: UpdateDoctorInformationDto) {
    return this.service.update(id, dto);
  }

  // Admin approves
  @Patch('approve/:id')
  @UseGuards(AuthGuard, RoleGuard) // update it to ADMIN role Later
  @Roles('admin')
  approve(@Param('id') id: number) {
    return this.service.approve(id);
  }
}
