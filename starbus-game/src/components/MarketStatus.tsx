import type { MarketCondition } from '../types/game'
import { fmtPct } from '../utils/format'

function rowColor(label: string, value: string): string {
  if (label.includes('Competition') && value === 'High') return 'text-danger'
  if (label.includes('Trust') && value === 'Low') return 'text-danger'
  if (label.includes('Growth') && value === 'High') return 'text-success'
  if (label.includes('Demand') && value === 'Normal') return 'text-success'
  if (value === 'Low') return 'text-danger'
  if (value === 'High') return 'text-success'
  return 'text-accent'
}

function Row({ label, value }: { label: string; value: string }) {
  const color = rowColor(label, value)

  return (
    <div className="flex items-center justify-between py-2 border-b border-panel-border last:border-0 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  )
}

export function MarketStatus({
  conditions,
  trust,
}: {
  conditions: MarketCondition
  trust: number
}) {
  return (
    <div className="rounded-xl bg-panel-light/50 border border-panel-border p-4 h-full">
      <h3 className="text-sm font-bold text-white mb-2">Market Status</h3>
      <Row label="Market Competition" value={conditions.competition} />
      <Row label="Customer Trust" value={conditions.trust} />
      <Row label="Demand Today" value={conditions.demand} />
      <Row label="Growth Opportunity" value={conditions.growthOpportunity} />
      <div className="mt-3 pt-2 border-t border-panel-border">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>Your trust score</span>
          <span className="text-white font-semibold">{fmtPct(trust)}</span>
        </div>
        <div className="h-2 rounded-full bg-panel overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-accent transition-all duration-700"
            style={{ width: `${trust}%` }}
          />
        </div>
        <p className="text-[10px] text-muted mt-1.5 leading-snug">
          Trust grows slower than reputation. Low trust sends foot traffic to incumbents.
        </p>
      </div>
    </div>
  )
}
