export interface Category {
  id: string
  name: string
  created_at: string
}

export interface Manufacturer {
  id: string
  name: string
  created_at: string
}

export interface Product {
  id: string
  code: string | null
  name: string
  manufacturer_id: string | null
  manufacturer?: Manufacturer
  manufacturer_part_number: string | null
  category_id: string | null
  category?: Category
  spec: string | null
  purchase_price: number | null
  selling_price: number | null
  supplier: string | null
  stock_quantity: number
  reorder_point: number | null
  is_discontinued: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  code: string | null
  company_name: string
  department: string | null
  contact_name: string | null
  postal_code: string | null
  address: string | null
  phone: string | null
  fax: string | null
  email: string | null
  payment_terms: string | null
  credit_limit: number | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerFormData {
  code: string
  company_name: string
  department: string
  contact_name: string
  postal_code: string
  address: string
  phone: string
  fax: string
  email: string
  payment_terms: string
  credit_limit: string
  notes: string
  is_active: boolean
}

export interface Supplier {
  id: string
  code: string | null
  company_name: string
  department: string | null
  contact_name: string | null
  postal_code: string | null
  address: string | null
  phone: string | null
  fax: string | null
  email: string | null
  payment_terms: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupplierFormData {
  code: string
  company_name: string
  department: string
  contact_name: string
  postal_code: string
  address: string
  phone: string
  fax: string
  email: string
  payment_terms: string
  notes: string
  is_active: boolean
}

export interface ProductFormData {
  code: string
  name: string
  manufacturer_id: string
  manufacturer_part_number: string
  category_id: string
  spec: string
  purchase_price: string
  selling_price: string
  supplier: string
  stock_quantity: string
  reorder_point: string
  is_discontinued: boolean
  notes: string
}
