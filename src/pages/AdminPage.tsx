import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  Flame,
  LayoutDashboard,
  MapPin,
  PackageOpen,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  Store,
  Timer,
  Trash2,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import type { Category, MenuItem, OrderStatus } from '../types'
import { useStore } from '../store/StoreContext'
import { Modal } from '../components/Modal'
import { OrderTimeline, StatusBadge } from '../components/OrderUI'
import {
  ALL_STATUSES,
  FULFILLMENT_LABEL,
  nextStatus,
  PAYMENT_LABEL,
  STATUS_LABEL,
  STATUS_SHORT,
  statusSteps,
} from '../lib/order'
import {
  formatCompact,
  formatRupiah,
  formatShortDate,
  timeAgo,
} from '../lib/format'

type AdminTab = 'ringkasan' | 'menu' | 'pesanan'
type StatusFilter = 'semua' | OrderStatus

const CATEGORIES: Category[] = ['Makanan Utama', 'Camilan', 'Minuman', 'Dessert']
const ACTIVE_STATUSES: OrderStatus[] = ['baru', 'diproses', 'dikirim', 'siap']

export function AdminPage() {
  const {
    menu,
    orders,
    updateOrderStatus,
    saveMenuItem,
    deleteMenuItem,
    resetDemoData,
  } = useStore()
  const [tab, setTab] = useState<AdminTab>('ringkasan')
  const [menuQuery, setMenuQuery] = useState('')
  const [orderQuery, setOrderQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorItem, setEditorItem] = useState<MenuItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  const paidOrders = useMemo(
    () => orders.filter((order) => order.status !== 'dibatalkan'),
    [orders],
  )
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0)
  const activeOrders = orders.filter((order) =>
    ACTIVE_STATUSES.includes(order.status),
  ).length
  const availableMenu = menu.filter((item) => item.available).length
  const todayKey = new Date().toDateString()
  const todayOrders = paidOrders.filter(
    (order) => new Date(order.createdAt).toDateString() === todayKey,
  )
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<OrderStatus, number>> = {}
    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] ?? 0) + 1
    })
    return counts
  }, [orders])

  const chart = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      return {
        key: date.toDateString(),
        label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
        date,
        revenue: 0,
      }
    })
    paidOrders.forEach((order) => {
      const key = new Date(order.createdAt).toDateString()
      const day = days.find((entry) => entry.key === key)
      if (day) day.revenue += order.total
    })
    const max = Math.max(1, ...days.map((day) => day.revenue))
    return { days, max }
  }, [paidOrders])

  const topItems = useMemo(() => {
    const map = new Map<string, { name: string; qty: number }>()
    paidOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = map.get(item.itemId)
        if (existing) {
          existing.qty += item.qty
        } else {
          map.set(item.itemId, {
            name: item.name,
            qty: item.qty,
          })
        }
      })
    })
    const list = [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5)
    const max = Math.max(1, ...list.map((item) => item.qty))
    return { list, max }
  }, [paidOrders])

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [orders],
  )

  const filteredMenu = useMemo(() => {
    const query = menuQuery.trim().toLowerCase()
    return menu.filter(
      (item) =>
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }, [menu, menuQuery])

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase()
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((order) => {
        const matchStatus = statusFilter === 'semua' || order.status === statusFilter
        const matchQuery =
          !query ||
          order.code.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.phone.toLowerCase().includes(query)
        return matchStatus && matchQuery
      })
  }, [orders, statusFilter, orderQuery])

  const openEditor = (item: MenuItem | null) => {
    setEditorItem(item)
    setEditorOpen(true)
  }

  return (
    <>
      <section className="container page-head">
        <div>
          <h1>Kelola Rasa Dapur</h1>
          <p>Pantau penjualan, atur menu, dan proses pesanan pelanggan dari satu tempat.</p>
        </div>
        <div className="page-head__side">
          <span className="pill">
            <ShieldCheck size={14} /> Mode demo
          </span>
          <span className="pill pill--active">
            {activeOrders} pesanan aktif
          </span>
        </div>
      </section>

      <div className="container admin-page">
        <div className="admin-tabs" role="tablist" aria-label="Bagian admin">
          {(
            [
              { key: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
              { key: 'menu', label: 'Menu', icon: UtensilsCrossed },
              { key: 'pesanan', label: 'Pesanan', icon: ClipboardList },
            ] as { key: AdminTab; label: string; icon: typeof LayoutDashboard }[]
          ).map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                className={`admin-tab ${tab === item.key ? 'is-active' : ''}`}
                onClick={() => setTab(item.key)}
              >
                <Icon size={17} />
                {item.label}
                {item.key === 'pesanan' && activeOrders > 0 && (
                  <span className="admin-tab__badge">{activeOrders}</span>
                )}
              </button>
            )
          })}
        </div>

        {tab === 'ringkasan' && (
          <div className="admin-section">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-card__icon">
                  <Wallet size={19} />
                </span>
                <div>
                  <span className="stat-card__label">Total pendapatan</span>
                  <strong>{formatRupiah(revenue)}</strong>
                  <small>Hari ini {formatRupiah(todayRevenue)}</small>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card__icon">
                  <ReceiptText size={19} />
                </span>
                <div>
                  <span className="stat-card__label">Pesanan masuk</span>
                  <strong>{orders.length}</strong>
                  <small>{todayOrders.length} pesanan hari ini</small>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card__icon">
                  <Timer size={19} />
                </span>
                <div>
                  <span className="stat-card__label">Pesanan aktif</span>
                  <strong>{activeOrders}</strong>
                  <small>Perlu diproses hari ini</small>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card__icon">
                  <UtensilsCrossed size={19} />
                </span>
                <div>
                  <span className="stat-card__label">Menu tersedia</span>
                  <strong>
                    {availableMenu}
                    <span className="stat-card__muted">/{menu.length}</span>
                  </strong>
                  <small>{menu.length - availableMenu} menu sedang habis</small>
                </div>
              </div>
            </div>

            <div className="admin-grid">
              <section className="panel">
                <div className="panel__head">
                  <div>
                    <h2>
                      <TrendingUp size={18} /> Pendapatan 7 hari terakhir
                    </h2>
                    <p>Total {formatRupiah(chart.days.reduce((sum, day) => sum + day.revenue, 0))}</p>
                  </div>
                  <span className="pill">Tanpa pesanan batal</span>
                </div>
                <div className="chart" role="img" aria-label="Grafik pendapatan tujuh hari terakhir">
                  {chart.days.map((day) => (
                    <div key={day.key} className="chart__col">
                      <span className="chart__value">
                        {day.revenue > 0 ? formatCompact(day.revenue / 1000) : ''}
                      </span>
                      <div className="chart__track">
                        <div
                          className="chart__bar"
                          style={{
                            height: `${Math.max(5, (day.revenue / chart.max) * 100)}%`,
                          }}
                          title={`${day.label}: ${formatRupiah(day.revenue)}`}
                        />
                      </div>
                      <span className="chart__label">{day.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel__head">
                  <div>
                    <h2>
                      <Flame size={18} /> Menu terlaris
                    </h2>
                    <p>Berdasarkan jumlah item terjual</p>
                  </div>
                </div>
                {topItems.list.length === 0 ? (
                  <p className="panel__empty">Belum ada data penjualan.</p>
                ) : (
                  <div className="top-list">
                    {topItems.list.map((item, index) => (
                      <div key={item.name} className="top-item">
                        <span className="top-item__rank">{index + 1}</span>
                        <div className="top-item__info">
                          <div>
                            <strong>{item.name}</strong>
                            <span>{formatCompact(item.qty)} porsi</span>
                          </div>
                          <div className="progress progress--thin">
                            <span style={{ '--progress': item.qty / topItems.max } as CSSProperties} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="admin-grid admin-grid--bottom">
              <section className="panel">
                <div className="panel__head">
                  <div>
                    <h2>
                      <ReceiptText size={18} /> Pesanan terbaru
                    </h2>
                    <p>5 pesanan terakhir yang masuk</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setTab('pesanan')}
                  >
                    Lihat semua <ArrowRight size={15} />
                  </button>
                </div>
                <div className="recent-list">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="recent-order">
                      <div className="recent-order__main">
                        <strong>{order.code}</strong>
                        <span>
                          {order.customer.name},{' '}
                          {order.items.reduce((sum, item) => sum + item.qty, 0)} item
                        </span>
                      </div>
                      <span className="recent-order__total">{formatRupiah(order.total)}</span>
                      <StatusBadge status={order.status} />
                      <span className="recent-order__time">{timeAgo(order.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel panel--danger">
                <div className="panel__head">
                  <div>
                    <h2>
                      <RotateCcw size={18} /> Data demo
                    </h2>
                    <p>Kembalikan menu dan pesanan ke data awal.</p>
                  </div>
                </div>
                <p className="panel__text">
                  Semua perubahan menu, pesanan, dan isi keranjang akan dihapus dan
                  diganti dengan data contoh. Cocok untuk mencoba ulang alur aplikasi.
                </p>
                <button
                  type="button"
                  className="btn btn--outline btn--block"
                  onClick={() => setResetOpen(true)}
                >
                  <RotateCcw size={16} /> Reset data demo
                </button>
              </section>
            </div>
          </div>
        )}

        {tab === 'menu' && (
          <div className="admin-section">
            <div className="admin-toolbar">
              <div className="search search--sm">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Cari nama menu atau kategori…"
                  value={menuQuery}
                  onChange={(event) => setMenuQuery(event.target.value)}
                  aria-label="Cari menu"
                />
              </div>
              <button type="button" className="btn btn--primary" onClick={() => openEditor(null)}>
                <Plus size={17} /> Tambah menu
              </button>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Menu</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Terjual</th>
                    <th>Status</th>
                    <th aria-label="Aksi" />
                  </tr>
                </thead>
                <tbody>
                  {filteredMenu.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-menu">
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.tags.join(', ') || item.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="table-category">
                        <span className="category-tag">{item.category}</span>
                      </td>
                      <td className="table-price">{formatRupiah(item.price)}</td>
                      <td className="table-sold">{formatCompact(item.sold)}</td>
                      <td className="table-status">
                        <button
                          type="button"
                          className={`switch ${item.available ? 'is-on' : ''}`}
                          aria-pressed={item.available}
                          aria-label={`${item.available ? 'Nonaktifkan' : 'Aktifkan'} ${item.name}`}
                          onClick={() => saveMenuItem({ ...item, available: !item.available })}
                        />
                      </td>
                      <td className="table-actions-cell">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="icon-btn icon-btn--sm"
                            onClick={() => openEditor(item)}
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn--sm icon-btn--danger"
                            onClick={() => setDeleteTarget(item)}
                            aria-label={`Hapus ${item.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMenu.length === 0 && (
                <div className="table-empty">
                  <PackageOpen size={26} />
                  <p>Tidak ada menu yang cocok dengan pencarian.</p>
                </div>
              )}
            </div>
            <p className="table-hint">
              Menonaktifkan menu akan menyembunyikannya dari pelanggan. Menu yang sedang
              dipesan tidak bisa dihapus dari riwayat.
            </p>
          </div>
        )}

        {tab === 'pesanan' && (
          <div className="admin-section">
            <div className="admin-toolbar admin-toolbar--wrap">
              <div className="status-tabs" role="tablist" aria-label="Filter status pesanan">
                <button
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === 'semua'}
                  className={`chip ${statusFilter === 'semua' ? 'is-active' : ''}`}
                  onClick={() => setStatusFilter('semua')}
                >
                  Semua <span>{orders.length}</span>
                </button>
                {ALL_STATUSES.filter((status) => statusCounts[status]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === status}
                    className={`chip ${statusFilter === status ? 'is-active' : ''}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {STATUS_SHORT[status]} <span>{statusCounts[status]}</span>
                  </button>
                ))}
              </div>
              <div className="search search--sm">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Cari kode, nama, atau HP…"
                  value={orderQuery}
                  onChange={(event) => setOrderQuery(event.target.value)}
                  aria-label="Cari pesanan"
                />
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-state empty-state--compact">
                <span className="empty-icon">
                  <PackageOpen size={28} />
                </span>
                <h3>Tidak ada pesanan</h3>
                <p>Belum ada pesanan yang cocok dengan filter ini.</p>
              </div>
            ) : (
              <div className="admin-order-list">
                {filteredOrders.map((order) => {
                  const isOpen = expandedOrder === order.id
                  const next = nextStatus(order.status, order.fulfillment)
                  return (
                    <article key={order.id} className="admin-order">
                      <div className="admin-order__head">
                        <div className="admin-order__identity">
                          <span className="admin-order__icon">
                            {order.fulfillment === 'delivery' ? (
                              <Bike size={18} />
                            ) : (
                              <Store size={18} />
                            )}
                          </span>
                          <div>
                            <strong>{order.code}</strong>
                            <span>
                              {formatShortDate(order.createdAt)}, {timeAgo(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="admin-order__grid">
                        <div>
                          <span className="admin-order__label">Pelanggan</span>
                          <strong>{order.customer.name}</strong>
                          <small>{order.customer.phone}</small>
                        </div>
                        <div>
                          <span className="admin-order__label">Pesanan</span>
                          <strong>
                            {order.items.reduce((sum, item) => sum + item.qty, 0)} item
                          </strong>
                          <small>{FULFILLMENT_LABEL[order.fulfillment]}, {PAYMENT_LABEL[order.payment]}</small>
                        </div>
                        <div>
                          <span className="admin-order__label">Total</span>
                          <strong>{formatRupiah(order.total)}</strong>
                          <small>
                            {order.fulfillment === 'delivery' ? 'Diantar' : 'Ambil sendiri'}
                          </small>
                        </div>
                        <div className="admin-order__controls">
                          <select
                            className="input input--sm"
                            value={order.status}
                            onChange={(event) =>
                              updateOrderStatus(order.id, event.target.value as OrderStatus)
                            }
                            aria-label={`Ubah status ${order.code}`}
                          >
                            {[...statusSteps(order.fulfillment), 'dibatalkan' as OrderStatus].map(
                              (status) => (
                                <option key={status} value={status}>
                                  {STATUS_SHORT[status]}
                                </option>
                              ),
                            )}
                          </select>
                          {next && (
                            <button
                              type="button"
                              className="btn btn--outline btn--sm"
                              onClick={() => updateOrderStatus(order.id, next)}
                            >
                              <CheckCircle2 size={15} />
                              {STATUS_SHORT[next]}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="admin-order__foot">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                          aria-expanded={isOpen}
                        >
                          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          {isOpen ? 'Tutup detail' : 'Lihat detail'}
                        </button>
                        <span className="admin-order__status-text">
                          Status: {STATUS_LABEL[order.status]}
                        </span>
                      </div>

                      {isOpen && (
                        <div className="admin-order__detail">
                          <div>
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
                          <div>
                            <h4>Pengantaran</h4>
                            <div className="info-list">
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
                                  <ClipboardList size={15} />
                                  <span>Catatan: {order.customer.notes}</span>
                                </p>
                              )}
                            </div>
                            <h4>Timeline</h4>
                            <OrderTimeline order={order} vertical />
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <MenuEditor
        open={editorOpen}
        item={editorItem}
        onClose={() => setEditorOpen(false)}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus menu?"
        subtitle={deleteTarget ? `${deleteTarget.name} akan dihapus dari daftar menu.` : undefined}
        size="sm"
      >
        <div className="modal__body">
          <div className="warning-box">
            <AlertTriangle size={18} />
            <p>
              Menu yang dihapus tidak bisa dikembalikan. Riwayat pesanan lama tetap
              menyimpan nama dan harga menu ini.
            </p>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                if (deleteTarget) deleteMenuItem(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              <Trash2 size={16} /> Hapus menu
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset data demo?"
        subtitle="Menu, pesanan, dan keranjang akan dikembalikan ke data awal."
        size="sm"
      >
        <div className="modal__body">
          <div className="warning-box">
            <AlertTriangle size={18} />
            <p>Semua perubahan yang sudah kamu buat akan hilang. Lanjutkan?</p>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--outline" onClick={() => setResetOpen(false)}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                resetDemoData()
                setResetOpen(false)
              }}
            >
              <RotateCcw size={16} /> Ya, reset
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

interface Draft {
  id: string
  name: string
  description: string
  price: string
  category: Category
  emoji: string
  rating: string
  sold: string
  prepTime: string
  tags: string
  available: boolean
}

const EMPTY_DRAFT: Draft = {
  id: '',
  name: '',
  description: '',
  price: '',
  category: 'Makanan Utama',
  emoji: '',
  rating: '4.8',
  sold: '0',
  prepTime: '15',
  tags: '',
  available: true,
}

function toDraft(item: MenuItem): Draft {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: String(item.price),
    category: item.category,
    emoji: item.emoji,
    rating: String(item.rating),
    sold: String(item.sold),
    prepTime: String(item.prepTime),
    tags: item.tags.join(', '),
    available: item.available,
  }
}

function MenuEditor({
  open,
  item,
  onClose,
}: {
  open: boolean
  item: MenuItem | null
  onClose: () => void
}) {
  const { saveMenuItem } = useStore()
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setDraft(item ? toDraft(item) : EMPTY_DRAFT)
    setErrors({})
  }, [open, item])

  const update = <K extends keyof Draft>(field: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    const price = Number(draft.price)
    const rating = Number(draft.rating)
    const sold = Number(draft.sold)
    const prepTime = Number(draft.prepTime)

    if (draft.name.trim().length < 2) nextErrors.name = 'Nama menu minimal 2 karakter.'
    if (draft.description.trim().length < 8) {
      nextErrors.description = 'Deskripsi minimal 8 karakter.'
    }
    if (!Number.isFinite(price) || price <= 0) nextErrors.price = 'Harga harus lebih dari 0.'
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      nextErrors.rating = 'Rating 0 sampai 5.'
    }
    if (!Number.isFinite(prepTime) || prepTime < 1) {
      nextErrors.prepTime = 'Waktu minimal 1 menit.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    saveMenuItem({
      id: draft.id,
      name: draft.name.trim(),
      description: draft.description.trim(),
      price,
      category: draft.category,
      emoji: draft.emoji.trim(),
      rating: Math.min(5, Math.max(0, rating)),
      sold: Math.max(0, Math.round(Number.isFinite(sold) ? sold : 0)),
      prepTime: Math.max(1, Math.round(prepTime)),
      tags: draft.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 3),
      available: draft.available,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? 'Edit menu' : 'Tambah menu baru'}
      subtitle={
        item
          ? 'Perbarui detail menu yang sudah ada.'
          : 'Menu baru langsung tampil di halaman pelanggan.'
      }
      size="md"
    >
      <form className="modal__body menu-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Nama menu</span>
          <input
            className={`input ${errors.name ? 'is-invalid' : ''}`}
            value={draft.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Contoh: Nasi Goreng Kampung"
          />
          {errors.name && <small className="field__error">{errors.name}</small>}
        </label>

        <label className="field">
          <span>Deskripsi</span>
          <textarea
            className={`input ${errors.description ? 'is-invalid' : ''}`}
            rows={3}
            value={draft.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="Ceritakan rasa, isi, dan keunggulan menu ini…"
            maxLength={220}
          />
          {errors.description && (
            <small className="field__error">{errors.description}</small>
          )}
        </label>

        <div className="field-row field-row--three">
          <label className="field">
            <span>Harga (Rp)</span>
            <input
              className={`input ${errors.price ? 'is-invalid' : ''}`}
              type="number"
              min={0}
              step={1000}
              value={draft.price}
              onChange={(event) => update('price', event.target.value)}
              placeholder="28000"
            />
            {errors.price && <small className="field__error">{errors.price}</small>}
          </label>
          <label className="field">
            <span>Kategori</span>
            <select
              className="input"
              value={draft.category}
              onChange={(event) => update('category', event.target.value as Category)}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Waktu siap (menit)</span>
            <input
              className={`input ${errors.prepTime ? 'is-invalid' : ''}`}
              type="number"
              min={1}
              value={draft.prepTime}
              onChange={(event) => update('prepTime', event.target.value)}
            />
            {errors.prepTime && <small className="field__error">{errors.prepTime}</small>}
          </label>
        </div>

        <div className="field-row field-row--three">
          <label className="field">
            <span>Rating awal</span>
            <input
              className={`input ${errors.rating ? 'is-invalid' : ''}`}
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={draft.rating}
              onChange={(event) => update('rating', event.target.value)}
            />
            {errors.rating && <small className="field__error">{errors.rating}</small>}
          </label>
          <label className="field">
            <span>Jumlah terjual</span>
            <input
              className="input"
              type="number"
              min={0}
              value={draft.sold}
              onChange={(event) => update('sold', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Label (pisahkan koma)</span>
            <input
              className="input"
              value={draft.tags}
              onChange={(event) => update('tags', event.target.value)}
              placeholder="Best seller, Pedas"
            />
          </label>
        </div>

        <label className="check-row">
          <input
            type="checkbox"
            checked={draft.available}
            onChange={(event) => update('available', event.target.checked)}
          />
          <span>
            <strong>Tersedia untuk dipesan</strong>
            <small>Nonaktifkan jika menu sedang habis.</small>
          </span>
        </label>

        <div className="modal__actions">
          <button type="button" className="btn btn--outline" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn--primary">
            {item ? 'Simpan perubahan' : 'Tambah menu'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
