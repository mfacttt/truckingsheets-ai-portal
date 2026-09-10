import { useFleetStatusLoads } from '@/entities/dashboard/data/use-fleet-status-loads'
import { FleetStatusGrid } from '@/widgets/fleet-status-grid/ui/FleetStatusGrid'

export function FleetStatusTab() {
  const loads = useFleetStatusLoads()
  return <FleetStatusGrid loads={loads} />
}
