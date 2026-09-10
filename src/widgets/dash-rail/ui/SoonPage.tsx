import type { ReactNode } from 'react'

export function SoonPage({
  icon,
  title,
  text,
  tag = 'Coming soon',
}: {
  icon: ReactNode
  title: string
  text: string
  tag?: string
}) {
  return (
    <div className="soon-wrap">
      <div className="soon-card">
        <div className="soon-ic">{icon}</div>
        <h2>{title}</h2>
        <p>{text}</p>
        <span className="soon-tag">{tag}</span>
      </div>
    </div>
  )
}
