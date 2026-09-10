import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReactNode } from 'react'
import { ChartIcon, GridIcon, RouteIcon, UsersIcon } from '@/shared/ui/icons'

interface ViewDef {
  id: string
  label: string
  icon: ReactNode
  title: string
  sub: string
  stats: { v: string; l: string }[]
  chart: ReactNode
}

const generalData = [55, 68, 61, 79, 72, 91, 84, 103, 98, 116].map((v, i) => ({ i, v }))
const familyData = [
  { name: 'RGM', value: 2162, color: 'var(--fam-rgm)' },
  { name: 'Flatbed', value: 1607, color: 'var(--fam-flatbed)' },
  { name: 'Reefer', value: 1428, color: 'var(--fam-reefer)' },
  { name: 'Dry Van', value: 1057, color: 'var(--fam-dryvan)' },
]
const deskData = [
  { name: 'TeamDispatch', v: 2399 },
  { name: 'M. Harris', v: 1188 },
  { name: 'J. Jackson', v: 810 },
  { name: 'N. Brown', v: 529 },
  { name: 'B. Jackson', v: 430 },
]
const FS_ROWS = [
  ['idle', 'pickup', 'transit', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'transit', 'delivery'],
  ['pickup', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'transit', 'delivery', 'idle', 'idle', 'pickup', 'transit', 'delivery', 'idle'],
  ['idle', 'idle', 'pickup', 'transit', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'delivery', 'idle', 'idle', 'pickup', 'transit'],
  ['transit', 'delivery', 'idle', 'pickup', 'transit', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'delivery', 'idle', 'idle', 'pickup'],
]

const VIEWS: ViewDef[] = [
  {
    id: 'general',
    label: 'General',
    icon: <ChartIcon />,
    title: 'Fleet momentum at a glance',
    sub: 'Σ gross and RPM cadence for any week range, with a weekly ledger to match.',
    stats: [
      { v: '$6.64M', l: 'Σ Gross · W1–W36' },
      { v: '$3.3456', l: 'Fleet RPM' },
      { v: '2,537', l: 'Loads · 36 units' },
    ],
    chart: (
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={generalData} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="vsGen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sun)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--sun)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="var(--sun)" strokeWidth={2.5} fill="url(#vsGen)" />
        </AreaChart>
      </ResponsiveContainer>
    ),
  },
  {
    id: 'trailer',
    label: 'Per trailer type',
    icon: <GridIcon />,
    title: 'Which equipment carries the fleet',
    sub: 'Gross, RPM and revenue mix by family — Reefer, Dry Van, Flatbed, Stepdeck, RGM.',
    stats: [
      { v: '32.6%', l: 'RGM · share of Σ gross' },
      { v: '$3.69', l: 'Flatbed · best RPM' },
      { v: '5 families', l: 'tracked automatically' },
    ],
    chart: (
      <ResponsiveContainer width="100%" height={190}>
        <PieChart>
          <Pie data={familyData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
            {familyData.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="var(--card)" strokeWidth={2} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    ),
  },
  {
    id: 'dispatchers',
    label: 'Per dispatchers',
    icon: <UsersIcon />,
    title: 'Who is moving the needle',
    sub: 'Σ gross, RPM rank and loads per desk — with a volume floor so outliers don’t skew it.',
    stats: [
      { v: '$2.40M', l: 'top desk · Σ gross' },
      { v: '$366K', l: 'median desk' },
      { v: '13 desks', l: 'in the window' },
    ],
    chart: (
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={deskData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 4 }} barCategoryGap={6}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tick={{ fontSize: 11, fill: 'var(--ink-2)' }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="v" radius={[0, 5, 5, 0]}>
            {deskData.map((_, i) => (
              <Cell key={i} fill={i === 0 ? 'var(--sun)' : 'var(--sky)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  {
    id: 'fleetstatus',
    label: 'Fleet status',
    icon: <RouteIcon />,
    title: 'The whole fleet’s week, day by day',
    sub: 'One row per truck: pickup, in-transit, delivery, idle — 7, 14 or 30 days.',
    stats: [
      { v: '14 days', l: 'default window' },
      { v: 'per truck', l: 'one row each' },
      { v: '4 states', l: 'colour-coded' },
    ],
    chart: (
      <div style={{ display: 'grid', gap: 6, padding: '10px 4px' }}>
        {FS_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 4 }}>
            {row.map((s, ci) => (
              <span key={ci} className={`fsstrip-cell fsc-${s}`} />
            ))}
          </div>
        ))}
      </div>
    ),
  },
]

export function ViewsSwitcher() {
  const [active, setActive] = useState('general')
  const view = VIEWS.find((v) => v.id === active) ?? VIEWS[0]!

  return (
    <section className="section" id="views">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">One sheet, four views</p>
          <h2>Every angle on the same loads</h2>
          <p>
            The dashboard reads one Google Sheet and gives you four ways to look at it. Switch
            between them below — this is the real thing, on sample fleet data.
          </p>
        </div>

        <div className="views-tabs">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`views-tab${active === v.id ? ' is-on' : ''}`}
              onClick={() => setActive(v.id)}
            >
              {v.icon}
              {v.label}
            </button>
          ))}
        </div>

        <div className="views-panel">
          <div className="views-canvas">
            <div className="views-canvas-head">
              <h3>{view.title}</h3>
              <span>{view.label}</span>
            </div>
            <p className="views-canvas-sub">{view.sub}</p>
            {view.chart}
          </div>
          <div className="views-aside">
            <h4>In this view</h4>
            {view.stats.map((s) => (
              <div className="views-stat" key={s.l}>
                <b>{s.v}</b>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
