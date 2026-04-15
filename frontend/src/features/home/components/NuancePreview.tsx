import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loadDailyNuanceSnapshot } from '@/features/daily-nuance/api/dailyNuanceApi'
import type { DailyNuanceSnapshot } from '@/features/daily-nuance/model/nuance'
import { siteRoutes } from '@/core/site/routes'

export function NuancePreview() {
  const [snapshot, setSnapshot] = useState<DailyNuanceSnapshot | null>(null)

  useEffect(() => {
    let cancelled = false

    void loadDailyNuanceSnapshot()
      .then((nextSnapshot) => {
        if (!cancelled) {
          setSnapshot(nextSnapshot)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const highlights = snapshot?.overview.new_fancy.slice(0, 3) ?? []

  return (
    <Card className="rounded-[1.75rem] border-stone-200 shadow-sm">
      <CardHeader className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
          Editorial Preview
        </p>
        <CardTitle className="text-2xl font-semibold tracking-tight text-stone-900">
          Signals worth watching
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {highlights.length > 0 ? (
          highlights.map((item) => (
            <div
              key={item.entity_id}
              className="rounded-2xl border border-stone-100 bg-stone-50/70 px-4 py-3"
            >
              <p className="font-medium text-stone-900">{item.title}</p>
              <p className="mt-1 text-sm text-stone-500">
                {item.domains.join(' · ')} · {item.source_names.join(', ')}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-200 px-4 py-5 text-sm text-stone-500">
            The latest nuance snapshot will appear here once the generated data is ready for the
            unified frontend.
          </p>
        )}

        <Link
          to={siteRoutes.dailyNuance}
          className="inline-flex text-sm font-medium text-sky-700 transition hover:text-sky-800"
        >
          Open the full Daily Nuance board →
        </Link>
      </CardContent>
    </Card>
  )
}
