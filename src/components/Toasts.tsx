import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useStore } from '../store/StoreContext'

export function Toasts({ hidden = false }: { hidden?: boolean }) {
  const { toasts, dismissToast } = useStore()

  if (hidden) return null

  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon =
          toast.tone === 'error'
            ? AlertCircle
            : toast.tone === 'info'
              ? Info
              : CheckCircle2
        return (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            <Icon size={17} />
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
