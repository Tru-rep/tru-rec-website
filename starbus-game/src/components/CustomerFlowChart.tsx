import type { Competitor } from '../types/game'
import { fmtPct } from '../utils/format'

const SLICE_COLORS = ['#64748b', '#2563eb', '#059669', '#7c3aed', '#ea580c', '#0891b2', '#db2777', '#ca8a04']

type Props = {
  agencyName: string
  playerCustomers: number
  competitors: Competitor[]
}

function buildSlices(playerCustomers: number, competitors: Competitor[]) {
  const entries = [
    { name: 'Nile Transit', customers: playerCustomers, color: SLICE_COLORS[0] },
    ...competitors.map((c, i) => ({
      name: c.name,
      customers: c.customers,
      color: SLICE_COLORS[(i + 1) % SLICE_COLORS.length],
    })),
  ]
  const total = entries.reduce((s, e) => s + e.customers, 0) || 1
  return entries.map((e) => ({
    ...e,
    pct: (e.customers / total) * 100,
  }))
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, endAngle)
  const end = polar(cx, cy, r, startAngle)
  const large = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function CustomerFlowChart({ agencyName, playerCustomers, competitors }: Props) {
  const slices = buildSlices(playerCustomers, competitors)
  const total = slices.reduce((s, e) => s + e.customers, 0)

  let angle = 0
  const paths = slices.map((slice) => {
    const sweep = (slice.pct / 100) * 360
    const d = describeArc(50, 50, 40, angle, angle + sweep)
    angle += sweep
    return { ...slice, d }
  })

  return (
    <div className="rounded-xl bg-panel-light/50 border border-panel-border p-4 h-full">
      <h3 className="text-sm font-bold text-white mb-3">Customer Flow (Today)</h3>
      <div className="flex gap-4 items-center">
        <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0">
          {paths.map((p) => (
            <path key={p.name} d={p.d} fill={p.color} stroke="#1a2332" strokeWidth="0.5" />
          ))}
          <circle cx="50" cy="50" r="22" fill="#1a2332" />
          <text x="50" y="48" textAnchor="middle" fill="#94a3b8" fontSize="5">
            Total
          </text>
          <text x="50" y="56" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold">
            {total.toLocaleString()}
          </text>
        </svg>

        <ul className="flex-1 space-y-1 text-[11px] max-h-36 overflow-y-auto pr-1">
          {slices.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="truncate text-muted">{s.name === 'Nile Transit' ? agencyName.split(' ')[0] + ' Transit' : s.name}</span>
              </span>
              <span className="tabular-nums text-white shrink-0">
                {s.customers.toLocaleString()} ({fmtPct(s.pct, 1)})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
