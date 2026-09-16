import { useMemo, type ReactNode } from 'react'
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney, formatMoneyCompact, formatNumber, formatRpm } from '@/shared/lib/format/number'
import type { DashMetric } from '@/entities/dashboard/model/dash-filters'

export interface RankBarDatum {
  name: string
  value: number
  color: string
}

const MONEY_METRICS: DashMetric[] = ['gross', 'avgGrossWk', 'avgGrossWeekUnit', 'avgLoadRate']

function tick(metric: DashMetric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (MONEY_METRICS.includes(metric)) return formatMoneyCompact(v)
  return formatNumber(Math.round(v))
}

function full(metric: DashMetric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (MONEY_METRICS.includes(metric)) return formatMoney(v)
  return formatNumber(Math.round(v))
}

export function MetricRankBar({
  title,
  caption,
  data,
  metric,
  metricLabel,
  extraControls,
}: {
  title: string
  caption?: string
  data: RankBarDatum[]
  metric: DashMetric
  metricLabel: string
  extraControls?: ReactNode
}) {
  const sorted = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data])

  return (
    <div className="dcard">
      <div className="dcard-head">
        <div className="dcard-title">
          <h2>{title}</h2>
          {caption && <p>{caption}</p>}
        </div>
        {extraControls && <div className="dcontrols">{extraControls}</div>}
      </div>

      <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 26 + 56)}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 76, bottom: 22, left: 4 }} barCategoryGap={6}>
          <XAxis
            type="number"
            tickFormatter={(v) => tick(metric, v)}
            tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
            axisLine={{ stroke: 'var(--line)' }}
            tickLine={false}
            label={{ value: metricLabel, position: 'insideBottom', offset: -12, fontSize: 11, fill: 'var(--ink-3)' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11, fill: 'var(--ink-2)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--sun-soft)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0]?.payload as RankBarDatum
              if (!p) return null
              return (
                <div className="dchart-tip">
                  <div className="dchart-tip-h">{p.name}</div>
                  <div className="dchart-tip-row">{metricLabel}: {full(metric, p.value)}</div>
                </div>
              )
            }}
          />
          <Bar dataKey="value" radius={[0, 5, 5, 0]}>
            {sorted.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: number) => tick(metric, v)}
              fill="var(--ink)"
              fontSize={11}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
