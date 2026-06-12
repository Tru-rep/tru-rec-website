import type { Competitor, Route } from '../types/game'
import { BOOTH_MAX_TICKETS_PER_BUS, BUSES_PER_DAY } from '../data/constants'

const PERSONALITY_PULL: Record<Competitor['personality'], number> = {
  premium: 1.18,
  budget: 1.1,
  reliable: 1.14,
  aggressive: 1.08,
  local_favorite: 1.12,
  veteran: 1.16,
}

export function competitorPull(c: Competitor, rng: () => number): number {
  const base = (c.reputation / 100) ** 1.15 * PERSONALITY_PULL[c.personality]
  if (c.personality === 'aggressive') return base * (1 + rng() * 0.12)
  return base
}

export function playerPull(
  reputation: number,
  trust: number,
  route: Route,
  officeLevel: number,
  playerCustomers: number,
): number {
  const repFactor = Math.max(0.04, reputation / 100) ** 1.85
  const trustFactor = Math.max(0.03, trust / 100) ** 1.5
  const qualityFactor = 0.65 + route.quality / 180
  const officeFactor = 0.85 + officeLevel * 0.06
  const momentum = 1 + Math.min(0.25, playerCustomers / 800)
  return repFactor * trustFactor * qualityFactor * officeFactor * momentum
}

type BusAllocation = { playerTickets: number; competitorTickets: number[] }

function allocateBusSeats(
  busSeats: number,
  pWeight: number,
  compWeights: number[],
  trust: number,
): BusAllocation {
  const n = compWeights.length
  const competitorTickets = new Array<number>(n).fill(0)

  if (busSeats <= 0) return { playerTickets: 0, competitorTickets }

  const sum = pWeight + compWeights.reduce((a, b) => a + b, 0)
  if (sum <= 0) return { playerTickets: 0, competitorTickets }

  let playerTickets = Math.min(
    Math.floor(busSeats * (pWeight / sum)),
    BOOTH_MAX_TICKETS_PER_BUS,
  )

  if (trust < 20) playerTickets = Math.min(playerTickets, Math.floor(busSeats * 0.04))
  if (trust < 35) playerTickets = Math.min(playerTickets, Math.floor(busSeats * 0.09))

  for (let i = 0; i < n; i++) {
    competitorTickets[i] = Math.min(
      Math.floor(busSeats * (compWeights[i] / sum)),
      BOOTH_MAX_TICKETS_PER_BUS,
    )
  }

  let remainder = busSeats - playerTickets - competitorTickets.reduce((a, b) => a + b, 0)

  const slots = [
    { type: 'player' as const, w: pWeight, cap: BOOTH_MAX_TICKETS_PER_BUS },
    ...compWeights.map((w, i) => ({
      type: 'comp' as const,
      i,
      w,
      cap: BOOTH_MAX_TICKETS_PER_BUS,
    })),
  ].sort((a, b) => b.w - a.w)

  let ri = 0
  let guard = 0
  while (remainder > 0 && guard < busSeats * slots.length * 2) {
    const slot = slots[ri % slots.length]
    if (slot.type === 'player') {
      if (playerTickets < slot.cap) {
        playerTickets++
        remainder--
      }
    } else if (competitorTickets[slot.i] < slot.cap) {
      competitorTickets[slot.i]++
      remainder--
    }
    ri++
    guard++
  }

  return { playerTickets, competitorTickets }
}

export function distributeCustomers(
  totalDemand: number,
  reputation: number,
  trust: number,
  route: Route,
  officeLevel: number,
  playerCustomers: number,
  competitors: Competitor[],
  rng: () => number,
): { playerTickets: number; competitorTickets: number[]; playerBoothCapped: boolean } {
  const pWeight = playerPull(reputation, trust, route, officeLevel, playerCustomers)
  const compWeights = competitors.map((c) => competitorPull(c, rng))

  let playerTickets = 0
  const competitorTickets = competitors.map(() => 0)
  let playerBoothCapped = false
  let demandLeft = totalDemand

  for (let b = 0; b < BUSES_PER_DAY; b++) {
    const busesRemaining = BUSES_PER_DAY - b
    const busSeats = Math.min(route.seatsPerDay, Math.max(0, Math.ceil(demandLeft / busesRemaining)))
    demandLeft -= busSeats

    const uncappedPlayer = Math.floor(busSeats * (pWeight / (pWeight + compWeights.reduce((a, x) => a + x, 0))))
    const bus = allocateBusSeats(busSeats, pWeight, compWeights, trust)

    if (bus.playerTickets >= BOOTH_MAX_TICKETS_PER_BUS && uncappedPlayer > BOOTH_MAX_TICKETS_PER_BUS) {
      playerBoothCapped = true
    }

    playerTickets += bus.playerTickets
    for (let i = 0; i < competitorTickets.length; i++) {
      competitorTickets[i] += bus.competitorTickets[i] ?? 0
    }
  }

  return { playerTickets, competitorTickets, playerBoothCapped }
}

/** Visual flow weights for street animation (0–1 each, normalized externally). */
export function streetFlowWeights(
  reputation: number,
  trust: number,
  route: Route,
  officeLevel: number,
  playerCustomers: number,
  competitors: Competitor[],
): { player: number; competitors: number[]; passBy: number } {
  const p = playerPull(reputation, trust, route, officeLevel, playerCustomers)
  const comps = competitors.map((c) => competitorPull(c, () => 0.5))
  const passBy = Math.max(0.08, 0.35 - trust / 120 - reputation / 200)
  const sum = p + comps.reduce((a, b) => a + b, 0) + passBy
  return {
    player: p / sum,
    competitors: comps.map((c) => c / sum),
    passBy: passBy / sum,
  }
}

export function queueIntensity(customers: number, reputation: number): number {
  return Math.min(1, customers / 900 + reputation / 200)
}
