import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Cell,
} from 'recharts'
import {
  BUBBLE_METRIC_LABELS,
  type BubbleMetric,
  type BubblePoint,
} from '@/entities/dashboard/lib/aggregate'
import { formatMoney, formatMoneyCompact, formatNumber, formatRpm, formatShare } from '@/shared/lib/format/number'
import { SeriesPicker } from '@/widgets/premium-table/ui/SeriesPicker'

const METRICS = Object.keys(BUBBLE_METRIC_LABELS) as BubbleMetric[]

function fmt(metric: BubbleMetric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (metric === 'gross' || metric === 'avgGrossWeek' || metric === 'avgLoadRate') return formatMoneyCompact(v)
  if (metric === 'pctFleet') return formatShare(v)
  return formatNumber(Math.round(v))
}

function fmtFull(metric: BubbleMetric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (metric === 'gross' || metric === 'avgGrossWeek' || metric === 'avgLoadRate') return formatMoney(v)
  if (metric === 'pctFleet') return formatShare(v)
  return formatNumber(Math.round(v))
}

interface Props {
  title: string
  points: BubblePoint[]
  colorOf(name: string, index: number): string
  defaultX?: BubbleMetric
  defaultY?: BubbleMetric
  defaultZ?: BubbleMetric
}

export function BubbleChart({
  title,
  points,
  colorOf,
  defaultX = 'loads',
  defaultY = 'gross',
  defaultZ = 'gross',
}: Props) {
  const [x, setX] = useState<BubbleMetric>(defaultX)
  const [y, setY] = useState<BubbleMetric>(defaultY)
  const [z, setZ] = useState<BubbleMetric>(defaultZ)
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const names = useMemo(() => points.map((p) => p.name), [points])

  // Every plotted dot carries its name. Dropping the crowd through the picker is
  // what keeps the labels from piling onto each other near the origin.
  const data = useMemo(
    () =>
      points
        .map((p, i) => ({ ...p, _x: p[x], _y: p[y], _z: Math.max(p[z], 0.0001), _i: i, _label: p.name }))
        .filter((p) => !hidden.has(p.name)),
    [points, x, y, z, hidden],
  )

  return (
    <div className="dcard">
      <div className="dcard-head">
        <div className="dcard-title">
          <h2>{title}</h2>
          <p>
            {/* Counted, not asserted: pointing two of the pickers at the same
                metric leaves the dot saying one thing twice. */}
            <span className="badge-3bm">{new Set([x, y, z]).size} Bubble Metrics</span>
            Each dot is one {title.toLowerCase().includes('unit') ? 'truck' : title.toLowerCase().includes('dispatcher') ? 'desk' : 'family'} — position and size are set by the three pickers below.
          </p>
        </div>
        <div className="dcontrols">
          <div className="dfield">
            <label title="What the dot's left/right position means">Horizontal axis (X)</label>
            <select className="dselect" value={x} onChange={(e) => setX(e.target.value as BubbleMetric)}>
              {METRICS.map((m) => (
                <option key={m} value={m}>{BUBBLE_METRIC_LABELS[m]}</option>
              ))}
            </select>
          </div>
          <div className="dfield">
            <label title="What the dot's up/down position means">Vertical axis (Y)</label>
            <select className="dselect" value={y} onChange={(e) => setY(e.target.value as BubbleMetric)}>
              {METRICS.map((m) => (
                <option key={m} value={m}>{BUBBLE_METRIC_LABELS[m]}</option>
              ))}
            </select>
          </div>
          <div className="dfield">
            <label title="What makes a dot bigger or smaller">Bubble size (bigger = more)</label>
            <select className="dselect" value={z} onChange={(e) => setZ(e.target.value as BubbleMetric)}>
              {METRICS.map((m) => (
                <option key={m} value={m}>{BUBBLE_METRIC_LABELS[m]}</option>
              ))}
            </select>
          </div>
          <SeriesPicker options={names} hidden={hidden} onChange={setHidden} colorOf={colorOf} noun="dots" />
        </div>
      </div>

      <p className="bubble-legend-line">
        Reading this chart: horizontal = <b>{BUBBLE_METRIC_LABELS[x]}</b>, vertical = <b>{BUBBLE_METRIC_LABELS[y]}</b>,
        and the bigger the dot, the higher its <b>{BUBBLE_METRIC_LABELS[z]}</b>.
      </p>

      <ResponsiveContainer width="100%" height={340}>
        {/* The top margin carries the labels: a leader's dot reaches the top of the
            scale, its name sits 18px above that, and the text is another 11px tall.
            Anything tighter clipped the topmost names against the edge of the plot. */}
        <ScatterChart margin={{ top: 54, right: 20, bottom: 22, left: 8 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="_x"
            name={BUBBLE_METRIC_LABELS[x]}
            tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
            tickFormatter={(v) => fmt(x, v)}
            axisLine={{ stroke: 'var(--line)' }}
            tickLine={false}
            label={{ value: BUBBLE_METRIC_LABELS[x], position: 'insideBottom', offset: -12, fontSize: 11, fill: 'var(--ink-3)' }}
          />
          <YAxis
            type="number"
            dataKey="_y"
            name={BUBBLE_METRIC_LABELS[y]}
            tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
            tickFormatter={(v) => fmt(y, v)}
            axisLine={false}
            tickLine={false}
            width={62}
          />
          {/* Smaller than the eye-catching default on purpose: at the old size the
              biggest dots reached under their neighbours' labels. */}
          <ZAxis type="number" dataKey="_z" range={[60, 460]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0]?.payload as BubblePoint & { _x: number; _y: number; _z: number }
              if (!p) return null
              return (
                <div className="dchart-tip">
                  <div className="dchart-tip-h">{p.name}</div>
                  <div className="dchart-tip-row">{BUBBLE_METRIC_LABELS[x]}: {fmtFull(x, p._x)}</div>
                  <div className="dchart-tip-row">{BUBBLE_METRIC_LABELS[y]}: {fmtFull(y, p._y)}</div>
                  <div className="dchart-tip-row">{BUBBLE_METRIC_LABELS[z]}: {fmtFull(z, p._z)}</div>
                </div>
              )
            }}
          />
          <Scatter data={data} fillOpacity={0.78}>
            {data.map((d) => (
              <Cell key={d.name} fill={colorOf(d.name, d._i)} stroke="var(--card)" strokeWidth={1} />
            ))}
            {/* fill has to be the attribute, not a style: recharts writes the series
                colour onto the label as an attribute, and a style object loses to it. */}
            {/* stroke="none" matters: the dots' outline is inherited by their labels,
                and a 1px stroke over 10.5px letters eats the glyphs from the inside. */}
            <LabelList
              dataKey="_label"
              position="top"
              offset={18}
              fill="var(--ink)"
              stroke="none"
              fontSize={10.5}
              fontWeight={600}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
