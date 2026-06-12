export function fmtSdg(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(Math.round(amount))
  return `${sign}${abs.toLocaleString('en-US')} SDG`
}

export function fmtPct(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

export function addCalendarDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function formatGameDate(iso: string): string {
  const d = new Date(`${iso}T08:00:00`)
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function dayName(iso: string): string {
  return new Date(`${iso}T08:00:00`).toLocaleDateString('en-GB', { weekday: 'long' })
}
