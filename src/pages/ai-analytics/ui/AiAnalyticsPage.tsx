import { Redirect } from '@/shared/lib/router/router'
import { useSession } from '@/entities/session/model/session-context'
import { DashRail } from '@/widgets/dash-rail/ui/DashRail'
import { SoonPage } from '@/widgets/dash-rail/ui/SoonPage'
import { SparkleIcon } from '@/shared/ui/icons'

export default function AiAnalyticsPage() {
  const { user, restoring } = useSession()
  if (restoring) return null
  if (!user) return <Redirect to="/login" />

  return (
    <DashRail contentKey="ai">
      <SoonPage
        icon={<SparkleIcon />}
        title="AI Analytics"
        text="We're building an AI copilot on top of your fleet data — ask questions in plain English, get anomaly alerts, and weekly written summaries. Hang tight."
      />
    </DashRail>
  )
}
