import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { lockScroll, unlockScroll } from '../lib/scrollLock'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  className = '',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    lockScroll()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, button, [href]',
      )?.focus()
    }, 40)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
      unlockScroll()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={`modal modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Dialog'}
      >
        {(title || subtitle) && (
          <div className="modal__head">
            <div>
              {title && <h2 className="modal__title">{title}</h2>}
              {subtitle && <p className="modal__subtitle">{subtitle}</p>}
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
