export interface VisitorAIConfig {
  baseURL: string
  apiKey: string
  model: string
}

export interface AdminSession {
  token: string
  expiresAt: number
}
