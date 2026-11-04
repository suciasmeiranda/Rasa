import { Clock3, Flame, Plus, Star } from 'lucide-react'
import type { MenuItem } from '../types'
import { categorySlug, formatCompact, formatRupiah } from '../lib/format'

interface MenuCardProps {
  item: MenuItem
  onOpen: (item: MenuItem) => void
  onAdd: (item: MenuItem) => void
}

export function MenuCard({ item, onOpen, onAdd }: MenuCardProps) {
  const unavailable = !item.available

  return (
    <article
      className={`menu-card ${unavailable ? 'is-unavailable' : ''}`}
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
      <div className={`menu-card__tile tile--${categorySlug(item.category)}`}>
        <div className="menu-card__badges">
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
        </div>
        <span className="menu-card__emoji" aria-hidden="true">
          {item.emoji}
        </span>
        {unavailable && <span className="menu-card__soldout">Habis hari ini</span>}
      </div>

      <div className="menu-card__body">
        <div className="menu-card__meta">
          <span className="rating">
            <Star size={13} fill="currentColor" /> {item.rating.toFixed(1)}
          </span>
          <span>{formatCompact(item.sold)} terjual</span>
          <span className="menu-card__time">
            <Clock3 size={12} /> {item.prepTime} mnt
          </span>
        </div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="menu-card__foot">
          <span className="price">
            <small>Rp</small>
            {formatRupiah(item.price).replace('Rp', '').trim()}
          </span>
          <button
            type="button"
            className="add-btn"
            onClick={(event) => {
              event.stopPropagation()
              onAdd(item)
            }}
            disabled={unavailable}
            aria-label={`Tambah ${item.name} ke keranjang`}
          >
            <Plus size={19} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  )
}
