# Stripe Payment Links 決済システム

会員登録・ログイン機能付きの Stripe Payment Links を使用した決済システムです。

## 機能

### フロントエンド（React + TypeScript + Tailwind CSS）

- 会員登録・ログイン機能
- 商品一覧表示
- 購入状態に応じたボタン切り替え（購入する → キャンセル）
- 購入履歴管理
- レスポンシブデザイン

### バックエンド（NestJS + SQLite）

- JWT 認証
- 商品管理 API
- 購入履歴管理
- Stripe Webhook 処理
- 動的 Payment Link 生成

## セットアップ

### 1. 環境変数の設定

#### バックエンド（stripe-test-backend/.env）

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your-super-secret-jwt-key
```

### 2. バックエンドの起動

```bash
cd stripe-test-backend
npm install
npm run start:dev
```

### 3. フロントエンドの起動

```bash
cd stripe-test-frontend
npm install
npm run dev
```

## 使用方法

### 1. 会員登録・ログイン

- 新規ユーザー: 会員登録フォームでアカウント作成
- 既存ユーザー: `test@example.com` / `password123`

### 2. 商品購入

- ログイン後に商品一覧が表示
- 「購入する」ボタンで Stripe 決済画面に遷移
- テストカード: `4242 4242 4242 4242`

### 3. 購入管理

- 購入完了後、ボタンが「キャンセル」に変更
- キャンセル機能で購入を中止可能

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Tailwind CSS, Vite
- **バックエンド**: NestJS, TypeScript, SQLite, JWT
- **決済**: Stripe Payment Links, Stripe Webhooks
- **認証**: JWT, bcrypt

## API エンドポイント

### 認証

- `POST /auth/register` - 会員登録
- `POST /auth/login` - ログイン

### 商品

- `GET /products` - 商品一覧
- `GET /products/:id` - 商品詳細

### 購入

- `GET /purchases/my-purchases` - 購入履歴取得
- `POST /purchases/:id/cancel` - 購入キャンセル

### 決済

- `POST /payment/create-session` - 動的 Payment Link 生成
- `POST /payment/webhook` - Stripe Webhook 処理

## 開発

### テスト用エンドポイント

- `POST /purchases/test-purchase` - テスト用購入履歴作成
- `POST /purchases/update-status` - テスト用ステータス更新
- `GET /purchases/debug/all` - 全購入履歴取得（デバッグ用）

## ライセンス

MIT License
