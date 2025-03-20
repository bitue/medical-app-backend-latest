import { Body, Controller, Post } from '@nestjs/common';
import { OperationHistoryService } from './operation-history.service';
import { PatientService } from 'src/patient/patient.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateOperationHistoryDto } from './dtos/create-operation-history.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';

@Controller('operation-history')
export class OperationHistoryController {
    constructor(private readonly operationHistory: OperationHistoryService, private readonly patientService: PatientService) {}

    @Post()
    @ApiBearerAuth()
   @ApiResponse({
     status: 201,
     description: 'Operation history successfully created.',
     type: CreateOperationHistoryDto,
     example: {
       code: 201,
       message: 'Operation history data created successfully!',
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
     type: CreateOperationHistoryDto,
     example: {
       code: 400,
       message: 'Invalid education data!',
       data: null,
     },
   })
   @ApiResponse({
     status: 500,
     description: 'Internal Server Error. An unexpected error occurred.',
     type: CreateOperationHistoryDto,
     example: {
       code: 500,
       message: 'Internal Server Error!',
       data: null,
     },
   })
   async create(@Body() operationHistoryData: CreateOperationHistoryDto, @CurrentUser() user: User) {
    
    try{
     const existingPatient = await this.patientService.findByUserId(user?.id);
     const operationHistory = await this.operationHistory.create({ descriptions : operationHistoryData?.descriptions, startDate : operationHistoryData?.startDate, endDate : operationHistoryData?.endDate});
   
     if(!existingPatient){
       await this.patientService.create({user : user, operationHistory})
        return {
         code : '201',
         message : "Operation history data created successfully!",
         data : operationHistory,
         status : true,
        }
     }
      await this.patientService.update(existingPatient.id, {operationHistories : [...existingPatient.operationHistories, operationHistory]})
      return {
       code : '201',
       message : "Operation history data created successfully!",
       data : operationHistory,
       status : true,
      }
    }catch(err){
     console.log(err)
    }
   }
}
