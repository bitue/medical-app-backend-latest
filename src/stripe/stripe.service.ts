import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '@/appointment/appointment.entity';
import { DoctorInformation } from '@/doctor-information/doctor-information.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(DoctorInformation)
    private readonly doctorInfoRepository: Repository<DoctorInformation>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {});
  }

  async createPaymentIntent(
    doctorId: number,
    appointmentId: number,
    patientId: number,
  ) {
    // Load doctor information
    const doctorInfo = await this.doctorInfoRepository.findOne({
      where: { doctor: { id: doctorId } },
    });

    if (!doctorInfo) {
      throw new NotFoundException('DoctorInformation not found');
    }

    if (!doctorInfo.adminApproval) {
      throw new BadRequestException('Doctor admin approval pending');
    }

    // Load Appointment
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.patient.id !== patientId) {
      throw new BadRequestException('Unauthorized payment - patient mismatch');
    }

    const amount = doctorInfo.paymentAmount * 100; // Convert to cents

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          doctorId: String(doctorId),
          appointmentId: String(appointmentId),
          patientId: String(patientId),
        },
      });

      // Save PaymentIntent ID in DB
      appointment.paymentIntentId = paymentIntent.id;
      await this.appointmentRepository.save(appointment);

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      throw error;
    }
  }

  // CONFIRM PAYMENT SUCCESS
  async markPaymentSuccess(paymentIntentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { paymentIntentId },
    });

    if (!appointment) {
      throw new NotFoundException(
        'Appointment not found for this paymentIntent',
      );
    }

    appointment.paymentStatus = true;
    await this.appointmentRepository.save(appointment);

    return { message: 'Payment successful', appointmentId: appointment.id };
  }
}
