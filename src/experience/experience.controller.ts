import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DoctorService } from 'src/doctor/doctor.service';
import { CreateEducationDto } from 'src/education/dtos/create-education.dto';
import { EducationService } from 'src/education/education.service';
import { User } from 'src/users/users.entity';
import { ExperienceService } from './experience.service';
import { CreateExperienceDto } from './dtos/create-experience.dto';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { request } from 'http';

@Controller('experience')
export class ExperienceController {
  constructor(
    private readonly experienceService: ExperienceService,
    private readonly doctorService: DoctorService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('doctor')
  async create(
    @Body() experienceData: CreateExperienceDto,
    @CurrentUser() user: User,
  ) {
    try {
      const [existingDoctor, experience] = await Promise.all([
        this.doctorService.findByUserId(user?.id),
        this.experienceService.create(experienceData),
      ]);

      console.log({ user, existingDoctor });

      // we are not doing this , if check the doctor is in my database if okay then i add the experience or education or other stuff

      // if (!existingDoctor) {
      //   await this.doctorService.create({ user: user, experience });
      //   return {
      //     code: '201',
      //     message: 'Experience data created successfully!',
      //     data: experience,
      //     status: true,
      //   };
      // }

      if (!existingDoctor) {
        throw new BadRequestException(
          'Doctor profile not found. Please create doctor profile first.',
        );
      }

      await this.doctorService.update(existingDoctor.id, {
        experiences: [...existingDoctor.experiences, experience],
      });
      return {
        code: '201',
        message: 'Experience data created successfully!',
        data: experience,
        status: true,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
