import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { deskColor, weeklyByUnit } from '@/entities/dashboard/lib/aggregate'
import type { Load } from '@/entities/dashboard/model/types'
import { formatMoneyCompact, formatNumber, formatRpm } from '@/shared/lib/format/number'
import '../../momentum-chart/ui/momentum-chart.css'

type Metric = 'gross' | 'rpm' | 'miles' | 'loads'
const METRIC_LABELS: Record<Metric, string> = { gross: 'Σ gross', rpm: 'RPM', miles: 'Σ miles', loads: 'Loads' }

function fmt(metric: Metric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (metric === 'gross') return formatMoneyCompact(v)
  return formatNumber(Math.round(v))
}

export function UnitWeeklyHistogram({ loads, unitIds }: { loads: Load[]; unitIds: number[] }) {
  const [metric, setMetric] = useState<Metric>('gross')
  const [showLines, setShowLines] = useState(false)

  const shown = useMemo(() => unitIds.slice(0, 12), [unitIds])
  const data = useMemo(() => weeklyByUnit(loads, shown, metric), [loads, shown, metric])

  return (
    <div className="dcard">
      <div className="chart-card-head">
        <div className="chart-card-title">
          <h2>Weekly {METRIC_LABELS[metric]} by unit</h2>
          <p>Top {shown.length} units by Σ gross · one series each</p>
        </div>
        <div className="chart-metric-controls">
          <div className="chart-metric-field">
            <label htmlFor="uwh-metric">Metric</label>
            <select id="uwh-metric" value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
              {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
                <option key={m} value={m}>
                  {METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className={`seg-pill${showLines ? ' is-active' : ''}`} onClick={() => setShowLines((v) => !v)}>
            Weekly lines
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {showLines ? (
          <LineChart data={data} margin={{ top: 6, right: 8, bottom: 6, left: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tickFormatter={(w) => `W${w}`} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
            <YAxis tickFormatter={(v) => fmt(metric, v)} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={64} />
            <Tooltip content={<UnitTip unitIds={shown} metric={metric} />} />
            {shown.map((u, i) => (
              <Line key={u} type="monotone" dataKey={String(u)} stroke={deskColor(i)} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 6, right: 8, bottom: 6, left: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tickFormatter={(w) => `W${w}`} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
            <YAxis tickFormatter={(v) => fmt(metric, v)} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={64} />
            <Tooltip content={<UnitTip unitIds={shown} metric={metric} />} />
            {shown.map((u, i) => (
              <Bar key={u} dataKey={String(u)} stackId="u" fill={deskColor(i)} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

function UnitTip({
  active,
  payload,
  label,
  unitIds,
  metric,
}: {
  active?: boolean
  payload?: { value?: number | string }[]
  label?: number | string
  unitIds: number[]
  metric: Metric
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-week">Week {label}</div>
      {unitIds.map((u, i) => (
        <div className="chart-tooltip-row" key={u}>
          <span className="chart-tooltip-dot" style={{ background: deskColor(i) }} />
          Unit {u}: {fmt(metric, Number(payload[i]?.value ?? 0))}
        </div>
      ))}
    </div>
  )
}
