import { fleetKpis, weeklyLedger, familyShare, dispatcherRows } from '@/entities/dashboard/lib/aggregate'
import type { Load } from '@/entities/dashboard/model/types'
import { KpiStrip } from '@/widgets/kpi-strip/ui/KpiStrip'
import { MomentumChart } from '@/widgets/momentum-chart/ui/MomentumChart'
import { WeeklyLedgerTable } from '@/widgets/weekly-ledger/ui/WeeklyLedgerTable'
import { WowChart } from '@/widgets/wow-chart/ui/WowChart'
import { formatMoneyCompact, formatPct } from '@/shared/lib/format/number'

export function GeneralTab({ loads, onFormula }: { loads: Load[]; onFormula(code: string): void }) {
  const kpis = fleetKpis(loads)
  const ledger = weeklyLedger(loads)
  const families = familyShare(loads)
  const desks = dispatcherRows(loads, undefined, 1)

  const topFamily = families[0]
  const topFamilyShare = topFamily && kpis.gross > 0 ? (100 * topFamily.gross) / kpis.gross : 0

  let momentum: string | null = null
  if (ledger.length >= 2) {
    let bestI = 1
    let bestD = (ledger[1]?.rpm ?? 0) - (ledger[0]?.rpm ?? 0)
    for (let i = 2; i < ledger.length; i++) {
      const d = (ledger[i]?.rpm ?? 0) - (ledger[i - 1]?.rpm ?? 0)
      if (d > bestD) {
        bestD = d
        bestI = i
      }
    }
    const w = ledger[bestI]?.week
    momentum = `Largest RPM step at Week ${w} (${bestD >= 0 ? '+' : ''}${bestD.toFixed(4)}).`
  }

  return (
    <>
      <KpiStrip kpis={kpis} ledger={ledger} onFormula={onFormula} />
      <MomentumChart ledger={ledger} />
      <WeeklyLedgerTable ledger={ledger} />
      <WowChart ledger={ledger} />

      <div className="dcard">
        <div className="dcard-head">
          <div className="dcard-title">
            <h2>Executive takeaways</h2>
          </div>
        </div>
        <p style={{ color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.7 }}>
          <strong>Scope</strong> · Portfolio RPM (ratio of sums on in-scope rows).
          <br />
          {topFamily && (
            <>
              <strong>Mix</strong> · Largest cohort: <strong>{topFamily.family}</strong> · ~
              {topFamilyShare.toFixed(1)}% of Σ billed rate.
              <br />
            </>
          )}
          {momentum && (
            <>
              <strong>Momentum</strong> · {momentum}
              <br />
            </>
          )}
          {desks[0] && (
            <>
              <strong>Desk</strong> · Top Σ gross desk: <strong>{desks[0].desk}</strong> (
              {formatMoneyCompact(desks[0].gross)}, {formatPct(desks[0].pctFleetGross)} of fleet).
            </>
          )}
        </p>
      </div>
    </>
  )
}
