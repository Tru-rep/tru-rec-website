import { useGameStore } from '../../../store/gameStore'
import { CustomerFlowChart } from '../../CustomerFlowChart'
import { MarketStatus } from '../../MarketStatus'
import { TodoList } from '../../TodoList'
import { fmtSdg } from '../../../utils/format'
import { calcDailyExpenses } from '../../../engine/simulation'

export function DashboardPanel() {
  const agencyName = useGameStore((s) => s.agencyName)
  const playerCustomers = useGameStore((s) => s.playerCustomers)
  const competitors = useGameStore((s) => s.competitors)
  const marketConditions = useGameStore((s) => s.marketConditions)
  const trust = useGameStore((s) => s.trust)
  const todos = useGameStore((s) => s.todos)
  const lastDayMessage = useGameStore((s) => s.lastDayMessage)
  const cash = useGameStore((s) => s.cash)
  const dailyProfit = useGameStore((s) => s.dailyProfit)
  const lastDayTickets = useGameStore((s) => s.lastDayTickets)
  const state = useGameStore()

  const burn = calcDailyExpenses(state)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Operations dashboard</h2>
        <p className="text-sm text-muted">Review performance, then end the business day when ready.</p>
      </div>

      {lastDayMessage && (
        <div className="rounded-lg border border-panel-border bg-panel-light/60 px-4 py-3 text-sm text-muted">
          {lastDayMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Cash', value: fmtSdg(cash) },
          { label: 'Last day profit', value: dailyProfit === 0 ? '—' : fmtSdg(dailyProfit) },
          { label: 'Tickets yesterday', value: String(lastDayTickets) },
          { label: 'Daily burn', value: fmtSdg(burn) },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-panel-border bg-panel-light/40 p-3">
            <div className="text-[10px] uppercase text-muted">{k.label}</div>
            <div className="text-lg font-bold text-white tabular-nums">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <CustomerFlowChart
          agencyName={agencyName}
          playerCustomers={playerCustomers}
          competitors={competitors}
        />
        <MarketStatus conditions={marketConditions} trust={trust} />
        <TodoList todos={todos} />
      </div>
    </div>
  )
}
