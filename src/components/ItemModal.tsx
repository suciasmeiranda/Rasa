import { useEffect, useState } from 'react'
import { Clock3, Flame, Minus, Plus, ShoppingBag, Star } from 'lucide-react'
import type { MenuItem } from '../types'
import { Modal } from './Modal'
import { formatCompact, formatRupiah } from '../lib/format'

interface ItemModalProps {
  item: MenuItem | null
  onClose: () => void
  onAdd: (item: MenuItem, qty: number, notes?: string) => void
}

export function ItemModal({ item, onClose, onAdd }: ItemModalProps) {
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setQty(1)
    setNotes('')
  }, [item?.id])

  if (!item) return null

  const unavailable = !item.available

  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      title={item.name}
      subtitle={item.category}
      size="md"
      className="item-modal"
    >
      <div className="item-modal__body">
        <div className="item-modal__tags">
          {item.tags.map((tag) => (
            <span key={tag} className="badge">
              {tag === 'Best seller' && <Flame size={11} />}
              {tag}
            </span>
          ))}
        </div>

        <div className="item-modal__meta">
          <span className="rating">
            <Star size={14} fill="currentColor" /> {item.rating.toFixed(1)}
          </span>
          <span>{formatCompact(item.sold)} terjual</span>
          <span>
            <Clock3 size={13} /> Siap {item.prepTime} menit
          </span>
        </div>

        <p className="item-modal__desc">{item.description}</p>

        <label className="field">
          <span>Catatan untuk dapur (opsional)</span>
          <textarea
            className="input"
            rows={2}
            placeholder="Contoh: pedas level 2, tanpa bawang, sambal dipisah…"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={140}
          />
        </label>

        <div className="item-modal__actions">
          <div className="stepper" aria-label="Jumlah pesanan">
            <button
              type="button"
              onClick={() => setQty((value) => Math.max(1, value - 1))}
              aria-label="Kurangi jumlah"
              disabled={qty <= 1}
            >
              <Minus size={16} />
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty((value) => Math.min(20, value + 1))}
              aria-label="Tambah jumlah"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => {
              onAdd(item, qty, notes.trim() || undefined)
              onClose()
            }}
            disabled={unavailable}
          >
            <ShoppingBag size={18} />
            {unavailable ? (
              'Sedang habis'
            ) : (
              <>
                <span>Tambah</span>
                <span className="btn__value">{formatRupiah(item.price * qty)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
