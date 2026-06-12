import type { Competitor, Route, TodoItem } from '../types/game'

export const PLAYER_AGENCY = 'Nile Transit Agency'

export const INITIAL_COMPETITORS: Competitor[] = [
  {
    id: 'baraka',
    name: 'Al Baraka',
    color: '#2563eb',
    accent: '#1d4ed8',
    customers: 1250,
    reputation: 92,
    personality: 'premium',
    tagline: 'Trusted for 12 years — premium service',
  },
  {
    id: 'safwa',
    name: 'Safwa',
    color: '#059669',
    accent: '#047857',
    customers: 980,
    reputation: 88,
    personality: 'reliable',
    tagline: 'Never missed a departure',
  },
  {
    id: 'horizon',
    name: 'Horizon',
    color: '#7c3aed',
    accent: '#6d28d9',
    customers: 1100,
    reputation: 85,
    personality: 'aggressive',
    tagline: 'Undercutting fares to win volume',
  },
  {
    id: 'noor',
    name: 'Al Noor',
    color: '#ea580c',
    accent: '#c2410c',
    customers: 750,
    reputation: 78,
    personality: 'local_favorite',
    tagline: 'Neighborhood families choose us',
  },
  {
    id: 'easy',
    name: 'Easy Ride',
    color: '#0891b2',
    accent: '#0e7490',
    customers: 620,
    reputation: 72,
    personality: 'budget',
    tagline: 'Lowest prices on the strip',
  },
  {
    id: 'city',
    name: 'City Link',
    color: '#db2777',
    accent: '#be185d',
    customers: 540,
    reputation: 68,
    personality: 'veteran',
    tagline: 'Operating since before you were born',
  },
  {
    id: 'road',
    name: 'Road Star',
    color: '#ca8a04',
    accent: '#a16207',
    customers: 480,
    reputation: 65,
    personality: 'budget',
    tagline: 'Fast tickets, no fuss',
  },
]

/** Mirrors Starbus hub route — Omdurman → Khartoum */
export const INITIAL_ROUTES: Route[] = [
  {
    id: 'omd-krt',
    origin: 'Omdurman',
    destination: 'Khartoum',
    ticketPrice: 7500,
    commissionRate: 0.1,
    quality: 55,
    seatsPerDay: 46,
  },
]

export const INITIAL_TODOS: TodoItem[] = [
  {
    id: 'office-2',
    title: 'Improve Office',
    description: 'Increase office level to 2',
    done: false,
  },
  {
    id: 'first-100',
    title: 'Marketing Campaign',
    description: 'Attract your first 100 customers',
    done: false,
  },
  {
    id: 'service',
    title: 'Improve Service',
    description: 'Increase customer satisfaction',
    done: false,
  },
]

export const OFFICE_DAILY_COST: Record<number, number> = {
  1: 4200,
  2: 6800,
  3: 9500,
}

export const SOFTWARE_BASE_COST = 1800

export const BANKRUPTCY_THRESHOLD = -5000

/** Each agency booth may sell at most this many tickets per bus departure, per route. */
export const BOOTH_MAX_TICKETS_PER_BUS = 50

/** Daily departures on the active route (Omdurman hub model). */
export const BUSES_PER_DAY = 8

export function boothDailyTicketCap(busesPerDay = BUSES_PER_DAY): number {
  return BOOTH_MAX_TICKETS_PER_BUS * busesPerDay
}

export const PERSONALITY_LABELS: Record<Competitor['personality'], string> = {
  premium: 'Premium brand',
  budget: 'Budget player',
  reliable: 'Reliability focus',
  aggressive: 'Aggressive pricing',
  local_favorite: 'Local favorite',
  veteran: 'Market veteran',
}

export const PERSONALITY_QUOTES: Record<Competitor['personality'], string[]> = {
  premium: ['Our customers expect excellence.', 'Reputation takes years — not days.'],
  budget: ['Cheapest ticket wins today.', 'Why pay more for the same seat?'],
  reliable: ['On-time, every time.', 'Delays cost trust — we know that.'],
  aggressive: ['New office? Cute.', 'We can undercut you all week.'],
  local_favorite: ['My uncle books with us.', 'Word of mouth built this street.'],
  veteran: ['We were here before the road was paved.', 'Startups come and go.'],
}
