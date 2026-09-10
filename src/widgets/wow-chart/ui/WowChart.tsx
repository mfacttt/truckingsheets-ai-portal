import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { weekOverWeekPct } from '@/entities/dashboard/lib/aggregate'
import { MOMENTUM_METRIC_LABELS, type MomentumMetric, type WeeklyLedgerRow } from '@/entities/dashboard/model/types'
import { formatPct } from '@/shared/lib/format/number'
import '../../momentum-chart/ui/momentum-chart.css'

const METRICS = Object.keys(MOMENTUM_METRIC_LABELS) as MomentumMetric[]

export function WowChart({ ledger }: { ledger: WeeklyLedgerRow[] }) {
  const [metric, setMetric] = useState<MomentumMetric>('gross')

  const data = useMemo(() => {
    const pct = weekOverWeekPct(ledger, metric)
    return ledger.map((w, i) => ({ week: w.week, pct: pct[i] ?? 0 }))
  }, [ledger, metric])

  if (ledger.length < 2) {
    return (
      <div className="dcard">
        <h2>Week-over-week · % change vs prior week</h2>
        <div className="empty-state" style={{ marginTop: 14 }}>
          Week-over-week chart needs sequential weeks — adjust Start / End weeks in the header.
        </div>
      </div>
    )
  }

  return (
    <div className="dcard">
      <div className="chart-card-head">
        <div className="chart-card-title">
          <h2>Week-over-week · % change vs prior week</h2>
          <p>Δ% = (this week ÷ last week − 1) × 100, on {MOMENTUM_METRIC_LABELS[metric]}</p>
        </div>
        <div className="chart-metric-controls">
          <div className="chart-metric-field">
            <label htmlFor="wow-metric">Primary</label>
            <select id="wow-metric" value={metric} onChange={(e) => setMetric(e.target.value as MomentumMetric)}>
              {METRICS.map((m) => (
                <option key={m} value={m}>
                  {MOMENTUM_METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 6, right: 8, bottom: 6, left: 0 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="week" tickFormatter={(w) => `W${w}`} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
          <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={48} />
          <ReferenceLine y={0} stroke="var(--ink-3)" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="chart-tooltip">
                  <div className="chart-tooltip-week">Week {label}</div>
                  <div className="chart-tooltip-row">{formatPct(Number(payload[0]?.value ?? 0))}</div>
                </div>
              )
            }}
          />
          <Bar dataKey="pct" radius={[4, 4, 4, 4]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.pct >= 0 ? 'var(--sky-bright)' : 'var(--red)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
