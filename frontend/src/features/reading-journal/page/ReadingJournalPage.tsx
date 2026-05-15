import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked, BookOpenText, Pencil, Plus, Share2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAIConfigStore } from '@/store/aiConfigStore'
import * as readingJournalApi from '@/features/reading-journal/api/readingJournalApi'
import { CommentList } from '@/features/reading-journal/components/CommentList'
import { EntryForm } from '@/features/reading-journal/components/EntryForm'
import type {
  CommentStatus,
  JournalComment,
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

const coverStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, rgba(120, 53, 15, 0.08) 1px, transparent 1px), linear-gradient(180deg, #fbf1dc 0%, #f4dfbd 100%)',
  backgroundSize: '28px 28px, 100% 100%',
}

const paperStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, rgba(180, 83, 9, 0.08) 1px, transparent 1px), repeating-linear-gradient(180deg, transparent 0 34px, rgba(146, 64, 14, 0.11) 34px 35px)',
  backgroundSize: '32px 100%, 100% 35px',
}

const journalFontStyle: CSSProperties = {
  fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", Georgia, serif',
}

function formatRating(rating: number | null) {
  return typeof rating === 'number' ? `${rating.toFixed(1)} / 5` : '未评分'
}

function formatSharePath(token: string) {
  return `/reading-journal/shared/${token}`
}

