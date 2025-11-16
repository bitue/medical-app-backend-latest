// stripe.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('payment-intent')
  async createPaymentIntent(
    @Body() body: { appointmentId: number; doctorId: number },
  ) {
    const { appointmentId, doctorId } = body;
    const { clientSecret } = await this.stripeService.createPaymentIntent(
      doctorId,
      appointmentId,
    );
    return { clientSecret };
  }
}
