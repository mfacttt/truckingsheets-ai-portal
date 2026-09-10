import type { DayCell, DayColumn, FleetStatusLoad, UnitRow } from '../model/fleet-status-types'

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1))
}

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function shiftYmd(ymd: string, deltaDays: number): string {
  const d = parseYmd(ymd)
  d.setUTCDate(d.getUTCDate() + deltaDays)
  return toYmd(d)
}

export function buildDayColumns(days: number, endYmd: string): DayColumn[] {
  const out: DayColumn[] = []
  for (let i = days - 1; i >= 0; i--) {
    const ymd = shiftYmd(endYmd, -i)
    const date = parseYmd(ymd)
    const dow = date.getUTCDay()
    out.push({
      ymd,
      day: date.getUTCDate(),
      dowLabel: DOW_LABELS[dow] ?? '',
      isWeekend: dow === 0 || dow === 6,
    })
  }
  return out
}

function cellStateForDay(unitLoads: FleetStatusLoad[], ymd: string): { state: DayCell['state']; load: FleetStatusLoad | null } {
  let hasPickup = false
  let hasDelivery = false
  let hasTransit = false
  let pickupLoad: FleetStatusLoad | null = null

  for (const l of unitLoads) {
    if (l.pickup === ymd) {
      hasPickup = true
      pickupLoad = l
    }
    if (l.delivery === ymd) hasDelivery = true
    if (l.pickup && l.delivery && l.pickup < ymd && ymd < l.delivery) hasTransit = true
  }

  if (hasPickup && hasDelivery) return { state: 'turn', load: pickupLoad }
  if (hasPickup) return { state: 'pickup', load: pickupLoad }
  if (hasDelivery) return { state: 'delivery', load: null }
  if (hasTransit) return { state: 'transit', load: null }
  return { state: 'idle', load: null }
}

export function trailerFamily(raw: string | null): string {
  if (!raw) return 'Other'
  const n = raw.toLowerCase().replace(/[_\s-]+/g, '')
  if (/^local(reefer|refer|reffer|reef)?$/.test(n)) return 'Local'
  if (/^(reefers?|reffers?|refers?|reef)$/.test(n)) return 'Reefer'
  if (/^(dryvans?)$/.test(n)) return 'Dry Van'
  if (/^(stepdecks?)$/.test(n)) return 'Stepdeck'
  if (/^(flatbeds?|opendecks?)$/.test(n)) return 'Flatbed'
  if (/^rgm$/.test(n)) return 'RGM'
  return raw
}

export interface FleetStatusFilters {
  trailerTypeFilter: string
  hideInactive: boolean
  units?: Set<number> | null
  dispatchers?: Set<string> | null
}

export function buildFleetStatusRows(
  loads: FleetStatusLoad[],
  days: number,
  endYmd: string,
  filters: FleetStatusFilters,
): { units: UnitRow[]; dayColumns: DayColumn[]; loadedRow: number[]; pickupRateRow: number[] } {
  const { trailerTypeFilter, hideInactive, units: unitFilter, dispatchers: deskFilter } = filters
  const dayColumns = buildDayColumns(days, endYmd)
  const windowStart = dayColumns[0]?.ymd ?? endYmd
  const windowEnd = dayColumns[dayColumns.length - 1]?.ymd ?? endYmd

  const byUnit = new Map<number, FleetStatusLoad[]>()
  for (const l of loads) {
    if (trailerTypeFilter !== 'All' && trailerFamily(l.trailerType) !== trailerTypeFilter) continue
    if (deskFilter && deskFilter.size > 0 && !(l.dispatcher && deskFilter.has(l.dispatcher))) continue
    const inWindow = (l.pickup && l.pickup >= windowStart && l.pickup <= windowEnd) ||
      (l.delivery && l.delivery >= windowStart && l.delivery <= windowEnd) ||
      (l.pickup && l.delivery && l.pickup < windowStart && l.delivery > windowEnd)
    if (!inWindow) continue
    const arr = byUnit.get(l.unitId)
    if (arr) arr.push(l)
    else byUnit.set(l.unitId, [l])
  }

  let unitIds = [...byUnit.keys()].sort((a, b) => a - b)
  if (unitFilter && unitFilter.size > 0) unitIds = unitIds.filter((u) => unitFilter.has(u))
  const loadedRow = dayColumns.map(() => 0)
  const pickupRateRow = dayColumns.map(() => 0)

  const units: UnitRow[] = []
  for (const unitId of unitIds) {
    const unitLoads = byUnit.get(unitId) ?? []
    if (hideInactive && unitLoads.length === 0) continue
    const days_: DayCell[] = dayColumns.map((col, i) => {
      const { state, load } = cellStateForDay(unitLoads, col.ymd)
      if (state === 'pickup' || state === 'transit' || state === 'delivery' || state === 'turn') {
        loadedRow[i] = (loadedRow[i] ?? 0) + 1
      }
      if ((state === 'pickup' || state === 'turn') && load?.loadRate) {
        pickupRateRow[i] = (pickupRateRow[i] ?? 0) + load.loadRate
      }
      return {
        ymd: col.ymd,
        state,
        loadRate: load?.loadRate ?? null,
        trailerNumber: load?.trailerNumber ?? null,
        trailerType: load?.trailerType ?? null,
        loadId: load?.loadId ?? null,
      }
    })
    units.push({ unitId, label: `Unit ${unitId}`, loadCount: unitLoads.length, days: days_ })
  }

  return { units, dayColumns, loadedRow, pickupRateRow }
}

export function trailerTypesInData(loads: FleetStatusLoad[]): string[] {
  const set = new Set<string>()
  for (const l of loads) {
    if (l.trailerType) set.add(trailerFamily(l.trailerType))
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function unitIdsInData(loads: FleetStatusLoad[]): number[] {
  return [...new Set(loads.map((l) => l.unitId))].sort((a, b) => a - b)
}

export function dispatchersInData(loads: FleetStatusLoad[]): string[] {
  return [...new Set(loads.map((l) => l.dispatcher).filter((d): d is string => !!d))].sort((a, b) =>
    a.localeCompare(b),
  )
}

const RING_COLORS: Record<string, string> = {
  Reefer: 'var(--fam-reefer)',
  'Dry Van': 'var(--fam-dryvan)',
  Flatbed: 'var(--fam-flatbed)',
  Stepdeck: 'var(--fam-stepdeck)',
  RGM: 'var(--fam-rgm)',
  Local: 'var(--fam-local)',
  Other: 'var(--fam-other)',
}

export function trailerRingColor(trailerType: string | null): string {
  return RING_COLORS[trailerFamily(trailerType)] ?? 'var(--fam-other)'
}

export function maxAvailableYmd(loads: FleetStatusLoad[]): string {
  let max = '2026-01-01'
  for (const l of loads) {
    if (l.pickup && l.pickup > max) max = l.pickup
    if (l.delivery && l.delivery > max) max = l.delivery
  }
  return max
}
