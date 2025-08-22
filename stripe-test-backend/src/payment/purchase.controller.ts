import { Controller, Get, Post, Param, UseGuards, Request, ParseIntPipe, Body } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchases')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  @Get('my-purchases')
  @UseGuards(JwtAuthGuard)
  async getMyPurchases(@Request() req) {
    const userId = req.user.id;
    return await this.purchaseService.getUserPurchases(userId);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelPurchase(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    return await this.purchaseService.cancelPurchase(id, userId);
  }

  // テスト用エンドポイント（開発環境のみ）
  @Post('test-purchase')
  async createTestPurchase(@Body() body: { userId: number; productId: number; stripeSessionId: string }) {
    return await this.purchaseService.createPurchase(
      body.userId,
      body.productId,
      body.stripeSessionId
    );
  }

  // テスト用ステータス更新エンドポイント（開発環境のみ）
  @Post('update-status')
  async updateTestStatus(@Body() body: { stripeSessionId: string; status: string }) {
    return await this.purchaseService.updatePurchaseStatus(body.stripeSessionId, body.status);
  }

  // デバッグ用エンドポイント（開発環境のみ）
  @Get('debug/all')
  async getAllPurchases() {
    return await this.purchaseService.getAllPurchases();
  }
}
