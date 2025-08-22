import { Controller, Post, Headers, Req, Body, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request & { rawBody?: Buffer },
  ) {
    if (!request.rawBody) {
      throw new Error('Raw body is required for webhook verification');
    }
    return this.paymentService.handleWebhook(signature, request.rawBody);
  }

  @Post('create-session')
  @UseGuards(JwtAuthGuard)
  async createSession(@Body() body: { productId: number; successUrl: string; cancelUrl: string }, @Req() req) {
    const userId = req.user.id;
    const url = await this.paymentService.createPaymentLink(
      body.productId,
      userId,
      body.successUrl,
      body.cancelUrl
    );
    return { url };
  }
}
