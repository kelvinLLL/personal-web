import { NavLink } from 'react-router-dom'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { primaryNavigation } from '@/core/site/navigation'
import { siteRoutes } from '@/core/site/routes'

const navLinkClass =
  'inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-200'
const inactiveNavClass = `${navLinkClass} text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950`

export function SiteHeader() {
  const isAdmin = useAIConfigStore((s) => s.isAdmin())

  return (
    <nav
      className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/92 backdrop-blur-md"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        <NavLink
          to={siteRoutes.home}
          className="inline-flex min-h-11 items-center font-mono text-lg font-bold text-zinc-950 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
        >
          kelvin.dev
        </NavLink>

        <div className="flex flex-wrap items-center gap-1.5">
          {primaryNavigation.map((item) => {
            if (item.appBoundary === 'external' && item.href) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  data-app-boundary="external"
                  className={inactiveNavClass}
                >
                  {item.label}
                </a>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to!}
                end={item.to === siteRoutes.home}
                className={({ isActive }) =>
                  isActive
                    ? `${navLinkClass} bg-zinc-950 text-white font-medium shadow-sm`
                    : inactiveNavClass
                }
              >
                {item.label}
              </NavLink>
            )
          })}

          {isAdmin && (
            <span className="ml-1 inline-flex min-h-8 items-center rounded-full bg-amber-100 px-3 text-xs font-medium text-amber-800">
              Admin
            </span>
          )}
        </div>
      </div>
    </nav>
  )
}
