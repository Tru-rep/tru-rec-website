import { useGameStore } from '../store/gameStore'
import { deriveOperationalAlerts } from '../engine/alerts'

const LEVEL_STYLES = {
  info: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
  warning: 'border-accent/50 bg-accent/10 text-amber-100',
  critical: 'border-danger/50 bg-danger/15 text-red-200',
} as const

export function OperationalAlerts() {
  const state = useGameStore()
  const alerts = deriveOperationalAlerts(state)

  if (!alerts.length) return null

  return (
    <div className="shrink-0 border-b border-panel-border bg-panel-light/40 px-3 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-thin">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`shrink-0 rounded-lg border px-3 py-1.5 min-w-[200px] max-w-[280px] ${LEVEL_STYLES[a.level]}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">{a.title}</div>
            <div className="text-[11px] leading-snug">{a.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
