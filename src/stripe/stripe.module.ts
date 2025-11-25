import { Appointment } from '@/appointment/appointment.entity';
import { DoctorInformation } from '@/doctor-information/doctor-information.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorInformation, Appointment])],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
