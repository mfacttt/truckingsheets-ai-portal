import type { DispatcherRow } from '@/entities/dashboard/model/types'
import { formatMoney, formatMiles, formatNumber, formatShare, formatRpm } from '@/shared/lib/format/number'
import { PremiumTable, type PremiumColumn } from '@/widgets/premium-table/ui/PremiumTable'
import type { ReactNode } from 'react'

const COLUMNS: PremiumColumn<DispatcherRow>[] = [
  { key: 'gross', label: 'Σ gross', value: (r) => r.gross, render: (r) => formatMoney(r.gross), heat: true, leader: true },
  { key: 'rpm', label: 'RPM', value: (r) => r.rpm, render: (r) => formatRpm(r.rpm), heat: true, leader: true },
  { key: 'miles', label: 'Σ mi', value: (r) => r.miles, render: (r) => formatMiles(r.miles), heat: true, leader: true },
  {
    key: 'avgWk',
    label: 'AVG/WK',
    value: (r) => r.avgGrossPerWeek,
    render: (r) => formatMoney(r.avgGrossPerWeek),
    heat: true,
  },
  {
    key: 'avgWkUnit',
    label: 'AVG/WK UNIT',
    value: (r) => r.avgGrossPerWeekPerUnit,
    render: (r) => formatMoney(r.avgGrossPerWeekPerUnit),
    heat: true,
  },
  { key: 'avgLoadRate', label: 'Avg load rate', value: (r) => r.avgLoadRate, render: (r) => formatMoney(r.avgLoadRate), heat: true },
  { key: 'loads', label: 'Loads', value: (r) => r.loads, render: (r) => formatNumber(r.loads), heat: true, leader: true },
  { key: 'pct', label: '% Σ gross', value: (r) => r.pctFleetGross, render: (r) => formatShare(r.pctFleetGross), heat: true },
  { key: 'units', label: 'Active units', value: (r) => r.activeUnits, render: (r) => r.activeUnits, sortable: false },
]

export function DispatcherTable({
  rows,
  extraControls,
  title = 'Dispatcher analytics',
  onFormula,
}: {
  rows: DispatcherRow[]
  extraControls?: ReactNode
  title?: string
  onFormula?: (code: string) => void
}) {
  const columns = onFormula
    ? COLUMNS.map((c) =>
        c.key === 'avgWkUnit'
          ? {
              ...c,
              label: 'AVG/WK UNIT ⓘ',
              render: (r: DispatcherRow) => (
                <button
                  type="button"
                  className="linklike"
                  style={{ font: 'inherit' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onFormula('D1')
                  }}
                >
                  {formatMoney(r.avgGrossPerWeekPerUnit)}
                </button>
              ),
            }
          : c,
      )
    : COLUMNS

  return (
    <PremiumTable
      title={title}
      caption="Desk rollups · sortable · heat-shaded on the sorted column"
      rows={rows}
      columns={columns}
      rowKey={(r) => r.desk}
      firstColLabel="Dispatcher"
      firstCol={(r) => r.desk}
      defaultSort="gross"
      minWidth={900}
      {...(extraControls ? { extraControls } : {})}
    />
  )
}
