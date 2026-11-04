import type { MenuItem, Totals, Fulfillment } from '../types'

export const DELIVERY_FEE = 12_000
export const FREE_DELIVERY_MIN = 100_000
export const SERVICE_FEE = 2_000

export const PROMOS: Record<string, { label: string; description: string }> = {
  HEMAT10: {
    label: 'Diskon 10%',
    description: 'Potongan 10% dari subtotal, maksimal Rp25.000.',
  },
  GRATISONGKIR: {
    label: 'Gratis ongkir',
    description: 'Biaya antar dihapus untuk pesanan ini.',
  },
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

export function formatCompact(value: number): string {
  if (value >= 1_000) {
    const compact = (value / 1_000).toFixed(1).replace('.', ',').replace(',0', '')
    return `${compact} rb`
  }
  return formatNumber(value)
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return formatDateTime(iso)
}

export function calcTotals(
  subtotal: number,
  fulfillment: Fulfillment,
  promo: string | null,
): Totals {
  const deliveryFee =
    subtotal === 0
      ? 0
      : fulfillment === 'delivery'
        ? subtotal >= FREE_DELIVERY_MIN
          ? 0
          : DELIVERY_FEE
        : 0

  const serviceFee = subtotal === 0 ? 0 : SERVICE_FEE

  let discount = 0
  if (promo === 'HEMAT10') {
    discount = Math.min(Math.round(subtotal * 0.1), 25_000)
  } else if (promo === 'GRATISONGKIR') {
    discount = deliveryFee
  }

  const total = Math.max(0, subtotal + deliveryFee + serviceFee - discount)

  return { subtotal, deliveryFee, serviceFee, discount, total }
}

export function cartSubtotal(lines: { price: number; qty: number }[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.qty, 0)
}

export function categorySlug(category: MenuItem['category']): string {
  return category.toLowerCase().replace(/\s+/g, '-')
}
