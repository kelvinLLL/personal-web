import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { VisitorAIConfig, AdminSession } from '@/types/ai'

interface AIConfigState {
  visitorConfig: VisitorAIConfig
  adminSession: AdminSession | null

  setVisitorConfig: (config: Partial<VisitorAIConfig>) => void
  setAdminSession: (session: AdminSession | null) => void
  isAdmin: () => boolean
  logout: () => void
}

export const useAIConfigStore = create<AIConfigState>()(
  devtools(
    persist(
      (set, get) => ({
        visitorConfig: {
          baseURL: '',
          apiKey: '',
          model: 'gpt-4o',
        },
        adminSession: null,

        setVisitorConfig: (config) =>
          set((state) => ({
            visitorConfig: { ...state.visitorConfig, ...config },
          })),

        setAdminSession: (session) => set({ adminSession: session }),

        isAdmin: () => {
          const session = get().adminSession
          if (!session) return false
          return Date.now() < session.expiresAt
        },

        logout: () => set({ adminSession: null }),
      }),
      { name: 'ai-config' },
    ),
  ),
)
