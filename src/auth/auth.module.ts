import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { MessageModule } from 'src/message/message.module';
import { DoctorModule } from '@/doctor/doctor.module';
import { PatientModule } from '@/patient/patient.module';
import { S3Module } from '@/s3/s3.module';

@Module({
  imports: [UsersModule, MessageModule, DoctorModule, PatientModule, S3Module],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
