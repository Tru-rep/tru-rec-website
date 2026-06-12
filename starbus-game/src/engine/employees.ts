import type { Employee, EmployeeRole } from '../types/game'
import { randInt, mulberry32 } from '../utils/random'

export const ROLE_INFO: Record<
  EmployeeRole,
  { label: string; baseSalary: number; description: string }
> = {
  dispatcher: {
    label: 'Dispatcher',
    baseSalary: 3500,
    description: 'Coordinates departures and reduces delays.',
  },
  support: {
    label: 'Customer Support',
    baseSalary: 2800,
    description: 'Handles complaints and protects reputation.',
  },
  operations: {
    label: 'Operations Manager',
    baseSalary: 5200,
    description: 'Runs day-to-day scaling and route ops.',
  },
  hr: {
    label: 'HR / Admin',
    baseSalary: 3000,
    description: 'Keeps staff stable and paperwork clean.',
  },
}

const FIRST_NAMES = [
  'Amal',
  'Hassan',
  'Sara',
  'Omar',
  'Lina',
  'Youssef',
  'Nadia',
  'Khalid',
  'Rania',
  'Tariq',
]

export function effectiveEfficiency(employee: Employee): number {
  const overload = employee.roles.length > 1 ? 0.68 : 1
  return employee.efficiency * employee.reliability * overload
}

export function calcEmployeeSalaries(employees: Employee[]): number {
  return employees.reduce((sum, e) => sum + e.salary, 0)
}

/** Small operational bonuses from staffed roles. */
export function employeeBonuses(employees: Employee[]): {
  ticketMultiplier: number
  trustBonus: number
  refundReduction: number
} {
  let ticketMultiplier = 1
  let trustBonus = 0
  let refundReduction = 0

  for (const e of employees) {
    const eff = effectiveEfficiency(e)
    for (const role of e.roles) {
      if (role === 'dispatcher') ticketMultiplier += 0.04 * eff
      if (role === 'support') {
        trustBonus += 0.15 * eff
        refundReduction += 0.08 * eff
      }
      if (role === 'operations') ticketMultiplier += 0.06 * eff
      if (role === 'hr') trustBonus += 0.08 * eff
    }
  }

  return { ticketMultiplier, trustBonus, refundReduction }
}

export function createEmployee(role: EmployeeRole, seed: number): Employee {
  const rng = mulberry32(seed)
  const qualityRoll = rng()
  const salaryVariance = 0.85 + rng() * 0.35

  return {
    id: `emp-${seed}-${role}`,
    name: FIRST_NAMES[randInt(rng, 0, FIRST_NAMES.length - 1)],
    roles: [role],
    salary: Math.round(ROLE_INFO[role].baseSalary * salaryVariance),
    efficiency: 0.65 + qualityRoll * 0.35,
    reliability: 0.7 + rng() * 0.28,
  }
}

export function roleLabel(role: EmployeeRole): string {
  return ROLE_INFO[role].label
}
