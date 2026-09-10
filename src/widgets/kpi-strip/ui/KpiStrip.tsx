import { useCountUp } from '@/shared/lib/hooks/use-count-up'
import { formatMoney, formatMoneyCompact, formatNumber, formatRpm, formatMiles } from '@/shared/lib/format/number'
import type { WeeklyLedgerRow } from '@/entities/dashboard/model/types'
import './kpi-strip.css'

interface Kpis {
  gross: number
  rpmValue: number
  miles: number
  loads: number
  weekCount: number
  unitCount: number
  avgLoadRate: number
  avgGrossPerWeek: number
  avgGrossPerWeekPerUnit: number
}

function AnimatedValue({ value, format }: { value: number; format: (n: number) => string }) {
  const n = useCountUp(value, 900)
  return <>{format(n)}</>
}

export function KpiStrip({
  kpis,
  onFormula,
}: {
  kpis: Kpis
  ledger: WeeklyLedgerRow[]
  onFormula(code: string): void
}) {
  return (
    <div className="kpi-row">
      <div className="kpi-card kpi-green">
        <div className="kpi-label">Σ Gross</div>
        <div className="kpi-value">
          <AnimatedValue value={kpis.gross} format={formatMoneyCompact} />
        </div>
        <div className="kpi-under">Σ billed load rates</div>
      </div>

      <div className="kpi-card kpi-navy">
        <div className="kpi-label">RPM</div>
        <div className="kpi-value">
          <AnimatedValue value={kpis.rpmValue} format={formatRpm} />
        </div>
        <div className="kpi-under">Σ rate ÷ Σ miles</div>
      </div>

      <div className="kpi-card kpi-cyan">
        <div className="kpi-label">Σ Miles</div>
        <div className="kpi-value">
          <AnimatedValue value={kpis.miles} format={formatMiles} />
        </div>
        <div className="kpi-under">Loaded miles · rollup</div>
      </div>

      <div className="kpi-card kpi-blue2">
        <div className="kpi-label">
          Weekly gross
          <button className="formula-link" onClick={() => onFormula('AW')} aria-label="Formula AW" title="Formula AW">
            i
          </button>
        </div>
        <div className="kpi-value">
          <AnimatedValue value={kpis.avgGrossPerWeek} format={formatMoney} />
        </div>
        <div className="kpi-under">Fleet: avg/wk</div>
        <div className="kpi-under-2">
          <span className="kpi-under-2-label">
            Fleet: avg/wk ÷ trucks{' '}
            <button className="formula-link" onClick={() => onFormula('F1')} aria-label="Formula F1" title="Formula F1">
              i
            </button>
          </span>
          <AnimatedValue value={kpis.avgGrossPerWeekPerUnit} format={formatMoney} />
        </div>
      </div>

      <div className="kpi-card kpi-slate">
        <div className="kpi-label">Avg load rate</div>
        <div className="kpi-value">
          <AnimatedValue value={kpis.avgLoadRate} format={formatMoney} />
        </div>
        <div className="kpi-under">Σ gross ÷ Σ loads (all loads in window)</div>
      </div>

      <div className="kpi-card kpi-slate">
        <div className="kpi-label">Loads</div>
        <div className="kpi-value">
          <AnimatedValue value={kpis.loads} format={formatNumber} />
        </div>
        <div className="kpi-under">
          {formatNumber(kpis.unitCount)} active units · {formatNumber(kpis.weekCount)} weeks
        </div>
      </div>
    </div>
  )
}
