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

  // @Post()
  // @UseGuards(AuthGuard, RoleGuard)
  // @Roles('doctor')
  // async create(
  //   @Body() educationData: CreateEducationDto,
  //   @CurrentUser() user: User,
  // ) {
  //   try {
  //     console.log(user, 'from  current user ');
  //     const [existingDoctor, education] = await Promise.all([
  //       this.doctorService.findByUserId(user?.id),
  //       this.educationService.create(educationData),
  //     ]);

  //     // if (!existingDoctor) {
  //     //   await this.doctorService.create({ user: user, education });
  //     //   return {
  //     //     code: '201',
  //     //     message: 'Education data created successfully!',
  //     //     data: education,
  //     //     status: true,
  //     //   };
  //     // }

  //     if (!existingDoctor) {
  //       throw new BadRequestException(
  //         'Doctor profile not found. Please create doctor profile first.',
  //       );
  //     }

  //     await this.doctorService.update(existingDoctor.id, {
  //       educations: [...existingDoctor.educations, education],
  //     });
  //     return {
  //       code: '201',
  //       message: `Education data added  successfully to ${user.username} profile `,
  //       data: education,
  //       status: true,
  //     };
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
}
