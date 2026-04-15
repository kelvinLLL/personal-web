import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { apiRequest } from '@/lib/apiClient'
import { testConnection } from '@/lib/aiClient'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ServerModel {
  key: string
  name: string
  model_id: string
  provider: string
}

function ServerModelSection() {
  const isAdmin = useAIConfigStore((s) => s.isAdmin())
  const adminSession = useAIConfigStore((s) => s.adminSession)
  const [models, setModels] = useState<ServerModel[]>([])
  const [active, setActive] = useState('')
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchModels()
  }, [])

  async function fetchModels() {
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest<{ models: ServerModel[]; active: string }>('/api/models')
      setModels(data.models)
      setActive(data.active)
    } catch {
      setError('Failed to load models from server')
    } finally {
      setLoading(false)
    }
  }

  async function handleSwitch(key: string) {
    if (!isAdmin || !adminSession) return
    setSwitching(true)
    try {
      const data = await apiRequest<{ active: string }>('/api/models/active', {
        method: 'POST',
        token: adminSession.token,
        body: JSON.stringify({ key }),
      })
      setActive(data.active)
    } catch {
      setError('Failed to switch model')
    } finally {
      setSwitching(false)
    }
  }

  return (
    <Card className="border border-stone-200 bg-white shadow-sm">
      <CardHeader className="pb-0">
        <div>
          <CardTitle>Server Models</CardTitle>
          <p className="text-sm text-stone-400">Models configured in models.yaml</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-end">
        {isAdmin && (
          <Button
            onClick={fetchModels}
            variant="outline"
            size="sm"
          >
            Reload
          </Button>
        )}
        </div>

      {loading ? (
        <p className="text-sm text-stone-400">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : models.length === 0 ? (
        <p className="text-sm text-stone-400">No models configured</p>
      ) : (
        <div className="space-y-2">
          {models.map((m) => (
            <div
              key={m.key}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                m.key === active
                  ? 'border-sky-300 bg-sky-50'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-stone-900">{m.name}</p>
                <p className="text-xs text-stone-400">
                  {m.model_id} · {m.provider}
                </p>
              </div>
              {m.key === active ? (
                <span className="text-xs text-sky-600 font-medium">Active</span>
              ) : isAdmin ? (
                <Button
                  onClick={() => handleSwitch(m.key)}
                  disabled={switching}
                  size="sm"
                >
                  Switch
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
      </CardContent>
    </Card>
  )
}

function VisitorConfigSection() {
  const config = useAIConfigStore((s) => s.visitorConfig)
  const setConfig = useAIConfigStore((s) => s.setVisitorConfig)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const ok = await testConnection(config)
      setTestResult(ok ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="border border-stone-200 bg-white shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle>Visitor AI Configuration</CardTitle>
        <p className="text-sm text-stone-400">
          Configure your own AI provider. Keys are stored locally in your browser only.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Base URL</label>
          <Input
            type="url"
            value={config.baseURL}
            onChange={(e) => setConfig({ baseURL: e.target.value })}
            placeholder="https://api.openai.com/v1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">API Key</label>
          <Input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig({ apiKey: e.target.value })}
            placeholder="sk-..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Model</label>
          <Input
            type="text"
            value={config.model}
            onChange={(e) => setConfig({ model: e.target.value })}
            placeholder="gpt-4o"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleTest}
            disabled={testing || !config.baseURL || !config.apiKey}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          {testResult === 'success' && (
            <span className="text-sm text-green-600">✓ Connection successful</span>
          )}
          {testResult === 'error' && (
            <span className="text-sm text-red-600">✗ Connection failed</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AdminLoginSection() {
  const adminSession = useAIConfigStore((s) => s.adminSession)
  const setAdminSession = useAIConfigStore((s) => s.setAdminSession)
  const isAdmin = useAIConfigStore((s) => s.isAdmin())
  const logout = useAIConfigStore((s) => s.logout)
  const [password, setPassword] = useState('')
  const [logging, setLogging] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLogging(true)
    setError('')
    try {
      const data = await apiRequest<{ token: string; expires_at: number }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ password }),
        },
      )
      setAdminSession({ token: data.token, expiresAt: data.expires_at * 1000 })
      setPassword('')
    } catch {
      setError('Login failed. Check password.')
    } finally {
      setLogging(false)
    }
  }

  return (
    <Card className="border border-stone-200 bg-white shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle>Admin Access</CardTitle>
      </CardHeader>
      <CardContent>

      {isAdmin ? (
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Logged in as Admin
            </span>
            {adminSession && (
              <p className="text-xs text-stone-400 mt-2">
                Expires: {new Date(adminSession.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button
            onClick={logout}
            variant="outline"
          >
            Logout
          </Button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            disabled={logging || !password}
          >
            {logging ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      )}
      </CardContent>
    </Card>
  )
}

function StatusSection() {
  const isAdmin = useAIConfigStore((s) => s.isAdmin())
  const config = useAIConfigStore((s) => s.visitorConfig)

  return (
    <Card className="border border-stone-200 bg-white shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle>Current Status</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-500">Mode</dt>
          <dd className="font-medium text-stone-900">{isAdmin ? 'Admin (Server Proxy)' : 'Visitor (Local)'}</dd>
        </div>
        {!isAdmin && config.baseURL && (
          <>
            <div className="flex justify-between">
              <dt className="text-stone-500">Provider</dt>
              <dd className="font-medium text-stone-900">{config.baseURL}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Model</dt>
              <dd className="font-medium text-stone-900">{config.model || 'Not set'}</dd>
            </div>
          </>
        )}
        </dl>
      </CardContent>
    </Card>
  )
}

export default function Settings() {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Settings</h1>
      <p className="text-sm text-stone-400 mb-8">Manage AI configuration and admin access</p>
      <div className="space-y-6 max-w-2xl">
        <StatusSection />
        <AdminLoginSection />
        <ServerModelSection />
        <VisitorConfigSection />
      </div>
    </PageContainer>
  )
}
