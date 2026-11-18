import { Check, Clock3, XCircle } from 'lucide-react'
import type { Order, OrderStatus } from '../types'
import { STATUS_LABEL, STATUS_SHORT, statusSteps } from '../lib/order'

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`status status--${status}`}>
      {STATUS_SHORT[status]}
    </span>
  )
}

interface TimelineProps {
  order: Order
  vertical?: boolean
}

export function OrderTimeline({ order, vertical = false }: TimelineProps) {
  if (order.status === 'dibatalkan') {
    return (
      <div className="timeline-cancelled">
        <XCircle size={18} />
        <div>
          <strong>Pesanan dibatalkan</strong>
          <p>Pesanan ini tidak diproses lebih lanjut.</p>
        </div>
      </div>
    )
  }

  const steps = statusSteps(order.fulfillment)
  const currentIndex = steps.indexOf(order.status)

  return (
    <ol className={`timeline ${vertical ? 'timeline--vertical' : ''}`}>
      {steps.map((step, index) => {
        const done = index < currentIndex
        const active = index === currentIndex
        return (
          <li
            key={step}
            className={`timeline__step ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`}
          >
            <span className="timeline__dot">
              {done ? (
                <Check size={13} strokeWidth={3} />
              ) : active ? (
                <Clock3 size={13} />
              ) : null}
            </span>
            <span className="timeline__text">
              <strong>{STATUS_SHORT[step]}</strong>
              {active && <small>{STATUS_LABEL[step]}</small>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
