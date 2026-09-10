import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { familyColor } from '@/entities/dashboard/lib/aggregate'
import type { FamilyShareRow } from '@/entities/dashboard/model/types'
import { formatMoney, formatMiles, formatRpm, formatShare } from '@/shared/lib/format/number'
import './family-mix.css'

type MixMetric = 'gross' | 'rpm' | 'miles'

const METRIC_LABELS: Record<MixMetric, string> = {
  gross: 'Gross share',
  rpm: 'RPM share',
  miles: 'Miles share',
}

export function FamilyMix({ rows }: { rows: FamilyShareRow[] }) {
  const [metric, setMetric] = useState<MixMetric>('gross')

  const total = rows.reduce((s, r) => s + r[metric], 0)
  const data = rows.map((r) => ({ name: r.family, value: r[metric], row: r }))

  function formatValue(row: FamilyShareRow): string {
    if (metric === 'gross') return formatMoney(row.gross)
    if (metric === 'rpm') return formatRpm(row.rpm)
    return formatMiles(row.miles)
  }

  return (
    <div className="dcard">
      <div className="chart-card-head">
        <div className="chart-card-title">
          <h2>Mix · Σ gross share by trailer family</h2>
        </div>
        <div className="chart-metric-controls">
          <div className="chart-metric-field">
            <label htmlFor="mix-metric">Metric</label>
            <select id="mix-metric" value={metric} onChange={(e) => setMetric(e.target.value as MixMetric)}>
              {(Object.keys(METRIC_LABELS) as MixMetric[]).map((m) => (
                <option key={m} value={m}>
                  {METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mix-grid">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.name} fill={familyColor(d.name)} stroke="var(--card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = payload[0]
                if (!p) return null
                const row = (p.payload as { row: FamilyShareRow }).row
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-week">{row.family}</div>
                    <div className="chart-tooltip-row">{formatValue(row)}</div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mix-legend">
          {rows.map((r) => (
            <div className="mix-legend-row" key={r.family}>
              <span className="mix-legend-dot" style={{ background: familyColor(r.family) }} />
              {r.family}
              <span className="mix-legend-val">
                {total > 0 ? formatShare((100 * r[metric]) / total) : '0%'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
