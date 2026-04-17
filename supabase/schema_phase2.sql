-- =============================================
-- Phase 2: 顧客マスタ・仕入先マスタ
-- Supabaseの「SQL Editor」で実行してください
-- =============================================

-- 顧客マスタ
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  company_name VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  contact_name VARCHAR(100),
  postal_code VARCHAR(10),
  address TEXT,
  phone VARCHAR(50),
  fax VARCHAR(50),
  email VARCHAR(200),
  payment_terms VARCHAR(200),
  credit_limit NUMERIC(14, 2),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 仕入先マスタ
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  company_name VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  contact_name VARCHAR(100),
  postal_code VARCHAR(10),
  address TEXT,
  phone VARCHAR(50),
  fax VARCHAR(50),
  email VARCHAR(200),
  payment_terms VARCHAR(200),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 自動更新トリガー
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS無効化
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
