import { familyColor } from '@/entities/dashboard/lib/aggregate'
import type { FamilyShareRow } from '@/entities/dashboard/model/types'
import { formatMoney, formatMiles, formatNumber, formatShare, formatRpm } from '@/shared/lib/format/number'
import { PremiumTable, type PremiumColumn } from '@/widgets/premium-table/ui/PremiumTable'

export function FamilyShareTable({ rows, weekCount }: { rows: FamilyShareRow[]; weekCount: number }) {
  const columns: PremiumColumn<FamilyShareRow>[] = [
    { key: 'gross', label: 'Σ gross', value: (r) => r.gross, render: (r) => formatMoney(r.gross), heat: true, leader: true },
    { key: 'rpm', label: 'RPM', value: (r) => r.rpm, render: (r) => formatRpm(r.rpm), heat: true, leader: true },
    { key: 'miles', label: 'Σ mi', value: (r) => r.miles, render: (r) => formatMiles(r.miles), heat: true, leader: true },
    {
      key: 'avgWk',
      label: 'AVG/WK',
      value: (r) => (weekCount > 0 ? r.gross / weekCount : 0),
      render: (r) => formatMoney(weekCount > 0 ? r.gross / weekCount : 0),
      heat: true,
    },
    {
      key: 'avgWkUnit',
      label: 'Avg $/wk · unit',
      value: (r) => (weekCount > 0 && r.units > 0 ? r.gross / (weekCount * r.units) : 0),
      render: (r) => formatMoney(weekCount > 0 && r.units > 0 ? r.gross / (weekCount * r.units) : 0),
      heat: true,
    },
    {
      key: 'avgLoadRate',
      label: 'Avg load rate',
      value: (r) => (r.loads > 0 ? r.gross / r.loads : 0),
      render: (r) => formatMoney(r.loads > 0 ? r.gross / r.loads : 0),
      heat: true,
    },
    { key: 'loads', label: 'Loads', value: (r) => r.loads, render: (r) => formatNumber(r.loads), heat: true, leader: true },
    { key: 'pct', label: '% Σ gross', value: (r) => r.pctFleetGross, render: (r) => formatShare(r.pctFleetGross), heat: true },
    { key: 'units', label: 'Units', value: (r) => r.units, render: (r) => r.units, sortable: false },
    { key: 'desks', label: 'Dispatchers', value: (r) => r.dispatchers, render: (r) => r.dispatchers, sortable: false },
  ]

  return (
    <PremiumTable
      title="Trailer families · Fleet cohort table · RPM & mix"
      caption="Normalised families · click a header to sort · gradient fills the sorted column"
      rows={rows}
      columns={columns}
      rowKey={(r) => r.family}
      firstColLabel="Family"
      firstCol={(r) => (
        <>
          <span className="pfam-dot" style={{ background: familyColor(r.family) }} />
          {r.family}
        </>
      )}
      defaultSort="gross"
      minWidth={960}
    />
  )
}
