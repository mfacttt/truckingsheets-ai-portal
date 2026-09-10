import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  familyColor,
  weeklyByFamily,
  FAMILY_WEEKLY_METRIC_LABELS,
  type FamilyWeeklyMetric,
} from '@/entities/dashboard/lib/aggregate'
import type { Load } from '@/entities/dashboard/model/types'
import { formatMoneyCompact, formatNumber, formatRpm, formatShare } from '@/shared/lib/format/number'
import '../../momentum-chart/ui/momentum-chart.css'

type Metric = FamilyWeeklyMetric
const METRIC_LABELS = FAMILY_WEEKLY_METRIC_LABELS

function formatMetric(metric: Metric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (metric === 'gross' || metric === 'avgGrossWeekUnit' || metric === 'avgLoadRate') return formatMoneyCompact(v)
  if (metric === 'pctGross') return formatShare(v)
  return formatNumber(Math.round(v))
}

export function FamilyWeeklyHistogram({ loads, families }: { loads: Load[]; families: string[] }) {
  const [metric, setMetric] = useState<Metric>('gross')
  const [showLines, setShowLines] = useState(false)

  const data = useMemo(() => weeklyByFamily(loads, families, metric), [loads, families, metric])

  return (
    <div className="dcard">
      <div className="chart-card-head">
        <div className="chart-card-title">
          <h2>Weekly Σ gross by trailer family — histogram</h2>
        </div>
        <div className="chart-metric-controls">
          <div className="chart-metric-field">
            <label htmlFor="fam-hist-metric">Metric</label>
            <select id="fam-hist-metric" value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
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
            <YAxis tickFormatter={(v) => formatMetric(metric, v)} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={64} />
            <Tooltip content={<HistTooltip families={families} metric={metric} />} />
            {families.map((fam) => (
              <Line key={fam} type="monotone" dataKey={fam} stroke={familyColor(fam)} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 6, right: 8, bottom: 6, left: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tickFormatter={(w) => `W${w}`} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
            <YAxis tickFormatter={(v) => formatMetric(metric, v)} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={64} />
            <Tooltip content={<HistTooltip families={families} metric={metric} />} />
            {families.map((fam) => (
              <Bar key={fam} dataKey={fam} stackId="fam" fill={familyColor(fam)} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

function HistTooltip({
  active,
  payload,
  label,
  families,
  metric,
}: {
  active?: boolean
  payload?: { value?: number | string }[]
  label?: number | string
  families: string[]
  metric: Metric
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-week">Week {label}</div>
      {families.map((fam, i) => (
        <div className="chart-tooltip-row" key={fam}>
          <span className="chart-tooltip-dot" style={{ background: familyColor(fam) }} />
          {fam}: {formatMetric(metric, Number(payload[i]?.value ?? 0))}
        </div>
      ))}
    </div>
  )
}
