import { useGameStore } from '../../../store/gameStore'
import { ROLE_INFO, effectiveEfficiency, roleLabel } from '../../../engine/employees'
import type { EmployeeRole } from '../../../types/game'
import { fmtSdg } from '../../../utils/format'

const ROLES: EmployeeRole[] = ['dispatcher', 'support', 'operations', 'hr']

export function EmployeesPanel() {
  const employees = useGameStore((s) => s.employees)
  const hireEmployee = useGameStore((s) => s.hireEmployee)
  const fireEmployee = useGameStore((s) => s.fireEmployee)
  const assignExtraRole = useGameStore((s) => s.assignExtraRole)
  const cash = useGameStore((s) => s.cash)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Employee management</h2>
        <p className="text-sm text-muted">
          Hire staff to improve operations. Assigning multiple roles to one person reduces their efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ROLES.map((role) => (
          <div key={role} className="rounded-xl border border-panel-border bg-panel-light/40 p-4">
            <div className="font-semibold text-white">{ROLE_INFO[role].label}</div>
            <p className="text-xs text-muted mt-1">{ROLE_INFO[role].description}</p>
            <div className="text-xs text-muted mt-2">From ~{fmtSdg(ROLE_INFO[role].baseSalary)}/day</div>
            <button
              type="button"
              onClick={() => hireEmployee(role)}
              disabled={cash < ROLE_INFO[role].baseSalary}
              className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40"
            >
              Hire {ROLE_INFO[role].label}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-panel-border bg-panel-light/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-panel-border text-sm font-semibold text-white">
          Current team ({employees.length})
        </div>
        {employees.length === 0 ? (
          <p className="p-4 text-sm text-muted">No employees yet — you are running everything alone.</p>
        ) : (
          <ul className="divide-y divide-panel-border">
            {employees.map((e) => {
              const eff = effectiveEfficiency(e)
              const overloaded = e.roles.length > 1
              return (
                <li key={e.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{e.name}</div>
                    <div className="text-xs text-muted">
                      {e.roles.map(roleLabel).join(' + ')} · {fmtSdg(e.salary)}/day · eff{' '}
                      {(eff * 100).toFixed(0)}%
                      {overloaded && <span className="text-accent ml-1">· overloaded</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.filter((r) => !e.roles.includes(r)).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => assignExtraRole(e.id, r)}
                        className="rounded-md border border-panel-border px-2 py-1 text-[10px] text-muted hover:text-white"
                      >
                        +{ROLE_INFO[r].label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => fireEmployee(e.id)}
                      className="rounded-md bg-danger/20 border border-danger/40 px-2 py-1 text-[10px] text-danger font-semibold"
                    >
                      Fire
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
