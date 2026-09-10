import type { DispatcherRow } from '@/entities/dashboard/model/types'
import { MIN_LOADS_DISPATCH_RPM } from '@/entities/dashboard/lib/aggregate'
import { formatMoneyCompact, formatNumber, formatRpm } from '@/shared/lib/format/number'

function RankTable({ title, rows, tone }: { title: string; rows: DispatcherRow[]; tone: 'good' | 'bad' }) {
  return (
    <div className="dcard" style={{ margin: 0 }}>
      <div className="dcard-head">
        <div className="dcard-title">
          <h2>{title}</h2>
          <p>Desk volume floor · n ≥ {MIN_LOADS_DISPATCH_RPM} loads</p>
        </div>
      </div>
      <div className="ptable-wrap">
        <table className="ptable" style={{ minWidth: 380 }}>
          <thead>
            <tr>
              <th className="nosort">Dispatcher</th>
              <th className="nosort">Loads</th>
              <th className="nosort">RPM</th>
              <th className="nosort">Σ gross</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.desk}>
                <td>{r.desk}</td>
                <td>{formatNumber(r.loads)}</td>
                <td style={{ color: tone === 'good' ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                  {formatRpm(r.rpm)}
                </td>
                <td>{formatMoneyCompact(r.gross)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
                  No desk clears the {MIN_LOADS_DISPATCH_RPM}-load floor in this window.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RpmRankTables({ best, worst }: { best: DispatcherRow[]; worst: DispatcherRow[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="rpmrank-grid">
      <RankTable title="Highest RPM desks" rows={best} tone="good" />
      <RankTable title="Lowest RPM desks" rows={worst} tone="bad" />
    </div>
  )
}
