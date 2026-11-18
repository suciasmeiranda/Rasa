import { Clock3, Flame, Plus, Star } from 'lucide-react'
import type { MenuItem } from '../types'
import { formatCompact, formatRupiah } from '../lib/format'

interface MenuCardProps {
  item: MenuItem
  index: number
  onOpen: (item: MenuItem) => void
  onAdd: (item: MenuItem) => void
}

export function MenuCard({ item, index, onOpen, onAdd }: MenuCardProps) {
  const unavailable = !item.available

  return (
    <article
      className={`menu-row ${unavailable ? 'is-unavailable' : ''}`}
      onClick={() => onOpen(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(item)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Lihat detail ${item.name}`}
    >
      <span className="menu-row__num" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="menu-row__main">
        <div className="menu-row__title">
          <h3>{item.name}</h3>
          <span className="menu-row__tags">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`badge ${tag === 'Best seller' ? 'badge--hot' : ''} ${
                  tag === 'Baru' ? 'badge--new' : ''
                }`}
              >
                {tag === 'Best seller' && <Flame size={11} />}
                {tag}
              </span>
            ))}
          </span>
        </div>
        <div className="menu-row__meta">
          <span className="rating">
            <Star size={13} fill="currentColor" /> {item.rating.toFixed(1)}
          </span>
          <span>{formatCompact(item.sold)} terjual</span>
          <span className="menu-row__time">
            <Clock3 size={12} /> {item.prepTime} mnt
          </span>
          {unavailable && <span className="menu-row__soldout">Habis hari ini</span>}
        </div>
      </div>

      <span className="menu-row__price">
        <small>Rp</small>
        {formatRupiah(item.price).replace('Rp', '').trim()}
      </span>

      <button
        type="button"
        className="menu-row__add"
        onClick={(event) => {
          event.stopPropagation()
          onAdd(item)
        }}
        disabled={unavailable}
        aria-label={`Tambah ${item.name} ke keranjang`}
      >
        <Plus size={19} strokeWidth={2.5} />
      </button>
    </article>
  )
}
