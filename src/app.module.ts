import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_PIPE } from '@nestjs/core';
import { DoctorModule } from './doctor/doctor.module';
import { EducationModule } from './education/education.module';
import { ExperienceModule } from './experience/experience.module';
import { CurrentMedicationModule } from './current-medication/current-medication.module';
import { PatientModule } from './patient/patient.module';
import { OperationHistoryModule } from './operation-history/operation-history.module';

import { CallModule } from './call/call.module';
// import { SeedModule } from './seed/seed.module';
import { S3Module } from './s3/s3.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { ReportModule } from './report/report.module';
import { AppointmentModule } from './appointment/appointment.module';
import { AdminModule } from './admin/admin.module';
import { HealthStatusModule } from './health-status/health-status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    MessageModule,
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '7d' },
    }),
    DoctorModule,
    EducationModule,
    ExperienceModule,
    CurrentMedicationModule,
    PatientModule,
    PrescriptionModule,
    ReportModule,
    OperationHistoryModule,
    HealthStatusModule,
    CallModule,

    S3Module,
    AppointmentModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
