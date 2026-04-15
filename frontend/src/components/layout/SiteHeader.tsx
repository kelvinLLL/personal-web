import { NavLink } from 'react-router-dom'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { primaryNavigation } from '@/core/site/navigation'
import { siteRoutes } from '@/core/site/routes'

export function SiteHeader() {
  const isAdmin = useAIConfigStore((s) => s.isAdmin())

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <NavLink
          to={siteRoutes.home}
          className="font-mono text-lg font-bold tracking-tight text-stone-900 transition-colors hover:text-sky-700"
        >
          kelvin.dev
        </NavLink>

        <div className="flex items-center gap-0.5">
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to!}
              end={item.to === siteRoutes.home}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-stone-900 text-white font-medium shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Admin
            </span>
          )}
        </div>
      </div>
    </nav>
  )
}
