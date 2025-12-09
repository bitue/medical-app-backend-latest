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
    if (appointment.paymentStatus) {
      throw new BadRequestException(
        'Payment already completed for this appointment',
      );
    }

    // already has payment intent
    if (appointment.paymentIntentId) {
      throw new BadRequestException(
        'Payment intent already created for this appointment',
      );
    }

    if (doctorInfo.paymentAmount === null) {
      throw new BadRequestException(
        'Payment amount not set for this doctor. Please contact admin.',
      );
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
          appointmentName: `Payment for Appointment ID: ${appointmentId}`,
          description: `Appointment ID: ${appointmentId} and  scheduled at time ${doctorInfo.schedule}`,
        },
      });

      console.log(paymentIntent, '<<<<< Created Payment Intent');

      // Save PaymentIntent ID in DB
      appointment.paymentIntentId = paymentIntent.id;
      await this.appointmentRepository.save(appointment);

      return {
        clientSecret: paymentIntent.client_secret,
        intentId: paymentIntent.id,
        doctorInfo: doctorInfo,
      };
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
    appointment.paymentIntentId = paymentIntentId;

    await this.appointmentRepository.save(appointment);

    return {
      message: 'Payment successful',
      appointmentId: appointment.id,
      appointment,
    };
  }

  async createCheckoutSession(
    doctorId: number,
    appointmentId: number,
    userId: number,
  ) {
    try {
      const doctorInfo = await this.doctorInfoRepository.findOne({
        where: { doctor: { id: doctorId } },
      });

      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['doctor', 'patient'],
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      if (!doctorInfo) {
        throw new NotFoundException('DoctorInformation not found');
      }
      if (!doctorInfo.adminApproval) {
        throw new BadRequestException('Doctor admin approval pending');
      }
      if (doctorInfo.paymentAmount === null) {
        throw new BadRequestException(
          'Payment amount not set for this doctor. Please contact admin.',
        );
      }
      const amount = doctorInfo.paymentAmount * 100; // Convert to cents
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Payment for Appointment ID: ${appointmentId}`,
                description: `Appointment ID: ${appointmentId} and  scheduled at time ${doctorInfo.schedule}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'https://www.google.com', // Replace with your actual success page URL for production
        cancel_url: 'https://www.yahoo.com', // Replace with your actual cancel page URL for production
        metadata: {
          appointment_id: appointmentId.toString(),
        },
      });

      return { sessionId: session.id, clientSecret: session.payment_intent };
    } catch (error) {
      console.error('Stripe checkout session creation failed:', error);
      throw new BadRequestException('Failed to create checkout session');
    }
  }
}
