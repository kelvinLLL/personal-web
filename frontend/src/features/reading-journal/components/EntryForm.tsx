import { useState, type CSSProperties, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type {
  ReadingJournalEntry,
  ReadingJournalEntryCreate,
  ReadingStatus,
} from '@/features/reading-journal/model/readingJournal'

const statusLabels: Record<ReadingStatus, string> = {
  planned: '待读',
  reading: '读中',
  finished: '已读',
  paused: '停驻',
  abandoned: '搁置',
}

const emptyEntry: ReadingJournalEntryCreate = {
  book: {
    title: '',
    author: '',
    original_title: '',
    translator: '',
    publisher: '',
    language: 'ja',
    tags: [],
  },
  status: 'reading',
  rating: null,
  started_on: '',
  finished_on: '',
  short_impression: '',
  public_impression: '',
  reflection: '',
  quotes: [],
}

const fieldClass =
  'h-11 border-[#d2b37d] bg-[#fffdf6]/90 text-[#24170f] focus-visible:ring-[#92400e]/25'
const textareaClass =
  'min-h-28 border-[#d2b37d] bg-[#fffdf6]/90 text-base leading-7 text-[#24170f] focus-visible:ring-[#92400e]/25 md:text-sm'
const noteLinesStyle: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(180deg, transparent 0 31px, rgba(146, 64, 14, 0.10) 31px 32px)',
  backgroundSize: '100% 32px',
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function buildEntryPayload(form: HTMLFormElement): ReadingJournalEntryCreate {
  const data = new FormData(form)
  const ratingValue = String(data.get('rating') ?? '').trim()
  const quoteText = String(data.get('quoteText') ?? '').trim()
  const quoteId = String(data.get('quoteId') ?? '').trim()
  const quoteCreatedAt = String(data.get('quoteCreatedAt') ?? '').trim()

  return {
    ...emptyEntry,
    book: {
      title: String(data.get('title') ?? '').trim(),
      author: String(data.get('author') ?? '').trim(),
      original_title: String(data.get('originalTitle') ?? '').trim(),
      translator: String(data.get('translator') ?? '').trim(),
      publisher: String(data.get('publisher') ?? '').trim(),
      language: String(data.get('language') ?? 'ja').trim() || 'ja',
      tags: splitTags(String(data.get('tags') ?? '')),
    },
    status: String(data.get('status') ?? 'reading') as ReadingStatus,
    rating: ratingValue ? Number(ratingValue) : null,
    short_impression: String(data.get('shortImpression') ?? '').trim(),
    public_impression: String(data.get('publicImpression') ?? '').trim(),
    reflection: String(data.get('reflection') ?? '').trim(),
    quotes: quoteText
      ? [
          {
            id: quoteId || null,
            text: quoteText,
            chapter: String(data.get('quoteChapter') ?? '').trim(),
            page: String(data.get('quotePage') ?? '').trim(),
            location: '',
            note: String(data.get('quoteNote') ?? '').trim(),
            tags: splitTags(String(data.get('quoteTags') ?? '')),
            is_spoiler: false,
            created_at: quoteCreatedAt || null,
          },
        ]
      : [],
  }
}

export function EntryForm({
  initialEntry,
  onSubmit,
  onCancel,
  submitLabel = '存下这一页',
  savingLabel = '正在收好...',
}: {
  initialEntry?: ReadingJournalEntry | null
  onSubmit: (entry: ReadingJournalEntryCreate) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  savingLabel?: string
}) {
  const [saving, setSaving] = useState(false)
  const firstQuote = initialEntry?.quotes[0]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setSaving(true)
    try {
      await onSubmit(buildEntryPayload(form))
      if (!initialEntry) {
        form.reset()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="relative grid gap-5 border border-[#d2b37d] bg-[#fff8e8] p-5 shadow-[5px_5px_0_rgba(75,46,24,0.10)] md:grid-cols-2"
    >
      <div className="absolute right-8 top-0 h-5 w-24 -translate-y-1/2 bg-[#b45333]/70" aria-hidden="true" />

      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f]">
        书名
        <Input
          name="title"
          required
          defaultValue={initialEntry?.book.title ?? ''}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f]">
        作者
        <Input
          name="author"
          defaultValue={initialEntry?.book.author ?? ''}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f]">
        原题
        <Input
          name="originalTitle"
          defaultValue={initialEntry?.book.original_title ?? ''}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f]">
        译者
        <Input
          name="translator"
          defaultValue={initialEntry?.book.translator ?? ''}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f]">
        出版社
        <Input
          name="publisher"
          defaultValue={initialEntry?.book.publisher ?? ''}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f]">
        语言
        <Input
          name="language"
          defaultValue={initialEntry?.book.language ?? 'ja'}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f]">
        进度
        <select
          name="status"
          defaultValue={initialEntry?.status ?? 'reading'}
          className="h-11 rounded-lg border border-[#d2b37d] bg-[#fffdf6]/90 px-3 text-sm text-[#24170f] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#92400e]/25"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f]">
        评分
        <Input
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.5"
          defaultValue={initialEntry?.rating ?? ''}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f] md:col-span-2">
        标签
        <Input
          name="tags"
          placeholder="japanese-literature, modern"
          defaultValue={initialEntry?.book.tags.join(', ') ?? ''}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f] md:col-span-2">
        一句感想
        <Input
          name="shortImpression"
          defaultValue={initialEntry?.short_impression ?? ''}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f] md:col-span-2">
        公开感想
        <Textarea
          name="publicImpression"
          defaultValue={initialEntry?.public_impression ?? ''}
          className={textareaClass}
          style={noteLinesStyle}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f] md:col-span-2">
        私密札记
        <Textarea
          name="reflection"
          defaultValue={initialEntry?.reflection ?? ''}
          className="min-h-40 border-[#d2b37d] bg-[#fffdf6]/90 text-base leading-7 text-[#24170f] focus-visible:ring-[#92400e]/25 md:text-sm"
          style={noteLinesStyle}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f] md:col-span-2">
        第一条摘句
        <Textarea
          name="quoteText"
          defaultValue={firstQuote?.text ?? ''}
          className={textareaClass}
          style={noteLinesStyle}
        />
      </label>
      <input type="hidden" name="quoteId" value={firstQuote?.id ?? ''} readOnly />
      <input type="hidden" name="quoteCreatedAt" value={firstQuote?.created_at ?? ''} readOnly />
      <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
        <Input
          name="quoteChapter"
          placeholder="章节"
          defaultValue={firstQuote?.chapter ?? ''}
          className={fieldClass}
        />
        <Input
          name="quotePage"
          placeholder="页码"
          defaultValue={firstQuote?.page ?? ''}
          className={fieldClass}
        />
        <Input
          name="quoteTags"
          placeholder="摘句标签"
          defaultValue={firstQuote?.tags.join(', ') ?? ''}
          className={fieldClass}
        />
      </div>
      <label className="grid gap-1 text-sm font-medium text-[#4a2e1f] md:col-span-2">
        摘句旁注
        <Input
          name="quoteNote"
          defaultValue={firstQuote?.note ?? ''}
          className={fieldClass}
        />
      </label>
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <Button
          type="submit"
          disabled={saving}
          className="min-h-11 gap-2 bg-[#8f2f23] text-[#fff8e8] shadow-[3px_3px_0_rgba(75,46,24,0.16)] hover:bg-[#76271d]"
        >
          <Plus className="size-4" aria-hidden="true" />
          {saving ? savingLabel : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="min-h-11 gap-2 border-[#c7a36b] bg-[#fffdf6]/90 text-[#4a2e1f] hover:bg-[#f7e6c9]"
        >
          <X className="size-4" aria-hidden="true" />
          先不写了
        </Button>
      </div>
    </form>
  )
}
