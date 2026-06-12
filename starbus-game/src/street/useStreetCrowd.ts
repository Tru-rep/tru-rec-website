import { useEffect, useMemo, useRef, useState } from 'react'
import type { Competitor } from '../types/game'
import type { Route } from '../types/game'
import { streetFlowWeights } from '../engine/market'
import { competitorSlots, PLAYER_SLOT } from './streetLayout'
import type { AgencyFlowStat, CrowdNpc, QueuePerson } from './crowdTypes'
import { ROAD_Y, npcAppearance, variantFromSeed } from './crowdTypes'
import {
  competitorQueuePoint,
  customerSpawnInterval,
  flowStats,
  pickCompetitorIndex,
  pickMarketChoice,
  playerQueuePoint,
  queuePoint,
  roadExit,
  spawnAtLane,
} from './crowdSimulation'

type Params = {
  competitors: Competitor[]
  playerCustomers: number
  reputation: number
  trust: number
  route: Route
  officeLevel: number
}

const WALK_SPEED = 18
const MAX_MOVING = 8
const MAX_QUEUE = 8
const LEAVE_EVERY_MS = 9000

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

function stepToward(
  npc: CrowdNpc,
  tx: number,
  ty: number,
  dt: number,
): Pick<CrowdNpc, 'x' | 'y' | 'facing'> {
  const d = dist(npc.x, npc.y, tx, ty)
  if (d < 0.05) return { x: tx, y: ty, facing: npc.facing }
  const step = WALK_SPEED * dt
  const nx = npc.x + ((tx - npc.x) / d) * step
  const ny = npc.y + ((ty - npc.y) / d) * step
  const facing: 1 | -1 = Math.abs(tx - npc.x) > 0.4 ? (tx >= npc.x ? 1 : -1) : npc.facing
  return { x: nx, y: ny, facing }
}

function activeTarget(npc: CrowdNpc): { x: number; y: number } {
  if (npc.waypointX != null && npc.waypointY != null) {
    const d = dist(npc.x, npc.y, npc.waypointX, npc.waypointY)
    if (d > 1.1) return { x: npc.waypointX, y: npc.waypointY }
  }
  return { x: npc.targetX, y: npc.targetY }
}

function clearWaypointIfReached(npc: CrowdNpc): CrowdNpc {
  if (npc.waypointX == null || npc.waypointY == null) return npc
  if (dist(npc.x, npc.y, npc.waypointX, npc.waypointY) < 1.1) {
    return { ...npc, waypointX: null, waypointY: null }
  }
  return npc
}

