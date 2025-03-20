import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { MessageModule } from 'src/message/message.module';
import { DoctorModule } from '@/doctor/doctor.module';
import { PatientModule } from '@/patient/patient.module';

@Module({
  imports: [UsersModule, MessageModule, DoctorModule, PatientModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
