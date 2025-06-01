import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { DoctorService } from '@/doctor/doctor.service';
import { S3Service } from '@/s3/s3.service';
import { PatientService } from '@/patient/patient.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateReportDto } from './dtos/report-create.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/users.entity';

@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly doctorService: DoctorService,
    private readonly s3Service: S3Service,
    private readonly patientService: PatientService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'report successfully created.',
    type: CreateReportDto,
    example: {
      code: 201,
      message: 'report data created successfully!',
      data: {
        docPath: 's3.file.com/files/photo.jpg',
        patientId: 5,
        reportDate: '2020-01-01',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.Prescription Invalid data.',
    type: CreateReportDto,
    example: {
      code: 400,
      message: 'Invalid Prescription data!',
      data: null,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error. An unexpected error occurred.',
    type: CreateReportDto,
    example: {
      code: 500,
      message: 'Internal Server Error!',
      data: null,
    },
  })
  async create(
    @UploadedFile() file: any,
    @Body() reportData: any,
    @CurrentUser() user: User,
  ) {
    try {
      console.log('reportData', reportData);

      const existingPatient = await this.patientService.findOne(
        reportData?.patientId,
      );

      if (!existingPatient) {
        return {
          code: '400',
          message: 'Patient not found!',
          data: null,
          status: false,
        };
      }
      const imageUrl = await this.s3Service.uploadFile(file);

      const report = await this.reportService.create({
        docPath: imageUrl,
        patient: existingPatient,
        reportDate: reportData?.reportDate,
        title: reportData?.title,
      });

      return {
        code: '201',
        message: 'Report data created successfully!',
        data: report,
        status: true,
      };
    } catch (err) {
      console.log(err);
    }
  }

  @Get('patient/:patientId')
  async getReportsByPatient(
    @Param('patientId', ParseIntPipe) patientId: number,
  ) {
    return this.reportService.getReportsByPatient(patientId);
  }
}
