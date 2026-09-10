import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface DonutDatum {
  name: string
  value: number
  color: string
  display: string
}

export function DonutBar({ title, data, caption }: { title: string; data: DonutDatum[]; caption: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="dcard">
      <div className="dcard-head">
        <div className="dcard-title">
          <h2>{title}</h2>
          <p>{caption}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'center' }} className="donutbar-grid">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="var(--card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = payload[0]?.payload as DonutDatum
                if (!p) return null
                return (
                  <div className="dchart-tip">
                    <div className="dchart-tip-h">{p.name}</div>
                    <div className="dchart-tip-row">
                      {p.display} · {total > 0 ? ((100 * p.value) / total).toFixed(1) : 0}%
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }} barCategoryGap={8}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={104} tick={{ fontSize: 11, fill: 'var(--ink-2)' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'var(--sun-soft)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
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
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
