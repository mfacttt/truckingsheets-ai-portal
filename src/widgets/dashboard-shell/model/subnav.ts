import type { DashTab } from '../ui/DashboardShell'

export interface SubTabOption {
  value: string
  label: string
  hint?: string
}

export const SUBTABS: Partial<Record<DashTab, SubTabOption[]>> = {
  trailer: [
    { value: 'overview', label: 'Overview', hint: 'Families, mix & snapshot' },
    { value: 'units', label: 'Units & economics', hint: 'One row per truck' },
    { value: 'lines', label: 'Weekly lines', hint: 'Trend per family' },
  ],
  dispatchers: [
    { value: 'overview', label: 'Overview', hint: 'Desk rollups & ranks' },
    { value: 'deskunits', label: 'Dispatchers & units', hint: 'Desk × unit view' },
    { value: 'units', label: 'Units', hint: 'One row per unit' },
  ],
}

export function defaultSubTab(tab: DashTab): string {
  return SUBTABS[tab]?.[0]?.value ?? 'overview'
}
