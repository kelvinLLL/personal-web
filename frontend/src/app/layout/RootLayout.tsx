import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/layout/SiteHeader'

export function RootLayout() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </>
  )
}
