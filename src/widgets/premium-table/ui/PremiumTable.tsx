import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { heatColor, heatTextColor, HEAT_PALETTES, type HeatPalette } from '@/entities/dashboard/lib/aggregate'

export interface PremiumColumn<Row> {
  key: string
  label: string
  /** numeric value for sorting / heatmap / leader-star; omit for text-only columns */
  value?: (row: Row) => number
  /** rendered cell content */
  render: (row: Row) => ReactNode
  sortable?: boolean
  heat?: boolean
  leader?: boolean
}

const PALETTES = Object.keys(HEAT_PALETTES) as HeatPalette[]

export function PremiumTable<Row>({
  title,
  caption,
  rows,
  columns,
  rowKey,
  firstColLabel,
  firstCol,
  defaultSort,
  minWidth = 720,
  extraControls,
}: {
  title: string
  caption?: string
  rows: Row[]
  columns: PremiumColumn<Row>[]
  rowKey: (row: Row) => string
  firstColLabel: string
  firstCol: (row: Row) => ReactNode
  defaultSort?: string
  minWidth?: number
  extraControls?: ReactNode
}) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSort ?? null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [palette, setPalette] = useState<HeatPalette>('ocean')

  const numericCols = useMemo(() => columns.filter((c) => c.value), [columns])

  const bounds = useMemo(() => {
    const out: Record<string, { min: number; max: number }> = {}
    for (const c of numericCols) {
      const vals = rows.map((r) => c.value!(r))
      out[c.key] = { min: Math.min(...vals, Infinity), max: Math.max(...vals, -Infinity) }
    }
    return out
  }, [rows, numericCols])

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.value) return rows
    const v = col.value
    return [...rows].sort((a, b) => (v(a) - v(b)) * (sortDir === 'asc' ? 1 : -1))
  }, [rows, columns, sortKey, sortDir])

  function toggleSort(col: PremiumColumn<Row>) {
    if (!col.value || col.sortable === false) return
    if (sortKey === col.key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else {
      setSortKey(col.key)
      setSortDir('desc')
    }
  }

  return (
    <div className="dcard">
      <div className="dcard-head">
        <div className="dcard-title">
          <h2>{title}</h2>
          {caption && <p>{caption}</p>}
        </div>
        <div className="dcontrols">
          {extraControls}
          <div className="dfield">
            <label>Sort gradient</label>
            <select className="dselect" value={palette} onChange={(e) => setPalette(e.target.value as HeatPalette)} style={{ minWidth: 120 }}>
              {PALETTES.map((p) => (
                <option key={p} value={p}>
                  {p[0]!.toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {sortKey && (
            <button className="linklike ptable-reset" onClick={() => setSortKey(null)}>
              Reset sort
            </button>
          )}
        </div>
      </div>

      <div className="ptable-wrap">
        <table className="ptable" style={{ minWidth }}>
          <thead>
            <tr>
              <th className="nosort">{firstColLabel}</th>
              {columns.map((col) => {
                const canSort = col.value && col.sortable !== false
                return (
                  <th
                    key={col.key}
                    className={`${canSort ? '' : 'nosort'} ${sortKey === col.key ? 'sorted' : ''}`}
                    onClick={() => toggleSort(col)}
                  >
                    {col.label}
                    {canSort && (
                      <span className="ptri">
                        <span className={sortKey === col.key && sortDir === 'asc' ? 'on' : ''}>▲</span>
                        <span className={sortKey === col.key && sortDir === 'desc' ? 'on' : ''}>▼</span>
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={rowKey(row)}>
                <td>{firstCol(row)}</td>
                {columns.map((col) => {
                  const v = col.value?.(row)
                  const b = bounds[col.key]
                  const isSortedHeat = col.heat && col.key === sortKey && b && v != null
                  const isLeader = col.leader && v != null && b && v === b.max
                  let heatStyle: CSSProperties | undefined
                  if (isSortedHeat) {
                    const bg = heatColor(v, b.min, b.max, palette)
                    heatStyle = { background: bg, color: heatTextColor(bg), fontWeight: 600 }
                  }
                  return (
                    <td key={col.key} style={heatStyle}>
                      {col.render(row)}
                      {isLeader && (
                        <span className="pstar" style={heatStyle ? { color: 'inherit', textShadow: 'none' } : undefined}>
                          ★
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
