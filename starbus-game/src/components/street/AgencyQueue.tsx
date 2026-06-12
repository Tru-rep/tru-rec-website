import type { QueuePerson } from '../../street/crowdTypes'
import { QueueNpc } from './StreetNpc'

export function AgencyQueue({
  people,
  x,
  y,
  emptyLabel,
}: {
  people: QueuePerson[]
  x: number
  y: number
  emptyLabel?: string
}) {
  return (
    <div
      className="agency-queue absolute z-[14] -translate-x-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {people.length === 0 ? (
        emptyLabel ? <span className="agency-queue__empty">{emptyLabel}</span> : null
      ) : (
        <div className="agency-queue__line">
          {people.map((p, i) => (
            <QueueNpc key={p.id} person={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
