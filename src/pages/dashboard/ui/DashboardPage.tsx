import { useState } from 'react'
import { Redirect } from '@/shared/lib/router/router'
import { useSession } from '@/entities/session/model/session-context'
import { useLoads, weekBounds } from '@/entities/dashboard/data/use-loads'
import { filterByWeekRange } from '@/entities/dashboard/lib/aggregate'
import { useWeekRange } from '@/entities/dashboard/model/use-week-range'
import { DashboardShell, type DashTab } from '@/widgets/dashboard-shell/ui/DashboardShell'
import { DashRail } from '@/widgets/dash-rail/ui/DashRail'
import { FormulaWiki } from '@/widgets/formula-wiki/ui/FormulaWiki'
import { GeneralTab } from './GeneralTab'
import { TrailerTypeTab } from './TrailerTypeTab'
import { DispatchersTab } from './DispatchersTab'
import { FleetStatusTab } from './FleetStatusTab'

export default function DashboardPage() {
  const { user, restoring } = useSession()
  const loads = useLoads()
  const { min, max } = weekBounds(loads)
  const { range, activePreset, applyPreset, apply, reset } = useWeekRange(min, max)
  const [tab, setTab] = useState<DashTab>('general')
  const [formulaCode, setFormulaCode] = useState<string | null>(null)

  if (restoring) return null
  if (!user) return <Redirect to="/login" />

  const filtered = filterByWeekRange(loads, range)

  return (
    <DashRail contentKey="fleet">
      <DashboardShell
        tab={tab}
        onTabChange={setTab}
        weekMin={min}
        weekMax={max}
        range={range}
        activePreset={activePreset}
        onApplyPreset={applyPreset}
        onApply={apply}
        onReset={reset}
      >
        {tab === 'general' && <GeneralTab loads={filtered} onFormula={setFormulaCode} />}
        {tab === 'trailer' && <TrailerTypeTab loads={filtered} />}
        {tab === 'dispatchers' && <DispatchersTab loads={filtered} onFormula={setFormulaCode} />}
        {tab === 'fleetstatus' && <FleetStatusTab />}

        {formulaCode && (
          <FormulaWiki code={formulaCode} onSelect={setFormulaCode} onClose={() => setFormulaCode(null)} />
        )}
      </DashboardShell>
    </DashRail>
  )
}
