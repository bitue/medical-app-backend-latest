// stripe.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('create-intent')
  createPayment(
    @Body() body: { doctorId: number; appointmentId: number; userId: number },
  ) {
    //const patientId = req.user.id; // logged in user
    return this.stripeService.createPaymentIntent(
      body.doctorId,
      body.appointmentId,
      body.userId,
    );
  }

  @Post('success')
  markSuccess(@Body() body: { paymentIntentId: string }) {
    return this.stripeService.markPaymentSuccess(body.paymentIntentId);
  }
}
