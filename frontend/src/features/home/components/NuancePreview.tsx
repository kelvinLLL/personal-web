import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loadDailyNuanceSnapshot } from '@/features/daily-nuance/api/dailyNuanceApi'
import type { DailyNuanceSnapshot } from '@/features/daily-nuance/model/nuance'
import { siteRoutes } from '@/core/site/routes'

export function NuancePreview() {
  const [snapshot, setSnapshot] = useState<DailyNuanceSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void loadDailyNuanceSnapshot()
      .then((nextSnapshot) => {
        if (!cancelled) {
          setSnapshot(nextSnapshot)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot(null)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const highlights = snapshot?.overview.new_fancy.slice(0, 3) ?? []

  return (
    <Card className="rounded-lg border-zinc-200 shadow-sm" aria-busy={loading}>
      <CardHeader className="space-y-3">
        <span className="inline-flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Activity className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Nuance Preview
          </p>
          <CardTitle className="text-2xl font-semibold text-zinc-950">
            Signals with freshness and momentum.
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 rounded-lg border border-zinc-100 bg-zinc-100 motion-safe:animate-pulse"
              />
            ))}
          </div>
        ) : highlights.length > 0 ? (
          highlights.map((item) => (
            <div
              key={item.entity_id}
              className="rounded-lg border border-zinc-100 bg-zinc-50/70 px-4 py-3"
            >
              <p className="font-medium text-zinc-950">{item.title}</p>
              <p className="mt-1 text-sm text-zinc-600">
                {item.domains.join(' / ')} - {item.source_names.join(', ')}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-5 text-sm leading-6 text-zinc-600">
            The latest nuance snapshot will appear here once the generated data is ready for the
            unified frontend.
          </p>
        )}

        <Link
          to={siteRoutes.dailyNuance}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-800 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
        >
          Open Daily Nuance
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  )
}
