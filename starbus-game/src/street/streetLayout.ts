/** Percent-based layout for the street canvas (top-left origin). */

export type AgencySlot = {
  id: string
  x: number
  queueY: number
  row: 'competitor' | 'player'
}

export const PLAYER_SLOT: AgencySlot = {
  id: 'player',
  x: 50,
  queueY: 78,
  row: 'player',
}

export function competitorSlots(count: number): AgencySlot[] {
  const pad = 6
  const span = 100 - pad * 2
  return Array.from({ length: count }, (_, i) => ({
    id: `comp-${i}`,
    x: pad + (span * i) / Math.max(1, count - 1),
    queueY: 38,
    row: 'competitor' as const,
  }))
}

export function slotForCompetitorIndex(index: number, total: number): AgencySlot {
  return competitorSlots(total)[index] ?? competitorSlots(total)[0]
}
