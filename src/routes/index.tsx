import { createHashRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppShell } from '@/components/layout/AppShell'

const Overview  = lazy(() => import('@/pages/Overview'))
const Farms     = lazy(() => import('@/pages/Farms'))
const MyFarm    = lazy(() => import('@/pages/MyFarm'))
const Animals   = lazy(() => import('@/pages/Animals'))
const Quality   = lazy(() => import('@/pages/Quality'))
const Pipeline  = lazy(() => import('@/pages/Pipeline'))
const Ask       = lazy(() => import('@/pages/Ask'))
const EtlCopilot = lazy(() => import('@/pages/EtlCopilot'))

function LoadingFallback() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center text-gray-400">
      <span className="text-sm">Loading…</span>
    </div>
  )
}

function LazyPage({ component: C }: { component: React.ComponentType }) {
  return <Suspense fallback={<LoadingFallback />}><C /></Suspense>
}

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },

      { path: 'overview',  element: <LazyPage component={Overview} /> },
      { path: 'farms',     element: <LazyPage component={Farms} /> },
      { path: 'my-farm',   element: <LazyPage component={MyFarm} /> },
      { path: 'animals',   element: <LazyPage component={Animals} /> },
      { path: 'quality',   element: <LazyPage component={Quality} /> },
      { path: 'pipeline',  element: <LazyPage component={Pipeline} /> },
      { path: 'ask',       element: <LazyPage component={Ask} /> },
      { path: 'etl-copilot', element: <LazyPage component={EtlCopilot} /> },

      // Redirect removed screens
      { path: 'dashboard',  element: <Navigate to="/overview" replace /> },
      { path: 'compare',    element: <Navigate to="/farms" replace /> },
      { path: 'landscape',  element: <Navigate to="/overview" replace /> },
      { path: 'resolution', element: <Navigate to="/farms" replace /> },
      { path: 'metrics',    element: <Navigate to="/ask" replace /> },
      { path: 'lineage',    element: <Navigate to="/overview" replace /> },
      { path: 'stream',     element: <Navigate to="/pipeline" replace /> },
      { path: 'business',   element: <Navigate to="/farms" replace /> },
      { path: 'onboard',    element: <Navigate to="/overview" replace /> },
      { path: 'results',    element: <Navigate to="/pipeline" replace /> },
    ],
  },
])
