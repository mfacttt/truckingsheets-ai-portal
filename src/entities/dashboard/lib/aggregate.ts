import type {
  DispatcherRow,
  FamilyShareRow,
  Load,
  MomentumMetric,
  WeekRange,
  WeeklyLedgerRow,
} from '../model/types'

export function rpm(gross: number, miles: number): number {
  return miles > 1e-9 ? gross / miles : 0
}

export function filterByWeekRange(loads: Load[], range: WeekRange): Load[] {
  return loads.filter((l) => l.week >= range.start && l.week <= range.end)
}

export function weeklyLedger(loads: Load[]): WeeklyLedgerRow[] {
  const byWeek = new Map<number, Load[]>()
  for (const l of loads) {
    const arr = byWeek.get(l.week)
    if (arr) arr.push(l)
    else byWeek.set(l.week, [l])
  }
  const weeks = [...byWeek.keys()].sort((a, b) => a - b)
  return weeks.map((week) => {
    const rows = byWeek.get(week) ?? []
    const gross = rows.reduce((s, r) => s + r.grossRate, 0)
    const miles = rows.reduce((s, r) => s + r.miles, 0)
    const activeUnits = new Set(rows.map((r) => r.unitId)).size
    return {
      week,
      gross,
      miles,
      rpm: rpm(gross, miles),
      loads: rows.length,
      activeUnits,
      avgGrossPerUnitWeek: activeUnits > 0 ? gross / activeUnits : 0,
      avgLoadRate: rows.length > 0 ? gross / rows.length : 0,
    }
  })
}

export function fleetKpis(loads: Load[]) {
  const gross = loads.reduce((s, r) => s + r.grossRate, 0)
  const miles = loads.reduce((s, r) => s + r.miles, 0)
  const weeks = new Set(loads.map((l) => l.week))
  const units = new Set(loads.map((l) => l.unitId))
  return {
    gross,
    miles,
    rpmValue: rpm(gross, miles),
    loads: loads.length,
    weekCount: weeks.size,
    unitCount: units.size,
    avgLoadRate: loads.length > 0 ? gross / loads.length : 0,
    avgGrossPerWeek: weeks.size > 0 ? gross / weeks.size : 0,
    avgGrossPerWeekPerUnit: weeks.size > 0 && units.size > 0 ? gross / (weeks.size * units.size) : 0,
  }
}

export function familyShare(loads: Load[]): FamilyShareRow[] {
  const byFam = new Map<string, Load[]>()
  for (const l of loads) {
    const arr = byFam.get(l.family)
    if (arr) arr.push(l)
    else byFam.set(l.family, [l])
  }
  const totalGross = loads.reduce((s, r) => s + r.grossRate, 0)
  const rows: FamilyShareRow[] = [...byFam.entries()].map(([family, rows_]) => {
    const gross = rows_.reduce((s, r) => s + r.grossRate, 0)
    const miles = rows_.reduce((s, r) => s + r.miles, 0)
    return {
      family,
      gross,
      miles,
      loads: rows_.length,
      rpm: rpm(gross, miles),
      pctFleetGross: totalGross > 1e-9 ? (100 * gross) / totalGross : 0,
      units: new Set(rows_.map((r) => r.unitId)).size,
      dispatchers: new Set(rows_.map((r) => r.dispatcher)).size,
    }
  })
  rows.sort((a, b) => b.gross - a.gross)
  return rows
}

export function dispatcherRows(loads: Load[], ledgerWeeks?: number, topN?: number): DispatcherRow[] {
  const byDesk = new Map<string, Load[]>()
  for (const l of loads) {
    const arr = byDesk.get(l.dispatcher)
    if (arr) arr.push(l)
    else byDesk.set(l.dispatcher, [l])
  }
  const weeks = ledgerWeeks ?? new Set(loads.map((l) => l.week)).size
  const totalGross = loads.reduce((s, r) => s + r.grossRate, 0)
  const rows: DispatcherRow[] = [...byDesk.entries()].map(([desk, rows_]) => {
    const gross = rows_.reduce((s, r) => s + r.grossRate, 0)
    const miles = rows_.reduce((s, r) => s + r.miles, 0)
    const units = new Set(rows_.map((r) => r.unitId)).size
    return {
      desk,
      gross,
      miles,
      loads: rows_.length,
      rpm: rpm(gross, miles),
      pctFleetGross: totalGross > 1e-9 ? (100 * gross) / totalGross : 0,
      avgGrossPerWeek: weeks > 0 ? gross / weeks : 0,
      avgGrossPerWeekPerUnit: weeks > 0 && units > 0 ? gross / (weeks * units) : 0,
      avgLoadRate: rows_.length > 0 ? gross / rows_.length : 0,
      activeUnits: units,
    }
  })
  rows.sort((a, b) => b.gross - a.gross)
  return topN ? rows.slice(0, topN) : rows
}

