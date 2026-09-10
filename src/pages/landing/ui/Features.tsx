import type { ReactNode } from 'react'

interface FeatureItem {
  title: string
  text: string
  icon: ReactNode
}

const FEATURES: FeatureItem[] = [
  {
    title: 'Any week range',
    text: 'Last week, last month, or a custom Start / End. Every KPI, chart and table on the page recomputes for that window.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="4.5" width="17" height="16" rx="2.2" /><path d="M8 2.6v4M16 2.6v4M3.5 9.5h17" />
      </svg>
    ),
  },
  {
    title: 'Weekly ledger, not a snapshot',
    text: 'Every week gets its own row — gross, RPM, miles, loads, active units — sortable, with a leader mark on the best week per column.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h10" /><circle cx="19" cy="18" r="2.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Trailer-family rollups',
    text: 'Reefer, Dry Van, Flatbed, Stepdeck, RGM — normalised automatically from whatever your sheet calls them.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="7" width="18" height="11" rx="2" /><path d="M3 12h18M8 7v11M14 7v11" />
      </svg>
    ),
  },
  {
    title: 'Volume-floored desk ranks',
    text: 'Dispatchers ranked by RPM with a minimum load count, so one lucky $9k load can’t float a small desk to the top.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15.5 20v-1.6a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 18.4V20" /><circle cx="9.25" cy="7.5" r="3.3" /><path d="M21 20v-1.6a3.6 3.6 0 0 0-2.7-3.5" />
      </svg>
    ),
  },
  {
    title: 'In-app formula glossary',
    text: 'Every metric links to a short explainer — F1, F5, D1, AW — so a number never means two things in two places.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 6.2c-1.8-1.6-4.3-2-7-1.6v13c2.7-.4 5.2 0 7 1.6 1.8-1.6 4.3-2 7-1.6v-13c-2.7-.4-5.2 0-7 1.6z" /><path d="M12 6.2v13" />
      </svg>
    ),
  },
  {
    title: 'Read-only, always',
    text: "Nothing to migrate. The dashboard reads your existing sheet; it never edits, appends, or overwrites a single cell.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3.5c3 2.3 6.2 3 8 3v6c0 4.6-3.4 7.6-8 8-4.6-.4-8-3.4-8-8v-6c1.8 0 5-.7 8-3z" /><path d="m8.8 12.3 2.2 2.2 4.2-4.2" />
      </svg>
    ),
  },
]

export function Features() {
  return (
    <section className="section section-tint" id="features">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">Details that matter to a fleet</p>
          <h2>Built so the numbers hold up on a Monday call</h2>
          <p>Consistent definitions, honest ranking, and your spreadsheet left exactly as it was.</p>
        </div>
        <div className="feats">
          {FEATURES.map((f) => (
            <article className="feat rv" key={f.title}>
              <div className="feat-ic">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
