export interface CalendarCell {
  date: Date
  iso: string
  day: number
  inMonth: boolean
}

// Monday-first grid covering the full month plus leading/trailing days to fill the week rows.
export function buildCalendarGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(Date.UTC(year, month - 1, 1))
  const startWeekday = (first.getUTCDay() + 6) % 7 // 0 = Monday
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()

  const cells: CalendarCell[] = []

  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(Date.UTC(year, month - 1, 1 - (startWeekday - i)))
    cells.push({ date: d, iso: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(Date.UTC(year, month - 1, day))
    cells.push({ date: d, iso: d.toISOString().slice(0, 10), day, inMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    const d = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate() + 1))
    cells.push({ date: d, iso: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: false })
  }

  return cells
}

export function monthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 }
}