export function ReadingJournalPage() {
  const isAdmin = useAIConfigStore((state) => state.isAdmin())
  const [entries, setEntries] = useState<ReadingJournalEntry[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    setLoading(true)
    void readingJournalApi
      .fetchReadingJournalEntries()
      .then((nextEntries) => {
        setEntries(nextEntries)
        setActiveId((current) => current ?? nextEntries[0]?.id ?? null)
        setError('')
      })
      .catch((cause) => setError(cause.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const activeEntry = useMemo(
    () => entries.find((entry) => entry.id === activeId) ?? entries[0] ?? null,
    [activeId, entries],
  )
  const editingEntry = useMemo(
    () => entries.find((entry) => entry.id === editingId) ?? null,
    [editingId, entries],
  )
  const activeEntryNumber = activeEntry
    ? entries.findIndex((entry) => entry.id === activeEntry.id) + 1
    : 0

  function handleNewEntryClick() {
    setEditingId(null)
    setShowForm((value) => !value)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  async function handleCreate(entry: ReadingJournalEntryCreate) {
    const created = await readingJournalApi.createReadingJournalEntry(entry)
    setEntries((current) => [created, ...current])
    setActiveId(created.id)
    closeForm()
  }

  async function handleUpdate(entry: ReadingJournalEntryCreate) {
    if (!editingId) return

    const updated = await readingJournalApi.updateReadingJournalEntry(editingId, entry)
    setEntries((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    setActiveId(updated.id)
    closeForm()
  }

  async function handleDelete(entryId: string) {
    if (!window.confirm('要删除这一页读书手帐吗？')) return

    await readingJournalApi.deleteReadingJournalEntry(entryId)
    const nextEntries = entries.filter((entry) => entry.id !== entryId)
    setEntries(nextEntries)
    setActiveId((current) => (current === entryId ? nextEntries[0]?.id ?? null : current))
    closeForm()
  }

  async function handleShare(entryId: string) {
    const response = await readingJournalApi.generateReadingJournalShareToken(entryId)
    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? { ...entry, comments_enabled: true, share_token: response.share_token }
          : entry,
      ),
    )
  }

  async function handleModerate(
    entryId: string,
    comment: JournalComment,
    status: CommentStatus,
  ) {
    const updated = await readingJournalApi.updateReadingJournalCommentStatus(
      entryId,
      comment.id,
      status,
    )
    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              comments: entry.comments.map((item) => (item.id === updated.id ? updated : item)),
            }
          : entry,
      ),
    )
  }

  if (!isAdmin) {
    return (
      <PageContainer className="max-w-5xl">
        <section
          className="relative overflow-hidden border border-[#d9bd8c] bg-[#fbf1dc] p-6 shadow-[0_24px_80px_rgba(75,46,24,0.14)] md:p-10"
          style={{ ...coverStyle, ...journalFontStyle }}
        >
          <div className="absolute left-8 top-0 h-7 w-32 bg-[#b45333]/80" aria-hidden="true" />
          <div className="max-w-2xl pt-6">
            <p className="text-sm font-semibold text-[#8f2f23]">静かな書斎</p>
            <h1 className="mt-3 text-4xl font-semibold text-[#24170f] md:text-5xl">
              私人读书手帐
            </h1>
            <p className="mt-5 text-base leading-8 text-[#59402d]">
              这里只放你的感想、摘句和读完之后还留在心里的余温。先登录，再翻开自己的书页。
            </p>
            <Link
              to="/settings"
              className="mt-7 inline-flex min-h-11 items-center justify-center border border-[#24170f] bg-[#24170f] px-5 text-sm font-medium text-[#fff8e8] shadow-[4px_4px_0_rgba(146,64,14,0.22)] transition hover:bg-[#3a2619] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#92400e]/40"
            >
              去设置登录
            </Link>
          </div>
        </section>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="max-w-7xl space-y-6">
      <section
        className="relative overflow-hidden border border-[#d8bd8f] bg-[#fbf1dc] p-5 shadow-[0_24px_80px_rgba(75,46,24,0.13)] md:p-8"
        style={{ ...coverStyle, ...journalFontStyle }}
      >
        <div className="absolute left-7 top-0 h-7 w-28 bg-[#b45333]/75" aria-hidden="true" />
        <div className="flex flex-col gap-6 pt-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#8f2f23]">静かな書斎</p>
            <h1 className="mt-3 text-4xl font-semibold text-[#24170f] md:text-5xl">
              私人读书手帐
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#59402d] md:text-base">
              像翻一本自己的册子：左边找书，右边写下感想、摘句和只给朋友看的分享笺。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid grid-cols-3 border border-[#d0aa72] bg-[#fff8e8]/80 text-center text-[#4a2e1f] shadow-[3px_3px_0_rgba(146,64,14,0.12)]">
              <div className="min-w-20 border-r border-[#d0aa72] px-3 py-2">
                <p className="text-lg font-semibold">{entries.length}</p>
                <p className="text-xs">册</p>
              </div>
              <div className="min-w-20 border-r border-[#d0aa72] px-3 py-2">
                <p className="text-lg font-semibold">
                  {entries.filter((entry) => entry.status === 'finished').length}
                </p>
                <p className="text-xs">已读</p>
              </div>
              <div className="min-w-20 px-3 py-2">
                <p className="text-lg font-semibold">
                  {entries.reduce((count, entry) => count + entry.quotes.length, 0)}
                </p>
                <p className="text-xs">摘句</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleNewEntryClick}
              className="min-h-11 gap-2 bg-[#8f2f23] px-4 text-[#fff8e8] shadow-[4px_4px_0_rgba(36,23,15,0.16)] hover:bg-[#76271d]"
            >
              <Plus className="size-4" aria-hidden="true" />
              {showForm ? '合上便笺' : '添一页'}
            </Button>
          </div>
        </div>
      </section>

      {(showForm || editingEntry) && (
        <section className="relative space-y-4 border border-[#d8bd8f] bg-[#f7e6c9] p-4 shadow-[0_16px_50px_rgba(75,46,24,0.10)] md:p-6">
          <div className="absolute left-8 top-0 h-5 w-24 -translate-y-1/2 bg-[#456a57]/75" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-[#24170f]">
            {editingEntry ? '修改这一页' : '新的一页'}
          </h2>
          <EntryForm
            key={editingEntry?.id ?? 'new-entry'}
            initialEntry={editingEntry}
            onSubmit={editingEntry ? handleUpdate : handleCreate}
            onCancel={closeForm}
            submitLabel={editingEntry ? '更新这一页' : '存下这一页'}
            savingLabel={editingEntry ? '正在更新...' : '正在收好...'}
          />
        </section>
      )}

      {error && (
        <p className="border border-[#c2410c]/30 bg-[#fff1e6] p-4 text-sm text-[#9a3412]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="border border-[#d8bd8f] bg-[#fff8e8] py-10 text-center text-sm text-[#6f553b]">
          正在翻开手帐...
        </p>
      ) : entries.length === 0 ? (
        <section className="border border-dashed border-[#c7a36b] bg-[#fff8e8] p-10 text-center shadow-[0_16px_50px_rgba(75,46,24,0.08)]">
          <BookOpenText className="mx-auto size-9 text-[#8f2f23]" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-semibold text-[#24170f]">还没有书页</h2>
          <p className="mt-2 text-sm text-[#6f553b]">从最近正在读的一本书开始就好。</p>
        </section>
      ) : (
        <div className="grid overflow-hidden border border-[#d8bd8f] bg-[#ead5b5] shadow-[0_28px_90px_rgba(75,46,24,0.14)] lg:grid-cols-[17rem_1fr]">
          <aside className="relative border-b border-[#d8bd8f] bg-[#efd9b8] p-4 lg:border-b-0 lg:border-r">
            <div className="absolute inset-y-5 left-4 w-2 bg-[#6d3f2a]/35" aria-hidden="true" />
            <div className="pl-5">
              <div className="mb-4 flex items-center gap-2 text-[#4a2e1f]">
                <BookMarked className="size-4 text-[#8f2f23]" aria-hidden="true" />
                <h2 className="text-sm font-semibold">书目索引</h2>
              </div>
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setActiveId(entry.id)}
                    className={`min-h-24 w-full border px-4 py-3 text-left shadow-[3px_3px_0_rgba(75,46,24,0.08)] transition ${
                      activeEntry?.id === entry.id
                        ? 'border-[#8f2f23]/50 bg-[#fff8e8] text-[#24170f]'
                        : 'border-[#d8bd8f] bg-[#f7e6c9] text-[#59402d] hover:border-[#8f2f23]/40 hover:bg-[#fff2d6]'
                    }`}
                  >
                    <span className="text-xs font-semibold text-[#8f2f23]">
                      第 {index + 1} 页 · {statusLabels[entry.status]}
                    </span>
                    <span className="mt-2 block text-base font-semibold">{entry.book.title}</span>
                    <span className="mt-1 block text-sm text-[#6f553b]">{entry.book.author}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {activeEntry && (
            <article
              className="relative bg-[#fff8e8] p-5 md:p-8"
              style={{ ...paperStyle, ...journalFontStyle }}
            >
              <div className="hidden md:block absolute inset-y-8 left-8 w-px bg-[#b45333]/25" aria-hidden="true" />
              <div className="relative md:pl-8">
                <div className="flex flex-col gap-5 border-b border-dashed border-[#c7a36b] pb-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#8f2f23]">
                      読書録 第 {activeEntryNumber} 页
                    </p>
                    <h2 className="mt-2 text-4xl font-semibold text-[#24170f] md:text-5xl">
                      {activeEntry.book.title}
                    </h2>
                    <p className="mt-2 text-base text-[#6f553b]">{activeEntry.book.author}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#4a2e1f]">
                      <span className="border border-[#c7a36b] bg-[#fffdf6]/80 px-3 py-1.5">
                        {statusLabels[activeEntry.status]}
                      </span>
                      <span className="border border-[#c7a36b] bg-[#fffdf6]/80 px-3 py-1.5">
                        {formatRating(activeEntry.rating)}
                      </span>
                      {activeEntry.book.original_title && (
                        <span className="border border-[#c7a36b] bg-[#fffdf6]/80 px-3 py-1.5">
                          {activeEntry.book.original_title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(activeEntry.id)
                      }}
                      className="min-h-11 gap-2 border-[#c7a36b] bg-[#fffdf6]/90 text-[#4a2e1f] hover:bg-[#f7e6c9]"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      编辑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleShare(activeEntry.id)}
                      className="min-h-11 gap-2 border-[#456a57]/40 bg-[#f4f7ed] text-[#284737] hover:bg-[#e6efd8]"
                    >
                      <Share2 className="size-4" aria-hidden="true" />
                      {activeEntry.share_token ? '重写分享笺' : '生成分享笺'}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => void handleDelete(activeEntry.id)}
                      className="min-h-11 gap-2"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      删除
                    </Button>
                  </div>
                </div>

                {activeEntry.share_token && (
                  <div className="mt-5 border border-[#456a57]/35 bg-[#f4f7ed] p-4 text-sm text-[#284737] shadow-[3px_3px_0_rgba(69,106,87,0.12)]">
                    <p className="font-semibold">给朋友的分享笺</p>
                    <p className="mt-2 break-all font-mono text-xs">
                      {formatSharePath(activeEntry.share_token)}
                    </p>
                  </div>
                )}

                <div className="mt-7 grid gap-6">
                  {activeEntry.short_impression && (
                    <section>
                      <h3 className="text-base font-semibold text-[#8f2f23]">一句感想</h3>
                      <p className="mt-2 max-w-3xl text-base leading-8 text-[#4a2e1f]">
                        {activeEntry.short_impression}
                      </p>
                    </section>
                  )}

                  {activeEntry.reflection && (
                    <section>
                      <h3 className="text-base font-semibold text-[#8f2f23]">私密札记</h3>
                      <p className="mt-2 max-w-3xl whitespace-pre-wrap text-base leading-8 text-[#4a2e1f]">
                        {activeEntry.reflection}
                      </p>
                    </section>
                  )}

                  {activeEntry.quotes.length > 0 && (
                    <section className="space-y-3">
                      <h3 className="text-base font-semibold text-[#8f2f23]">摘录句子</h3>
                      {activeEntry.quotes.map((quote) => (
                        <blockquote
                          key={quote.id}
                          className="border-l-4 border-[#8f2f23]/70 bg-[#fffdf6]/90 px-4 py-3 shadow-[3px_3px_0_rgba(75,46,24,0.08)]"
                        >
                          <p className="text-base leading-8 text-[#24170f]">{quote.text}</p>
                          {(quote.chapter || quote.page) && (
                            <footer className="mt-2 text-xs text-[#6f553b]">
                              {quote.chapter}
                              {quote.page ? ` · p.${quote.page}` : ''}
                            </footer>
                          )}
                          {quote.note && (
                            <p className="mt-3 text-sm leading-6 text-[#8f2f23]">{quote.note}</p>
                          )}
                        </blockquote>
                      ))}
                    </section>
                  )}

                  <CommentList
                    entry={activeEntry}
                    onModerate={(comment, status) =>
                      void handleModerate(activeEntry.id, comment, status)
                    }
                  />
                </div>
              </div>
            </article>
          )}
        </div>
      )}
    </PageContainer>
  )
}
