import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Banknote,
  Bike,
  Building2,
  Clock3,
  MapPin,
  MessageSquare,
  Phone,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react'
import type { Fulfillment, PaymentMethod } from '../types'
import { useStore } from '../store/StoreContext'
import { Modal } from './Modal'
import { calcTotals, formatRupiah } from '../lib/format'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (orderId: string) => void
}

interface FormState {
  name: string
  phone: string
  address: string
  notes: string
}

const PAYMENT_OPTIONS: {
  value: PaymentMethod
  label: string
  description: string
  icon: typeof QrCode
}[] = [
  { value: 'qris', label: 'QRIS', description: 'Semua e-wallet & m-banking', icon: QrCode },
  {
    value: 'transfer',
    label: 'Transfer bank',
    description: 'BCA, Mandiri, BNI',
    icon: Building2,
  },
  {
    value: 'cod',
    label: 'Bayar di tempat',
    description: 'Tunai saat pesanan tiba',
    icon: Banknote,
  },
]

export function CheckoutModal({ open, onClose, onSuccess }: CheckoutModalProps) {
  const { cart, menu, promo, cartSubtotal, placeOrder } = useStore()
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    address: '',
    notes: '',
  })
  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery')
  const [payment, setPayment] = useState<PaymentMethod>('qris')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) setErrors({})
  }, [open])

  const totals = calcTotals(cartSubtotal, fulfillment, promo)
  const lines = cart.flatMap((line) => {
    const item = menu.find((entry) => entry.id === line.itemId)
    return item ? [{ ...line, item }] : []
  })

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
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

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Nama penerima minimal 2 karakter.'
    }
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 15) {
      nextErrors.phone = 'Nomor HP tidak valid (9 sampai 15 digit).'
    }
    if (fulfillment === 'delivery' && form.address.trim().length < 8) {
      nextErrors.address = 'Alamat pengantaran perlu diisi lebih lengkap.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const order = placeOrder({
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address:
          fulfillment === 'pickup'
            ? 'Ambil di Rasa Dapur, Jl. Kemang Raya No. 8'
            : form.address.trim(),
        notes: form.notes.trim(),
      },
      fulfillment,
      payment,
      promo,
    })

    if (order) {
      setForm((current) => ({ ...current, notes: '' }))
      onSuccess(order.id)
    }
  }

  const estimate =
    Math.max(0, ...lines.map((line) => line.item.prepTime)) +
    (fulfillment === 'delivery' ? 18 : 5)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Selesaikan pesanan"
      subtitle="Cek detail pengantaran dan metode pembayaranmu."
      size="lg"
      className="checkout-modal"
    >
      {lines.length === 0 ? (
        <div className="checkout-empty">
          <span className="empty-icon">
            <ShoppingBag size={28} />
          </span>
          <h3>Keranjang kosong</h3>
          <p>Tambahkan menu dulu sebelum checkout.</p>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Kembali ke menu
          </button>
        </div>
      ) : (
        <form className="checkout" onSubmit={handleSubmit} noValidate>
          <div className="checkout__form">
            <section className="checkout__section">
              <h3 className="checkout__label">1. Metode pesanan</h3>
              <div className="radio-grid">
                <button
                  type="button"
                  className={`radio-card ${fulfillment === 'delivery' ? 'is-selected' : ''}`}
                  onClick={() => setFulfillment('delivery')}
                  role="radio"
                  aria-checked={fulfillment === 'delivery'}
                >
                  <span className="radio-card__icon">
                    <Bike size={20} />
                  </span>
                  <span>
                    <strong>Diantar</strong>
                    <small>± {estimate} menit, {totals.deliveryFee === 0 ? 'Gratis ongkir' : formatRupiah(totals.deliveryFee)}</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={`radio-card ${fulfillment === 'pickup' ? 'is-selected' : ''}`}
                  onClick={() => setFulfillment('pickup')}
                  role="radio"
                  aria-checked={fulfillment === 'pickup'}
                >
                  <span className="radio-card__icon">
                    <Store size={20} />
                  </span>
                  <span>
                    <strong>Ambil sendiri</strong>
                    <small>± {estimate} menit, tanpa ongkir</small>
                  </span>
                </button>
              </div>
            </section>

            <section className="checkout__section">
              <h3 className="checkout__label">2. Detail penerima</h3>
              <div className="field-row">
                <label className="field">
                  <span>Nama lengkap</span>
                  <span className="input-wrap">
                    <User size={16} />
                    <input
                      className={`input ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Nama penerima"
                      value={form.name}
                      onChange={(event) => update('name', event.target.value)}
                      autoComplete="name"
                    />
                  </span>
                  {errors.name && <small className="field__error">{errors.name}</small>}
                </label>
                <label className="field">
                  <span>Nomor HP</span>
                  <span className="input-wrap">
                    <Phone size={16} />
                    <input
                      className={`input ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="0812 3456 7890"
                      value={form.phone}
                      onChange={(event) => update('phone', event.target.value)}
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </span>
                  {errors.phone && <small className="field__error">{errors.phone}</small>}
                </label>
              </div>

              {fulfillment === 'delivery' ? (
                <label className="field">
                  <span>Alamat pengantaran</span>
                  <span className="input-wrap input-wrap--textarea">
                    <MapPin size={16} />
                    <textarea
                      className={`input ${errors.address ? 'is-invalid' : ''}`}
                      rows={2}
                      placeholder="Nama jalan, nomor rumah, kelurahan, patokan…"
                      value={form.address}
                      onChange={(event) => update('address', event.target.value)}
                      autoComplete="street-address"
                    />
                  </span>
                  {errors.address && (
                    <small className="field__error">{errors.address}</small>
                  )}
                </label>
              ) : (
                <div className="pickup-note">
                  <MapPin size={18} />
                  <div>
                    <strong>Ambil di Rasa Dapur</strong>
                    <p>Jl. Kemang Raya No. 8, Jakarta Selatan. Tunjukkan kode pesanan saat ambil.</p>
                  </div>
                </div>
              )}
            </section>

            <section className="checkout__section">
              <h3 className="checkout__label">3. Metode pembayaran</h3>
              <div className="radio-grid radio-grid--three">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`radio-card ${payment === option.value ? 'is-selected' : ''}`}
                      onClick={() => setPayment(option.value)}
                      role="radio"
                      aria-checked={payment === option.value}
                    >
                      <span className="radio-card__icon">
                        <Icon size={19} />
                      </span>
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="checkout__section">
              <h3 className="checkout__label">4. Catatan pesanan</h3>
              <label className="field">
                <span className="sr-only">Catatan pesanan</span>
                <span className="input-wrap input-wrap--textarea">
                  <MessageSquare size={16} />
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Contoh: titip di pos keamanan, jangan dibel…"
                    value={form.notes}
                    onChange={(event) => update('notes', event.target.value)}
                    maxLength={160}
                  />
                </span>
              </label>
            </section>
          </div>

          <aside className="checkout__summary">
            <div className="checkout__summary-head">
              <h3>Ringkasan pesanan</h3>
              <span className="pill">
                <Clock3 size={13} /> ± {estimate} menit
              </span>
            </div>

            <div className="checkout__items">
              {lines.map((line) => (
                <div key={line.itemId} className="checkout-item">
                  <div>
                    <strong>
                      {line.qty}× {line.item.name}
                    </strong>
                    {line.notes && <small>“{line.notes}”</small>}
                  </div>
                  <span>{formatRupiah(line.item.price * line.qty)}</span>
                </div>
              ))}
            </div>

            <div className="summary">
              <div className="summary__row">
                <span>Subtotal</span>
                <span>{formatRupiah(totals.subtotal)}</span>
              </div>
              <div className="summary__row">
                <span>Ongkir</span>
                <span>
                  {fulfillment === 'pickup' ? (
                    <span className="text-muted">Ambil sendiri</span>
                  ) : totals.deliveryFee === 0 ? (
                    <span className="text-green">Gratis</span>
                  ) : (
                    formatRupiah(totals.deliveryFee)
                  )}
                </span>
              </div>
              <div className="summary__row">
                <span>Biaya layanan</span>
                <span>{formatRupiah(totals.serviceFee)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="summary__row summary__row--discount">
                  <span>Promo {promo}</span>
                  <span>−{formatRupiah(totals.discount)}</span>
                </div>
              )}
              <div className="summary__row summary__row--total">
                <span>Total bayar</span>
                <strong>{formatRupiah(totals.total)}</strong>
              </div>
            </div>

            <div className="checkout__trust">
              <ShieldCheck size={17} />
              <span>
                {payment === 'cod'
                  ? 'Siapkan uang tunai saat pesanan tiba.'
                  : 'Pembayaran aman dan terenkripsi. Pesanan diproses setelah pembayaran dikonfirmasi.'}
              </span>
            </div>

            <button type="submit" className="btn btn--primary btn--block btn--lg">
              Pesan sekarang <ArrowRight size={18} />
            </button>
            <p className="checkout__note">
              Dengan memesan, kamu menyetujui syarat & ketentuan Rasa.
            </p>
          </aside>
        </form>
      )}
    </Modal>
  )
}
