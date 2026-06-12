import { create } from 'zustand'
import type { EmployeeRole, GameState, OfficeTab, UiState } from '../types/game'
import { createInitialState, resetGame, simulateDay } from '../engine/simulation'
import { clearSave, loadGame, saveGame } from '../engine/save'
import { createEmployee } from '../engine/employees'

type GameStore = GameState &
  UiState & {
    endDay: () => void
    reset: () => void
    hydrate: () => void
    goToStreet: () => void
    goToOffice: (tab?: OfficeTab) => void
    setOfficeTab: (tab: OfficeTab) => void
    hireEmployee: (role: EmployeeRole) => void
    fireEmployee: (id: string) => void
    assignExtraRole: (id: string, role: EmployeeRole) => void
  }

function persist(state: GameState) {
  saveGame(state)
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),
  location: 'street',
  officeTab: 'dashboard',

  hydrate: () => {
    const saved = loadGame()
    if (saved) set({ ...saved, location: 'street', officeTab: 'dashboard' })
  },

  goToStreet: () => set({ location: 'street' }),

  goToOffice: (tab = 'dashboard') => set({ location: 'office', officeTab: tab }),

  setOfficeTab: (tab) => set({ officeTab: tab }),

  endDay: () => {
    const state = get()
    if (state.isBankrupt) return

    const { next } = simulateDay(state)
    set({ ...next, location: state.location, officeTab: state.officeTab })
    persist(next)
  },

  hireEmployee: (role) => {
    const state = get()
    const seed = state.rngSeed + state.employees.length * 7919
    const employee = createEmployee(role, seed)
    const next = {
      ...state,
      employees: [...state.employees, employee],
      rngSeed: state.rngSeed + 1,
      cash: state.cash - employee.salary,
    }
    set(next)
    persist(next)
  },

  fireEmployee: (id) => {
    const state = get()
    const next = { ...state, employees: state.employees.filter((e) => e.id !== id) }
    set(next)
    persist(next)
  },

  assignExtraRole: (id, role) => {
    const state = get()
    const next = {
      ...state,
      employees: state.employees.map((e) =>
        e.id === id && !e.roles.includes(role) ? { ...e, roles: [...e.roles, role] } : e,
      ),
    }
    set(next)
    persist(next)
  },

  reset: () => {
    clearSave()
    const fresh = resetGame()
    set({ ...fresh, location: 'street', officeTab: 'dashboard' })
    persist(fresh)
  },
}))
