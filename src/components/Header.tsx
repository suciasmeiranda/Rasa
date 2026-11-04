import {
  ClipboardList,
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { navigate } from '../router'

export type NavKey = 'menu' | 'orders' | 'admin'

interface HeaderProps {
  active: NavKey
  onOpenCart: () => void
}

const NAV_ITEMS: { key: NavKey; label: string; path: string }[] = [
  { key: 'menu', label: 'Menu', path: '/' },
  { key: 'orders', label: 'Pesanan saya', path: '/pesanan' },
  { key: 'admin', label: 'Admin', path: '/admin' },
]

export function Header({ active, onOpenCart }: HeaderProps) {
  const { cartCount } = useStore()

  return (
    <>
      <div className="announce">
        <Sparkles size={14} />
        <span>
          Gratis ongkir untuk pesanan di atas Rp100.000
          <span className="announce__divider">•</span>
          <span className="announce__muted">Buka setiap hari 09.00–21.00</span>
        </span>
      </div>
      <header className="header">
        <div className="container header__inner">
          <button
            type="button"
            className="brand"
            onClick={() => navigate('/')}
            aria-label="Rasa, kembali ke menu"
          >
            <span className="brand__mark">🍜</span>
            <span className="brand__name">
              Rasa<span>.</span>
            </span>
          </button>

          <nav className="nav" aria-label="Navigasi utama">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`nav__link ${active === item.key ? 'is-active' : ''}`}
                onClick={() => navigate(item.path)}
                aria-current={active === item.key ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="header__actions">
            <button
              type="button"
              className="cart-btn"
              onClick={onOpenCart}
              aria-label={`Buka keranjang, ${cartCount} item`}
            >
              <ShoppingBag size={18} />
              <span className="cart-btn__label">Keranjang</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export function MobileNav({ active, onOpenCart }: HeaderProps) {
  const { cartCount } = useStore()

  const items = [
    { key: 'menu' as const, label: 'Menu', icon: UtensilsCrossed, path: '/' },
    { key: 'orders' as const, label: 'Pesanan', icon: ClipboardList, path: '/pesanan' },
    { key: 'admin' as const, label: 'Admin', icon: LayoutDashboard, path: '/admin' },
  ]

  return (
    <nav className="bottom-nav" aria-label="Navigasi bawah">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav__item ${active === item.key ? 'is-active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={active === item.key ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        )
      })}
      <button
        type="button"
        className="bottom-nav__item"
        onClick={onOpenCart}
        aria-label={`Buka keranjang, ${cartCount} item`}
      >
        <span className="bottom-nav__icon">
          <ShoppingBag size={20} />
          {cartCount > 0 && <span className="bottom-nav__badge">{cartCount}</span>}
        </span>
        <span>Keranjang</span>
      </button>
    </nav>
  )
}
