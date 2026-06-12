import { useGameStore } from '../../../store/gameStore'
import { fmtSdg } from '../../../utils/format'
import {
  BOOTH_MAX_TICKETS_PER_BUS,
  BUSES_PER_DAY,
  boothDailyTicketCap,
} from '../../../data/constants'
export function RoutesPanel() {
  const routes = useGameStore((s) => s.routes)
  const activeRouteId = useGameStore((s) => s.activeRouteId)
  const lastDayTickets = useGameStore((s) => s.lastDayTickets)

  const route = routes.find((r) => r.id === activeRouteId)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Route performance</h2>
        <p className="text-sm text-muted">Ticket operations on active intercity lines (Starbus model).</p>
      </div>

      {route && (
        <div className="rounded-xl border border-panel-border bg-panel-light/40 p-4 max-w-lg">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="text-xs text-muted uppercase">Active route</div>
              <div className="text-xl font-bold text-white">
                {route.origin} → {route.destination}
              </div>
            </div>
            <span className="rounded-full bg-success/15 text-success text-xs font-bold px-2 py-1">LIVE</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">Ticket price</dt>
              <dd className="font-semibold text-white">{fmtSdg(route.ticketPrice)}</dd>
            </div>
            <div>
              <dt className="text-muted">Your commission</dt>
              <dd className="font-semibold text-accent">{route.commissionRate * 100}%</dd>
            </div>
            <div>
              <dt className="text-muted">Service quality</dt>
              <dd className="font-semibold text-white">{route.quality}/100</dd>
            </div>
            <div>
              <dt className="text-muted">Yesterday tickets</dt>
              <dd className="font-semibold text-white">{lastDayTickets}</dd>
            </div>
            <div>
              <dt className="text-muted">Seats per bus</dt>
              <dd className="font-semibold text-white">{route.seatsPerDay}</dd>
            </div>
            <div>
              <dt className="text-muted">Booth quota</dt>
              <dd className="font-semibold text-white">
                {BOOTH_MAX_TICKETS_PER_BUS}/bus · {boothDailyTicketCap()}/day max
              </dd>
            </div>
            <div>
              <dt className="text-muted">Daily departures</dt>
              <dd className="font-semibold text-white">{BUSES_PER_DAY} buses</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted">
            Each booth on the strip is capped at {BOOTH_MAX_TICKETS_PER_BUS} tickets per bus per route — same
            rule as every competitor. Route expansion unlocks later.
          </p>
        </div>
      )}
    </div>
  )
}
