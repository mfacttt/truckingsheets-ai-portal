import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { deskColor, weeklyByDesk } from '@/entities/dashboard/lib/aggregate'
import type { Load } from '@/entities/dashboard/model/types'
import { CloseIcon } from '@/shared/ui/icons'
import { formatMoneyCompact, formatNumber, formatRpm } from '@/shared/lib/format/number'

type Metric = 'gross' | 'rpm' | 'loads'
const LABELS: Record<Metric, string> = { gross: 'Σ Gross', rpm: 'RPM', loads: 'Loads' }

function fmt(metric: Metric, v: number): string {
  if (metric === 'rpm') return formatRpm(v)
  if (metric === 'gross') return formatMoneyCompact(v)
  return formatNumber(Math.round(v))
}

export function DeskWeekModal({
  family,
  loads,
  desks,
  onClose,
}: {
  family: string
  loads: Load[]
  desks: string[]
  onClose(): void
}) {
  const [metric, setMetric] = useState<Metric>('gross')
  const [selected, setSelected] = useState<Set<string>>(() => new Set(desks.slice(0, 6)))

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const shown = desks.filter((d) => selected.has(d))
  const data = useMemo(() => weeklyByDesk(loads, shown, metric), [loads, shown, metric])

  function toggle(d: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return next
    })
  }

  return (
    <div className="fw-veil" onClick={onClose}>
      <div
        className="fw-modal"
        style={{ gridTemplateColumns: '210px 1fr', maxWidth: 860 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${family} weekly desk trend`}
      >
        <nav className="fw-nav" style={{ display: 'block' }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-3)', marginBottom: 10 }}>
            Desks · {family}
          </p>
          {desks.map((d, i) => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, padding: '5px 6px', borderRadius: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.has(d)} onChange={() => toggle(d)} style={{ accentColor: 'var(--sun)' }} />
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: deskColor(i), flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d}</span>
            </label>
          ))}
        </nav>

        <div className="fw-body">
          <button className="fw-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
          <h3>{family} · weekly desk trend</h3>
          <p style={{ marginBottom: 14 }}>One colored line per selected desk (this family only). Toggle desks in the sidebar.</p>

          <div className="seg" style={{ marginBottom: 16 }}>
            {(Object.keys(LABELS) as Metric[]).map((m) => (
              <button key={m} className={metric === m ? 'is-on' : ''} onClick={() => setMetric(m)}>
                {LABELS[m]}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 6, right: 10, bottom: 6, left: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tickFormatter={(w) => `W${w}`} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
              <YAxis tickFormatter={(v) => fmt(metric, v)} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={62} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="dchart-tip">
                      <div className="dchart-tip-h">Week {label}</div>
                      {shown.map((d, i) => (
                        <div className="dchart-tip-row" key={d}>
                          <span className="dchart-tip-dot" style={{ background: deskColor(i) }} />
                          {d}: {fmt(metric, Number(payload[i]?.value ?? 0))}
                        </div>
                      ))}
                    </div>
                  )
                }}
              />
              {shown.map((d, i) => (
                <Line key={d} type="monotone" dataKey={d} stroke={deskColor(i)} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
