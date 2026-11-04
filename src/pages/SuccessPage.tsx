import { useState } from 'react'
import {
  ArrowRight,
  Bike,
  Check,
  ClipboardList,
  Clock3,
  Copy,
  CreditCard,
  MapPin,
  ShoppingBag,
  Store,
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { OrderTimeline, StatusBadge } from '../components/OrderUI'
import {
  FULFILLMENT_LABEL,
  PAYMENT_LABEL,
} from '../lib/order'
import { formatDateTime, formatRupiah } from '../lib/format'
import { navigate } from '../router'

interface SuccessPageProps {
  orderId: string
}

export function SuccessPage({ orderId }: SuccessPageProps) {
  const { orders } = useStore()
  const [copied, setCopied] = useState(false)
  const order = orders.find((entry) => entry.id === orderId)

  if (!order) {
    return (
      <section className="container success-page">
        <div className="empty-state">
          <span className="empty-icon">
            <ClipboardList size={30} />
          </span>
          <h3>Pesanan tidak ditemukan</h3>
          <p>Mungkin tautannya sudah tidak berlaku. Cek daftar pesananmu, ya.</p>
          <div className="empty-state__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/pesanan')}
            >
              Lihat pesanan saya
            </button>
            <button type="button" className="btn btn--outline" onClick={() => navigate('/')}>
              Kembali ke menu
            </button>
          </div>
        </div>
      </section>
    )
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)
  const estimate = order.fulfillment === 'delivery' ? 35 : 20

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // Clipboard bisa diblokir browser; kode tetap terlihat di layar.
    }
  }

  return (
    <section className="container success-page">
      <div className="success-card">
        <div className="success-hero">
          <span className="success-ring" aria-hidden="true">
            <Check size={40} strokeWidth={3} />
          </span>
          <span className="section-kicker">Pesanan diterima</span>
          <h1>Terima kasih, {order.customer.name.split(' ')[0]}!</h1>
          <p>
            Pesananmu sudah diteruskan ke dapur. Kami masak fresh dan kabari lewat
            status pesanan.
          </p>
          <div className="success-meta">
            <StatusBadge status={order.status} />
            <span className="pill">
              <Clock3 size={13} />
              {order.fulfillment === 'delivery'
                ? `Estimasi tiba ± ${estimate} menit`
                : `Siap diambil ± ${estimate} menit`}
            </span>
          </div>
        </div>

        <div className="success-code">
          <div>
            <span>Kode pesanan</span>
            <strong>{order.code}</strong>
            <small>{formatDateTime(order.createdAt)}</small>
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={copyCode}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Tersalin' : 'Salin kode'}
          </button>
        </div>

        <div className="success-timeline">
          <h2>Status pesanan</h2>
          <OrderTimeline order={order} />
        </div>

        <div className="success-details">
          <div>
            <h2>Detail pesanan</h2>
            <div className="order-detail__items">
              {order.items.map((item, index) => (
                <div key={`${item.itemId}-${index}`} className="order-detail__item">
                  <span aria-hidden="true">{item.emoji}</span>
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
                <span>Subtotal ({itemCount} item)</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="summary__row">
                <span>Ongkir</span>
                <span>
                  {order.deliveryFee === 0 ? 'Gratis' : formatRupiah(order.deliveryFee)}
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

          <div className="success-info">
            <h2>Info pengantaran</h2>
            <div className="info-list">
              <p>
                {order.fulfillment === 'delivery' ? <Bike size={15} /> : <Store size={15} />}
                <span>{FULFILLMENT_LABEL[order.fulfillment]}</span>
              </p>
              <p>
                <MapPin size={15} />
                <span>{order.customer.address}</span>
              </p>
              <p>
                <CreditCard size={15} />
                <span>{PAYMENT_LABEL[order.payment]}</span>
              </p>
              {order.customer.notes && (
                <p>
                  <ClipboardList size={15} />
                  <span>Catatan: {order.customer.notes}</span>
                </p>
              )}
            </div>
            <div className="success-tip">
              <Clock3 size={17} />
              <p>
                Simpan kode <strong>{order.code}</strong> untuk menanyakan status
                pesananmu ke dapur.
              </p>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => navigate('/pesanan')}
          >
            <ClipboardList size={18} /> Lacak pesanan
          </button>
          <button
            type="button"
            className="btn btn--outline btn--lg"
            onClick={() => navigate('/')}
          >
            <ShoppingBag size={18} /> Pesan lagi <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  )
}
