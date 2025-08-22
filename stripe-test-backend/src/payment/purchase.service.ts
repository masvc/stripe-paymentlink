import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PurchaseService {
  constructor(private databaseService: DatabaseService) {}

  async createPurchase(userId: number, productId: number, stripeSessionId: string) {
    return await this.databaseService.runQuery(
      'INSERT INTO purchases (user_id, product_id, stripe_session_id) VALUES (?, ?, ?)',
      [userId, productId, stripeSessionId]
    );
  }

  async updatePurchaseStatus(stripeSessionId: string, status: string) {
    return await this.databaseService.runQuery(
      'UPDATE purchases SET status = ? WHERE stripe_session_id = ?',
      [status, stripeSessionId]
    );
  }

  async getUserPurchases(userId: number) {
    return await this.databaseService.getAllQuery(
      `SELECT p.*, pr.name as product_name, pr.price, pr.description 
       FROM purchases p 
       JOIN products pr ON p.product_id = pr.id 
       WHERE p.user_id = ? 
       ORDER BY p.created_at DESC`,
      [userId]
    );
  }

  async getPurchaseBySessionId(stripeSessionId: string) {
    return await this.databaseService.getQuery(
      'SELECT * FROM purchases WHERE stripe_session_id = ?',
      [stripeSessionId]
    );
  }

  async getAllPurchases() {
    return await this.databaseService.getAllQuery(
      `SELECT p.*, pr.name as product_name, pr.price, pr.description 
       FROM purchases p 
       JOIN products pr ON p.product_id = pr.id 
       ORDER BY p.created_at DESC`
    );
  }

  async cancelPurchase(purchaseId: number, userId: number) {
    // 購入履歴の存在確認と所有者確認
    const purchase = await this.databaseService.getQuery(
      'SELECT * FROM purchases WHERE id = ? AND user_id = ?',
      [purchaseId, userId]
    );

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.user_id !== userId) {
      throw new ForbiddenException('You can only cancel your own purchases');
    }

    // ステータスをcancelledに更新
    return await this.databaseService.runQuery(
      'UPDATE purchases SET status = ? WHERE id = ?',
      ['cancelled', purchaseId]
    );
  }
}
