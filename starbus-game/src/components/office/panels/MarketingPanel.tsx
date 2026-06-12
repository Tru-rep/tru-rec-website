import { useGameStore } from '../../../store/gameStore'
import { fmtPct } from '../../../utils/format'

export function MarketingPanel() {
  const trust = useGameStore((s) => s.trust)
  const reputation = useGameStore((s) => s.reputation)
  const playerCustomers = useGameStore((s) => s.playerCustomers)
  const todos = useGameStore((s) => s.todos)

  const marketingTodo = todos.find((t) => t.id === 'first-100')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Marketing & trust</h2>
        <p className="text-sm text-muted">
          Street activity reflects trust. Campaign systems will expand here — for now, reputation grows through sales and service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
        <div className="rounded-xl border border-panel-border bg-panel-light/40 p-4">
          <div className="text-xs text-muted">Market trust</div>
          <div className="text-3xl font-bold text-white">{fmtPct(trust)}</div>
          <p className="text-xs text-muted mt-2">Low trust = pedestrians hesitate, then walk to competitors.</p>
        </div>
        <div className="rounded-xl border border-panel-border bg-panel-light/40 p-4">
          <div className="text-xs text-muted">Brand reputation</div>
          <div className="text-3xl font-bold text-accent">{fmtPct(reputation)}</div>
          <p className="text-xs text-muted mt-2">Built through consistent ticket sales and avoiding loss days.</p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-panel-border p-4 max-w-lg">
        <div className="text-sm font-semibold text-white">Campaign queue</div>
        <p className="text-xs text-muted mt-1">
          {marketingTodo?.done
            ? 'First 100 customers milestone reached.'
            : `Goal: ${marketingTodo?.description ?? 'Grow customer base'} (${playerCustomers}/100)`}
        </p>
        <button
          type="button"
          disabled
          className="mt-3 rounded-lg bg-panel-light px-4 py-2 text-xs font-semibold text-muted cursor-not-allowed"
        >
          Launch campaign (coming soon)
        </button>
      </div>
    </div>
  )
}
