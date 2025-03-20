import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { UsersModule } from '@/users/users.module';
import { DoctorModule } from '@/doctor/doctor.module';
import { S3Module } from '@/s3/s3.module';
import { PatientModule } from '@/patient/patient.module';
import { CurrentUserMiddleware } from '@/common/middleware/current-user.middleware';

@Module({
  imports : [TypeOrmModule.forFeature([Report]), UsersModule, DoctorModule, S3Module, PatientModule],
  controllers: [ReportController],
  providers: [ReportService]
})
export class ReportModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).exclude(
      { path: 'report', method: RequestMethod.GET },
      'report/{*splat}',
    ).forRoutes(ReportController);
  }
}
