// stripe.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('payment-intent')
  async createPaymentIntent(@Body() body: { amount: number }) {
    const { amount } = body;
    const { clientSecret } =
      await this.stripeService.createPaymentIntent(amount);
    return { clientSecret };
  }
}
