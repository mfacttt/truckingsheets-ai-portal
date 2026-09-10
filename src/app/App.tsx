import { lazy, Suspense, type ReactNode } from 'react'
import { Router, useRouter } from '@/shared/lib/router/router'
import { SessionProvider } from '@/entities/session/model/session-context'
import { ToastProvider } from '@/shared/ui/toast/ToastProvider'
import { Header } from '@/widgets/header/ui/Header'
import { Footer } from '@/widgets/footer/ui/Footer'
import LandingPage from '@/pages/landing/ui/LandingPage'

const LoginPage = lazy(() => import('@/pages/login/ui/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/ui/DashboardPage'))
const AiAnalyticsPage = lazy(() => import('@/pages/ai-analytics/ui/AiAnalyticsPage'))
const TeamPage = lazy(() => import('@/pages/team/ui/TeamPage'))
const PlansPage = lazy(() => import('@/pages/plans/ui/PlansPage'))
const BillingPage = lazy(() => import('@/pages/billing/ui/BillingPage'))
const NotFoundPage = lazy(() => import('@/pages/not-found/ui/NotFoundPage'))

function RouteFallback() {
  return (
    <div className="page">
      <div className="wrap">
        <div className="skel" style={{ height: 36, width: 260, marginBottom: 24 }} />
        <div className="skel" style={{ height: 180 }} />
      </div>
    </div>
  )
}

function resolveRoute(path: string): ReactNode {
  if (path === '/') return <LandingPage />
  if (path === '/login') return <LoginPage />
  if (path === '/dashboard/ai') return <AiAnalyticsPage />
  if (path === '/dashboard/team') return <TeamPage />
  if (path === '/dashboard/plans') return <PlansPage />
  if (path === '/dashboard/billing') return <BillingPage />
  if (path.startsWith('/dashboard')) return <DashboardPage />
  return <NotFoundPage />
}

function Shell() {
  const { path } = useRouter()
  const isDashboard = path.startsWith('/dashboard')

  return (
    <>
      {!isDashboard && <Header />}
      <main>
        <Suspense fallback={<RouteFallback />}>{resolveRoute(path)}</Suspense>
      </main>
      {!isDashboard && <Footer />}
    </>
  )
}

export function App() {
  return (
    <Router>
      <SessionProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </SessionProvider>
    </Router>
  )
}
