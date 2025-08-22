import type { Purchase } from '../types/purchase';
import { AuthService } from './auth.service';

const API_BASE_URL = 'http://localhost:3000';

export class PurchaseService {
  static async getUserPurchases(): Promise<Purchase[]> {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/purchases/my-purchases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchases');
    }

    return response.json();
  }

  static async cancelSubscription(purchaseId: number): Promise<void> {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/purchases/${purchaseId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  }
}