export function momentumSeries(ledger: WeeklyLedgerRow[], metric: MomentumMetric): number[] {
  return ledger.map((w) => {
    switch (metric) {
      case 'gross':
        return w.gross
      case 'rpm':
        return w.rpm
      case 'miles':
        return w.miles
      case 'loads':
        return w.loads
      case 'avgLoadRate':
        return w.avgLoadRate
      case 'avgGrossPerUnit':
        return w.avgGrossPerUnitWeek
    }
  })
}

export function weekOverWeekPct(ledger: WeeklyLedgerRow[], metric: MomentumMetric): number[] {
  const series = momentumSeries(ledger, metric)
  return series.map((v, i) => {
    if (i === 0) return 0
    const prev = series[i - 1] ?? 0
    return prev > 1e-9 ? ((v - prev) / prev) * 100 : 0
  })
}

export interface UnitEconomicsRow {
  unitId: number
  gross: number
  miles: number
  loads: number
  rpm: number
  pctFleetGross: number
  avgGrossPerWeekLedger: number
  avgGrossPerHaulingWeek: number
  avgLoadRate: number
  weeksActive: number
  dispatchers: string[]
}

export function unitEconomics(loads: Load[], ledgerWeekCount: number): UnitEconomicsRow[] {
  const byUnit = new Map<number, Load[]>()
  for (const l of loads) {
    const arr = byUnit.get(l.unitId)
    if (arr) arr.push(l)
    else byUnit.set(l.unitId, [l])
  }
  const totalGross = loads.reduce((s, r) => s + r.grossRate, 0)
  const rows: UnitEconomicsRow[] = [...byUnit.entries()].map(([unitId, rows_]) => {
    const gross = rows_.reduce((s, r) => s + r.grossRate, 0)
    const miles = rows_.reduce((s, r) => s + r.miles, 0)
    const weeksActive = new Set(rows_.map((r) => r.week)).size
    return {
      unitId,
      gross,
      miles,
      loads: rows_.length,
      rpm: rpm(gross, miles),
      pctFleetGross: totalGross > 1e-9 ? (100 * gross) / totalGross : 0,
      avgGrossPerWeekLedger: ledgerWeekCount > 0 ? gross / ledgerWeekCount : 0,
      avgGrossPerHaulingWeek: weeksActive > 0 ? gross / weeksActive : 0,
      avgLoadRate: rows_.length > 0 ? gross / rows_.length : 0,
      weeksActive,
      dispatchers: [...new Set(rows_.map((r) => r.dispatcher))],
    }
  })
  rows.sort((a, b) => b.gross - a.gross)
  return rows
}

export interface DeskUnitRow {
  desk: string
  units: number[]
  unitCount: number
  gross: number
  miles: number
  loads: number
  rpm: number
  avgGrossPerWeek: number
  avgGrossPerHaulingWeek: number
  avgLoadRate: number
  loadsPerUnit: number
  grossPerUnit: number
  weeksActive: number
}

