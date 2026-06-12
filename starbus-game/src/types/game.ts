export type CompetitorPersonality =
  | 'premium'
  | 'budget'
  | 'reliable'
  | 'aggressive'
  | 'local_favorite'
  | 'veteran'

export type Competitor = {
  id: string
  name: string
  color: string
  accent: string
  customers: number
  reputation: number
  personality: CompetitorPersonality
  tagline: string
}

export type Route = {
  id: string
  origin: string
  destination: string
  ticketPrice: number
  commissionRate: number
  quality: number
  seatsPerDay: number
}

export type EmployeeRole = 'dispatcher' | 'support' | 'operations' | 'hr'

export type Employee = {
  id: string
  name: string
  roles: EmployeeRole[]
  salary: number
  efficiency: number
  reliability: number
}

export type DaySummary = {
  day: number
  revenue: number
  expenses: number
  profit: number
  ticketsSold: number
  marketSharePct: number
}

export type MarketCondition = {
  competition: 'High' | 'Medium' | 'Low'
  trust: 'Low' | 'Medium' | 'High'
  demand: 'Low' | 'Normal' | 'High'
  growthOpportunity: 'Low' | 'Medium' | 'High'
}

export type TodoItem = {
  id: string
  title: string
  description: string
  done: boolean
}

export type AlertLevel = 'info' | 'warning' | 'critical'

export type OperationalAlert = {
  id: string
  level: AlertLevel
  title: string
  message: string
}

export type GameLocation = 'street' | 'office'

export type OfficeTab =
  | 'dashboard'
  | 'routes'
  | 'employees'
  | 'finance'
  | 'marketing'
  | 'operations'

export type GameState = {
  agencyName: string
  cash: number
  reputation: number
  trust: number
  officeLevel: number
  day: number
  gameDateIso: string
  dailyProfit: number
  lastDayRevenue: number
  lastDayExpenses: number
  lastDayTickets: number
  playerCustomers: number
  competitors: Competitor[]
  routes: Route[]
  activeRouteId: string
  employees: Employee[]
  marketConditions: MarketCondition
  history: DaySummary[]
  todos: TodoItem[]
  isBankrupt: boolean
  rngSeed: number
  notificationCount: number
  lastDayMessage: string | null
  consecutiveLossDays: number
  lastDayBoothCapped: boolean
}

export type UiState = {
  location: GameLocation
  officeTab: OfficeTab
}
