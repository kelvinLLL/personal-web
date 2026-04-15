export interface Scores {
  value: number
  learnability: number
  fun: number
  feasibility: number
  overall: number
}

export interface Reference {
  title: string
  url: string
  type: 'repo' | 'article' | 'hn' | 'other'
}

export interface IdeaDetail {
  why_interesting: string
  why_worth_doing: string
  references: Reference[]
  tech_hints: string[]
  effort: 'S' | 'M' | 'L'
}

export interface IdeaMeta {
  discovered_at: string
  source: 'workflow' | 'workflow_selected' | 'manual'
  workflow_run_id?: string
}

export interface IdeasMeta {
  updatedAt: string | null
  count: number
}

export interface ProjectIdea {
  id: string
  title: string
  tagline: string
  category: 'toy' | 'tool' | 'feature' | 'learning'
  status: 'pending' | 'in_progress' | 'done' | 'skipped'
  scores: Scores
  detail: IdeaDetail
  meta: IdeaMeta
}

export type IdeaCategory = ProjectIdea['category']
export type IdeaStatus = ProjectIdea['status']
export type EffortLevel = IdeaDetail['effort']
