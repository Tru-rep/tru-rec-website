import { useGameStore } from '../../../store/gameStore'
import { fmtSdg } from '../../../utils/format'
import { calcDailyExpenses } from '../../../engine/simulation'
import { calcEmployeeSalaries } from '../../../engine/employees'
import { OFFICE_DAILY_COST, SOFTWARE_BASE_COST } from '../../../data/constants'

export function FinancePanel() {
  const state = useGameStore()
  const history = useGameStore((s) => s.history)
  const cash = useGameStore((s) => s.cash)
  const consecutiveLossDays = useGameStore((s) => s.consecutiveLossDays)

  const office = OFFICE_DAILY_COST[state.officeLevel] ?? OFFICE_DAILY_COST[1]
  const payroll = calcEmployeeSalaries(state.employees)
  const totalBurn = calcDailyExpenses(state)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Finance & reserves</h2>
        <p className="text-sm text-muted">Cash pressure is the core survival mechanic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-panel-border bg-panel-light/40 p-4">
          <div className="text-xs text-muted uppercase">Cash reserves</div>
          <div className="text-2xl font-bold text-white tabular-nums">{fmtSdg(cash)}</div>
        </div>
        <div className="rounded-xl border border-panel-border bg-panel-light/40 p-4">
          <div className="text-xs text-muted uppercase">Daily burn</div>
          <div className="text-2xl font-bold text-danger tabular-nums">{fmtSdg(totalBurn)}</div>
        </div>
        <div className="rounded-xl border border-panel-border bg-panel-light/40 p-4">
          <div className="text-xs text-muted uppercase">Loss streak</div>
          <div className="text-2xl font-bold text-white">{consecutiveLossDays} days</div>
        </div>
      </div>

      <div className="rounded-xl border border-panel-border bg-panel-light/30 p-4 max-w-md">
        <div className="text-sm font-semibold text-white mb-2">Expense breakdown</div>
        <ul className="text-sm space-y-1 text-muted">
          <li className="flex justify-between"><span>Office Lv.{state.officeLevel}</span><span className="text-white">{fmtSdg(office)}</span></li>
          <li className="flex justify-between"><span>Software systems</span><span className="text-white">{fmtSdg(SOFTWARE_BASE_COST)}</span></li>
          <li className="flex justify-between"><span>Payroll</span><span className="text-white">{fmtSdg(payroll)}</span></li>
        </ul>
      </div>

      {history.length > 0 && (
        <div className="rounded-xl border border-panel-border overflow-hidden">
          <div className="px-4 py-2 bg-panel-light/50 text-sm font-semibold text-white">Recent days</div>
          <table className="w-full text-xs">
            <thead className="text-muted">
              <tr>
                <th className="text-left p-2">Day</th>
                <th className="text-right p-2">Revenue</th>
                <th className="text-right p-2">Expenses</th>
                <th className="text-right p-2">Profit</th>
                <th className="text-right p-2">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().slice(0, 7).map((h) => (
                <tr key={h.day} className="border-t border-panel-border">
                  <td className="p-2 text-white">{h.day}</td>
                  <td className="p-2 text-right tabular-nums">{fmtSdg(h.revenue)}</td>
                  <td className="p-2 text-right tabular-nums text-muted">{fmtSdg(h.expenses)}</td>
                  <td className={`p-2 text-right tabular-nums ${h.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {fmtSdg(h.profit)}
                  </td>
                  <td className="p-2 text-right">{h.ticketsSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
