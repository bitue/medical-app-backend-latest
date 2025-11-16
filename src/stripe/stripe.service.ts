// stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DoctorInformation } from '@/doctor/doctorInformation.entity';
import { Repository } from 'typeorm';
import { Appointment } from '@/appointment/appointment.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(DoctorInformation)
    private readonly doctorInformationRepository: Repository<DoctorInformation>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {});
    this.doctorInformationRepository = doctorInformationRepository;
    this.appointmentRepository = appointmentRepository;
  }

  // async createPaymentIntent(amount: number) {
  //   try {
  //     const paymentIntent = await this.stripe.paymentIntents.create({
  //       amount,
  //       currency: 'usd',
  //       payment_method_types: ['card'],
  //     });
  //     return { clientSecret: paymentIntent.client_secret };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // stripe.service.ts
  async createPaymentIntent(doctorId: number, appointmentId: number) {
    const doctorInformation = await this.doctorInformationRepository.findOne({
      where: { doctor: { id: doctorId } },
    });

    if (!doctorInformation) {
      throw new Error('Doctor information not found');
    }

    const amount = doctorInformation.paymentAmount;

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert amount to cents
        currency: 'usd',
        payment_method_types: ['card'],
      });

      // Save the payment intent in the appointment for later use
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
      });
      if (appointment) {
        appointment.paymentIntentId = paymentIntent.id; // Store the payment intent ID
        await this.appointmentRepository.save(appointment);
      }

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      throw error;
    }
  }
}
