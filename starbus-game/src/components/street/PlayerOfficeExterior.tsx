import { fmtPct } from '../../utils/format'

type Props = {
  agencyName: string
  playerCustomers: number
  trust: number
  x: number
  queueY: number
  flowWeight: number
}

export function PlayerOfficeExterior({
  agencyName,
  playerCustomers,
  trust,
  x,
  queueY,
  flowWeight,
}: Props) {
  const isWeak = trust < 35 && playerCustomers < 80

  return (
    <div
      className="absolute z-30 flex flex-col items-center"
      style={{
        left: `${x}%`,
        top: `${queueY - 28}%`,
        transform: `translateX(-50%) scale(${isWeak ? 0.86 : 0.94})`,
      }}
    >
      <div
        className={`mb-1 rounded-lg px-3 py-1.5 text-center shadow-xl backdrop-blur-sm border ${
          isWeak ? 'bg-panel/80 border-panel-border/80' : 'bg-panel/95 border-accent/30'
        }`}
      >
        <div className="text-[9px] text-muted uppercase tracking-wide">Your storefront</div>
        <div className="text-[11px] font-bold text-white max-w-[120px] truncate">{agencyName}</div>
        <div className={`text-[9px] ${isWeak ? 'text-muted' : 'text-accent'}`}>
          {playerCustomers} served · Trust {fmtPct(trust)}
        </div>
      </div>

      <div
        className={`relative w-[88px] h-[58px] rounded-lg border-2 shadow-lg overflow-hidden ${
          isWeak
            ? 'border-slate-400/40 bg-gradient-to-b from-slate-200/90 to-slate-300/80'
            : 'border-blue-400/60 bg-gradient-to-b from-slate-100 to-slate-200'
        }`}
      >
        {isWeak && (
          <span className="absolute -top-0.5 -right-0.5 z-10 rounded bg-danger/90 px-1 py-px text-[7px] font-bold text-white">
            NEW
          </span>
        )}
        <div
          className="absolute -top-1.5 inset-x-0 h-2.5 rounded-t opacity-80"
          style={{
            background: isWeak
              ? 'repeating-linear-gradient(90deg, #64748b 0 6px, #fff 6px 12px)'
              : 'repeating-linear-gradient(90deg, #3b82f6 0 6px, #fff 6px 12px)',
          }}
        />
        <div className="absolute inset-x-2 top-2.5 bottom-1.5 rounded bg-slate-800/8 border border-white/40">
          <div className="absolute bottom-0.5 left-1.5 text-base opacity-70">🧑‍💻</div>
          {isWeak && (
            <div className="absolute top-1 right-1 text-[8px] text-slate-500 animate-pulse">OPEN?</div>
          )}
        </div>
      </div>

      {playerCustomers < 15 && (
        <div className="mt-1 text-[8px] text-white/55 italic">queue often empty</div>
      )}

      <div className="mt-0.5 h-1 rounded-full bg-white/10 overflow-hidden w-14" title="Share of foot traffic">
        <div
          className="h-full rounded-full bg-blue-400 transition-all duration-700"
          style={{ width: `${Math.max(3, flowWeight * 500)}%` }}
        />
      </div>
    </div>
  )
}
