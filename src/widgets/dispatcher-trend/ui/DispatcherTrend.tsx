import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { deskColor, weeklyByDesk } from '@/entities/dashboard/lib/aggregate'
import type { Load } from '@/entities/dashboard/model/types'
import { formatMoneyCompact, formatNumber, formatRpm } from '@/shared/lib/format/number'
import '../../momentum-chart/ui/momentum-chart.css'

type Metric = 'gross' | 'rpm' | 'loads'
const METRIC_LABELS: Record<Metric, string> = { gross: 'Σ Gross', rpm: 'RPM', loads: 'Loads' }

function formatMetric(metric: Metric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (metric === 'gross') return formatMoneyCompact(v)
  return formatNumber(Math.round(v))
}

export function DispatcherTrend({ loads, desks }: { loads: Load[]; desks: string[] }) {
  const [metric, setMetric] = useState<Metric>('gross')
  const data = useMemo(() => weeklyByDesk(loads, desks, metric), [loads, desks, metric])

  return (
    <div className="dcard">
      <div className="chart-card-head">
        <div className="chart-card-title">
          <h2>Dispatcher desk ledger · weekly trend</h2>
          <p>One line per top desk · drag not required — hover for values</p>
        </div>
        <div className="chart-metric-controls">
          <div className="chart-metric-field">
            <label htmlFor="desk-trend-metric">Metric</label>
            <select id="desk-trend-metric" value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
              {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
                <option key={m} value={m}>
                  {METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 6, right: 8, bottom: 6, left: 0 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="week" tickFormatter={(w) => `W${w}`} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
          <YAxis tickFormatter={(v) => formatMetric(metric, v)} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={64} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="chart-tooltip">
                  <div className="chart-tooltip-week">Week {label}</div>
                  {desks.map((d, i) => (
                    <div className="chart-tooltip-row" key={d}>
                      <span className="chart-tooltip-dot" style={{ background: deskColor(i) }} />
                      {d}: {formatMetric(metric, Number(payload[i]?.value ?? 0))}
                    </div>
                  ))}
                </div>
              )
            }}
          />
          {desks.map((d, i) => (
            <Line key={d} type="monotone" dataKey={d} stroke={deskColor(i)} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
