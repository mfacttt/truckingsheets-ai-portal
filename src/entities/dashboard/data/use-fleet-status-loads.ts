import { useMemo } from 'react'
import raw from './fleet-status-loads.json'
import type { FleetStatusLoad } from '../model/fleet-status-types'

export function useFleetStatusLoads(): FleetStatusLoad[] {
  return useMemo(() => raw as FleetStatusLoad[], [])
}
