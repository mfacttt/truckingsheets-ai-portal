import { useEffect, useState } from 'react'
import { RESEND_COOLDOWN_SECONDS } from '@/shared/config/constants'

const TICK_MS = 1000
const MS_PER_SECOND = 1000

export interface Cooldown {
  secondsLeft: number
  start(seconds?: number): void
}

export function useCooldown(autoStartSeconds?: number): Cooldown {
  const [until, setUntil] = useState(() =>
    autoStartSeconds ? Date.now() + autoStartSeconds * MS_PER_SECOND : 0,
  )
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (until <= Date.now()) return undefined
    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [until])

  const secondsLeft = Math.max(0, Math.ceil((until - now) / MS_PER_SECOND))

  const start = (seconds: number = RESEND_COOLDOWN_SECONDS) => {
    setNow(Date.now())
    setUntil(Date.now() + seconds * MS_PER_SECOND)
  }

  return { secondsLeft, start }
}
