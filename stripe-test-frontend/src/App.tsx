import { useEffect, useState } from 'react';
import type { Product } from './types/product';
import type { User } from './types/auth';
import type { Purchase } from './types/purchase';
import { ProductCard } from './components/ProductCard';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { AuthService } from './services/auth.service';
import { PurchaseService } from './services/purchase.service';
import './App.css';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // URLパラメータからsession_idを取得
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      setMessage('決済が完了しました！');
      // URLパラメータをクリア
      window.history.replaceState({}, '', '/');
    }

    // 既存のトークンをチェック
    const token = AuthService.getToken();
    if (token) {
      // トークンが存在する場合、ユーザー情報を復元
      // 実際のアプリケーションでは、トークンの有効性をサーバーで確認する必要があります
      setUser({ id: 1, email: 'user@example.com' }); // 簡易的な実装
    }

    // 商品一覧を取得
    fetch('http://localhost:3000/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error:', error));
  }, []);

  // ユーザーがログインした時に購入履歴を取得
  useEffect(() => {
    if (user) {
      loadPurchases();
    }
  }, [user]);

  const loadPurchases = async () => {
    try {
      const userPurchases = await PurchaseService.getUserPurchases();
      setPurchases(userPurchases);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    }
  };

  const handleLogin = (user: User) => {
    setUser(user);
    setShowRegister(false);
  };

  const handleRegister = (user: User) => {
    setUser(user);
    setShowRegister(false);
  };

  const handleLogout = () => {
    AuthService.removeToken();
    setUser(null);
    setPurchases([]);
  };

  const handlePurchase = async (product: Product) => {
    if (!user) {
      alert('ログインが必要です。');
      return;
    }

    try {
      // 購入前のレコードを作成（pending状態）
      const response = await fetch('http://localhost:3000/payment/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`,
        },
        body: JSON.stringify({
          productId: product.id,
          successUrl: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.origin,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      } else {
        // フォールバック: 既存のPayment Linkを使用
        window.open(product.stripePaymentLink, '_blank');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      // フォールバック: 既存のPayment Linkを使用
      window.open(product.stripePaymentLink, '_blank');
    }
  };

  const handleCancel = async (purchaseId: number) => {
    if (!confirm('本当にキャンセルしますか？')) {
      return;
    }

    setLoading(prev => ({ ...prev, [purchaseId]: true }));

    try {
      await PurchaseService.cancelSubscription(purchaseId);
      setMessage('キャンセルが完了しました！');
      // 購入履歴を再読み込み
      await loadPurchases();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('キャンセルに失敗しました。');
    } finally {
      setLoading(prev => ({ ...prev, [purchaseId]: false }));
    }
  };

  const getPurchaseForProduct = (productId: number): Purchase | undefined => {
    return purchases.find(p => p.product_id === productId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="px-4">
          {showRegister ? (
            <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">商品一覧</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">ようこそ、{user.email}さん</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {/* メッセージ */}
      {message && (
        <div className="text-center mb-8 text-green-600 font-bold">{message}</div>
      )}

      {/* 商品一覧 */}
      <div className="flex flex-wrap justify-center gap-4 px-4">
        {products.map((product) => {
          const purchase = getPurchaseForProduct(product.id);
          const isLoading = loading[purchase?.id || 0] || false;
          
          return (
            <ProductCard 
              key={product.id} 
              product={product} 
              onPurchase={() => handlePurchase(product)}
              onCancel={handleCancel}
              purchase={purchase}
              loading={isLoading}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;