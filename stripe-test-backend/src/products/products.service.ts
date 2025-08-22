import { Injectable } from '@nestjs/common';
import { Product } from './models/product.model';

@Injectable()
export class ProductsService {
  private products: Product[] = [
    {
      id: 1,
      name: 'プレミアムプラン',
      description: '月額プレミアムサブスクリプション',
      price: 1000,
      stripePaymentLink: 'https://buy.stripe.com/test_xxxxxxxxx', // 実際のURLに更新してください
    },
    {
      id: 2,
      name: 'スタンダードプラン',
      description: '月額スタンダードサブスクリプション',
      price: 500,
      stripePaymentLink: 'https://buy.stripe.com/test_yyyyyyyyy', // 実際のURLに更新してください
    },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }
}
