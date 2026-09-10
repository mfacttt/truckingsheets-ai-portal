import { Link } from '@/shared/lib/router/router'

export default function NotFoundPage() {
  return (
    <div className="page page-center-v">
      <div className="wrap" style={{ textAlign: 'center' }}>
        <p className="eyebrow" style={{ justifyContent: 'center' }}>
          404
        </p>
        <h1>Page not found</h1>
        <p style={{ margin: '14px 0 26px', color: 'var(--ink-2)' }}>
          That page doesn't exist, or it moved.
        </p>
        <Link className="btn btn-primary" to="/">
          Back to home
        </Link>
      </div>
    </div>
  )
}