/** One row per dispatcher, carrying every unit that desk ran loads on. */
export function deskUnitRows(loads: Load[], ledgerWeeks: number): DeskUnitRow[] {
  const byDesk = new Map<string, Load[]>()
  for (const l of loads) {
    const arr = byDesk.get(l.dispatcher)
    if (arr) arr.push(l)
    else byDesk.set(l.dispatcher, [l])
  }
  const rows: DeskUnitRow[] = [...byDesk.entries()].map(([desk, rows_]) => {
    const gross = rows_.reduce((s, r) => s + r.grossRate, 0)
    const miles = rows_.reduce((s, r) => s + r.miles, 0)
    const units = [...new Set(rows_.map((r) => r.unitId))].sort((a, b) => a - b)
    const weeksActive = new Set(rows_.map((r) => r.week)).size
    return {
      desk,
      units,
      unitCount: units.length,
      gross,
      miles,
      loads: rows_.length,
      rpm: rpm(gross, miles),
      avgGrossPerWeek: ledgerWeeks > 0 ? gross / ledgerWeeks : 0,
      avgGrossPerHaulingWeek: weeksActive > 0 ? gross / weeksActive : 0,
      avgLoadRate: rows_.length > 0 ? gross / rows_.length : 0,
      loadsPerUnit: units.length > 0 ? rows_.length / units.length : 0,
      grossPerUnit: units.length > 0 ? gross / units.length : 0,
      weeksActive,
    }
  })
  rows.sort((a, b) => b.gross - a.gross)
  return rows
}

export interface WeeklyFamilyPoint {
  week: number
  [family: string]: number
}

export type FamilyWeeklyMetric =
  | 'gross'
  | 'rpm'
  | 'miles'
  | 'loads'
  | 'avgGrossWeekUnit'
  | 'avgLoadRate'
  | 'pctGross'

export const FAMILY_WEEKLY_METRIC_LABELS: Record<FamilyWeeklyMetric, string> = {
  gross: 'Σ gross',
  rpm: 'RPM',
  miles: 'Σ miles',
  loads: 'Loads',
  avgGrossWeekUnit: 'Avg $/wk · unit',
  avgLoadRate: 'Avg load rate',
  pctGross: '% Σ gross',
}

export function weeklyByFamily(
  loads: Load[],
  families: string[],
  metric: FamilyWeeklyMetric,
): WeeklyFamilyPoint[] {
  const byWeek = new Map<number, Load[]>()
  for (const l of loads) {
    const arr = byWeek.get(l.week)
    if (arr) arr.push(l)
    else byWeek.set(l.week, [l])
  }
  const weeks = [...byWeek.keys()].sort((a, b) => a - b)
  return weeks.map((week) => {
    const rows = byWeek.get(week) ?? []
    const weekGross = rows.reduce((s, r) => s + r.grossRate, 0)
    const point: WeeklyFamilyPoint = { week }
    for (const fam of families) {
      const famRows = rows.filter((r) => r.family === fam)
      const gross = famRows.reduce((s, r) => s + r.grossRate, 0)
      const miles = famRows.reduce((s, r) => s + r.miles, 0)
      const units = new Set(famRows.map((r) => r.unitId)).size
      switch (metric) {
        case 'gross':
          point[fam] = gross
          break
        case 'rpm':
          point[fam] = rpm(gross, miles)
          break
        case 'miles':
          point[fam] = miles
          break
        case 'loads':
          point[fam] = famRows.length
          break
        case 'avgGrossWeekUnit':
          point[fam] = units > 0 ? gross / units : 0
          break
        case 'avgLoadRate':
          point[fam] = famRows.length > 0 ? gross / famRows.length : 0
          break
        case 'pctGross':
          point[fam] = weekGross > 1e-9 ? (100 * gross) / weekGross : 0
          break
      }
    }
    return point
  })
}

export interface WeeklyUnitPoint {
  week: number
  [unitId: string]: number
}

export type UnitWeeklyMetric = 'gross' | 'rpm' | 'miles' | 'loads' | 'avgLoadRate' | 'pctGross'

export const UNIT_WEEKLY_METRIC_LABELS: Record<UnitWeeklyMetric, string> = {
  gross: 'Σ gross',
  rpm: 'RPM',
  miles: 'Σ miles',
  loads: 'Loads',
  avgLoadRate: 'Avg load rate',
  pctGross: '% Σ gross',
}

