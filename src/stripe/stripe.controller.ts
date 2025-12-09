// stripe.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Headers,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('stripe')
export class StripeController {
  private stripe: Stripe;

  constructor(
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {});
  }

  @Post('create-intent')
  @UseGuards(AuthGuard, RoleGuard) // update it to ADMIN role Later
  @Roles('patient')
  createPayment(
    @Body()
    body: {
      doctorId: number;
      appointmentId: number;
      patientId: number;
    },
  ) {
    console.log(body);
    return this.stripeService.createPaymentIntent(
      body.doctorId,
      body.appointmentId,
      body.patientId,
    );
  }

  @Post('success')
  markSuccess(@Body() body: { paymentIntentId: string }) {
    return this.stripeService.markPaymentSuccess(body.paymentIntentId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() request: Request,
    @Res() response: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        request['rawBody'],
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.log('❌ Webhook signature verification failed.', err.message);
      return response.send(`Webhook Error: ${err.message}`);
    }

    // 🎯 Listen to successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const paymentIntentId = paymentIntent.id;
      console.log('✅ PaymentIntent was successful!', paymentIntentId);

      await this.stripeService.markPaymentSuccess(paymentIntentId);

      console.log('Payment succeeded, DB updated!');
    }

    response.json({ received: true });
  }

  @Post('create-session')
  async createCheckoutSession(
    @Body() body: { doctorId: number; appointmentId: number; userId: number },
  ) {
    return this.stripeService.createCheckoutSession(
      body.doctorId,
      body.appointmentId,
      body.userId,
    );
  }
}
