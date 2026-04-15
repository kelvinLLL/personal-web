import { describe, it, expect, beforeEach } from 'vitest'
import { useAIConfigStore } from '@/store/aiConfigStore'

describe('aiConfigStore', () => {
  beforeEach(() => {
    useAIConfigStore.setState({
      visitorConfig: { baseURL: '', apiKey: '', model: 'gpt-4o' },
      adminSession: null,
    })
  })

  it('starts with empty visitor config', () => {
    const state = useAIConfigStore.getState()
    expect(state.visitorConfig.baseURL).toBe('')
    expect(state.visitorConfig.apiKey).toBe('')
    expect(state.visitorConfig.model).toBe('gpt-4o')
  })

  it('updates visitor config partially', () => {
    useAIConfigStore.getState().setVisitorConfig({ baseURL: 'https://api.test.com' })
    const state = useAIConfigStore.getState()
    expect(state.visitorConfig.baseURL).toBe('https://api.test.com')
    expect(state.visitorConfig.model).toBe('gpt-4o')
  })

  it('sets admin session', () => {
    const future = Date.now() + 1000 * 60 * 60
    useAIConfigStore.getState().setAdminSession({ token: 'test-token', expiresAt: future })
    expect(useAIConfigStore.getState().isAdmin()).toBe(true)
  })

  it('detects expired admin session', () => {
    const past = Date.now() - 1000
    useAIConfigStore.getState().setAdminSession({ token: 'test-token', expiresAt: past })
    expect(useAIConfigStore.getState().isAdmin()).toBe(false)
  })

  it('logs out', () => {
    const future = Date.now() + 1000 * 60 * 60
    useAIConfigStore.getState().setAdminSession({ token: 'test-token', expiresAt: future })
    useAIConfigStore.getState().logout()
    expect(useAIConfigStore.getState().adminSession).toBeNull()
    expect(useAIConfigStore.getState().isAdmin()).toBe(false)
  })
})
