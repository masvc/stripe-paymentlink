import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PurchaseService } from './purchase.service';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private configService: ConfigService,
    private purchaseService: PurchaseService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-07-30.basil',
    });
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleCheckoutSessionCompleted(session);
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      this.logger.error('Webhook error:', err);
      throw err;
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      this.logger.log(`Payment completed for session: ${session.id}`);
      
      // メタデータから商品情報を取得
      const productId = session.metadata?.product_id;
      const userId = session.metadata?.user_id;
      
      if (productId && userId) {
        // 購入履歴を作成
        await this.purchaseService.createPurchase(
          parseInt(userId),
          parseInt(productId),
          session.id
        );
        
        // ステータスをcompletedに更新
        await this.purchaseService.updatePurchaseStatus(session.id, 'completed');
        
        this.logger.log(`Purchase record created for user ${userId}, product ${productId}`);
      } else {
        this.logger.warn('Missing metadata in session:', session.metadata);
      }
    } catch (error) {
      this.logger.error(`Error processing completed session: ${error}`);
    }
  }

  async createPurchaseRecord(userId: number, productId: number, stripeSessionId: string) {
    return await this.purchaseService.createPurchase(userId, productId, stripeSessionId);
  }

  // 商品IDからPayment Linkを生成するメソッド（オプション）
  async createPaymentLink(productId: number, userId: number, successUrl: string, cancelUrl: string) {
    const product = await this.getProductById(productId);
    
    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }
    
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price * 100, // Stripeは金額をセント単位で受け取る
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product_id: productId.toString(),
        user_id: userId.toString(),
      },
    });

    return session.url;
  }

  private async getProductById(productId: number) {
    // 実際の実装では、ProductsServiceから商品情報を取得
    const products = [
      { id: 1, name: 'プレミアムプラン', description: '月額プレミアムサブスクリプション', price: 1000 },
      { id: 2, name: 'スタンダードプラン', description: '月額スタンダードサブスクリプション', price: 500 },
    ];
    return products.find(p => p.id === productId);
  }
}
