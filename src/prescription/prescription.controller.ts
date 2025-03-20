import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { DoctorService } from '@/doctor/doctor.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './dtos/prescription-create.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/users.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '@/s3/s3.service';
import { PatientService } from '@/patient/patient.service';

@Controller('prescription')
export class PrescriptionController {
    constructor(private readonly prescriptionService: PrescriptionService, private readonly doctorService: DoctorService, private readonly s3Service : S3Service, private readonly patientService: PatientService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
   @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Prescription successfully created.',
    type: CreatePrescriptionDto,
    example: {
      code: 201,
      message: 'Prescription data created successfully!',
      data: {
        docPath: 's3.file.com/files/photo.jpg',
        patientId: 5,
        prescriptionDate: '2020-01-01',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.Prescription Invalid data.',
    type: CreatePrescriptionDto,
    example: {
      code: 400,
      message: 'Invalid Prescription data!',
      data: null,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error. An unexpected error occurred.',
    type: CreatePrescriptionDto,
    example: {
      code: 500,
      message: 'Internal Server Error!',
      data: null,
    },

  })
  async create(@UploadedFile() file: any, @Body() prescriptionData: any, @CurrentUser() user: User) {

    if (!prescriptionData?.patientId) {
      throw new BadRequestException('Patient ID is required');
    }

    if (!prescriptionData?.doctorId) {
      throw new BadRequestException('Doctor ID is required');
    }

   try{
    const existingDoctor = await this.doctorService.findOne(prescriptionData?.doctorId);
    const existingPatient = await this.patientService.findOne(prescriptionData.patientId);
  
    if(!existingDoctor){

       return {
        code : '400',
        message : "Doctor not found!",
        data : null,
        status : false
       }
    }

    if(!existingPatient){

      return {
       code : '400',
       message : "Patient not found!",
       data : null,
       status : false
      }
   }
    const imageUrl = await this.s3Service.uploadFile(file);

     const prescription = await this.prescriptionService.create({docPath : imageUrl, patient : existingPatient, prescriptionDate : prescriptionData?.prescriptionDate, doctor : existingDoctor, title : prescriptionData?.title});

     return {
      code : '201',
      message : "Prescription data created successfully!",
      data : prescription,
      status : true
     }
   }catch(err){
    console.log(err)
   }
  }

  @Get('patient/:patientId')
  async getPrescriptionsByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.prescriptionService.getPrescriptionsByPatient(patientId);
  }

}
