import { useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Bike,
  Check,
  ChefHat,
  Clock3,
  Copy,
  Leaf,
  Search,
  SearchX,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import type { Category, MenuItem } from '../types'
import { useStore } from '../store/StoreContext'
import { MenuCard } from '../components/MenuCard'
import { ItemModal } from '../components/ItemModal'
import { formatCompact } from '../lib/format'
import { navigate } from '../router'

const CATEGORIES: ('Semua' | Category)[] = [
  'Semua',
  'Makanan Utama',
  'Camilan',
  'Minuman',
  'Dessert',
]

type SortKey = 'populer' | 'murah' | 'mahal' | 'rating'

export function MenuPage() {
  const { menu, addToCart, notify } = useStore()
  const [category, setCategory] = useState<'Semua' | Category>('Semua')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('populer')
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const promoRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const result = menu.filter((item) => {
      const matchCategory = category === 'Semua' || item.category === category
      const matchQuery =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalized))
      return matchCategory && matchQuery
    })

    return [...result].sort((a, b) => {
      if (sort === 'murah') return a.price - b.price
      if (sort === 'mahal') return b.price - a.price
      if (sort === 'rating') return b.rating - a.rating
      return b.sold - a.sold
    })
  }, [menu, category, query, sort])

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const copyPromo = async () => {
    try {
      await navigator.clipboard.writeText('HEMAT10')
      setCopied(true)
      notify('Kode HEMAT10 disalin.')
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      notify('Salin manual: HEMAT10', 'info')
    }
  }

  return (
    <>
      <section className="hero container">
        <div className="hero__copy">
          <span className="eyebrow">
            <span className="eyebrow__dot" />
            Dapur rumahan • Jakarta Selatan
          </span>
          <h1>
            Makanan rumahan,
            <br />
            <em>rasa juara.</em>
          </h1>
          <p className="hero__lead">
            Dari nasi goreng kampung sampai kopi susu gula aren — dimasak fresh
            dengan bahan pilihan, diantar hangat ke pintumu dalam 30 menit.
          </p>
          <div className="hero__cta">
            <button type="button" className="btn btn--primary btn--lg" onClick={scrollToMenu}>
              Pesan sekarang <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() =>
                promoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            >
              <Sparkles size={17} /> Lihat promo
            </button>
          </div>
          <div className="hero__stats">
            <div className="stat">
              <strong>
                4.9 <Star size={16} fill="currentColor" className="stat__star" />
              </strong>
              <span>Rating pelanggan</span>
            </div>
            <div className="stat">
              <strong>30 mnt</strong>
              <span>Rata-rata antar</span>
            </div>
            <div className="stat">
              <strong>12 rb+</strong>
              <span>Pelanggan setia</span>
            </div>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__card">
            <span className="hero__blob hero__blob--one" />
            <span className="hero__blob hero__blob--two" />
            <span className="hero__emoji">🍛</span>
            <span className="hero__stamp">
              <ChefHat size={15} />
              Dimasak fresh
            </span>
          </div>
          <div className="float-card float-card--rating">
            <span className="float-card__icon float-card__icon--yellow">
              <Star size={17} fill="currentColor" />
            </span>
            <div>
              <strong>4.9/5</strong>
              <small>2.400+ ulasan</small>
            </div>
          </div>
          <div className="float-card float-card--delivery">
            <span className="float-card__icon float-card__icon--green">
              <Bike size={18} />
            </span>
            <div>
              <strong>30 menit</strong>
              <small>Sampai hangat</small>
            </div>
          </div>
          <div className="float-card float-card--best">
            <span className="float-card__emoji">🍗</span>
            <div>
              <strong>Best seller</strong>
              <small>Ayam Geprek</small>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="promo-banner" ref={promoRef}>
          <div className="promo-banner__glow" aria-hidden="true" />
          <div className="promo-banner__copy">
            <span className="promo-banner__eyebrow">
              <Sparkles size={14} /> Promo minggu ini
            </span>
            <h2>Diskon 10% untuk pesanan pertamamu</h2>
            <p>
              Pakai kode <strong>HEMAT10</strong> saat checkout. Potongan maksimal
              Rp25.000, berlaku sampai akhir minggu.
            </p>
          </div>
          <button type="button" className="promo-banner__code" onClick={copyPromo}>
            <span>{copied ? 'Tersalin!' : 'HEMAT10'}</span>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      <section className="container menu-section" id="menu" ref={menuRef}>
        <div className="section-head">
          <div>
            <span className="section-kicker">Menu pilihan</span>
            <h2>Menu favorit hari ini</h2>
            <p>Semua dimasak setelah kamu pesan. Pilih, tambah catatan, kami masak.</p>
          </div>
          <span className="menu-count">
            <span>{filtered.length}</span> menu tersedia
          </span>
        </div>

        <div className="menu-toolbar">
          <div className="search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Cari nasi goreng, kopi, camilan…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Cari menu"
            />
          </div>
          <label className="sort">
            <span className="sr-only">Urutkan menu</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
              <option value="populer">Paling populer</option>
              <option value="murah">Harga terendah</option>
              <option value="mahal">Harga tertinggi</option>
              <option value="rating">Rating tertinggi</option>
            </select>
          </label>
        </div>

        <div className="chips" role="tablist" aria-label="Kategori menu">
          {CATEGORIES.map((item) => {
            const count =
              item === 'Semua'
                ? menu.length
                : menu.filter((entry) => entry.category === item).length
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={`chip ${category === item ? 'is-active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
                <span>{count}</span>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <SearchX size={30} />
            </span>
            <h3>Menu tidak ditemukan</h3>
            <p>Coba kata kunci lain atau lihat semua kategori.</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setQuery('')
                setCategory('Semua')
              }}
            >
              Reset pencarian
            </button>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onOpen={setSelected}
                onAdd={(entry) => addToCart(entry.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container features">
        <div className="feature">
          <span className="feature__icon feature__icon--green">
            <Leaf size={20} />
          </span>
          <div>
            <h3>Bahan segar setiap hari</h3>
            <p>Belanja pagi, dimasak saat dipesan. Tanpa pengawet.</p>
          </div>
        </div>
        <div className="feature">
          <span className="feature__icon feature__icon--orange">
            <Bike size={20} />
          </span>
          <div>
            <h3>Antar cepat & hangat</h3>
            <p>Kurir internal, rata-rata sampai dalam 30 menit.</p>
          </div>
        </div>
        <div className="feature">
          <span className="feature__icon feature__icon--blue">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h3>Pembayaran aman</h3>
            <p>QRIS, transfer bank, atau bayar tunai di tempat.</p>
          </div>
        </div>
        <div className="feature">
          <span className="feature__icon feature__icon--yellow">
            <Clock3 size={20} />
          </span>
          <div>
            <h3>Buka setiap hari</h3>
            <p>Dari jam 09.00 sampai 21.00, termasuk akhir pekan.</p>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="cta-band">
          <div className="cta-band__emoji" aria-hidden="true">
            🍜
          </div>
          <div className="cta-band__copy">
            <h2>Lapar? Kami siap masak.</h2>
            <p>
              Pesan sekarang dan nikmati makanan rumahan yang hangat. Sudah punya
              pesanan? Cek statusnya kapan saja.
            </p>
          </div>
          <div className="cta-band__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={scrollToMenu}>
              Pesan sekarang <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn btn--outline-light btn--lg"
              onClick={() => navigate('/pesanan')}
            >
              Pesanan saya
            </button>
          </div>
        </div>
      </section>

      <div className="container menu-footnote">
        <span>
          <Star size={14} fill="currentColor" /> {formatCompact(12400)} pelanggan sudah
          pesan di Rasa
        </span>
      </div>

      <ItemModal
        item={selected}
        onClose={() => setSelected(null)}
        onAdd={(item, qty, notes) => addToCart(item.id, qty, notes)}
      />
    </>
  )
}
