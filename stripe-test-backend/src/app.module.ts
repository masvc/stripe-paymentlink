import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { PaymentModule } from './payment/payment.module';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: 'your-secret-key', // 本番では環境変数にしてください
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    ProductsModule,
    PaymentModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
