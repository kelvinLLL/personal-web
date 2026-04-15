/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, type ReactNode } from 'react'
import {
  createBrowserRouter,
  createMemoryRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom'
import { RootLayout } from '@/app/layout/RootLayout'
import { siteRoutes, toChildPath } from '@/core/site/routes'

const Home = lazy(() => import('@/pages/Home'))
const Ideas = lazy(() => import('@/pages/Ideas'))
const IdeaDetail = lazy(() => import('@/pages/IdeaDetail'))
const DailyNuance = lazy(() => import('@/pages/DailyNuance'))
const SkillMarketplace = lazy(() => import('@/pages/SkillMarketplace'))
const SkillMarketplaceDetail = lazy(() => import('@/pages/SkillMarketplaceDetail'))
const BookReader = lazy(() => import('@/pages/BookReader'))
const Settings = lazy(() => import('@/pages/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
    </div>
  )
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>
}

export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: toChildPath(siteRoutes.ideas), element: withSuspense(<Ideas />) },
      { path: `${toChildPath(siteRoutes.ideas)}/:id`, element: withSuspense(<IdeaDetail />) },
      { path: toChildPath(siteRoutes.dailyNuance), element: withSuspense(<DailyNuance />) },
      {
        path: toChildPath(siteRoutes.skillMarketplace),
        element: withSuspense(<SkillMarketplace />),
      },
      {
        path: `${toChildPath(siteRoutes.skillMarketplace)}/:ownerType/:slug`,
        element: withSuspense(<SkillMarketplaceDetail />),
      },
      { path: toChildPath(siteRoutes.bookReader), element: withSuspense(<BookReader />) },
      { path: 'reader', element: <Navigate replace to={siteRoutes.bookReader} /> },
      { path: toChildPath(siteRoutes.settings), element: withSuspense(<Settings />) },
      { path: '*', element: withSuspense(<NotFound />) },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(appRoutes)
}

export function createAppMemoryRouter(initialEntries = ['/']) {
  return createMemoryRouter(appRoutes, { initialEntries })
}

export const router = createAppRouter()
