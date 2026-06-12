import type { OfficeTab } from '../../types/game'

const TABS: { id: OfficeTab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'routes', label: 'Routes', icon: '🛣️' },
  { id: 'employees', label: 'Employees', icon: '👥' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
  { id: 'operations', label: 'Operations', icon: '⚙️' },
]

export function OfficeSidebar({
  active,
  onSelect,
}: {
  active: OfficeTab
  onSelect: (tab: OfficeTab) => void
}) {
  return (
    <nav className="office-sidebar w-52 shrink-0 flex flex-col py-4 px-3 border-r border-panel-border bg-panel">
      <div className="px-2 mb-4">
        <div className="text-[10px] uppercase tracking-widest text-muted">Command center</div>
        <div className="text-sm font-bold text-white">Inside office</div>
      </div>
      <ul className="space-y-1 flex-1">
        {TABS.map((tab) => (
          <li key={tab.id}>
            <button
              type="button"
              onClick={() => onSelect(tab.id)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active === tab.id
                  ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                  : 'text-muted hover:bg-panel-light hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
