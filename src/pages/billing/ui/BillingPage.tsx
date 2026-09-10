import { Redirect } from '@/shared/lib/router/router'
import { useSession } from '@/entities/session/model/session-context'
import { DashRail } from '@/widgets/dash-rail/ui/DashRail'
import { SoonPage } from '@/widgets/dash-rail/ui/SoonPage'
import { CardIcon } from '@/shared/ui/icons'

export default function BillingPage() {
  const { user, restoring } = useSession()
  if (restoring) return null
  if (!user) return <Redirect to="/login" />

  return (
    <DashRail contentKey="billing">
      <SoonPage
        icon={<CardIcon />}
        title="Billing"
        text="Invoices, payment method and usage history for Trucking Sheets AI will show up here once billing is connected for this product."
      />
    </DashRail>
  )
}
