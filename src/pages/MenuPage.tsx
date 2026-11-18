import { useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, Copy, Search, SearchX, Star } from 'lucide-react'
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
      <section className="hero">
        <div
          className="hero__media"
          data-slot
          data-alt="Paella dimasak di atas bara api dalam wajan besar"
        >
          <img
            src={`${import.meta.env.BASE_URL}photos/cooking-a-paella-1920.jpg`}
            alt="Paella dimasak di atas bara api dalam wajan besar"
            width={1920}
            height={1277}
          />
        </div>

        <div className="container hero__inner">
          <div className="hero__plate">
            <p className="hero__dateline">Dapur rumahan di Kemang, Jakarta Selatan</p>
            <h1>
              Makanan rumahan, <span>rasa juara.</span>
            </h1>
            <p className="hero__lead">
              Nasi goreng sampai kopi susu, dimasak fresh, diantar hangat dalam 30
              menit.
            </p>
            <div className="hero__cta">
              <button type="button" className="btn btn--primary btn--lg" onClick={scrollToMenu}>
                Pesan sekarang <ArrowRight size={18} />
              </button>
              <button
                type="button"
                className="btn btn--quiet btn--lg"
                onClick={() =>
                  promoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              >
                Lihat promo
              </button>
            </div>
            <dl className="hero__stats">
              <div className="hero__stat">
                <dt>Rating pelanggan</dt>
                <dd>4.9</dd>
              </div>
              <div className="hero__stat">
                <dt>Ulasan pelanggan</dt>
                <dd>2.400+</dd>
              </div>
              <div className="hero__stat">
                <dt>Rata-rata antar</dt>
                <dd>30 mnt</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="promo-band" ref={promoRef}>
          <p className="promo-band__rate" aria-hidden="true">
            10<span>%</span>
          </p>
          <div className="promo-band__copy">
            <h2>Diskon 10% untuk pesanan pertamamu</h2>
            <p>
              Pakai kode <strong>HEMAT10</strong> saat checkout. Potongan maksimal
              Rp25.000, berlaku sampai akhir minggu.
            </p>
          </div>
          <button type="button" className="promo-band__code" onClick={copyPromo}>
            <span className="promo-band__code-label">
              {copied ? 'Tersalin' : 'Salin kode promo'}
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </span>
            <span className="promo-band__code-value">HEMAT10</span>
          </button>
        </div>
      </div>

      <section className="container menu-section" id="menu" ref={menuRef}>
        <div className="menu-head">
          <div>
            <h2>Menu hari ini</h2>
            <p>Semua dimasak setelah kamu pesan. Pilih, tambah catatan, kami masak.</p>
          </div>
          <span className="menu-count">
            <strong>{filtered.length}</strong> menu tersedia
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
          <div className="menu-index">
            {filtered.map((item, index) => (
              <MenuCard
                key={item.id}
                item={item}
                index={index}
                onOpen={setSelected}
                onAdd={(entry) => addToCart(entry.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container proof" aria-label="Biaya dan layanan">
        <div className="proof__grid">
          <div className="proof__figure">
            <strong>Rp12.000</strong>
            <span>Ongkir tetap untuk pengantaran area Kemang.</span>
          </div>
          <div className="proof__figure">
            <strong>Rp100.000</strong>
            <span>Gratis ongkir untuk pesanan mulai nominal ini.</span>
          </div>
          <div className="proof__figure">
            <strong>Rp2.000</strong>
            <span>Biaya layanan per pesanan.</span>
          </div>
        </div>
      </section>

      <section className="container making">
        <figure className="making__figure">
          <div
            className="making__media"
            data-slot
            data-alt="Bumbu dan rempah-rempah ditata di atas permukaan gelap"
          >
            <img
              src={`${import.meta.env.BASE_URL}photos/bumbu-dan-rempah-rempah-1920.jpg`}
              alt="Bumbu dan rempah-rempah ditata di atas permukaan gelap"
              width={1920}
              height={1280}
              loading="lazy"
            />
          </div>
          <figcaption className="making__figcaption">
            Bumbu dasar disiapkan tiap pagi di dapur Kemang.
          </figcaption>
        </figure>

        <div className="making__copy">
          <h2>Dimasak setelah kamu pesan.</h2>
          <p className="making__lead">
            Belanja pagi, racik bumbu, masak saat pesanan masuk. Tidak ada makanan
            menunggu di etalase.
          </p>
          <div className="making__facts">
            <div className="making__fact">
              <div>
                <h3>Bahan segar setiap hari</h3>
                <p>Belanja pagi, dimasak saat dipesan. Tanpa pengawet.</p>
              </div>
            </div>
            <div className="making__fact">
              <div>
                <h3>Antar cepat &amp; hangat</h3>
                <p>Kurir internal, rata-rata sampai dalam 30 menit.</p>
              </div>
            </div>
            <div className="making__fact">
              <div>
                <h3>Pembayaran aman</h3>
                <p>QRIS, transfer bank, atau bayar tunai di tempat.</p>
              </div>
            </div>
            <div className="making__fact">
              <div>
                <h3>Buka setiap hari</h3>
                <p>Dari jam 09.00 sampai 21.00, termasuk akhir pekan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="close-band">
        <div className="container">
          <div className="close-band__inner">
            <div>
              <h2>Lapar? Kami siap masak.</h2>
              <p>
                Pesan sekarang dan nikmati makanan rumahan yang hangat. Cek status
                pesanan kapan saja.
              </p>
            </div>
            <div className="close-band__actions">
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
          <p className="close-band__count">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            {formatCompact(12400)} pelanggan sudah pesan di Rasa
          </p>
        </div>
      </section>

      <ItemModal
        item={selected}
        onClose={() => setSelected(null)}
        onAdd={(item, qty, notes) => addToCart(item.id, qty, notes)}
      />
    </>
  )
}
