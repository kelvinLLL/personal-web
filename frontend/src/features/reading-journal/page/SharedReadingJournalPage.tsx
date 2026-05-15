import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageContainer } from '@/components/layout/PageContainer'
import * as readingJournalApi from '@/features/reading-journal/api/readingJournalApi'
import type { SharedReadingJournalEntry } from '@/features/reading-journal/model/readingJournal'

const statusLabels: Record<string, string> = {
  planned: 'Planned',
  reading: 'Reading',
  finished: 'Finished',
  paused: 'Paused',
  abandoned: 'Abandoned',
}

function formatRating(rating: number | null) {
  return typeof rating === 'number' ? `${rating.toFixed(1)} / 5` : 'Unrated'
}

export function SharedReadingJournalPage() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const [entry, setEntry] = useState<SharedReadingJournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!shareToken) {
      setError('Missing share token.')
      setLoading(false)
      return
    }

    setLoading(true)
    void readingJournalApi
      .fetchSharedReadingJournalEntry(shareToken)
      .then((nextEntry) => {
        setEntry(nextEntry)
        setError('')
      })
      .catch(() => {
        setEntry(null)
        setError('This shared reading note is unavailable.')
      })
      .finally(() => setLoading(false))
  }, [shareToken])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!shareToken) return

    const form = event.currentTarget
    const data = new FormData(form)
    setSubmitting(true)
    try {
      await readingJournalApi.createSharedReadingJournalComment(shareToken, {
        display_name: String(data.get('displayName') ?? '').trim(),
        body: String(data.get('comment') ?? '').trim(),
      })
      form.reset()
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer className="space-y-8">
      <section className="border border-red-900/10 bg-[#fbf3e4] p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold text-red-900">Shared reading note</p>
        {loading ? (
          <p className="mt-5 text-sm text-stone-600">Opening shared note...</p>
        ) : error ? (
          <>
            <h1 className="mt-3 text-3xl font-semibold text-stone-950">
              Shared note unavailable
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-700">{error}</p>
          </>
        ) : entry ? (
          <>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-stone-950 md:text-4xl">
                  {entry.book.title}
                </h1>
                <p className="mt-2 text-base text-stone-700">{entry.book.author}</p>
              </div>
              <div className="border border-red-900/20 bg-white px-4 py-3 text-sm text-stone-700">
                {statusLabels[entry.status] ?? entry.status} · {formatRating(entry.rating)}
              </div>
            </div>

            {entry.public_impression && (
              <p className="mt-6 max-w-3xl whitespace-pre-wrap text-base leading-8 text-stone-800">
                {entry.public_impression}
              </p>
            )}
          </>
        ) : null}
      </section>

      {entry && (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5 text-red-900" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-stone-950">Approved comments</h2>
            </div>
            {entry.comments.length === 0 ? (
              <p className="border border-dashed border-stone-300 bg-[#fffaf1] p-5 text-sm text-stone-600">
                No approved comments yet.
              </p>
            ) : (
              entry.comments.map((comment) => (
                <article key={comment.id} className="border border-stone-200 bg-white p-5">
                  <p className="text-sm font-semibold text-stone-950">{comment.display_name}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-700">{comment.body}</p>
                </article>
              ))
            )}
          </section>

          <section className="border border-red-900/10 bg-[#fffaf1] p-5">
            <h2 className="text-xl font-semibold text-stone-950">Leave a comment</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Your note will wait for review before it appears here.
            </p>
            <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 grid gap-4">
              <label className="grid gap-1 text-sm font-medium text-stone-800">
                Display name
                <Input name="displayName" required className="h-11 bg-white" />
              </label>
              <label className="grid gap-1 text-sm font-medium text-stone-800">
                Comment
                <Textarea name="comment" required className="min-h-32 bg-white" />
              </label>
              <Button type="submit" disabled={submitting} className="min-h-11 gap-2">
                <Send className="size-4" aria-hidden="true" />
                {submitting ? 'Submitting...' : 'Submit Comment'}
              </Button>
            </form>
            {submitted && (
              <p className="mt-4 border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                Comment received and waiting for review.
              </p>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  )
}
