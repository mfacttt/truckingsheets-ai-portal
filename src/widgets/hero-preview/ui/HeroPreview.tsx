import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Area, ComposedChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { GaugeIcon, TrendingUpIcon } from '@/shared/ui/icons'
import './hero-preview.css'

const WEEKS = [
  { w: 'W1', gross: 118, rpm: 3.1 },
  { w: 'W5', gross: 141, rpm: 3.24 },
  { w: 'W9', gross: 133, rpm: 3.18 },
  { w: 'W13', gross: 166, rpm: 3.31 },
  { w: 'W17', gross: 158, rpm: 3.22 },
  { w: 'W21', gross: 189, rpm: 3.35 },
  { w: 'W25', gross: 176, rpm: 3.29 },
  { w: 'W29', gross: 214, rpm: 3.42 },
  { w: 'W33', gross: 226, rpm: 3.46 },
  { w: 'W36', gross: 242, rpm: 3.5 },
]

export function HeroPreview() {
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120)
    return () => clearTimeout(t)
  }, [])

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${px * 7}deg`)
    el.style.setProperty('--rx', `${-py * 6}deg`)
  }
  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  return (
    <div className="hp-stage" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="hp" ref={ref} role="img" aria-label="Trucking Sheets AI fleet dashboard preview">
        <div className="hp-topbar">
          <span className="hp-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="hp-topbar-title">Fleet Analytics · General</span>
          <span className="hp-topbar-pill">W1 → W36 · 2026</span>
        </div>

        <div className="hp-kpis">
          <div className="hp-kpi k-sun">
            <div className="hp-kpi-label">Σ Gross</div>
            <div className="hp-kpi-value">$6.64M</div>
          </div>
          <div className="hp-kpi k-navy">
            <div className="hp-kpi-label">RPM</div>
            <div className="hp-kpi-value">$3.3456</div>
          </div>
          <div className="hp-kpi k-sky">
            <div className="hp-kpi-label">Loads</div>
            <div className="hp-kpi-value">2,537</div>
          </div>
        </div>

        <div className="hp-chart-frame">
          <div className="hp-chart-cap">
            <span>Weekly billed rate &amp; RPM cadence</span>
            <span>36 wks</span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <ComposedChart data={mounted ? WEEKS : WEEKS.map((d) => ({ ...d, gross: 0, rpm: 0 }))} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="hpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--sun)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--sun)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <XAxis dataKey="w" tick={{ fontSize: 9, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} interval={1} />
              <YAxis yAxisId="l" hide domain={[80, 'dataMax + 20']} />
              <YAxis yAxisId="r" hide domain={[2.9, 3.7]} />
              <Area
                yAxisId="l"
                type="monotone"
                dataKey="gross"
                stroke="var(--sun)"
                strokeWidth={2.5}
                fill="url(#hpFill)"
                isAnimationActive
                animationDuration={900}
              />
              <Line
                yAxisId="r"
                type="monotone"
                dataKey="rpm"
                stroke="var(--sky)"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive
                animationDuration={1100}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="hp-legend">
          <span>
            <i style={{ background: 'var(--sun)' }} /> Σ billed rate
          </span>
          <span>
            <i style={{ background: 'var(--sky)' }} /> Fleet RPM
          </span>
        </div>
      </div>

      <div className="hp-float hp-float-a">
        <span className="hp-float-ic f-sky">
          <GaugeIcon />
        </span>
        <span className="hp-float-txt">
          <b>$5,121.93</b>
          <span>fleet avg / wk · truck</span>
        </span>
      </div>
      <div className="hp-float hp-float-b">
        <span className="hp-float-ic f-sun">
          <TrendingUpIcon />
        </span>
        <span className="hp-float-txt">
          <b>+12.4%</b>
          <span>WoW gross · Week 29</span>
        </span>
      </div>
    </div>
  )
}
