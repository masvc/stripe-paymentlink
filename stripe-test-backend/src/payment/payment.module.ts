import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController, PurchaseController],
  providers: [PaymentService, PurchaseService, DatabaseService],
})
export class PaymentModule {}