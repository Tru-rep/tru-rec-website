import { useGameStore } from '../store/gameStore'
import { TopBar } from '../components/TopBar'
import { OperationalAlerts } from '../components/OperationalAlerts'
import { OfficeSidebar } from '../components/office/OfficeSidebar'
import { DashboardPanel } from '../components/office/panels/DashboardPanel'
import { RoutesPanel } from '../components/office/panels/RoutesPanel'
import { EmployeesPanel } from '../components/office/panels/EmployeesPanel'
import { FinancePanel } from '../components/office/panels/FinancePanel'
import { MarketingPanel } from '../components/office/panels/MarketingPanel'
import { OperationsPanel } from '../components/office/panels/OperationsPanel'
import type { OfficeTab } from '../types/game'

function OfficePanel({ tab }: { tab: OfficeTab }) {
  switch (tab) {
    case 'dashboard':
      return <DashboardPanel />
    case 'routes':
      return <RoutesPanel />
    case 'employees':
      return <EmployeesPanel />
    case 'finance':
      return <FinancePanel />
    case 'marketing':
      return <MarketingPanel />
    case 'operations':
      return <OperationsPanel />
    default:
      return <DashboardPanel />
  }
}

export function OfficeView() {
  const goToStreet = useGameStore((s) => s.goToStreet)
  const officeTab = useGameStore((s) => s.officeTab)
  const setOfficeTab = useGameStore((s) => s.setOfficeTab)
  const endDay = useGameStore((s) => s.endDay)
  const isBankrupt = useGameStore((s) => s.isBankrupt)

  return (
    <div className="flex h-full flex-col overflow-hidden office-interior">
      <TopBar />

      <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 bg-panel-light/30 border-b border-panel-border">
        <button
          type="button"
          onClick={goToStreet}
          className="flex items-center gap-2 rounded-lg border border-panel-border px-3 py-2 text-xs font-semibold text-muted hover:text-white hover:bg-panel-light transition-colors"
        >
          ← Back to street
        </button>
        <span className="text-xs text-muted hidden sm:inline">You are inside the office — make decisions, then end the day.</span>
        {isBankrupt ? (
          <span className="text-sm text-danger font-semibold">Bankrupt — reset via ⚙️</span>
        ) : (
          <button
            type="button"
            onClick={endDay}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg hover:bg-accent-hover"
          >
            📅 End Day
          </button>
        )}
      </div>

      <OperationalAlerts />

      <div className="flex flex-1 min-h-0">
        <OfficeSidebar active={officeTab} onSelect={setOfficeTab} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 office-desk-bg">
          <OfficePanel tab={officeTab} />
        </main>
      </div>
    </div>
  )
}
