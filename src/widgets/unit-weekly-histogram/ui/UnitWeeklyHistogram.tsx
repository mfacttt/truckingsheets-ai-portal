import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  deskColor,
  weeklyByUnit,
  UNIT_WEEKLY_METRIC_LABELS,
  type UnitWeeklyMetric,
} from '@/entities/dashboard/lib/aggregate'
import type { Load } from '@/entities/dashboard/model/types'
import { weekLabelWithDates } from '@/entities/dashboard/lib/week-dates'
import { SeriesPicker } from '@/widgets/premium-table/ui/SeriesPicker'
import { formatMoneyCompact, formatNumber, formatRpm, formatShare } from '@/shared/lib/format/number'
import '../../momentum-chart/ui/momentum-chart.css'

type Metric = UnitWeeklyMetric
const METRIC_LABELS = UNIT_WEEKLY_METRIC_LABELS

function fmt(metric: Metric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (metric === 'gross' || metric === 'avgLoadRate') return formatMoneyCompact(v)
  if (metric === 'pctGross') return formatShare(v)
  return formatNumber(Math.round(v))
}

export function UnitWeeklyHistogram({ loads, unitIds }: { loads: Load[]; unitIds: number[] }) {
  const [metric, setMetric] = useState<Metric>('gross')
  const [showLines, setShowLines] = useState(false)
  const [hidden, setHidden] = useState<Set<number>>(new Set())

  const series = useMemo(() => unitIds.slice(0, 12), [unitIds])
  // Twelve units side by side on a full season leaves each bar about a pixel wide,
  // so the key doubles as the filter for which ones actually get drawn.
  const shown = useMemo(() => series.filter((u) => !hidden.has(u)), [series, hidden])
  const data = useMemo(() => weeklyByUnit(loads, shown, metric), [loads, shown, metric])

  return (
    <div className="dcard">
      <div className="chart-card-head">
        <div className="chart-card-title">
          <h2>Weekly {METRIC_LABELS[metric]} by unit</h2>
          <p>One series per unit · pick which ones in Show</p>
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
          <SeriesPicker
            options={series}
            hidden={hidden}
            onChange={setHidden}
            colorOf={(_u, i) => deskColor(i)}
            render={(u) => `Unit ${u}`}
            noun="units"
          />
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
            {shown.map((u) => (
              <Line key={u} type="monotone" dataKey={String(u)} stroke={deskColor(series.indexOf(u))} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 6, right: 8, bottom: 6, left: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tickFormatter={(w) => `W${w}`} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
            <YAxis tickFormatter={(v) => fmt(metric, v)} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={64} />
            <Tooltip content={<UnitTip unitIds={shown} metric={metric} />} />
            {shown.map((u) => (
              <Bar key={u} dataKey={String(u)} fill={deskColor(series.indexOf(u))} />
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
      <div className="chart-tooltip-week">{weekLabelWithDates(Number(label))}</div>
      {unitIds.map((u, i) => (
        <div className="chart-tooltip-row" key={u}>
          <span className="chart-tooltip-dot" style={{ background: deskColor(i) }} />
          Unit {u}: {fmt(metric, Number(payload[i]?.value ?? 0))}
        </div>
      ))}
    </div>
  )
}
