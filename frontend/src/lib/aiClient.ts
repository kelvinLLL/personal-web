import type { VisitorAIConfig } from '@/types/ai'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { apiStreamRequest } from './apiClient'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<Response> {
  const store = useAIConfigStore.getState()

  if (store.isAdmin()) {
    return apiStreamRequest('/api/proxy/chat', {
      method: 'POST',
      token: store.adminSession!.token,
      body: JSON.stringify({ messages, ...options }),
    })
  }

  const config = store.visitorConfig
  if (!config.baseURL || !config.apiKey) {
    throw new Error('AI configuration not set. Please configure in Settings.')
  }

  return fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      ...options,
    }),
  })
}

export async function testConnection(config: VisitorAIConfig): Promise<boolean> {
  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    }),
  })
  return response.ok
}
