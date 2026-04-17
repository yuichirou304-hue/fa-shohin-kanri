-- =============================================
-- Phase 3: 案件・見積・受注・発注管理
-- Supabaseの「SQL Editor」で実行してください
-- =============================================

-- 案件テーブル
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number VARCHAR(50) NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(200),
  project_name VARCHAR(200) NOT NULL,
  quote_date DATE,
  status VARCHAR(20) DEFAULT 'quoting',
  -- quoting:見積中 / ordered:受注済 / completed:完了 / lost:失注
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 見積バージョンテーブル
CREATE TABLE quote_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 見積明細テーブル
CREATE TABLE quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_version_id UUID REFERENCES quote_versions(id) ON DELETE CASCADE,
  item_type VARCHAR(20) DEFAULT 'equipment',
  -- equipment:機器 / construction:工事費
  item_number INTEGER,
  name VARCHAR(300) NOT NULL,
  model VARCHAR(300),
  manufacturer VARCHAR(200),
  quantity NUMERIC(10, 2) DEFAULT 1,
  unit VARCHAR(20) DEFAULT '台',
  unit_price NUMERIC(12, 2),
  amount NUMERIC(14, 2),
  dp_price NUMERIC(12, 2),
  dp_amount NUMERIC(14, 2),
  supplier VARCHAR(200),
  comment1 TEXT,
  comment2 TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 受注テーブル
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  quote_version_id UUID REFERENCES quote_versions(id) ON DELETE SET NULL,
  order_number VARCHAR(50),
  order_date DATE,
  customer_order_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 受注明細テーブル
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  quote_item_id UUID REFERENCES quote_items(id) ON DELETE SET NULL,
  item_type VARCHAR(20) DEFAULT 'equipment',
  item_number INTEGER,
  name VARCHAR(300) NOT NULL,
  model VARCHAR(300),
  manufacturer VARCHAR(200),
  quantity NUMERIC(10, 2),
  unit VARCHAR(20),
  unit_price NUMERIC(12, 2),
  amount NUMERIC(14, 2),
  dp_price NUMERIC(12, 2),
  supplier VARCHAR(200),
  comment1 TEXT,
  comment2 TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 発注書テーブル
CREATE TABLE purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  po_number VARCHAR(50),
  supplier_name VARCHAR(200) NOT NULL,
  po_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 発注明細テーブル
CREATE TABLE purchase_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  name VARCHAR(300) NOT NULL,
  model VARCHAR(300),
  manufacturer VARCHAR(200),
  quantity NUMERIC(10, 2),
  unit VARCHAR(20),
  unit_price NUMERIC(12, 2),
  amount NUMERIC(14, 2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS無効化
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE quote_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items DISABLE ROW LEVEL SECURITY;
