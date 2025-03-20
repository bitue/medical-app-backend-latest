import { Controller, Post, Body } from '@nestjs/common';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dtos/create-education.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { DoctorService } from 'src/doctor/doctor.service';

@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService, private readonly doctorService: DoctorService) {}

  @Post()
   @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Education successfully created.',
    type: CreateEducationDto,
    example: {
      code: 201,
      message: 'Education data created successfully!',
      data: {
        degreeName: 'Bachelor of Science in Computer Science',
        instituteName: 'University of Example',
        startDate: '2020-01-01',
        endDate: '2023-01-01',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid education data.',
    type: CreateEducationDto,
    example: {
      code: 400,
      message: 'Invalid education data!',
      data: null,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error. An unexpected error occurred.',
    type: CreateEducationDto,
    example: {
      code: 500,
      message: 'Internal Server Error!',
      data: null,
    },
  })
  async create(@Body() educationData: CreateEducationDto, @CurrentUser() user: User) {

   try{
    const [existingDoctor, education] = await Promise.all([
      this.doctorService.findByUserId(user?.id),
      this.educationService.create(educationData)
    ]);
  
    if(!existingDoctor){
      await this.doctorService.create({user : user, education})
       return {
        code : '201',
        message : "Education data created successfully!",
        data : education,
        status : true
       }
    }
     await this.doctorService.update(existingDoctor.id, {educations : [...existingDoctor.educations, education]})
     return {
      code : '201',
      message : "Education data created successfully!",
      data : education,
      status : true
     }
   }catch(err){
    console.log(err)
   }
  }
}

