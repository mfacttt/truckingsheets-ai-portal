/** The season these week numbers belong to. The loads feed carries only a week
 *  number; the fleet-status feed dates the same weeks, and those dates line up
 *  with ISO weeks of this year. */
export const SEASON_YEAR = 2026

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Monday of the given ISO week. */
function isoWeekStart(week: number, year = SEASON_YEAR): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayFromMonday = (jan4.getUTCDay() + 6) % 7
  const firstMonday = new Date(jan4)
  firstMonday.setUTCDate(jan4.getUTCDate() - dayFromMonday)
  const start = new Date(firstMonday)
  start.setUTCDate(firstMonday.getUTCDate() + (week - 1) * 7)
  return start
}

function shortDate(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** "Week 14, 2026" — for tooltips and table rows. */
export function weekLabel(week: number, year = SEASON_YEAR): string {
  return `Week ${week}, ${year}`
}

/** "Mar 30–Apr 5" — the days the week covers. */
export function weekDateRange(week: number, year = SEASON_YEAR): string {
  const start = isoWeekStart(week, year)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  return `${shortDate(start)}–${shortDate(end)}`
}

/** "Week 14, 2026 (Mar 30–Apr 5)" — the full form. */
export function weekLabelWithDates(week: number, year = SEASON_YEAR): string {
  return `${weekLabel(week, year)} (${weekDateRange(week, year)})`
}

/** Axis ticks stay short so they don't collide: "W14". */
export function weekTick(week: number): string {
  return `W${week}`
}
