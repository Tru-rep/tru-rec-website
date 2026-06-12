import type { AgencyFlowStat } from '../../street/crowdTypes'
import { fmtPct } from '../../utils/format'

export function MarketFlowBar({ stats, trust }: { stats: AgencyFlowStat[]; trust: number }) {
  const top = stats.slice(0, 4)

  return (
    <div className="absolute top-3 right-3 z-40 w-[200px] rounded-xl bg-black/45 backdrop-blur-sm border border-white/10 p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-white/60 mb-2">Foot traffic share</div>
      <ul className="space-y-1.5">
        {top.map((s) => (
          <li key={s.id}>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-white truncate max-w-[90px]">{s.label}</span>
              <span className="text-white/80 tabular-nums">
                {fmtPct(s.share * 100, 1)} · {s.queueLen} queued
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, s.share * 100 * 2.8)}%`, backgroundColor: s.color }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-white/70">
        Trust {fmtPct(trust)} — higher trust shifts the bars toward you
      </div>
    </div>
  )
}
