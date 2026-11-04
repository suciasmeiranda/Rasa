import type { Fulfillment, OrderStatus, PaymentMethod } from '../types'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  baru: 'Pesanan baru',
  diproses: 'Sedang diproses',
  dikirim: 'Dalam pengiriman',
  siap: 'Siap diambil',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

export const STATUS_SHORT: Record<OrderStatus, string> = {
  baru: 'Baru',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  siap: 'Siap diambil',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

export const FULFILLMENT_LABEL: Record<Fulfillment, string> = {
  delivery: 'Diantar',
  pickup: 'Ambil sendiri',
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  qris: 'QRIS',
  transfer: 'Transfer bank',
  cod: 'Bayar di tempat',
}

export function statusSteps(fulfillment: Fulfillment): OrderStatus[] {
  return fulfillment === 'delivery'
    ? ['baru', 'diproses', 'dikirim', 'selesai']
    : ['baru', 'diproses', 'siap', 'selesai']
}

export function statusTone(status: OrderStatus): string {
  return `status--${status}`
}

export function nextStatus(
  current: OrderStatus,
  fulfillment: Fulfillment,
): OrderStatus | null {
  const steps = statusSteps(fulfillment)
  const index = steps.indexOf(current)
  if (index === -1 || index === steps.length - 1) return null
  return steps[index + 1]
}

export const ALL_STATUSES: OrderStatus[] = [
  'baru',
  'diproses',
  'dikirim',
  'siap',
  'selesai',
  'dibatalkan',
]
