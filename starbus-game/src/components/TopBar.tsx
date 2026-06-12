import { useGameStore } from '../store/gameStore'
import { fmtPct, fmtSdg, formatGameDate } from '../utils/format'

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'yellow' }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 border-r border-panel-border last:border-r-0">
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      <span
        className={`text-sm font-bold tabular-nums ${
          accent === 'green' ? 'text-success' : accent === 'yellow' ? 'text-accent' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export function TopBar() {
  const agencyName = useGameStore((s) => s.agencyName)
  const cash = useGameStore((s) => s.cash)
  const dailyProfit = useGameStore((s) => s.dailyProfit)
  const reputation = useGameStore((s) => s.reputation)
  const trust = useGameStore((s) => s.trust)
  const officeLevel = useGameStore((s) => s.officeLevel)
  const day = useGameStore((s) => s.day)
  const gameDateIso = useGameStore((s) => s.gameDateIso)
  const notificationCount = useGameStore((s) => s.notificationCount)

  const profitLabel =
    dailyProfit === 0 ? '—' : `${dailyProfit > 0 ? '+' : ''}${fmtSdg(dailyProfit)}`

  return (
    <header className="flex items-center justify-between gap-4 bg-panel border-b border-panel-border px-4 py-2.5 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-lg">🚌</div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted">Agency</div>
          <div className="truncate text-sm font-bold text-white">{agencyName.toUpperCase()}</div>
        </div>
      </div>

      <div className="flex md:hidden items-center gap-3 text-xs tabular-nums">
        <span className="text-white font-bold">{fmtSdg(cash)}</span>
        <span className="text-accent">{fmtPct(reputation)}</span>
        <span className="text-muted">·</span>
        <span className="text-blue-300">{fmtPct(trust)} trust</span>
      </div>

      <div className="hidden md:flex items-center bg-panel-light/60 rounded-lg overflow-hidden">
        <Stat label="Cash Balance" value={fmtSdg(cash)} />
        <Stat label="Daily Profit" value={profitLabel} accent={dailyProfit >= 0 ? 'green' : undefined} />
        <Stat label="Reputation" value={fmtPct(reputation)} accent="yellow" />
        <Stat label="Market Trust" value={fmtPct(trust)} />
        <Stat label="Office Level" value={`Lv. ${officeLevel}`} />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:block text-right">
          <div className="text-[10px] uppercase text-muted">Day {day}</div>
          <div className="text-xs font-semibold">{formatGameDate(gameDateIso)} · 08:00 AM</div>
        </div>
        <span className="text-xl" title="Clear morning">
          ☀️
        </span>
        <button
          type="button"
          className="relative rounded-lg bg-panel-light p-2 text-muted hover:text-white"
          aria-label="Notifications"
        >
          🔔
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>
        <button
          type="button"
          className="rounded-lg bg-panel-light p-2 text-muted hover:text-white"
          aria-label="Settings"
          onClick={() => useGameStore.getState().reset()}
          title="Reset game (dev)"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}
