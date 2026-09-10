import type { ReactNode } from 'react'

interface FaqItem {
  q: string
  a: ReactNode
}

const QA: FaqItem[] = [
  {
    q: 'What does the dashboard actually read from my sheet?',
    a: (
      <>
        The same columns your dispatch sheet already has: unit, week, dispatcher, trailer type,
        load rate and miles. No new columns, no migration — it maps to what's already there.
      </>
    ),
  },
  {
    q: 'Will it change or overwrite my spreadsheet?',
    a: (
      <>
        No. Trucking Sheets AI only <strong>reads</strong> your sheet to compute the dashboard. It
        never writes, edits, or deletes a cell.
      </>
    ),
  },
  {
    q: 'How is RPM calculated?',
    a: (
      <>
        RPM is a ratio of sums, not an average of per-load ratios: total Σ gross ÷ total loaded
        miles for the selected window. The same definition is used everywhere in the dashboard —
        General, per trailer type, and per dispatcher.
      </>
    ),
  },
  {
    q: "What's the difference between this and Dispatch Sheets AI?",
    a: (
      <>
        Dispatch Sheets AI gets loads <em>into</em> your sheet — it reads rate confirmation PDFs and
        writes rows. Trucking Sheets AI looks <em>at</em> the loads already in your sheet and turns
        them into a fleet dashboard. Same account, same sheet, different job.
      </>
    ),
  },
  {
    q: 'Can I filter by trailer type or by dispatcher?',
    a: (
      <>
        Yes. The Per trailer type tab breaks gross, RPM and mix down by Reefer, Dry Van, Flatbed,
        Stepdeck and RGM. The Per dispatchers tab ranks desks by the same metrics, with a minimum
        load-volume floor so one outlier load can't skew a small desk's rank.
      </>
    ),
  },
  {
    q: 'What is the demo, exactly?',
    a: (
      <>
        A fully interactive copy of the dashboard running on a sample fleet's data — the same
        views, filters, and charts you'd get on your own sheet, so you can see the real thing before
        connecting anything.
      </>
    ),
  },
]

export function Faq() {
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="section-head center">
          <p className="eyebrow">FAQ</p>
          <h2>Fair questions</h2>
        </div>
        <div className="faq rv">
          {QA.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p className="a">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
