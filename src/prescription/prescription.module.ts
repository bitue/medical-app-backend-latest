import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from './prescription.entity';
import { CurrentUserMiddleware } from '@/common/middleware/current-user.middleware';
import { DoctorModule } from '@/doctor/doctor.module';
import { UsersModule } from '@/users/users.module';
import { S3Module } from '@/s3/s3.module';
import { PatientModule } from '@/patient/patient.module';

@Module({
  imports : [TypeOrmModule.forFeature([Prescription]), UsersModule, DoctorModule, S3Module, PatientModule],
  controllers: [PrescriptionController],
  providers: [PrescriptionService]
})
export class PrescriptionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).exclude(
      { path: 'prescription', method: RequestMethod.GET },
      'prescription/{*splat}',
    ).forRoutes(PrescriptionController);
  }
}
