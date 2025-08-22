export interface Purchase {
  id: number;
  user_id: number;
  product_id: number;
  stripe_session_id: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  product_name: string;
  price: number;
  description: string;
}
