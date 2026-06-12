import { ROAD_Y } from '../../street/crowdTypes'

type Lane = {
  x: number
  queueY: number
  color: string
  label: string
  isPlayer?: boolean
}

export function AgencyLanes({ lanes }: { lanes: Lane[] }) {
  return (
    <svg
      className="absolute inset-0 z-[4] pointer-events-none w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {lanes.map((lane) => (
        <g key={lane.label}>
          {/* Lane path: road → queue */}
          <line
            x1={lane.x}
            y1={ROAD_Y}
            x2={lane.x}
            y2={lane.queueY + 14}
            stroke={lane.color}
            strokeWidth="0.35"
            strokeDasharray="1.2 1"
            opacity={lane.isPlayer ? 0.55 : 0.35}
          />
          {/* Road entry marker */}
          <circle cx={lane.x} cy={ROAD_Y} r="0.8" fill={lane.color} opacity={0.5} />
        </g>
      ))}
    </svg>
  )
}
