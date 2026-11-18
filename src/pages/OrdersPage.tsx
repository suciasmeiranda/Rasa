import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  ShoppingBag,
  XCircle,
} from 'lucide-react'
import type { Order } from '../types'
import { useStore } from '../store/StoreContext'
import { Modal } from '../components/Modal'
import { OrderTimeline, StatusBadge } from '../components/OrderUI'
import {
  FULFILLMENT_LABEL,
  PAYMENT_LABEL,
} from '../lib/order'
import { formatDateTime, formatRupiah, timeAgo } from '../lib/format'
import { navigate } from '../router'

type FilterKey = 'semua' | 'aktif' | 'riwayat'

const ACTIVE_STATUSES = new Set(['baru', 'diproses', 'dikirim', 'siap'])

interface OrdersPageProps {
  onOpenCart: () => void
}

export function OrdersPage({ onOpenCart }: OrdersPageProps) {
  const { orders, reorder, cancelOrder } = useStore()
  const [filter, setFilter] = useState<FilterKey>('semua')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)

  const sorted = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  )

  const counts = {
    semua: sorted.length,
    aktif: sorted.filter((order) => ACTIVE_STATUSES.has(order.status)).length,
    riwayat: sorted.filter((order) => !ACTIVE_STATUSES.has(order.status)).length,
  }

  const filtered = sorted.filter((order) => {
    const matchFilter =
      filter === 'semua'
        ? true
        : filter === 'aktif'
          ? ACTIVE_STATUSES.has(order.status)
          : !ACTIVE_STATUSES.has(order.status)
    const normalized = query.trim().toLowerCase()
    const matchQuery =
      !normalized ||
      order.code.toLowerCase().includes(normalized) ||
      order.customer.name.toLowerCase().includes(normalized) ||
      order.items.some((item) => item.name.toLowerCase().includes(normalized))
    return matchFilter && matchQuery
  })

  const handleReorder = (order: Order) => {
    const added = reorder(order)
    if (added > 0) onOpenCart()
  }

  return (
    <>
      <section className="container page-head">
        <div>
          <h1>Pesanan saya</h1>
          <p>Pantau pesanan yang sedang berjalan atau pesan lagi menu favoritmu.</p>
        </div>
        <div className="page-head__side">
          <span className="pill pill--active">
            {counts.aktif} pesanan aktif
          </span>
          <button type="button" className="btn btn--outline" onClick={() => navigate('/')}>
            <ShoppingBag size={16} /> Pesan lagi
          </button>
        </div>
      </section>

      <section className="container orders-page">
        <div className="orders-toolbar">
          <div className="tabs" role="tablist" aria-label="Filter pesanan">
            {(
              [
                { key: 'semua', label: 'Semua' },
                { key: 'aktif', label: 'Aktif' },
                { key: 'riwayat', label: 'Riwayat' },
              ] as { key: FilterKey; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={filter === tab.key}
                className={`tab ${filter === tab.key ? 'is-active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                <span>{counts[tab.key]}</span>
              </button>
            ))}
          </div>
          <div className="search search--sm">
            <Search size={17} />
            <input
              type="search"
              placeholder="Cari kode atau menu…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Cari pesanan"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <ClipboardList size={30} />
            </span>
            <h3>Belum ada pesanan di sini</h3>
            <p>
              {sorted.length === 0
                ? 'Yuk mulai pesan makanan pertamamu. Menu favorit menunggu.'
                : 'Coba ubah filter atau kata kunci pencarian.'}
            </p>
            <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
              Lihat menu
            </button>
          </div>
        ) : (
          <div className="order-list">
            {filtered.map((order) => {
              const isOpen = expanded === order.id
              const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)
              return (
                <article key={order.id} className="order-card">
                  <div className="order-card__head">
                    <div className="order-card__identity">
                      <div>
                        <div className="order-card__code">
                          {order.code}
                          <span>{formatDateTime(order.createdAt)}</span>
                        </div>
                        <p>
                          {order.items
                            .slice(0, 2)
                            .map((item) => item.name)
                            .join(', ')}
                          {order.items.length > 2 ? ` +${order.items.length - 2} lagi` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="order-card__status">
                      <StatusBadge status={order.status} />
                      <span className="order-card__time">{timeAgo(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="order-card__summary">
                    <span>
                      <strong>{itemCount} item</strong>, {FULFILLMENT_LABEL[order.fulfillment]}
                    </span>
                    <span>
                      <strong>{formatRupiah(order.total)}</strong>
                    </span>
                  </div>

                  <div className="order-card__actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      {isOpen ? 'Tutup detail' : 'Lihat detail'}
                    </button>
                    <div className="order-card__action-group">
                      {order.status === 'baru' && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm btn--danger-text"
                          onClick={() => setCancelTarget(order)}
                        >
                          <XCircle size={15} /> Batalkan
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => handleReorder(order)}
                      >
                        <RotateCcw size={15} /> Pesan lagi
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="order-detail">
                      <div className="order-detail__col">
                        <h4>Item pesanan</h4>
                        <div className="order-detail__items">
                          {order.items.map((item, index) => (
                            <div
                              key={`${item.itemId}-${index}`}
                              className="order-detail__item"
                            >
                              <div>
                                <strong>
                                  {item.qty}× {item.name}
                                </strong>
                                {item.notes && <small>“{item.notes}”</small>}
                              </div>
                              <span>{formatRupiah(item.price * item.qty)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="summary summary--compact">
                          <div className="summary__row">
                            <span>Subtotal</span>
                            <span>{formatRupiah(order.subtotal)}</span>
                          </div>
                          <div className="summary__row">
                            <span>Ongkir</span>
                            <span>
                              {order.deliveryFee === 0
                                ? 'Gratis'
                                : formatRupiah(order.deliveryFee)}
                            </span>
                          </div>
                          <div className="summary__row">
                            <span>Biaya layanan</span>
                            <span>{formatRupiah(order.serviceFee)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="summary__row summary__row--discount">
                              <span>Diskon {order.promo}</span>
                              <span>−{formatRupiah(order.discount)}</span>
                            </div>
                          )}
                          <div className="summary__row summary__row--total">
                            <span>Total</span>
                            <strong>{formatRupiah(order.total)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="order-detail__col">
                        <h4>Info pengantaran</h4>
                        <div className="info-list">
                          <p>
                            <strong>{order.customer.name}</strong>
                            <span>{order.customer.phone}</span>
                          </p>
                          <p>
                            <MapPin size={15} />
                            <span>{order.customer.address}</span>
                          </p>
                          <p>
                            <CreditCard size={15} />
                            <span>
                              {PAYMENT_LABEL[order.payment]},{' '}
                              {FULFILLMENT_LABEL[order.fulfillment]}
                            </span>
                          </p>
                          {order.customer.notes && (
                            <p>
                              <Phone size={15} />
                              <span>Catatan: {order.customer.notes}</span>
                            </p>
                          )}
                        </div>
                        <h4>Status pesanan</h4>
                        <OrderTimeline order={order} vertical />
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Batalkan pesanan?"
        subtitle={
          cancelTarget
            ? `Pesanan ${cancelTarget.code} akan dibatalkan dan tidak diproses.`
            : undefined
        }
        size="sm"
      >
        <div className="modal__body">
          <p className="modal__text">
            Pesanan yang sudah dibatalkan tidak bisa dikembalikan. Kamu bisa memesan
            ulang kapan saja.
          </p>
          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setCancelTarget(null)}
            >
              Kembali
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                if (cancelTarget) cancelOrder(cancelTarget.id)
                setCancelTarget(null)
              }}
            >
              Ya, batalkan
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
