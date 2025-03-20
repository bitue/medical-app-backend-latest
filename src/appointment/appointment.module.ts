import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { Doctor } from '@/doctor/doctor.entity';
import { Patient } from '@/patient/patient.entity';
import { Prescription } from '@/prescription/prescription.entity';
import { Report } from '@/report/report.entity';
import { CurrentUserMiddleware } from '@/common/middleware/current-user.middleware';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Doctor, Patient, Report, Prescription]), UsersModule],
  controllers: [AppointmentController],
  providers: [AppointmentService]
})
export class AppointmentModule {

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).exclude(
      { path: 'appointments', method: RequestMethod.GET },
      'appointments/{*splat}',
    ).forRoutes(AppointmentController);
  }

}
