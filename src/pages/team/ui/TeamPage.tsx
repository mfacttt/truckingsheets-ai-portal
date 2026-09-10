import { Redirect } from '@/shared/lib/router/router'
import { useSession } from '@/entities/session/model/session-context'
import { DashRail } from '@/widgets/dash-rail/ui/DashRail'
import { SoonPage } from '@/widgets/dash-rail/ui/SoonPage'
import { UsersIcon } from '@/shared/ui/icons'

export default function TeamPage() {
  const { user, restoring } = useSession()
  if (restoring) return null
  if (!user) return <Redirect to="/login" />

  return (
    <DashRail contentKey="team">
      <SoonPage
        icon={<UsersIcon />}
        title="Team"
        text="Invite dispatchers and managers, assign roles, and control who can see billing and who only sees the dashboard. Team management is coming to this workspace."
      />
    </DashRail>
  )
}
