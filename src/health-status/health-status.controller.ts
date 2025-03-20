import { Body, Controller, Post } from '@nestjs/common';
import { HealthStatusService } from './health-status.service';
import { PatientService } from 'src/patient/patient.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { HealthStatusCreateDto } from './dto/helth-status-create.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';

@Controller('health-status')
export class HealthStatusController {
    constructor(private readonly HealthStatusService: HealthStatusService, private readonly patientService: PatientService) {}

    @Post()
    @ApiBearerAuth()
   @ApiResponse({
     status: 201,
     description: 'Health status successfully created.',
     type: HealthStatusCreateDto,
     example: {
       code: 201,
       message: 'Health status data created successfully!',
       data: {
         descriptions: [],
         startDate: '2020-01-01',
         endDate: '2023-01-01',
       },
     },
   })
   @ApiResponse({
     status: 400,
     description: 'Bad Request. Invalid education data.',
     type: HealthStatusCreateDto,
     example: {
       code: 400,
       message: 'Invalid education data!',
       data: null,
     },
   })
   @ApiResponse({
     status: 500,
     description: 'Internal Server Error. An unexpected error occurred.',
     type: HealthStatusCreateDto,
     example: {
       code: 500,
       message: 'Internal Server Error!',
       data: null,
     },
   })
   async create(@Body() healthStatusData: HealthStatusCreateDto, @CurrentUser() user: User) {
    
    try{
     const existingPatient = await this.patientService.findByUserId(user?.id);
     const healthStatus = await this.HealthStatusService.create(healthStatusData);
   
     if(!existingPatient){
       await this.patientService.create({user : user, healthStatus})
        return {
         code : '201',
         message : "Health status data created successfully!",
         data : healthStatus,
         status : true,
        }
     }
      await this.patientService.update(existingPatient.id, {healthStatuses : [...existingPatient.healthStatuses, healthStatus]})
      return {
       code : '201',
       message : "Health status data created successfully!",
       data : healthStatus,
       status : true,
      }
    }catch(err){
     console.log(err)
    }
   }
}
