import type { GameState, MarketCondition } from '../types/game'
import { mulberry32, randBetween } from '../utils/random'
import {
  BANKRUPTCY_THRESHOLD,
  BOOTH_MAX_TICKETS_PER_BUS,
  BUSES_PER_DAY,
  INITIAL_COMPETITORS,
  INITIAL_ROUTES,
  INITIAL_TODOS,
  OFFICE_DAILY_COST,
  PLAYER_AGENCY,
  SOFTWARE_BASE_COST,
} from '../data/constants'
import { addCalendarDays } from '../utils/format'
import { distributeCustomers } from './market'
import { calcEmployeeSalaries, employeeBonuses } from './employees'

export function createInitialState(): GameState {
  return {
    agencyName: PLAYER_AGENCY,
    cash: 25_000,
    reputation: 18,
    trust: 11,
    officeLevel: 1,
    day: 1,
    gameDateIso: '2026-05-11',
    dailyProfit: 0,
    lastDayRevenue: 0,
    lastDayExpenses: 0,
    lastDayTickets: 0,
    playerCustomers: 0,
    competitors: structuredClone(INITIAL_COMPETITORS),
    routes: structuredClone(INITIAL_ROUTES),
    activeRouteId: 'omd-krt',
    employees: [],
    marketConditions: deriveMarketConditions(18, 11, 0),
    history: [],
    todos: structuredClone(INITIAL_TODOS),
    isBankrupt: false,
    rngSeed: Date.now() % 1_000_000,
    notificationCount: 2,
    lastDayMessage: null,
    consecutiveLossDays: 0,
    lastDayBoothCapped: false,
  }
}

export function deriveMarketConditions(
  reputation: number,
  trust: number,
  playerSharePct: number,
): MarketCondition {
  const blended = reputation * 0.45 + trust * 0.55
  return {
    competition: 'High',
    trust: blended < 30 ? 'Low' : blended < 60 ? 'Medium' : 'High',
    demand: 'Normal',
    growthOpportunity: playerSharePct < 5 ? 'High' : playerSharePct < 15 ? 'Medium' : 'Low',
  }
}

/** Weekday demand multiplier — Friday peak like real intercity travel. */
export function weekdayDemandMultiplier(iso: string): number {
  const dow = new Date(`${iso}T08:00:00`).getDay()
  const map: Record<number, number> = {
    0: 0.85,
    1: 0.95,
    2: 0.9,
    3: 1.0,
    4: 1.05,
    5: 1.35,
    6: 1.15,
  }
  return map[dow] ?? 1
}

export function calcDailyExpenses(state: Pick<GameState, 'officeLevel' | 'employees'>): number {
  const office = OFFICE_DAILY_COST[state.officeLevel] ?? OFFICE_DAILY_COST[1]
  const payroll = calcEmployeeSalaries(state.employees)
  return office + SOFTWARE_BASE_COST + payroll
}

export function calcRouteDemand(routeSeats: number, dateIso: string, rng: () => number): number {
  const baseFill = randBetween(rng, 0.62, 0.94)
  const weekday = weekdayDemandMultiplier(dateIso)
  const totalSeats = routeSeats * BUSES_PER_DAY
  return Math.round(totalSeats * baseFill * weekday)
}

export function calcCommissionRevenue(
  tickets: number,
  ticketPrice: number,
  commissionRate: number,
  quality: number,
  rng: () => number,
) {
  const commissionPerTicket = ticketPrice * commissionRate
  const qualityFactor = 0.85 + quality / 200
  const variance = 0.92 + rng() * 0.16
  return Math.round(tickets * commissionPerTicket * qualityFactor * variance)
}

