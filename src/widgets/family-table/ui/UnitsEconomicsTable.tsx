import type { UnitEconomicsRow } from '@/entities/dashboard/lib/aggregate'
import { formatMoney, formatMiles, formatNumber, formatShare, formatRpm } from '@/shared/lib/format/number'
import { PremiumTable, type PremiumColumn } from '@/widgets/premium-table/ui/PremiumTable'
import type { ReactNode } from 'react'

const COLUMNS: PremiumColumn<UnitEconomicsRow>[] = [
  { key: 'gross', label: 'Σ gross', value: (r) => r.gross, render: (r) => formatMoney(r.gross), heat: true, leader: true },
  { key: 'rpm', label: 'RPM', value: (r) => r.rpm, render: (r) => formatRpm(r.rpm), heat: true, leader: true },
  { key: 'miles', label: 'Σ mi', value: (r) => r.miles, render: (r) => formatMiles(r.miles), heat: true, leader: true },
  {
    key: 'haulWk',
    label: 'Truck: gross ÷ hauling weeks',
    value: (r) => r.avgGrossPerHaulingWeek,
    render: (r) => formatMoney(r.avgGrossPerHaulingWeek),
    heat: true,
    leader: true,
  },
  {
    key: 'avgWkLedger',
    label: 'Truck: avg/wk',
    value: (r) => r.avgGrossPerWeekLedger,
    render: (r) => formatMoney(r.avgGrossPerWeekLedger),
    heat: true,
  },
  { key: 'avgLoadRate', label: 'Avg load rate', value: (r) => r.avgLoadRate, render: (r) => formatMoney(r.avgLoadRate), heat: true },
  { key: 'loads', label: 'Loads', value: (r) => r.loads, render: (r) => formatNumber(r.loads), heat: true, leader: true },
  { key: 'pct', label: '% Σ gross', value: (r) => r.pctFleetGross, render: (r) => formatShare(r.pctFleetGross), heat: true },
  { key: 'weeks', label: 'Weeks · active', value: (r) => r.weeksActive, render: (r) => r.weeksActive, sortable: false },
  {
    key: 'desks',
    label: 'Dispatchers',
    render: (r) => (r.dispatchers.slice(0, 2).join(', ') + (r.dispatchers.length > 2 ? '…' : '')) as ReactNode,
    sortable: false,
  },
]

export function UnitsEconomicsTable({ rows, extraControls }: { rows: UnitEconomicsRow[]; extraControls?: ReactNode }) {
  return (
    <PremiumTable
      title="Units & economics"
      caption="One row per fleet unit · sortable · heat-shaded on the sorted column"
      rows={rows}
      columns={COLUMNS}
      rowKey={(r) => String(r.unitId)}
      firstColLabel="Unit"
      firstCol={(r) => `Unit ${r.unitId}`}
      defaultSort="gross"
      minWidth={980}
      {...(extraControls ? { extraControls } : {})}
    />
  )
}
