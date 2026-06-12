import { useGameStore } from '../store/gameStore'
import { StreetScene } from '../components/StreetScene'
import { fmtPct, fmtSdg, formatGameDate } from '../utils/format'

export function StreetView() {
  const goToOffice = useGameStore((s) => s.goToOffice)
  const agencyName = useGameStore((s) => s.agencyName)
  const competitors = useGameStore((s) => s.competitors)
  const playerCustomers = useGameStore((s) => s.playerCustomers)
  const reputation = useGameStore((s) => s.reputation)
  const trust = useGameStore((s) => s.trust)
  const officeLevel = useGameStore((s) => s.officeLevel)
  const routes = useGameStore((s) => s.routes)
  const activeRouteId = useGameStore((s) => s.activeRouteId)
  const day = useGameStore((s) => s.day)
  const gameDateIso = useGameStore((s) => s.gameDateIso)
  const cash = useGameStore((s) => s.cash)

  const route = routes.find((r) => r.id === activeRouteId) ?? routes[0]
  if (!route) return null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 flex items-center justify-between gap-3 bg-panel/95 border-b border-panel-border px-4 py-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted">Outside · {agencyName}</div>
          <div className="text-xs text-white">
            Day {day} · {formatGameDate(gameDateIso)} · {fmtSdg(cash)} cash
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-muted">
          <span>Trust <strong className="text-white">{fmtPct(trust)}</strong></span>
          <span>Rep <strong className="text-accent">{fmtPct(reputation)}</strong></span>
        </div>
        <button
          type="button"
          onClick={() => goToOffice('dashboard')}
          className="shrink-0 flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg hover:bg-accent-hover transition-colors"
        >
          <span>🏢</span>
          Go To My Office
        </button>
      </header>

      <StreetScene
        competitors={competitors}
        playerCustomers={playerCustomers}
        reputation={reputation}
        trust={trust}
        agencyName={agencyName}
        route={route}
        officeLevel={officeLevel}
      />

      <footer className="shrink-0 px-4 py-2 bg-panel border-t border-panel-border text-[11px] text-muted text-center">
        Watch the street — customer movement reflects market trust. Run the business from inside your office.
      </footer>
    </div>
  )
}
