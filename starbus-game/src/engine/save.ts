import type { GameState } from '../types/game'
import { INITIAL_COMPETITORS } from '../data/constants'

const SAVE_KEY = 'nile-transit-save-v3'

function migrate(raw: Partial<GameState>): GameState {
  const competitors = (raw.competitors ?? []).map((c) => {
    const template = INITIAL_COMPETITORS.find((t) => t.id === c.id)
    return {
      ...template,
      ...c,
      personality: c.personality ?? template?.personality ?? 'veteran',
      tagline: c.tagline ?? template?.tagline ?? 'Established operator',
    }
  })

  return {
    ...(raw as GameState),
    competitors: competitors.length ? competitors : structuredClone(INITIAL_COMPETITORS),
    trust: raw.trust ?? Math.max(4, (raw.reputation ?? 18) * 0.6),
    lastDayTickets: raw.lastDayTickets ?? 0,
    consecutiveLossDays: raw.consecutiveLossDays ?? 0,
    lastDayBoothCapped: raw.lastDayBoothCapped ?? false,
    employees: raw.employees ?? [],
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem('nile-transit-save-v1')
    if (!raw) return null
    return migrate(JSON.parse(raw) as Partial<GameState>)
  } catch {
    return null
  }
}

export function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state))
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
  localStorage.removeItem('nile-transit-save-v1')
}
