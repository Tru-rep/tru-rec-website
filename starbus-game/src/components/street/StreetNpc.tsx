import type { CSSProperties } from 'react'
import type { CrowdNpc } from '../../street/crowdTypes'

function poseFor(npc: Pick<CrowdNpc, 'state' | 'intent'>): string {
  if (npc.state === 'enter') return 'enter'
  if (npc.state === 'pause') return 'hesitate'
  if (npc.intent === 'leave_agency') return 'walk'
  return 'walk'
}

export function StreetNpcFigure({
  npc,
  scale = 1.55,
}: {
  npc: Pick<
    CrowdNpc,
    'shirt' | 'hair' | 'skin' | 'hasBag' | 'facing' | 'state' | 'intent' | 'bubble' | 'enterT'
  >
  scale?: number
}) {
  const pose = poseFor(npc)
  const enterScale = npc.state === 'enter' ? 1 - npc.enterT * 0.75 : 1
  const enterOpacity = npc.state === 'enter' ? 1 - npc.enterT : 1

  return (
    <div
      className={`street-npc street-npc--${pose} street-npc--face-${npc.facing === 1 ? 'right' : 'left'}`}
      style={
        {
          '--npc-scale': scale * enterScale,
          '--npc-opacity': enterOpacity,
          '--shirt': npc.shirt,
          '--hair': npc.hair,
          '--skin': npc.skin,
        } as CSSProperties
      }
    >
      {npc.bubble && (
        <div className={`street-npc__bubble street-npc__bubble--${npc.bubble}`}>
          {npc.bubble === '?' && '?'}
          {npc.bubble === 'no' && '✕'}
          {npc.bubble === 'yes' && '✓'}
        </div>
      )}
      <div className="street-npc__shadow" />
      <div className="street-npc__figure">
        <div className="street-npc__hair" />
        <div className="street-npc__head">
          <span className="street-npc__eye street-npc__eye--l" />
          <span className="street-npc__eye street-npc__eye--r" />
        </div>
        <div className="street-npc__torso" />
        <span className="street-npc__arm street-npc__arm--l" />
        <span className="street-npc__arm street-npc__arm--r" />
        <div className="street-npc__legs">
          <span className="street-npc__leg street-npc__leg--l" />
          <span className="street-npc__leg street-npc__leg--r" />
        </div>
        {npc.hasBag && <div className="street-npc__bag" />}
      </div>
    </div>
  )
}

export function StreetNpcActor({ npc }: { npc: CrowdNpc }) {
  return (
    <div
      className="street-npc-actor absolute z-[25] pointer-events-none"
      style={{
        left: `${npc.x}%`,
        top: `${npc.y}%`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {npc.intent !== 'leave_agency' && (
        <div className="street-npc-actor__label">→ {npc.agencyLabel}</div>
      )}
      {npc.intent === 'leave_agency' && (
        <div className="street-npc-actor__label street-npc-actor__label--leave">← leaving</div>
      )}
      <StreetNpcFigure npc={npc} />
    </div>
  )
}

export function QueueNpc({
  person,
  index,
}: {
  person: { variant: number; shirt: string; hair: string; skin: string; hasBag: boolean }
  index: number
}) {
  return (
    <div className="queue-npc" style={{ '--qi': index } as CSSProperties}>
      <StreetNpcFigure
        npc={{
          shirt: person.shirt,
          hair: person.hair,
          skin: person.skin,
          hasBag: person.hasBag,
          facing: 1,
          state: 'pause',
          intent: 'join_competitor',
          bubble: null,
          enterT: 0,
        }}
        scale={1.35}
      />
    </div>
  )
}
