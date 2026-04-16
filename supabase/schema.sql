-- =============================================
-- FA商材管理システム - Supabaseスキーマ
-- Supabaseの「SQL Editor」で実行してください
-- =============================================

-- カテゴリテーブル
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- メーカーテーブル
CREATE TABLE manufacturers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 商材テーブル
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(200) NOT NULL,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  manufacturer_part_number VARCHAR(100),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  spec TEXT,
  purchase_price NUMERIC(12, 2),
  selling_price NUMERIC(12, 2),
  supplier VARCHAR(200),
  stock_quantity INTEGER DEFAULT 0,
  reorder_point INTEGER,
  is_discontinued BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS（Row Level Security）を無効化（社内システムのため）
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- FA機器の初期カテゴリ
INSERT INTO categories (name) VALUES
  ('センサー'),
  ('PLC'),
  ('インバーター'),
  ('サーボ・モーター'),
  ('電磁弁'),
  ('スイッチ・操作機器'),
  ('電源'),
  ('ケーブル・配線'),
  ('ロボット'),
  ('計測機器'),
  ('その他');
