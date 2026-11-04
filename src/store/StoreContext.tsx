import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  CartLine,
  CheckoutInput,
  MenuItem,
  Order,
  OrderStatus,
} from '../types'
import { buildSeedOrders, seedMenu } from '../data/seed'
import { calcTotals, PROMOS } from '../lib/format'

const KEYS = {
  menu: 'rasa.menu.v1',
  orders: 'rasa.orders.v1',
  cart: 'rasa.cart.v1',
}

export interface Toast {
  id: string
  message: string
  tone: 'success' | 'error' | 'info'
}

interface StoreValue {
  menu: MenuItem[]
  cart: CartLine[]
  orders: Order[]
  promo: string | null
  toasts: Toast[]
  cartCount: number
  cartSubtotal: number
  addToCart: (itemId: string, qty?: number, notes?: string) => void
  updateQty: (itemId: string, qty: number) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  applyPromo: (code: string) => boolean
  clearPromo: () => void
  placeOrder: (input: CheckoutInput) => Order | null
  reorder: (order: Order) => number
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  cancelOrder: (orderId: string) => void
  saveMenuItem: (item: MenuItem) => void
  deleteMenuItem: (itemId: string) => void
  resetDemoData: () => void
  notify: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

function load<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Penyimpanan bisa penuh atau diblokir; aplikasi tetap berjalan di memori.
  }
}

