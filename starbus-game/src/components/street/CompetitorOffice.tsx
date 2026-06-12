import type { Competitor } from '../../types/game'
import { PERSONALITY_LABELS } from '../../data/constants'
import { fmtPct } from '../../utils/format'

type Props = {
  competitor: Competitor
  index: number
  x: number
  queueY: number
}

export function CompetitorOffice({ competitor, index, x, queueY }: Props) {
  return (
    <div
      className="absolute z-10 flex flex-col items-center -translate-x-1/2"
      style={{ left: `${x}%`, top: `${queueY - 22}%` }}
    >
      <div
        className="mb-0.5 w-[72px] max-w-[11vw] rounded-t-lg px-1 py-1 text-center text-[8px] font-bold text-white shadow-lg ring-1 ring-white/20"
        style={{ backgroundColor: competitor.color }}
      >
        <div className="truncate">{competitor.name}</div>
        <div className="font-normal opacity-90">
          {competitor.customers.toLocaleString()} · {fmtPct(competitor.reputation)}
        </div>
      </div>

      <div
        className="relative w-[72px] max-w-[11vw] h-[52px] rounded-b-md border-2 border-black/15 shadow-xl overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${competitor.color}40 0%, ${competitor.accent}70 100%)` }}
      >
        <div className="absolute top-1.5 inset-x-1.5 h-2.5 rounded bg-white/35" />
        <div className="absolute top-5 left-1.5 w-2.5 h-3 rounded-sm bg-amber-100/90" />
        <div className="absolute top-5 right-1.5 w-2.5 h-3 rounded-sm bg-amber-100/90" />
        <div className="absolute bottom-1 left-2 text-[10px]">🧑‍💼</div>
        <div className="absolute bottom-1 left-6 text-[10px]">🧑‍💼</div>
        <div className="absolute bottom-1 right-1.5 text-[9px]">📋</div>
        <span className="absolute top-0.5 right-0.5 text-[7px] font-bold bg-black/35 text-white rounded px-0.5">
          {index + 1}
        </span>
        <span
          className="absolute bottom-0 inset-x-0 text-[6px] text-center text-white/90 py-0.5 font-semibold"
          style={{ backgroundColor: `${competitor.color}cc` }}
        >
          {PERSONALITY_LABELS[competitor.personality]}
        </span>
      </div>
    </div>
  )
}
