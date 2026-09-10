import type { ReactNode } from 'react'

export type BannerKind = 'info' | 'success' | 'error' | 'warn'

export function Banner({ kind = 'info', children }: { kind?: BannerKind; children: ReactNode }) {
  return (
    <div className={`banner banner-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}