export function simulateDay(state: GameState): {
  next: GameState
  revenue: number
  expenses: number
  profit: number
  ticketsSold: number
  message: string
} {
  const rng = mulberry32(state.rngSeed + state.day * 9973)
  const route = state.routes.find((r) => r.id === state.activeRouteId) ?? state.routes[0]
  const expenses = calcDailyExpenses(state)

  const totalDemand = calcRouteDemand(route.seatsPerDay, state.gameDateIso, rng)
  const jitterRep = state.reputation + randBetween(rng, -2, 2)
  const jitterTrust = state.trust + randBetween(rng, -1.5, 1.5)

  const { playerTickets, competitorTickets, playerBoothCapped } = distributeCustomers(
    totalDemand,
    jitterRep,
    jitterTrust,
    route,
    state.officeLevel,
    state.playerCustomers,
    state.competitors,
    rng,
  )

  const bonuses = employeeBonuses(state.employees)
  let adjustedTickets = Math.max(0, Math.round(playerTickets * bonuses.ticketMultiplier))

  const revenue = calcCommissionRevenue(
    adjustedTickets,
    route.ticketPrice,
    route.commissionRate,
    route.quality,
    rng,
  )
  const profit = revenue - expenses

  const totalMarketCustomers =
    state.playerCustomers +
    adjustedTickets +
    state.competitors.reduce((sum, c) => sum + c.customers, 0)

  const playerCustomers = state.playerCustomers + adjustedTickets
  const marketSharePct = totalMarketCustomers > 0 ? (playerCustomers / totalMarketCustomers) * 100 : 0

  let reputation = state.reputation
  let trust = state.trust

  if (adjustedTickets === 0) {
    reputation -= randBetween(rng, 0.3, 1.0)
    trust -= randBetween(rng, 0.4, 1.2)
  } else if (adjustedTickets < 8) {
    reputation += randBetween(rng, 0.1, 0.45)
    trust += randBetween(rng, 0.15, 0.55)
  } else {
    reputation += randBetween(rng, 0.35, 1.1)
    trust += randBetween(rng, 0.5, 1.4)
  }

  trust += bonuses.trustBonus * 0.05

  if (profit < 0) trust -= randBetween(rng, 0.1, 0.35)
  if (profit > 0 && playerTickets >= 5) trust += randBetween(rng, 0.1, 0.4)

  reputation = Math.max(5, Math.min(100, reputation))
  trust = Math.max(4, Math.min(100, trust))

  const competitors = state.competitors.map((c, i) => ({
    ...c,
    customers: c.customers + (competitorTickets[i] ?? 0),
    reputation: Math.min(98, c.reputation + randBetween(rng, -0.3, 0.4)),
  }))

  const cash = state.cash + profit
  const isBankrupt = cash < BANKRUPTCY_THRESHOLD
  const consecutiveLossDays = profit < 0 ? state.consecutiveLossDays + 1 : 0

  const todos = state.todos.map((t) => {
    if (t.id === 'first-100' && playerCustomers >= 100) return { ...t, done: true }
    if (t.id === 'service' && reputation >= 35) return { ...t, done: true }
    return t
  })

  const summary = {
    day: state.day,
    revenue,
    expenses,
    profit,
    ticketsSold: adjustedTickets,
    marketSharePct,
  }

  const message =
    adjustedTickets === 0
      ? 'No tickets sold. Crowds kept walking to Al Baraka, Safwa, and the rest of the strip.'
      : playerBoothCapped
        ? `Sold ${adjustedTickets} tickets — booth quota hit (${BOOTH_MAX_TICKETS_PER_BUS}/bus). Competitors took the rest of that departure.`
        : profit >= 0
          ? `Sold ${adjustedTickets} tickets (${route.origin} → ${route.destination}). Net +${profit.toLocaleString()} SDG — still a tiny slice of the market.`
          : `Only ${adjustedTickets} tickets. Expenses beat commission revenue — reserves shrinking.`

  const alertBump =
    (adjustedTickets === 0 ? 1 : 0) + (profit < 0 ? 1 : 0) + (trust < 20 ? 1 : 0)

  const next: GameState = {
    ...state,
    cash,
    reputation,
    trust,
    day: state.day + 1,
    gameDateIso: addCalendarDays(state.gameDateIso, 1),
    dailyProfit: profit,
    lastDayRevenue: revenue,
    lastDayExpenses: expenses,
    lastDayTickets: adjustedTickets,
    playerCustomers,
    competitors,
    marketConditions: deriveMarketConditions(reputation, trust, marketSharePct),
    history: [...state.history, summary].slice(-30),
    todos,
    isBankrupt,
    consecutiveLossDays,
    rngSeed: state.rngSeed + 1,
    lastDayMessage: message,
    lastDayBoothCapped: playerBoothCapped,
    notificationCount: state.notificationCount + alertBump,
  }

  return { next, revenue, expenses, profit, ticketsSold: adjustedTickets, message }
}

export function resetGame(): GameState {
  return createInitialState()
}
