import { useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { momentumSeries } from '@/entities/dashboard/lib/aggregate'
import { MOMENTUM_METRIC_LABELS, type MomentumMetric, type WeeklyLedgerRow } from '@/entities/dashboard/model/types'
import { formatMoneyCompact, formatNumber, formatRpm } from '@/shared/lib/format/number'
import './momentum-chart.css'

const METRICS = Object.keys(MOMENTUM_METRIC_LABELS) as MomentumMetric[]

function formatMetric(metric: MomentumMetric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (metric === 'gross' || metric === 'avgLoadRate' || metric === 'avgGrossPerUnit') return formatMoneyCompact(v)
  return formatNumber(Math.round(v))
}

interface Point {
  week: number
  primary: number
  secondary: number
}

export function MomentumChart({ ledger }: { ledger: WeeklyLedgerRow[] }) {
  const [primary, setPrimary] = useState<MomentumMetric>('gross')
  const [secondary, setSecondary] = useState<MomentumMetric>('rpm')

  const data: Point[] = useMemo(() => {
    const p = momentumSeries(ledger, primary)
    const s = momentumSeries(ledger, secondary)
    return ledger.map((w, i) => ({ week: w.week, primary: p[i] ?? 0, secondary: s[i] ?? 0 }))
  }, [ledger, primary, secondary])

  function handlePrimary(v: MomentumMetric) {
    setPrimary(v)
    if (v === secondary) setSecondary(primary)
  }
  function handleSecondary(v: MomentumMetric) {
    setSecondary(v)
    if (v === primary) setPrimary(secondary)
  }

  return (
    <div className="dcard">
      <div className="chart-card-head">
        <div className="chart-card-title">
          <h2>Weekly billed rate &amp; Fleet RPM cadence</h2>
          <p>Area — {MOMENTUM_METRIC_LABELS[primary]} · Line — {MOMENTUM_METRIC_LABELS[secondary]} (same window)</p>
        </div>
        <div className="chart-metric-controls">
          <div className="chart-metric-field">
            <label htmlFor="momentum-primary">Primary</label>
            <select id="momentum-primary" value={primary} onChange={(e) => handlePrimary(e.target.value as MomentumMetric)}>
              {METRICS.map((m) => (
                <option key={m} value={m}>
                  {MOMENTUM_METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
          <div className="chart-metric-field">
            <label htmlFor="momentum-secondary">Secondary</label>
            <select id="momentum-secondary" value={secondary} onChange={(e) => handleSecondary(e.target.value as MomentumMetric)}>
              {METRICS.map((m) => (
                <option key={m} value={m}>
                  {MOMENTUM_METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 6, right: 8, bottom: 6, left: 0 }}>
          <defs>
            <linearGradient id="momentumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sun)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--sun)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="week"
            tickFormatter={(w) => `W${w}`}
            tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
            axisLine={{ stroke: 'var(--line)' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => formatMetric(primary, v)}
            tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => formatMetric(secondary, v)}
            tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="chart-tooltip">
                  <div className="chart-tooltip-week">Week {label}</div>
                  <div className="chart-tooltip-row">
                    <span className="chart-tooltip-dot" style={{ background: 'var(--sun)' }} />
                    {MOMENTUM_METRIC_LABELS[primary]}: {formatMetric(primary, Number(payload[0]?.value ?? 0))}
                  </div>
                  <div className="chart-tooltip-row">
                    <span className="chart-tooltip-dot" style={{ background: 'var(--sky)' }} />
                    {MOMENTUM_METRIC_LABELS[secondary]}: {formatMetric(secondary, Number(payload[1]?.value ?? 0))}
                  </div>
                </div>
              )
            }}
          />
          <Area yAxisId="left" type="monotone" dataKey="primary" stroke="var(--sun)" strokeWidth={2} fill="url(#momentumFill)" />
          <Line yAxisId="right" type="monotone" dataKey="secondary" stroke="var(--sky)" strokeWidth={2.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
