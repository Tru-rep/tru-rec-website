/** Customer journey on the street — every NPC follows one of these paths. */
export type NpcIntent =
  | 'join_competitor'
  | 'join_player'
  | 'hesitate_player'
  | 'leave_agency'

export type NpcState = 'walk' | 'pause' | 'enter' | 'done'

export type CrowdNpc = {
  id: string
  variant: number
  x: number
  y: number
  targetX: number
  targetY: number
  waypointX: number | null
  waypointY: number | null
  state: NpcState
  intent: NpcIntent
  agencyId: string
  agencyLabel: string
  shirt: string
  hair: string
  skin: string
  facing: 1 | -1
  pauseMs: number
  pauseLeft: number
  bubble: null | '?' | 'no' | 'yes'
  enterT: number
  hasBag: boolean
}

export type QueuePerson = {
  id: string
  variant: number
  shirt: string
  hair: string
  skin: string
  hasBag: boolean
}

export const ROAD_Y = 83

/** @deprecated use ROAD_Y */
export const SIDEWALK_Y = ROAD_Y

export const NPC_SHIRTS = [
  '#2563eb',
  '#059669',
  '#ea580c',
  '#7c3aed',
  '#db2777',
  '#0891b2',
  '#ca8a04',
  '#475569',
  '#dc2626',
  '#0d9488',
]
export const NPC_HAIR = ['#1e293b', '#422006', '#3f1d0f', '#0f172a', '#57534e', '#713f12']
export const NPC_SKIN = ['#f5cba7', '#e0ac69', '#c68642', '#8d5524', '#ffdbac']

export function npcAppearance(variant: number) {
  return {
    shirt: NPC_SHIRTS[variant % NPC_SHIRTS.length],
    hair: NPC_HAIR[variant % NPC_HAIR.length],
    skin: NPC_SKIN[variant % NPC_SKIN.length],
    hasBag: variant % 3 === 0,
  }
}

export function variantFromSeed(seed: number): number {
  return Math.abs(seed * 2654435761) % 1000
}

export type AgencyFlowStat = {
  id: string
  label: string
  share: number
  queueLen: number
  color: string
}
