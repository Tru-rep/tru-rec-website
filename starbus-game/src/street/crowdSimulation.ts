import type { Competitor } from '../types/game'
import { PLAYER_SLOT } from './streetLayout'
import { ROAD_Y } from './crowdTypes'

export type MarketChoice =
  | { kind: 'competitor'; index: number; agencyId: string; label: string }
  | { kind: 'player'; agencyId: 'player'; label: string }
  | { kind: 'hesitate'; agencyId: 'player'; label: string; fallbackIndex: number }

/** Pick which agency this customer will try to reach — weighted by market physics. */
export function pickMarketChoice(
  flow: { player: number; competitors: number[] },
  competitors: Competitor[],
  trust: number,
): MarketChoice {
  const hesitateP = trust < 22 ? 0.22 : trust < 40 ? 0.12 : 0.04
  if (Math.random() < hesitateP) {
    const fallbackIndex = pickCompetitorIndex(flow)
    return {
      kind: 'hesitate',
      agencyId: 'player',
      label: 'Nile Transit',
      fallbackIndex,
    }
  }

  const playerW = flow.player * (trust > 15 ? 1.5 : 0.6)
  const compWeights = flow.competitors
  const sum = playerW + compWeights.reduce((a, b) => a + b, 0)
  let r = Math.random() * sum

  if (r < playerW) {
    return { kind: 'player', agencyId: 'player', label: 'Nile Transit' }
  }
  r -= playerW
  for (let i = 0; i < compWeights.length; i += 1) {
    r -= compWeights[i]
    if (r <= 0) {
      return {
        kind: 'competitor',
        index: i,
        agencyId: competitors[i].id,
        label: competitors[i].name,
      }
    }
  }
  const idx = pickCompetitorIndex(flow)
  return {
    kind: 'competitor',
    index: idx,
    agencyId: competitors[idx].id,
    label: competitors[idx].name,
  }
}

export function pickCompetitorIndex(flow: { competitors: number[] }): number {
  const weights = flow.competitors
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  let r = Math.random() * sum
  for (let i = 0; i < weights.length; i += 1) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return 0
}

export function spawnAtLane(agencyX: number): { x: number; y: number; facing: 1 | -1 } {
  return {
    x: agencyX + (Math.random() - 0.5) * 1.2,
    y: ROAD_Y,
    facing: 1,
  }
}

export function roadExit(facing: 1 | -1 = Math.random() > 0.5 ? 1 : -1) {
  return { x: facing === 1 ? 108 : -8, y: ROAD_Y, facing }
}

export function queuePoint(agencyX: number, queueY: number) {
  return { x: agencyX, y: queueY + 13 }
}

export function doorPoint(agencyX: number, queueY: number) {
  return { x: agencyX, y: queueY + 2 }
}

export function competitorQueuePoint(index: number, slots: { x: number; queueY: number }[]) {
  const slot = slots[index] ?? slots[0]
  return queuePoint(slot.x, slot.queueY)
}

export function playerQueuePoint() {
  return queuePoint(PLAYER_SLOT.x, PLAYER_SLOT.queueY)
}

/** ms between new customers arriving on the sidewalk */
export function customerSpawnInterval(flowPlayer: number): number {
  return Math.max(900, 1600 - flowPlayer * 600)
}

export function flowStats(
  competitors: Competitor[],
  queues: Record<string, { length: number } | unknown[]>,
  flow: { player: number; competitors: number[] },
): { id: string; label: string; share: number; queueLen: number; color: string }[] {
  const playerLen = Array.isArray(queues.player) ? queues.player.length : 0
  const stats = [
    {
      id: 'player',
      label: 'You',
      share: flow.player,
      queueLen: playerLen,
      color: '#60a5fa',
    },
    ...competitors.map((c, i) => ({
      id: c.id,
      label: c.name,
      share: flow.competitors[i] ?? 0,
      queueLen: Array.isArray(queues[c.id]) ? queues[c.id].length : 0,
      color: c.color,
    })),
  ]
  return stats.sort((a, b) => b.share - a.share)
}
