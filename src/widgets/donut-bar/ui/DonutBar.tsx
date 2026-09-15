import { useMemo, useState, type ReactNode } from 'react'
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface DonutDatum {
  name: string
  value: number
  color: string
  display: string
}

/** A slice set per metric, so the card can switch what the shares measure. */
export interface DonutMetricOption {
  value: string
  label: string
  data: DonutDatum[]
}

const OTHER_LABEL = 'Other types'
const OTHER_COLOR = 'var(--ink-3)'

/** Share labels sit outside the ring on the card, so they take the card's text
 *  colour — inheriting the slice colour leaves the dark families unreadable on
 *  a dark ground. Slices under 4% are skipped; their labels would collide. */
function renderSharePercent(total: number) {
  return function ShareLabel({ value, x, y, textAnchor }: {
    value?: number
    x?: number
    y?: number
    textAnchor?: 'inherit' | 'end' | 'start' | 'middle'
  }) {
    const share = total > 0 ? (100 * Number(value ?? 0)) / total : 0
    if (share < 4) return null
    return (
      <text
        x={x}
        y={y}
        fill="var(--ink)"
        textAnchor={textAnchor}
        dominantBaseline="central"
        style={{ fontSize: 11, fontWeight: 600 }}
      >
        {share.toFixed(1)}%
      </text>
    )
  }
}

export function DonutBar({
  title,
  data,
  caption,
  metrics,
  focusOptions,
  focusLabel = 'Primary selection',
}: {
  title: string
  data: DonutDatum[]
  caption: string
  /** When given, the card shows a Metric picker and takes its slices from the choice. */
  metrics?: DonutMetricOption[]
  /** When given, the card can compare one entry against everything else combined. */
  focusOptions?: string[]
  focusLabel?: string
}) {
  const [metric, setMetric] = useState(metrics?.[0]?.value ?? '')
  const [focus, setFocus] = useState('All')

  const active = metrics?.find((m) => m.value === metric) ?? null
  const baseData = active ? active.data : data
  const heading = active ? `${active.label} share by trailer family` : title

  // Focusing one entry answers a different question than filtering to it: the
  // reader wants that entry measured against the rest of the fleet, not alone.
  const shown = useMemo<DonutDatum[]>(() => {
    if (focus === 'All') return baseData
    const picked = baseData.find((d) => d.name === focus)
    if (!picked) return baseData
    const rest = baseData.filter((d) => d.name !== focus).reduce((s, d) => s + d.value, 0)
    return [picked, { name: OTHER_LABEL, value: rest, color: OTHER_COLOR, display: '' }]
  }, [baseData, focus])

  const total = shown.reduce((s, d) => s + d.value, 0)
  const barData = focus === 'All' ? baseData : baseData.filter((d) => d.name === focus)

  const controls: ReactNode = (metrics || focusOptions) && (
    <div className="dcontrols">
      {focusOptions && focusOptions.length > 0 && (
        <div className="dfield">
          <label>{focusLabel}</label>
          <select className="dselect" value={focus} onChange={(e) => setFocus(e.target.value)} style={{ minWidth: 130 }}>
            <option value="All">All</option>
            {focusOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      )}
      {metrics && metrics.length > 0 && (
        <div className="dfield">
          <label>Metric</label>
          <select className="dselect" value={metric} onChange={(e) => setMetric(e.target.value)} style={{ minWidth: 140 }}>
            {metrics.map((m) => (
              <option key={m.value} value={m.value}>{m.label} share</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )

  return (
    <div className="dcard">
      <div className="dcard-head">
        <div className="dcard-title">
          <h2>{heading}</h2>
          <p>{caption}</p>
        </div>
        {controls}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'center' }} className="donutbar-grid">
        <ResponsiveContainer width="100%" height={220}>
          {/* Share labels sit outside the ring, so the chart needs room for them. */}
          <PieChart margin={{ top: 6, right: 34, bottom: 6, left: 34 }}>
            <Pie
              data={shown}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={76}
              paddingAngle={2}
              label={renderSharePercent(total)}
              labelLine={false}
            >
              {shown.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="var(--card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active: on, payload }) => {
                if (!on || !payload?.length) return null
                const p = payload[0]?.payload as DonutDatum
                if (!p) return null
                return (
                  <div className="dchart-tip">
                    <div className="dchart-tip-h">{p.name}</div>
                    <div className="dchart-tip-row">
                      {p.display || ''} {p.display ? '· ' : ''}
                      {total > 0 ? ((100 * p.value) / total).toFixed(1) : 0}%
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={Math.max(160, barData.length * 34)}>
          <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }} barCategoryGap={8}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={104} tick={{ fontSize: 11, fill: 'var(--ink-2)' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'var(--sun-soft)' }}
              content={({ active: on, payload }) => {
                if (!on || !payload?.length) return null
                const p = payload[0]?.payload as DonutDatum
                if (!p) return null
                return (
                  <div className="dchart-tip">
                    <div className="dchart-tip-h">{p.name}</div>
                    <div className="dchart-tip-row">{p.display}</div>
                  </div>
                )
              }}
            />
            <Bar dataKey="value" radius={[0, 5, 5, 0]}>
              {barData.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
              <LabelList
                dataKey="display"
                position="right"
                style={{ fill: 'var(--ink)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