export function useStreetCrowd({
  competitors,
  playerCustomers,
  reputation,
  trust,
  route,
  officeLevel,
}: Params) {
  const [tick, setTick] = useState(0)
  const npcsRef = useRef<CrowdNpc[]>([])
  const queuesRef = useRef<Record<string, QueuePerson[]>>({ player: [] })
  const idRef = useRef(0)
  const spawnAccRef = useRef(0)
  const leaveAccRef = useRef(0)

  const slots = useMemo(() => competitorSlots(competitors.length), [competitors.length])

  const flow = useMemo(
    () => streetFlowWeights(reputation, trust, route, officeLevel, playerCustomers, competitors),
    [reputation, trust, route, officeLevel, playerCustomers, competitors],
  )

  useEffect(() => {
    queuesRef.current = { player: [] }
    competitors.forEach((c) => {
      queuesRef.current[c.id] = []
    })
  }, [competitors])

  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const pushQueue = (agencyId: string, npc: CrowdNpc) => {
      const q = [...(queuesRef.current[agencyId] ?? [])]
      if (q.length >= MAX_QUEUE) q.shift()
      q.push({
        id: npc.id,
        variant: npc.variant,
        shirt: npc.shirt,
        hair: npc.hair,
        skin: npc.skin,
        hasBag: npc.hasBag,
      })
      queuesRef.current = { ...queuesRef.current, [agencyId]: q }
    }

    const spawnCustomer = () => {
      if (npcsRef.current.length >= MAX_MOVING) return

      const choice = pickMarketChoice(flow, competitors, trust)
      const seed = idRef.current++
      const variant = variantFromSeed(seed)
      const app = npcAppearance(variant)

      if (choice.kind === 'hesitate') {
        const pt = playerQueuePoint()
        const spawn = spawnAtLane(pt.x)
        npcsRef.current = [
          ...npcsRef.current,
          {
            id: `npc-${seed}`,
            variant,
            x: spawn.x,
            y: spawn.y,
            targetX: pt.x,
            targetY: pt.y,
            waypointX: null,
            waypointY: null,
            state: 'walk',
            intent: 'hesitate_player',
            agencyId: 'player',
            agencyLabel: choice.label,
            ...app,
            facing: spawn.facing,
            pauseMs: 1600,
            pauseLeft: 1600,
            bubble: '?',
            enterT: 0,
            hasBag: app.hasBag,
          },
        ]
        return
      }

      const isPlayer = choice.kind === 'player'
      const pt = isPlayer
        ? playerQueuePoint()
        : competitorQueuePoint(choice.index, slots)
      const spawn = spawnAtLane(pt.x)

      npcsRef.current = [
        ...npcsRef.current,
        {
          id: `npc-${seed}`,
          variant,
          x: spawn.x,
          y: spawn.y,
          targetX: pt.x,
          targetY: pt.y,
          waypointX: null,
          waypointY: null,
          state: 'walk',
          intent: isPlayer ? 'join_player' : 'join_competitor',
          agencyId: choice.agencyId,
          agencyLabel: choice.label,
          ...app,
          facing: spawn.facing,
          pauseMs: 0,
          pauseLeft: 0,
          bubble: isPlayer && trust > 28 ? 'yes' : null,
          enterT: 0,
          hasBag: app.hasBag,
        },
      ]
    }

    const spawnLeave = (agencyId: string, label: string) => {
      const q = queuesRef.current[agencyId] ?? []
      if (q.length === 0 || npcsRef.current.length >= MAX_MOVING) return

      const person = q[q.length - 1]
      queuesRef.current = { ...queuesRef.current, [agencyId]: q.slice(0, -1) }

      const idx = competitors.findIndex((c) => c.id === agencyId)
      const slot = agencyId === 'player' ? PLAYER_SLOT : (slots[idx] ?? slots[0])
      const door = queuePoint(slot.x, slot.queueY)
      const exit = roadExit()

      npcsRef.current = [
        ...npcsRef.current,
        {
          id: `leave-${idRef.current++}`,
          variant: person.variant,
          x: door.x,
          y: door.y,
          targetX: exit.x,
          targetY: exit.y,
          waypointX: slot.x,
          waypointY: ROAD_Y,
          state: 'walk',
          intent: 'leave_agency',
          agencyId,
          agencyLabel: label,
          shirt: person.shirt,
          hair: person.hair,
          skin: person.skin,
          hasBag: person.hasBag,
          facing: exit.facing,
          pauseMs: 0,
          pauseLeft: 0,
          bubble: null,
          enterT: 0,
        },
      ]
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      spawnAccRef.current += dt * 1000
      leaveAccRef.current += dt * 1000

      if (spawnAccRef.current >= customerSpawnInterval(flow.player)) {
        spawnAccRef.current = 0
        spawnCustomer()
      }

      if (leaveAccRef.current >= LEAVE_EVERY_MS) {
        leaveAccRef.current = 0
        const withQueue = [
          { id: 'player', label: 'You', len: queuesRef.current.player?.length ?? 0 },
          ...competitors.map((c) => ({
            id: c.id,
            label: c.name,
            len: queuesRef.current[c.id]?.length ?? 0,
          })),
        ].filter((a) => a.len > 0)
        if (withQueue.length) {
          const pick = withQueue[Math.floor(Math.random() * withQueue.length)]
          spawnLeave(pick.id, pick.label)
        }
      }

      npcsRef.current = npcsRef.current
        .map((raw) => {
          let npc = clearWaypointIfReached(raw)
          if (npc.state === 'done') return npc

          if (npc.state === 'pause') {
            const pauseLeft = npc.pauseLeft - dt * 1000
            if (pauseLeft > 0) return { ...npc, pauseLeft }

            if (npc.intent === 'hesitate_player') {
              if (trust > 38 && Math.random() > 0.5) {
                const pt = playerQueuePoint()
                return {
                  ...npc,
                  state: 'walk' as const,
                  pauseLeft: 0,
                  bubble: 'yes' as const,
                  intent: 'join_player' as const,
                  agencyId: 'player',
                  agencyLabel: 'Nile Transit',
                  targetX: pt.x,
                  targetY: pt.y,
                  x: pt.x,
                  y: ROAD_Y,
                }
              }
              const idx = pickCompetitorIndex(flow)
              const comp = competitors[idx] ?? competitors[0]
              const pt = competitorQueuePoint(idx, slots)
              const spawn = spawnAtLane(pt.x)
              return {
                ...npc,
                state: 'walk' as const,
                pauseLeft: 0,
                bubble: 'no' as const,
                intent: 'join_competitor' as const,
                agencyId: comp.id,
                agencyLabel: comp.name,
                x: spawn.x,
                y: spawn.y,
                targetX: pt.x,
                targetY: pt.y,
                waypointX: null,
                waypointY: null,
              }
            }
            return { ...npc, state: 'walk' as const, pauseLeft: 0 }
          }

          if (npc.state === 'enter') {
            const enterT = Math.min(1, npc.enterT + dt * 2.5)
            if (enterT >= 1) {
              pushQueue(npc.agencyId, npc)
              return { ...npc, enterT: 1, state: 'done' as const }
            }
            return { ...npc, enterT }
          }

          const target = activeTarget(npc)
          const d = dist(npc.x, npc.y, target.x, target.y)

          if (d < 1.1) {
            npc = clearWaypointIfReached(npc)
            const final = activeTarget(npc)
            const dFinal = dist(npc.x, npc.y, final.x, final.y)

            if (dFinal < 1.1) {
              if (npc.intent === 'leave_agency') return { ...npc, state: 'done' as const }
              if (npc.intent === 'hesitate_player') {
                return { ...npc, state: 'pause' as const, pauseLeft: npc.pauseMs, bubble: '?' as const }
              }
              return { ...npc, state: 'enter' as const, enterT: 0, bubble: null }
            }
          }

          const moved = stepToward(npc, target.x, target.y, dt)
          return { ...npc, ...moved }
        })
        .filter((n) => n.state !== 'done')

      setTick((t) => t + 1)
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [competitors, flow, trust])

  void tick

  const agencyFlow: AgencyFlowStat[] = flowStats(competitors, queuesRef.current, flow)

  return {
    npcs: npcsRef.current,
    queues: queuesRef.current,
    slots,
    flow,
    agencyFlow,
    playerSlot: PLAYER_SLOT,
  }
}