export function weeklyByUnit(
  loads: Load[],
  unitIds: number[],
  metric: UnitWeeklyMetric,
): WeeklyUnitPoint[] {
  const byWeek = new Map<number, Load[]>()
  for (const l of loads) {
    const arr = byWeek.get(l.week)
    if (arr) arr.push(l)
    else byWeek.set(l.week, [l])
  }
  const weeks = [...byWeek.keys()].sort((a, b) => a - b)
  return weeks.map((week) => {
    const rows = byWeek.get(week) ?? []
    const weekGross = rows.reduce((s, r) => s + r.grossRate, 0)
    const point: WeeklyUnitPoint = { week }
    for (const uid of unitIds) {
      const uRows = rows.filter((r) => r.unitId === uid)
      const gross = uRows.reduce((s, r) => s + r.grossRate, 0)
      const miles = uRows.reduce((s, r) => s + r.miles, 0)
      switch (metric) {
        case 'gross':
          point[String(uid)] = gross
          break
        case 'rpm':
          point[String(uid)] = rpm(gross, miles)
          break
        case 'miles':
          point[String(uid)] = miles
          break
        case 'loads':
          point[String(uid)] = uRows.length
          break
        case 'avgLoadRate':
          point[String(uid)] = uRows.length > 0 ? gross / uRows.length : 0
          break
        case 'pctGross':
          point[String(uid)] = weekGross > 1e-9 ? (100 * gross) / weekGross : 0
          break
      }
    }
    return point
  })
}

export const FAMILY_COLORS: Record<string, string> = {
  Reefer: 'var(--fam-reefer)',
  'Dry Van': 'var(--fam-dryvan)',
  Flatbed: 'var(--fam-flatbed)',
  Stepdeck: 'var(--fam-stepdeck)',
  RGM: 'var(--fam-rgm)',
  Local: 'var(--fam-local)',
  Other: 'var(--fam-other)',
}

export function familyColor(family: string): string {
  return FAMILY_COLORS[family] ?? 'var(--fam-other)'
}

export interface WeeklyDeskPoint {
  week: number
  [desk: string]: number
}

export function weeklyByDesk(loads: Load[], desks: string[], metric: 'gross' | 'rpm' | 'loads'): WeeklyDeskPoint[] {
  const byWeek = new Map<number, Load[]>()
  for (const l of loads) {
    const arr = byWeek.get(l.week)
    if (arr) arr.push(l)
    else byWeek.set(l.week, [l])
  }
  const weeks = [...byWeek.keys()].sort((a, b) => a - b)
  return weeks.map((week) => {
    const rows = byWeek.get(week) ?? []
    const point: WeeklyDeskPoint = { week }
    for (const desk of desks) {
      const deskRows = rows.filter((r) => r.dispatcher === desk)
      const gross = deskRows.reduce((s, r) => s + r.grossRate, 0)
      const miles = deskRows.reduce((s, r) => s + r.miles, 0)
      if (metric === 'gross') point[desk] = gross
      else if (metric === 'rpm') point[desk] = rpm(gross, miles)
      else point[desk] = deskRows.length
    }
    return point
  })
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2 : (sorted[mid] ?? 0)
}

const DESK_PALETTE = ['#F47920', '#1E7ABF', '#E06A12', '#0F9D58', '#FF9633', '#9333EA', '#2DB7C9', '#B85C38']

export function deskColor(index: number): string {
  return DESK_PALETTE[index % DESK_PALETTE.length] ?? '#94A3B8'
}

// ---- MIN LOADS floor for desk RPM ranking (matches Helios MIN_LOADS_DISPATCH_RPM) ----
export const MIN_LOADS_DISPATCH_RPM = 25

export function deskRpmRanked(loads: Load[]): { best: DispatcherRow[]; worst: DispatcherRow[] } {
  const eligible = dispatcherRows(loads).filter((d) => d.loads >= MIN_LOADS_DISPATCH_RPM)
  const byRpmDesc = [...eligible].sort((a, b) => b.rpm - a.rpm)
  const byRpmAsc = [...eligible].sort((a, b) => a.rpm - b.rpm)
  return { best: byRpmDesc.slice(0, 10), worst: byRpmAsc.slice(0, 10) }
}

// ---- generic bubble/scatter datapoint over any grouped entity ----
export type BubbleMetric =
  | 'loads'
  | 'gross'
  | 'rpm'
  | 'miles'
  | 'avgGrossWeek'
  | 'avgLoadRate'
  | 'pctFleet'

export const BUBBLE_METRIC_LABELS: Record<BubbleMetric, string> = {
  loads: 'Loads',
  gross: 'Σ gross',
  rpm: 'RPM ($/mi)',
  miles: 'Σ miles',
  avgGrossWeek: 'Avg $/wk · unit',
  avgLoadRate: 'Avg load rate',
  pctFleet: '% Σ gross',
}

