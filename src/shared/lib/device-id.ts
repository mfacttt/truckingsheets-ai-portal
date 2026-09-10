import { DEVICE_ID_STORAGE_KEY } from '@/shared/config/constants'

let cached: string | null = null

export function getDeviceId(): string {
  if (cached) return cached

  try {
    const stored = localStorage.getItem(DEVICE_ID_STORAGE_KEY)
    if (stored) {
      cached = stored
      return cached
    }

    const created = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, created)
    cached = created
    return cached
  } catch {
    cached ??= crypto.randomUUID()
    return cached
  }
}
