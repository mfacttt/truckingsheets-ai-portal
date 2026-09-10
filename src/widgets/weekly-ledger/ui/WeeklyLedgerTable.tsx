import type { WeeklyLedgerRow } from '@/entities/dashboard/model/types'
import { formatMoney, formatMiles, formatNumber, formatRpm } from '@/shared/lib/format/number'
import { PremiumTable, type PremiumColumn } from '@/widgets/premium-table/ui/PremiumTable'

const COLUMNS: PremiumColumn<WeeklyLedgerRow>[] = [
  { key: 'gross', label: 'Σ gross', value: (r) => r.gross, render: (r) => formatMoney(r.gross), heat: true, leader: true },
  { key: 'rpm', label: 'RPM', value: (r) => r.rpm, render: (r) => formatRpm(r.rpm), heat: true, leader: true },
  { key: 'miles', label: 'Σ mi', value: (r) => r.miles, render: (r) => formatMiles(r.miles), heat: true, leader: true },
  {
    key: 'awUnit',
    label: 'Fleet: week gross ÷ trucks',
    value: (r) => r.avgGrossPerUnitWeek,
    render: (r) => formatMoney(r.avgGrossPerUnitWeek),
    heat: true,
    leader: true,
  },
  {
    key: 'avgLoadRate',
    label: 'Avg load rate',
    value: (r) => r.avgLoadRate,
    render: (r) => formatMoney(r.avgLoadRate),
    heat: true,
    leader: true,
  },
  { key: 'loads', label: 'Loads', value: (r) => r.loads, render: (r) => formatNumber(r.loads), heat: true, leader: true },
  { key: 'units', label: 'Active units', value: (r) => r.activeUnits, render: (r) => r.activeUnits, sortable: false },
]

export function WeeklyLedgerTable({ ledger }: { ledger: WeeklyLedgerRow[] }) {
  return (
    <PremiumTable
      title="Weekly ledger"
      caption="One row per week · click a header to sort · gradient fills the sorted column"
      rows={ledger}
      columns={COLUMNS}
      rowKey={(r) => String(r.week)}
      firstColLabel="Week"
      firstCol={(r) => `Week ${r.week}`}
      minWidth={780}
    />
  )
}