function uid(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${random}`
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>(() => load<MenuItem[]>(KEYS.menu) ?? seedMenu)
  const [orders, setOrders] = useState<Order[]>(
    () => load<Order[]>(KEYS.orders) ?? buildSeedOrders(seedMenu),
  )
  const [cart, setCart] = useState<CartLine[]>(() => load<CartLine[]>(KEYS.cart) ?? [])
  const [promo, setPromo] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => save(KEYS.menu, menu), [menu])
  useEffect(() => save(KEYS.orders, orders), [orders])
  useEffect(() => save(KEYS.cart, cart), [cart])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, tone: Toast['tone'] = 'success') => {
      const id = uid('toast')
      setToasts((current) => [...current, { id, message, tone }])
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, 3200)
    },
    [],
  )

  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.qty, 0),
    [cart],
  )

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const item = menu.find((entry) => entry.id === line.itemId)
        return sum + (item ? item.price * line.qty : 0)
      }, 0),
    [cart, menu],
  )

  const addToCart = useCallback(
    (itemId: string, qty = 1, notes?: string) => {
      const item = menu.find((entry) => entry.id === itemId)
      if (!item || !item.available) {
        notify('Menu ini sedang tidak tersedia.', 'error')
        return
      }
      setCart((current) => {
        const existing = current.find((line) => line.itemId === itemId)
        if (existing) {
          return current.map((line) =>
            line.itemId === itemId
              ? { ...line, qty: line.qty + qty, notes: notes ?? line.notes }
              : line,
          )
        }
        return [...current, { itemId, qty, notes }]
      })
      notify(`${item.name} masuk keranjang.`)
    },
    [menu, notify],
  )

  const updateQty = useCallback((itemId: string, qty: number) => {
    setCart((current) =>
      qty <= 0
        ? current.filter((line) => line.itemId !== itemId)
        : current.map((line) => (line.itemId === itemId ? { ...line, qty } : line)),
    )
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart((current) => current.filter((line) => line.itemId !== itemId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setPromo(null)
  }, [])

  const applyPromo = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase()
      if (!normalized) return false
      if (!PROMOS[normalized]) {
        notify('Kode promo tidak dikenali.', 'error')
        return false
      }
      setPromo(normalized)
      notify(`Promo ${PROMOS[normalized].label} berhasil dipakai.`)
      return true
    },
    [notify],
  )

  const clearPromo = useCallback(() => setPromo(null), [])

  const placeOrder = useCallback(
    (input: CheckoutInput): Order | null => {
      if (cart.length === 0) {
        notify('Keranjang masih kosong.', 'error')
        return null
      }

      const items = cart.map((line) => {
        const item = menu.find((entry) => entry.id === line.itemId)
        return item
          ? {
              itemId: item.id,
              name: item.name,
              emoji: item.emoji,
              price: item.price,
              qty: line.qty,
              notes: line.notes,
            }
          : null
      })

      if (items.some((item) => item === null)) {
        notify('Ada menu yang tidak lagi tersedia.', 'error')
        return null
      }

      const unavailable = items.find((item) => {
        const source = menu.find((entry) => entry.id === item?.itemId)
        return source && !source.available
      })
      if (unavailable) {
        notify(`${unavailable.name} sedang tidak tersedia.`, 'error')
        return null
      }

      const validItems = items as Order['items']
      const subtotal = validItems.reduce((sum, item) => sum + item.price * item.qty, 0)
      const totals = calcTotals(subtotal, input.fulfillment, input.promo)
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()

      const order: Order = {
        id: uid('ord'),
        code: `RSA-${suffix}`,
        createdAt: new Date().toISOString(),
        customer: input.customer,
        fulfillment: input.fulfillment,
        payment: input.payment,
        items: validItems,
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        serviceFee: totals.serviceFee,
        discount: totals.discount,
        promo: input.promo,
        total: totals.total,
        status: 'baru',
      }

      setOrders((current) => [order, ...current])
      setCart([])
      setPromo(null)
      notify('Pesanan berhasil dibuat. Terima kasih!')
      return order
    },
    [cart, menu, notify],
  )

  const reorder = useCallback(
    (order: Order) => {
      const next = cart.map((line) => ({ ...line }))
      let added = 0
      order.items.forEach((line) => {
        const item = menu.find((entry) => entry.id === line.itemId)
        if (!item?.available) return
        const existing = next.find((entry) => entry.itemId === line.itemId)
        if (existing) {
          existing.qty += line.qty
        } else {
          next.push({ itemId: line.itemId, qty: line.qty, notes: line.notes })
        }
        added += line.qty
      })

      if (added > 0) {
        setCart(next)
        notify(`${added} item ditambahkan ke keranjang.`)
      } else {
        notify('Menu dari pesanan ini sedang tidak tersedia.', 'error')
      }
      return added
    },
    [cart, menu, notify],
  )

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status } : order)),
      )
      notify('Status pesanan diperbarui.')
    },
    [notify],
  )

  const cancelOrder = useCallback(
    (orderId: string) => {
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: 'dibatalkan' } : order,
        ),
      )
      notify('Pesanan dibatalkan.', 'info')
    },
    [notify],
  )

  const saveMenuItem = useCallback(
    (item: MenuItem) => {
      const exists = menu.some((entry) => entry.id === item.id)
      if (exists) {
        setMenu((current) =>
          current.map((entry) => (entry.id === item.id ? item : entry)),
        )
        notify(`${item.name} berhasil diperbarui.`)
      } else {
        const created = { ...item, id: uid('m') }
        setMenu((current) => [created, ...current])
        notify(`${item.name} ditambahkan ke menu.`)
      }
    },
    [menu, notify],
  )

  const deleteMenuItem = useCallback(
    (itemId: string) => {
      const item = menu.find((entry) => entry.id === itemId)
      setMenu((current) => current.filter((entry) => entry.id !== itemId))
      setCart((current) => current.filter((line) => line.itemId !== itemId))
      notify(`${item?.name ?? 'Menu'} dihapus.`, 'info')
    },
    [menu, notify],
  )

  const resetDemoData = useCallback(() => {
    setMenu(seedMenu)
    setOrders(buildSeedOrders(seedMenu))
    setCart([])
    setPromo(null)
    notify('Data demo dikembalikan ke awal.', 'info')
  }, [notify])

  const value: StoreValue = {
    menu,
    cart,
    orders,
    promo,
    toasts,
    cartCount,
    cartSubtotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    applyPromo,
    clearPromo,
    placeOrder,
    reorder,
    updateOrderStatus,
    cancelOrder,
    saveMenuItem,
    deleteMenuItem,
    resetDemoData,
    notify,
    dismissToast,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore harus dipakai di dalam StoreProvider')
  }
  return context
}
