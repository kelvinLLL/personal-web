import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageContainer } from '@/components/layout/PageContainer'
import { loadDailyNuanceSnapshot } from '@/features/daily-nuance/api/dailyNuanceApi'
import { NuanceHero } from '@/features/daily-nuance/components/NuanceHero'
import { NuanceSection } from '@/features/daily-nuance/components/NuanceSection'
import { NuanceSnapshotMeta } from '@/features/daily-nuance/components/NuanceSnapshotMeta'
import {
  getSnapshotDomainCount,
  getSnapshotItemCount,
  type DailyNuanceSnapshot,
} from '@/features/daily-nuance/model/nuance'

export function DailyNuancePage() {
  const [snapshot, setSnapshot] = useState<DailyNuanceSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let canceled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const payload = await loadDailyNuanceSnapshot()
        if (!canceled) {
          setSnapshot(payload)
        }
      } catch (cause) {
        if (!canceled) {
          const message = cause instanceof Error ? cause.message : 'Unknown error'
          setError(message)
        }
      } finally {
        if (!canceled) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      canceled = true
    }
  }, [])

  return (
    <PageContainer>
      <NuanceHero subtitle="Fresh signals worth watching, organized by momentum and staying power." />

      {loading && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          <p className="text-sm text-stone-500">Loading daily nuance snapshot...</p>
        </div>
      )}

      {error && !loading && (
        <Alert className="mb-8 border-amber-200 bg-amber-50 text-amber-900">
          <AlertTitle>Snapshot unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {snapshot && !loading && !error && (
        <>
          <NuanceSnapshotMeta
            snapshotDate={snapshot.snapshot_date}
            itemCount={getSnapshotItemCount(snapshot)}
            domainCount={getSnapshotDomainCount(snapshot)}
          />
          <NuanceSection
            title="New & Fancy"
            bucket="new_fancy"
            items={snapshot.overview.new_fancy}
          />
          <NuanceSection
            title="Proven & Rising"
            bucket="proven_rising"
            items={snapshot.overview.proven_rising}
          />
        </>
      )}
    </PageContainer>
  )
}

export default DailyNuancePage
