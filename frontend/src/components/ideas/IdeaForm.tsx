import { useState } from 'react'
import type { ProjectIdea, IdeaCategory, EffortLevel } from '@/types/idea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type IdeaFormData = Omit<ProjectIdea, 'id' | 'meta'>

interface IdeaFormProps {
  onSubmit: (data: IdeaFormData) => Promise<void>
  onCancel: () => void
  initial?: Partial<ProjectIdea>
}

const defaultScores = { value: 5, learnability: 5, fun: 5, feasibility: 5, overall: 5 }
const defaultDetail = {
  why_interesting: '',
  why_worth_doing: '',
  references: [],
  tech_hints: [],
  effort: 'M' as EffortLevel,
}

export function IdeaForm({ onSubmit, onCancel, initial }: IdeaFormProps) {
  const [title, setTitle] = useState(initial?.title || '')
  const [tagline, setTagline] = useState(initial?.tagline || '')
  const [category, setCategory] = useState<IdeaCategory>(initial?.category || 'tool')
  const [status, setStatus] = useState(initial?.status || 'pending')
  const [scores, setScores] = useState(initial?.scores || defaultScores)
  const [detail, setDetail] = useState(initial?.detail || defaultDetail)
  const [techHintsText, setTechHintsText] = useState((initial?.detail?.tech_hints || []).join(', '))
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        title,
        tagline,
        category,
        status,
        scores: { ...scores, overall: Math.round((scores.value + scores.learnability + scores.fun + scores.feasibility) / 4) },
        detail: {
          ...detail,
          tech_hints: techHintsText.split(',').map((s) => s.trim()).filter(Boolean),
        },
      })
    } finally {
      setSubmitting(false)
    }
  }

  function updateScore(key: keyof typeof scores, value: number) {
    setScores((prev) => ({ ...prev, [key]: Math.min(10, Math.max(1, value)) }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Tagline</label>
          <Input
            required
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as IdeaCategory)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="toy">Toy</option>
            <option value="tool">Tool</option>
            <option value="feature">Feature</option>
            <option value="learning">Learning</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectIdea['status'])}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Effort</label>
          <select
            value={detail.effort}
            onChange={(e) => setDetail((d) => ({ ...d, effort: e.target.value as EffortLevel }))}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="S">S (hours)</option>
            <option value="M">M (days)</option>
            <option value="L">L (weeks)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['value', 'learnability', 'fun', 'feasibility'] as const).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-stone-700 mb-1 capitalize">{key}</label>
            <input
            type="number"
            min={1}
            max={10}
            value={scores[key]}
            onChange={(e) => updateScore(key, parseInt(e.target.value) || 1)}
            className="w-full"
          />
        </div>
      ))}
    </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Why Interesting</label>
        <Textarea
          value={detail.why_interesting}
          onChange={(e) => setDetail((d) => ({ ...d, why_interesting: e.target.value }))}
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Why Worth Doing</label>
        <Textarea
          value={detail.why_worth_doing}
          onChange={(e) => setDetail((d) => ({ ...d, why_worth_doing: e.target.value }))}
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Tech Hints (comma-separated)</label>
        <Input
          value={techHintsText}
          onChange={(e) => setTechHintsText(e.target.value)}
          placeholder="React, FastAPI, WebSocket..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={submitting || !title || !tagline}
        >
          {submitting ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
