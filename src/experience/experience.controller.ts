import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DoctorService } from 'src/doctor/doctor.service';
import { CreateEducationDto } from 'src/education/dtos/create-education.dto';
import { EducationService } from 'src/education/education.service';
import { User } from 'src/users/users.entity';
import { ExperienceService } from './experience.service';
import { CreateExperienceDto } from './dtos/create-experience.dto';

@Controller('experience')
export class ExperienceController {
    constructor(private readonly experienceService: ExperienceService, private readonly doctorService: DoctorService) {}

  @Post()
   @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Experience successfully created.',
    type: CreateExperienceDto,
    example: {
      code: 201,
      message: 'Experience data created successfully!',
      data: {
        
        hospitalName: 'General Hospital',
        designation: 'Senior Doctor',
        startDate: '2020-01-01',
        endDate: '2023-01-01',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid education data.',
    type: CreateExperienceDto,
    example: {
      code: 400,
      message: 'Invalid education data!',
      data: null,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error. An unexpected error occurred.',
    type: CreateExperienceDto,
    example: {
      code: 500,
      message: 'Internal Server Error!',
      data: null,
    },
  })
  async create(@Body() experienceData: CreateExperienceDto, @CurrentUser() user: User) {

   try{
    const [existingDoctor, experience] = await Promise.all([
      this.doctorService.findByUserId(user?.id),
      this.experienceService.create(experienceData)
    ]) ;


console.log({user, existingDoctor})
  
    if(!existingDoctor){
     await this.doctorService.create({user : user, experience})
       return {
        code : '201',
        message : "Experience data created successfully!",
        data : experience,
        status : true,
       }
    }
     await this.doctorService.update(existingDoctor.id, {experiences : [...existingDoctor.experiences, experience]})
     return {
      code : '201',
      message : "Experience data created successfully!",
      data : experience,
      status : true
     }
   }catch(err){
    console.log(err)
   }
  }
}
