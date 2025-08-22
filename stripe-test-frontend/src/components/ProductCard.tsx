import type { Product } from '../types/product';
import type { Purchase } from '../types/purchase';

interface ProductCardProps {
  product: Product;
  onPurchase: () => void;
  onCancel: (purchaseId: number) => void;
  purchase?: Purchase;
  loading?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPurchase, 
  onCancel, 
  purchase,
  loading = false 
}) => {
  const isPurchased = purchase && purchase.status === 'completed';
  const isPending = purchase && purchase.status === 'pending';

  const handleAction = () => {
    if (isPurchased && purchase) {
      onCancel(purchase.id);
    } else if (!isPending) {
      onPurchase();
    }
  };

  const getButtonText = () => {
    if (loading) return '処理中...';
    if (isPending) return '処理中...';
    if (isPurchased) return 'キャンセル';
    return '購入する';
  };

  const getButtonClass = () => {
    if (loading || isPending) {
      return 'bg-gray-400 text-white font-bold py-2 px-4 rounded w-full cursor-not-allowed';
    }
    if (isPurchased) {
      return 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full';
    }
    return 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full';
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg p-6 m-4 bg-white">
      <h2 className="text-xl font-bold mb-2">{product.name}</h2>
      <p className="text-gray-700 text-base mb-4">{product.description}</p>
      <p className="text-gray-900 text-xl font-bold mb-4">
        ¥{product.price.toLocaleString()}/月
      </p>
      
      {/* 購入状態の表示 */}
      {isPurchased && (
        <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="text-sm">✅ 購入済み</p>
          <p className="text-xs text-green-600">
            購入日: {new Date(purchase.created_at).toLocaleDateString('ja-JP')}
          </p>
        </div>
      )}
      
      {isPending && (
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="text-sm">⏳ 処理中</p>
        </div>
      )}

      <button
        onClick={handleAction}
        disabled={loading || isPending}
        className={getButtonClass()}
      >
        {getButtonText()}
      </button>
    </div>
  );
};