export interface BubblePoint {
  name: string
  loads: number
  gross: number
  rpm: number
  miles: number
  avgGrossWeek: number
  avgLoadRate: number
  pctFleet: number
}

function bubbleFromRows(name: string, rows: Load[], totalGross: number, ledgerWeeks: number): BubblePoint {
  const gross = rows.reduce((s, r) => s + r.grossRate, 0)
  const miles = rows.reduce((s, r) => s + r.miles, 0)
  const units = new Set(rows.map((r) => r.unitId)).size || 1
  return {
    name,
    loads: rows.length,
    gross,
    rpm: rpm(gross, miles),
    miles,
    avgGrossWeek: ledgerWeeks > 0 ? gross / (ledgerWeeks * units) : 0,
    avgLoadRate: rows.length > 0 ? gross / rows.length : 0,
    pctFleet: totalGross > 1e-9 ? (100 * gross) / totalGross : 0,
  }
}

export function bubbleByFamily(loads: Load[], ledgerWeeks: number): BubblePoint[] {
  const total = loads.reduce((s, r) => s + r.grossRate, 0)
  const groups = new Map<string, Load[]>()
  for (const l of loads) {
    const a = groups.get(l.family)
    if (a) a.push(l)
    else groups.set(l.family, [l])
  }
  return [...groups.entries()]
    .map(([k, rows]) => bubbleFromRows(k, rows, total, ledgerWeeks))
    .sort((a, b) => b.gross - a.gross)
}

export function bubbleByUnit(loads: Load[], ledgerWeeks: number): BubblePoint[] {
  const total = loads.reduce((s, r) => s + r.grossRate, 0)
  const groups = new Map<number, Load[]>()
  for (const l of loads) {
    const a = groups.get(l.unitId)
    if (a) a.push(l)
    else groups.set(l.unitId, [l])
  }
  return [...groups.entries()]
    .map(([k, rows]) => bubbleFromRows(`Unit ${k}`, rows, total, ledgerWeeks))
    .sort((a, b) => b.gross - a.gross)
}

export function bubbleByDesk(loads: Load[], ledgerWeeks: number): BubblePoint[] {
  const total = loads.reduce((s, r) => s + r.grossRate, 0)
  const groups = new Map<string, Load[]>()
  for (const l of loads) {
    const a = groups.get(l.dispatcher)
    if (a) a.push(l)
    else groups.set(l.dispatcher, [l])
  }
  return [...groups.entries()]
    .map(([k, rows]) => bubbleFromRows(k, rows, total, ledgerWeeks))
    .sort((a, b) => b.gross - a.gross)
}

// ---- heatmap palettes for sortable tables ----
export type HeatPalette = 'ocean' | 'thermal' | 'sunset' | 'forest' | 'neon'

export const HEAT_PALETTES: Record<HeatPalette, [string, string, string]> = {
  ocean: ['#0B3D64', '#2DB7C9', '#D7F3F0'],
  thermal: ['#132A54', '#F2E9D8', '#C0322A'],
  sunset: ['#5B21B6', '#F97316', '#FACC15'],
  forest: ['#14532D', '#7CA661', '#B7E4C7'],
  neon: ['#C026D3', '#FACC15', '#22C55E'],
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bl = Math.round(a[2] + (b[2] - a[2]) * t)
  return `rgb(${r}, ${g}, ${bl})`
}

/** Returns a background colour for value v within [min,max] on the given palette. */
export function heatColor(v: number, min: number, max: number, palette: HeatPalette): string {
  if (!(max > min)) return 'transparent'
  const t = Math.max(0, Math.min(1, (v - min) / (max - min)))
  const [c0, c1, c2] = HEAT_PALETTES[palette].map(hexToRgb) as [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ]
  return t < 0.5 ? mix(c0, c1, t * 2) : mix(c1, c2, (t - 0.5) * 2)
}

/** Readable text colour (dark or light) for a given `rgb(r, g, b)` background. */
export function heatTextColor(bg: string): string {
  const m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(bg)
  if (!m) return '#fff'
  const r = Number(m[1]) / 255
  const g = Number(m[2]) / 255
  const b = Number(m[3]) / 255
  // perceived luminance
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.62 ? '#1B2233' : '#fff'
}
