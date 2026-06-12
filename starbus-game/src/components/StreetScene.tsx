import { useMemo } from 'react'
import type { Competitor, Route } from '../types/game'
import { fmtPct } from '../utils/format'
import { useStreetCrowd } from '../street/useStreetCrowd'
import { CompetitorOffice } from './street/CompetitorOffice'
import { PlayerOfficeExterior } from './street/PlayerOfficeExterior'
import { StreetNpcActor } from './street/StreetNpc'
import { AgencyQueue } from './street/AgencyQueue'
import { MarketFlowBar } from './street/MarketFlowBar'
import { AgencyLanes } from './street/AgencyLanes'

type Props = {
  competitors: Competitor[]
  playerCustomers: number
  reputation: number
  trust: number
  agencyName: string
  route: Route
  officeLevel: number
}

export function StreetScene({
  competitors,
  playerCustomers,
  reputation,
  trust,
  agencyName,
  route,
  officeLevel,
}: Props) {
  const { npcs, queues, slots, flow, agencyFlow, playerSlot } = useStreetCrowd({
    competitors,
    playerCustomers,
    reputation,
    trust,
    route,
    officeLevel,
  })

  const atmosphere = useMemo(() => {
    if (trust < 20) return 'tense'
    if (reputation < 30) return 'struggling'
    return 'hopeful'
  }, [trust, reputation])

  const mood = useMemo(() => {
    if (flow.player < 0.03) return { title: 'Market ignores us', sub: 'Foot traffic goes to incumbents' }
    if (trust < 22) return { title: 'Low public trust', sub: 'Customers hesitate, then pick rivals' }
    if (trust < 40) return { title: 'Trust building slowly', sub: 'Some customers now try your office' }
    return { title: 'Foot traffic improving', sub: 'More queues forming at your door' }
  }, [trust, flow.player])

  const playerQueue = queues.player ?? []
  const dominant = agencyFlow[0]

  return (
    <section
      className={`street-scene relative flex-1 overflow-hidden bg-gradient-to-b from-sky-300/50 via-sky-200/30 to-street/90 street-scene--${atmosphere}`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="cloud cloud-a" />
        <div className="cloud cloud-b" />
      </div>

      <div className="absolute top-3 left-3 z-40 rounded-xl bg-black/45 backdrop-blur-sm px-3 py-2 border border-white/10 max-w-[210px]">
        <div className="text-[10px] uppercase tracking-widest text-white/60">Market behavior</div>
        <div className="text-xs font-semibold text-white">{mood.title}</div>
        <div className="text-[10px] text-white/75 mt-0.5">{mood.sub}</div>
        {dominant && (
          <div className="text-[10px] text-white/60 mt-1.5">
            Dominant: <span style={{ color: dominant.color }}>{dominant.label}</span>
          </div>
        )}
      </div>

      <MarketFlowBar stats={agencyFlow} trust={trust} />

      <AgencyLanes
        lanes={[
          ...competitors.map((c, i) => ({
            x: slots[i]?.x ?? 50,
            queueY: slots[i]?.queueY ?? 38,
            color: c.color,
            label: c.name,
          })),
          {
            x: playerSlot.x,
            queueY: playerSlot.queueY,
            color: '#60a5fa',
            label: 'You',
            isPlayer: true,
          },
        ]}
      />

      <div className="absolute top-[18%] inset-x-0 flex justify-center gap-3 opacity-20 pointer-events-none">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-6 rounded-t bg-slate-600" style={{ height: 16 + (i % 3) * 10 }} />
        ))}
      </div>

      {competitors.map((c, i) => (
        <CompetitorOffice
          key={c.id}
          competitor={c}
          index={i}
          x={slots[i]?.x ?? 50}
          queueY={slots[i]?.queueY ?? 38}
        />
      ))}

      {competitors.map((c, i) => (
        <AgencyQueue
          key={`q-${c.id}`}
          people={queues[c.id] ?? []}
          x={slots[i]?.x ?? 50}
          y={(slots[i]?.queueY ?? 38) + 15}
        />
      ))}

      <AgencyQueue
        people={playerQueue}
        x={playerSlot.x}
        y={playerSlot.queueY + 9}
        emptyLabel="no customers yet"
      />

      <div className="absolute bottom-0 inset-x-0 h-16 bg-street border-t-[5px] border-street/80 shadow-inner" />
      <div className="absolute bottom-16 inset-x-0 h-1.5 bg-yellow-300/70" />

      {npcs.map((npc) => (
        <StreetNpcActor key={npc.id} npc={npc} />
      ))}

      <PlayerOfficeExterior
        agencyName={agencyName}
        playerCustomers={playerCustomers}
        trust={trust}
        x={playerSlot.x}
        queueY={playerSlot.queueY}
        flowWeight={flow.player}
      />

      <div className="absolute bottom-2 left-3 text-[9px] text-white/45">
        Each customer enters their agency lane on the road, walks up, queues, enters · Trust {fmtPct(trust)}
      </div>

      {atmosphere === 'tense' && <div className="absolute inset-0 pointer-events-none street-vignette" aria-hidden />}
    </section>
  )
}
