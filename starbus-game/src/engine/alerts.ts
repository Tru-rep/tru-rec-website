import type { GameState, OperationalAlert } from '../types/game'
import { BOOTH_MAX_TICKETS_PER_BUS } from '../data/constants'
import { calcDailyExpenses } from './simulation'
export function deriveOperationalAlerts(state: GameState): OperationalAlert[] {
  const alerts: OperationalAlert[] = []
  const burn = calcDailyExpenses(state)
  const runwayDays = state.cash > 0 ? Math.floor(state.cash / burn) : 0

  if (state.isBankrupt) {
    alerts.push({
      id: 'bankrupt',
      level: 'critical',
      title: 'Insolvency',
      message: 'Cash reserves collapsed. Operations halted.',
    })
    return alerts
  }

  if (state.cash < burn * 3) {
    alerts.push({
      id: 'runway',
      level: state.cash < burn ? 'critical' : 'warning',
      title: 'Cash runway critical',
      message:
        state.cash < burn
          ? `Less than one day of costs left (${burn.toLocaleString()} SDG/day).`
          : `~${runwayDays} days of runway at current burn.`,
    })
  }

  if (state.trust < 25) {
    alerts.push({
      id: 'trust',
      level: 'warning',
      title: 'Market trust is fragile',
      message: 'Customers walk past your office to established agencies.',
    })
  }

  if (state.lastDayBoothCapped) {
    alerts.push({
      id: 'booth-cap',
      level: 'info',
      title: 'Booth quota hit',
      message: `Your booth sold the max ${BOOTH_MAX_TICKETS_PER_BUS} tickets on at least one bus — overflow went to other agencies.`,
    })
  }

  if (state.lastDayTickets === 0 && state.day > 1) {
    alerts.push({
      id: 'no-sales',
      level: 'warning',
      title: 'Zero ticket sales yesterday',
      message: 'Competitors captured the full daily demand.',
    })
  }

  if (state.consecutiveLossDays >= 2) {
    alerts.push({
      id: 'loss-streak',
      level: state.consecutiveLossDays >= 4 ? 'critical' : 'warning',
      title: 'Operating at a loss',
      message: `${state.consecutiveLossDays} consecutive days with negative net profit.`,
    })
  }

  if (state.reputation < 15) {
    alerts.push({
      id: 'rep',
      level: 'critical',
      title: 'Reputation collapsing',
      message: 'Word is spreading that your agency is unreliable.',
    })
  }

  if (state.playerCustomers < 30 && state.day >= 3) {
    alerts.push({
      id: 'startup',
      level: 'info',
      title: 'Startup pressure',
      message: 'You are still invisible on a street dominated by incumbents.',
    })
  }

  return alerts.slice(0, 4)
}
