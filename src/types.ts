export type Category = 'Makanan Utama' | 'Camilan' | 'Minuman' | 'Dessert'

export type Fulfillment = 'delivery' | 'pickup'

export type PaymentMethod = 'qris' | 'transfer' | 'cod'

export type OrderStatus =
  | 'baru'
  | 'diproses'
  | 'dikirim'
  | 'siap'
  | 'selesai'
  | 'dibatalkan'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: Category
  emoji: string
  rating: number
  sold: number
  prepTime: number
  tags: string[]
  available: boolean
}

export interface CartLine {
  itemId: string
  qty: number
  notes?: string
}

export interface OrderItem {
  itemId: string
  name: string
  emoji: string
  price: number
  qty: number
  notes?: string
}

export interface CustomerInfo {
  name: string
  phone: string
  address: string
  notes: string
}

export interface Order {
  id: string
  code: string
  createdAt: string
  customer: CustomerInfo
  fulfillment: Fulfillment
  payment: PaymentMethod
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  serviceFee: number
  discount: number
  promo: string | null
  total: number
  status: OrderStatus
}

export interface CheckoutInput {
  customer: CustomerInfo
  fulfillment: Fulfillment
  payment: PaymentMethod
  promo: string | null
}

export interface Totals {
  subtotal: number
  deliveryFee: number
  serviceFee: number
  discount: number
  total: number
}
