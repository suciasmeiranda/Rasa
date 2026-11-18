import { useEffect, useState, type CSSProperties } from 'react'
import {
  ArrowRight,
  Bike,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { navigate } from '../router'
import { lockScroll, unlockScroll } from '../lib/scrollLock'
import {
  calcTotals,
  formatRupiah,
  FREE_DELIVERY_MIN,
  PROMOS,
} from '../lib/format'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const {
    cart,
    menu,
    promo,
    cartSubtotal,
    cartCount,
    updateQty,
    removeFromCart,
    clearCart,
    applyPromo,
    clearPromo,
  } = useStore()
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    if (!open) return
    lockScroll()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      unlockScroll()
    }
  }, [open, onClose])

  if (!open) return null

  const lines = cart
    .map((line) => ({
      ...line,
      item: menu.find((entry) => entry.id === line.itemId),
    }))
    .filter((line): line is typeof line & { item: NonNullable<typeof line.item> } =>
      Boolean(line.item),
    )

  const hasUnavailable = lines.some((line) => !line.item.available)
  const totals = calcTotals(cartSubtotal, 'delivery', promo)
  const remainingForFree = Math.max(0, FREE_DELIVERY_MIN - cartSubtotal)
  const progress = Math.min(100, (cartSubtotal / FREE_DELIVERY_MIN) * 100)

  return (
    <div className="drawer-layer">
      <div className="drawer-overlay" onClick={onClose} aria-hidden="true" />
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang pesanan"
      >
        <div className="drawer__head">
          <div>
            <h2>
              Keranjang <span className="drawer__count">{cartCount} item</span>
            </h2>
            <p>Dari Rasa Dapur, Kemang</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup keranjang">
            <X size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer__empty">
            <span className="empty-icon">
              <ShoppingBag size={30} />
            </span>
            <h3>Keranjangmu masih kosong</h3>
            <p>Yuk pilih menu favoritmu dan mulai pesan. Dimasak fresh setelah dipesan.</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                onClose()
                navigate('/')
              }}
            >
              Lihat menu
            </button>
          </div>
        ) : (
          <>
            <div className="drawer__body">
              <div className="free-shipping">
                <div className="free-shipping__text">
                  <Bike size={16} />
                  {remainingForFree > 0 ? (
                    <span>
                      Tambah <strong>{formatRupiah(remainingForFree)}</strong> lagi untuk
                      gratis ongkir
                    </span>
                  ) : (
                    <span>Selamat, pesananmu dapat gratis ongkir!</span>
                  )}
                </div>
                <div className="progress">
                  <span style={{ '--progress': progress / 100 } as CSSProperties} />
                </div>
              </div>

              <div className="cart-lines">
                {lines.map((line) => (
                  <div
                    key={line.itemId}
                    className={`cart-line ${!line.item.available ? 'is-unavailable' : ''}`}
                  >
                    <div className="cart-line__info">
                      <div className="cart-line__top">
                        <h3>{line.item.name}</h3>
                        <button
                          type="button"
                          className="icon-btn icon-btn--sm"
                          onClick={() => removeFromCart(line.itemId)}
                          aria-label={`Hapus ${line.item.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <span className="cart-line__price">
                        {formatRupiah(line.item.price)}
                      </span>
                      {line.notes && <p className="cart-line__notes">“{line.notes}”</p>}
                      {!line.item.available && (
                        <p className="cart-line__warning">Menu sedang habis, hapus dulu</p>
                      )}
                      <div className="cart-line__bottom">
                        <div className="stepper stepper--sm">
                          <button
                            type="button"
                            onClick={() => updateQty(line.itemId, line.qty - 1)}
                            aria-label="Kurangi jumlah"
                          >
                            <Minus size={14} />
                          </button>
                          <span>{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(line.itemId, line.qty + 1)}
                            aria-label="Tambah jumlah"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <strong>{formatRupiah(line.item.price * line.qty)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="promo-box">
                <div className="promo-box__title">
                  <Tag size={15} />
                  Kode promo
                </div>
                {promo ? (
                  <div className="promo-active">
                    <div>
                      <strong>{promo}</strong>
                      <span>{PROMOS[promo]?.label}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn icon-btn--sm"
                      onClick={() => {
                        clearPromo()
                        setCode('')
                      }}
                      aria-label="Hapus promo"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <form
                    className="promo-form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const ok = applyPromo(code)
                      if (ok) {
                        setCode('')
                        setCodeError('')
                      } else {
                        setCodeError('Kode tidak valid. Coba HEMAT10.')
                      }
                    }}
                  >
                    <input
                      className="input"
                      placeholder="Contoh: HEMAT10"
                      value={code}
                      onChange={(event) => {
                        setCode(event.target.value.toUpperCase())
                        setCodeError('')
                      }}
                      aria-label="Kode promo"
                    />
                    <button type="submit" className="btn btn--outline" disabled={!code.trim()}>
                      Pakai
                    </button>
                  </form>
                )}
                {codeError && <p className="field__error">{codeError}</p>}
              </div>

              <button
                type="button"
                className="link-danger"
                onClick={() => {
                  clearCart()
                  onClose()
                }}
              >
                <Trash2 size={14} /> Kosongkan keranjang
              </button>
            </div>

            <div className="drawer__foot">
              <div className="summary">
                <div className="summary__row">
                  <span>Subtotal</span>
                  <span>{formatRupiah(totals.subtotal)}</span>
                </div>
                <div className="summary__row">
                  <span>Ongkir</span>
                  <span>
                    {totals.deliveryFee === 0 ? (
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
                    <span>Diskon ({promo})</span>
                    <span>−{formatRupiah(totals.discount)}</span>
                  </div>
                )}
                <div className="summary__row summary__row--total">
                  <span>Total</span>
                  <strong>{formatRupiah(totals.total)}</strong>
                </div>
              </div>

              {hasUnavailable && (
                <p className="drawer__warning">
                  Ada menu yang sedang habis. Hapus dari keranjang untuk melanjutkan.
                </p>
              )}

              <button
                type="button"
                className="btn btn--primary btn--block btn--lg"
                onClick={onCheckout}
                disabled={hasUnavailable}
              >
                Lanjut ke pembayaran <ArrowRight size={18} />
              </button>
              <p className="drawer__note">Ongkir dihitung untuk pengantaran di area Kemang.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
