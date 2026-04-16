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
