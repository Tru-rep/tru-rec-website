import { useGameStore } from '../../../store/gameStore'
import { deriveOperationalAlerts } from '../../../engine/alerts'

export function OperationsPanel() {
  const state = useGameStore()
  const alerts = deriveOperationalAlerts(state)
  const officeLevel = useGameStore((s) => s.officeLevel)
  const employees = useGameStore((s) => s.employees)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Operations & decisions</h2>
        <p className="text-sm text-muted">Monitor pressure points and prepare for scaling systems.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.length === 0 ? (
          <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
            No critical operational alerts right now.
          </div>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-4 text-sm ${
                a.level === 'critical'
                  ? 'border-danger/40 bg-danger/10 text-red-200'
                  : a.level === 'warning'
                    ? 'border-accent/40 bg-accent/10 text-amber-100'
                    : 'border-blue-500/30 bg-blue-500/10 text-blue-200'
              }`}
            >
              <div className="font-bold uppercase text-[10px] opacity-80">{a.title}</div>
              <p className="mt-1">{a.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="rounded-xl border border-panel-border bg-panel-light/30 p-4 max-w-lg">
        <div className="text-sm font-semibold text-white">Operational snapshot</div>
        <ul className="mt-2 text-sm text-muted space-y-1">
          <li>Office level: <span className="text-white">{officeLevel}</span></li>
          <li>Staff on payroll: <span className="text-white">{employees.length}</span></li>
          <li>Upgrades: <span className="text-muted">CRM, analytics, automation — planned</span></li>
          <li>Customer complaints queue: <span className="text-muted">coming with support staff events</span></li>
        </ul>
      </div>
    </div>
  )
}
