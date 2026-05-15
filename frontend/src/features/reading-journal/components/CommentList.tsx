import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  CommentStatus,
  JournalComment,
  ReadingJournalEntry,
} from '@/features/reading-journal/model/readingJournal'

const commentLabels: Record<CommentStatus, string> = {
  pending: '待确认',
  approved: '已收下',
  rejected: '已搁置',
}

export function CommentList({
  entry,
  onModerate,
}: {
  entry: ReadingJournalEntry
  onModerate: (comment: JournalComment, status: CommentStatus) => void
}) {
  const pending = entry.comments.filter((comment) => comment.status === 'pending')
  const reviewed = entry.comments.filter((comment) => comment.status !== 'pending')

  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-[#8f2f23]">边注留言</h3>
      {pending.length === 0 ? (
        <p className="border border-dashed border-[#c7a36b] bg-[#fffdf6]/75 p-4 text-sm text-[#6f553b]">
          暂无需要确认的留言。
        </p>
      ) : (
        pending.map((comment) => (
          <article
            key={comment.id}
            className="border border-[#d9a441]/45 bg-[#fff5d8] p-4 shadow-[3px_3px_0_rgba(75,46,24,0.08)]"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#4a2e1f]">{comment.display_name}</p>
                <p className="mt-2 text-sm leading-7 text-[#59402d]">{comment.body}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onModerate(comment, 'approved')}
                  aria-label={`收下 ${comment.display_name} 的留言`}
                  className="min-h-11 gap-2 bg-[#456a57] text-[#fff8e8] hover:bg-[#365644]"
                >
                  <Check className="size-4" aria-hidden="true" />
                  收下
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onModerate(comment, 'rejected')}
                  aria-label={`搁置 ${comment.display_name} 的留言`}
                  className="min-h-11 gap-2 border-[#c7a36b] bg-[#fffdf6] text-[#4a2e1f] hover:bg-[#f7e6c9]"
                >
                  <X className="size-4" aria-hidden="true" />
                  搁置
                </Button>
              </div>
            </div>
          </article>
        ))
      )}
      {reviewed.length > 0 && (
        <div className="grid gap-2 border-l-4 border-[#456a57]/45 pl-3">
          {reviewed.map((comment) => (
            <p key={comment.id} className="text-sm text-[#6f553b]">
              {comment.display_name}: {commentLabels[comment.status]}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}
