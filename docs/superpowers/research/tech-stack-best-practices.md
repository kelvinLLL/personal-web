# Tech Stack Best Practices — Actionable Reference

## 1. Vite + React + TypeScript Project Setup

### Folder Structure

```
src/
├── app/                  # App shell: providers, router, global error boundary
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── components/           # Shared/reusable UI components
│   └── ui/               # shadcn/ui components land here
├── features/             # Feature-based modules (co-located logic)
│   └── dashboard/
│       ├── components/
│       ├── hooks/
│       ├── api.ts
│       ├── store.ts
│       └── types.ts
├── hooks/                # Shared custom hooks
├── lib/                  # Utility functions, SDK wrappers
├── services/             # API client, auth service
├── stores/               # Global Zustand stores
├── types/                # Shared TypeScript types
└── main.tsx
```

**Key principle**: co-locate feature-specific code. Shared utilities go in top-level dirs; feature-specific code stays in `features/<name>/`.

### vite.config.ts

```ts
import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    // NEW in Vite 6+: use tsconfig paths directly
    // tsconfigPaths: true,
  },
  build: {
    target: "esnext",
    sourcemap: false,  // true for staging, false for prod
    // Chunking strategy via rolldown (Vite 7+)
    rolldownOptions: {
      output: {
        // Manual chunks for vendor splitting
        codeSplitting: {
          groups: [
            { name: "vendor-react", test: /react|react-dom|react-router/ },
            { name: "vendor-ui", test: /radix|lucide|class-variance/ },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
})
```

### Path Aliases — tsconfig.json + tsconfig.app.json

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

```jsonc
// tsconfig.app.json — MUST also have the same paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Vite resolves aliases via `resolve.alias`. TypeScript resolves via `paths`. **Both must agree.**

### Env Variables

```bash
# .env               — all modes
# .env.local         — all modes, git-ignored
# .env.production    — production only
# .env.development   — development only
```

```ts
// Only VITE_ prefixed vars are exposed to client code
// .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
DB_PASSWORD=secret  // NOT exposed to client ✓
```

```ts
// src/vite-env.d.ts — type safety for env vars
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**Pitfall**: Never set `envPrefix: ""` — it leaks ALL env vars to client bundles.

### Build Optimization Checklist

- `build.target: "esnext"` for modern browsers
- Dynamic `import()` for route-level code splitting (automatic with React Router lazy)
- `build.reportCompressedSize: false` for faster builds in CI
- `build.cssCodeSplit: true` (default) — CSS per-chunk
- `json.stringify: "auto"` (default) — large JSON auto-optimized

---

## 2. React Router v7 (formerly v6)

### Route Configuration (Framework Mode)

```ts
// app/routes.ts
import { type RouteConfig, route, index, layout, prefix } from "@react-router/dev/routes"

export default [
  index("./home.tsx"),
  
  // Layout routes — no URL segment added
  layout("./layouts/app-layout.tsx", [
    route("dashboard", "./dashboard.tsx"),
    route("settings", "./settings.tsx"),
  ]),
  
  // Prefix routes — adds URL segment, no layout component
  ...prefix("api", [
    route("users", "./api/users.tsx"),
  ]),
] satisfies RouteConfig
```

### Lazy Loading (Declarative/SPA Mode)

```tsx
import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router"

const Dashboard = lazy(() => import("./features/dashboard/Dashboard"))
const Settings = lazy(() => import("./features/settings/Settings"))

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Skeleton />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "settings",
        // Route-level lazy: loads component + loader together
        lazy: () => import("./features/settings/route"),
      },
    ],
  },
])
```

### Layout Routes Pattern

```tsx
// layouts/AppLayout.tsx
import { Outlet, useNavigation } from "react-router"

export default function AppLayout() {
  const navigation = useNavigation()
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        {navigation.state === "loading" && <TopLoader />}
        <Outlet />
      </main>
    </div>
  )
}
```

### Protected Routes Pattern

```tsx
// components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router"
import { useAuthStore } from "@/stores/auth"

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}

// In router config:
{
  element: <ProtectedRoute />,
  children: [
    { path: "dashboard", element: <Dashboard /> },
    { path: "settings", element: <Settings /> },
  ],
}
```

### Type-Safe Routing (Framework Mode)

```tsx
// Auto-generated types via +types/ convention
import type { Route } from "./+types/team"

export async function loader({ params }: Route.LoaderArgs) {
  // params.teamId is typed as string
  const team = await fetchTeam(params.teamId)
  return { name: team.name }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.name}</h1>
}
```

**Pitfalls**:
- Don't nest `<Routes>` inside route modules — use the route config for nesting
- Index routes cannot have children
- Prefer `layout()` over wrapper `route()` when you don't need a URL segment

---

## 3. Zustand

### Store Organization — Slices Pattern

```ts
// stores/auth-slice.ts
import type { StateCreator } from "zustand"

export interface AuthSlice {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

export const createAuthSlice: StateCreator<
  AuthSlice & /* other slices */,
  [],
  [],
  AuthSlice
> = (set) => ({
  token: null,
  isAuthenticated: false,
  login: (token) => set({ token, isAuthenticated: true }),
  logout: () => set({ token: null, isAuthenticated: false }),
})
```

```ts
// stores/index.ts — combine slices
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { createAuthSlice, type AuthSlice } from "./auth-slice"
import { createUISlice, type UISlice } from "./ui-slice"

type Store = AuthSlice & UISlice

export const useStore = create<Store>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createUISlice(...a),
      }),
      {
        name: "app-store",
        partialize: (state) => ({ token: state.token }), // only persist what's needed
      }
    ),
    { name: "AppStore" }
  )
)
```

### Selectors for Performance

```tsx
// BAD — re-renders on ANY store change
const { token, theme } = useStore()

// GOOD — only re-renders when token changes
const token = useStore((s) => s.token)

// GOOD — derived selector with shallow compare for objects
import { useShallow } from "zustand/shallow"

const { name, email } = useStore(
  useShallow((s) => ({ name: s.name, email: s.email }))
)
```

### Auto-Generating Selectors

```ts
import { StoreApi, UseBoundStore, create } from "zustand"

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

function createSelectors<S extends UseBoundStore<StoreApi<object>>>(store: S) {
  const storeIn = store as WithSelectors<typeof store>
  storeIn.use = {}
  for (const k of Object.keys(storeIn.getState())) {
    ;(storeIn.use as any)[k] = () => storeIn((s) => s[k as keyof typeof s])
  }
  return storeIn
}

// Usage
const useAppStore = createSelectors(useStore)
const token = useAppStore.use.token()  // auto-generated selector
```

### Actions Outside Components

```ts
// Can call actions without hooks
useStore.getState().logout()

// Or separate actions from state (recommended pattern):
// stores/auth-slice.ts
export const authActions = {
  login: (token: string) => useStore.setState({ token, isAuthenticated: true }),
  logout: () => useStore.setState({ token: null, isAuthenticated: false }),
}
```

**Pitfalls**:
- Don't select the entire store — always use individual selectors
- `persist` middleware with `partialize` — don't persist derived state or large blobs
- `devtools` should wrap outermost for correct middleware ordering: `devtools(persist(...))`

---

## 4. Tailwind CSS + shadcn/ui

### Setup with Vite (Tailwind v4+)

```bash
pnpm add tailwindcss @tailwindcss/vite
pnpm dlx shadcn@latest init
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
})
```

```css
/* src/index.css — Tailwind v4 style */
@import "tailwindcss";
```

### Theming — CSS Variables

```css
/* globals.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
}
```

### Dark Mode — Theme Provider

```tsx
// components/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({ theme: "system", setTheme: () => null })

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    if (theme === "system") {
      const sys = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark" : "light"
      root.classList.add(sys)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme: (t) => { localStorage.setItem(storageKey, t); setTheme(t) },
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

### Component Customization

```tsx
// Override shadcn component via className or variant extension
// components/ui/button.tsx — already in your project, modify directly
// Add custom variants to the cva() call:
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      // Custom variant:
      brand: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
    },
  },
})
```

**Pitfalls**:
- `components.json` controls where `shadcn add` places files — keep `@/components/ui` convention
- Don't install Tailwind config file with v4 — use CSS `@theme inline` instead
- Adding new tokens: define in `:root` + `.dark`, expose via `@theme inline`

---

## 5. FastAPI

### Project Structure (Medium App)

```
app/
├── __init__.py
├── main.py              # FastAPI app, lifespan, middleware
├── config.py            # Settings via pydantic-settings
├── dependencies.py      # Shared dependencies
├── models/              # Pydantic models (schemas)
│   ├── __init__.py
│   ├── user.py
│   └── item.py
├── routers/
│   ├── __init__.py
│   ├── auth.py
│   ├── users.py
│   └── items.py
├── services/            # Business logic
│   ├── __init__.py
│   ├── auth_service.py
│   └── item_service.py
├── storage/             # File-based persistence
│   ├── __init__.py
│   └── json_store.py
└── middleware/
    └── __init__.py
```

### App Entry with Lifespan

```python
# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, users, items

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load resources
    yield
    # Shutdown: cleanup

app = FastAPI(lifespan=lifespan, title=settings.app_title)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(items.router, prefix="/items", tags=["items"])
```

### Config with pydantic-settings

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_title: str = "My API"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    cors_origins: list[str] = ["http://localhost:5173"]
    data_dir: str = "./data"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

settings = Settings()
```

### Dependency Injection

```python
# app/dependencies.py
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.config import settings

security = HTTPBearer()

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Reusable type alias
CurrentUser = Annotated[dict, Depends(get_current_user)]
```

### Pydantic v2 Patterns

```python
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime

class ItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    tags: list[str] = Field(default_factory=list, max_length=10)

    @field_validator("tags")
    @classmethod
    def lowercase_tags(cls, v: list[str]) -> list[str]:
        return [t.lower().strip() for t in v]

class ItemResponse(BaseModel):
    model_config = {"from_attributes": True}  # replaces orm_mode

    id: str
    title: str
    tags: list[str]
    created_at: datetime

class ItemUpdate(BaseModel):
    title: str | None = None
    tags: list[str] | None = None

    @model_validator(mode="before")
    @classmethod
    def check_at_least_one(cls, data: dict) -> dict:
        if not any(data.values()):
            raise ValueError("At least one field must be provided")
        return data
```

### SSE Streaming

```python
# app/routers/events.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json

router = APIRouter()

async def event_generator():
    while True:
        data = await get_latest_event()  # your logic
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(1)

@router.get("/stream")
async def stream_events():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # disable nginx buffering
        },
    )
```

### File-Based Storage with Locking

```python
# app/storage/json_store.py
import asyncio
import json
from pathlib import Path
from contextlib import asynccontextmanager
from filelock import FileLock  # pip install filelock

class JsonStore:
    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self._locks: dict[str, asyncio.Lock] = {}

    def _get_lock(self, key: str) -> asyncio.Lock:
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        return self._locks[key]

    def _path(self, collection: str, key: str) -> Path:
        # Sanitize to prevent path traversal
        safe_collection = Path(collection).name
        safe_key = Path(key).name
        return self.base_dir / safe_collection / f"{safe_key}.json"

    async def read(self, collection: str, key: str) -> dict | None:
        path = self._path(collection, key)
        if not path.exists():
            return None
        async with self._get_lock(f"{collection}/{key}"):
            return json.loads(path.read_text())

    async def write(self, collection: str, key: str, data: dict) -> None:
        path = self._path(collection, key)
        path.parent.mkdir(parents=True, exist_ok=True)
        async with self._get_lock(f"{collection}/{key}"):
            # Atomic write: write to tmp then rename
            tmp = path.with_suffix(".tmp")
            tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2))
            tmp.rename(path)
```

**Pitfalls**:
- Don't use `@app.on_event("startup")` — deprecated. Use `lifespan` context manager.
- CORS: never `allow_origins=["*"]` with `allow_credentials=True` — browsers reject it
- Always use `Annotated[type, Depends(...)]` syntax over old parameter default style

---

## 6. Testing

### Vitest Setup for Frontend

```ts
// vite.config.ts (or vitest.config.ts)
/// <reference types="vitest/config" />
import { defineConfig } from "vite"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/**/*.d.ts", "src/main.tsx"],
    },
  },
})
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
})
```

### React Testing Library Patterns

```tsx
// src/test/utils.tsx — custom render with providers
import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"
import { MemoryRouter } from "react-router"

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider defaultTheme="light">
        {children}
      </ThemeProvider>
    </MemoryRouter>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export { screen, waitFor, within } from "@testing-library/react"
export { userEvent } from "@testing-library/user-event"
```

```tsx
// features/dashboard/Dashboard.test.tsx
import { describe, it, expect, vi } from "vitest"
import { renderWithProviders, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { Dashboard } from "./Dashboard"

describe("Dashboard", () => {
  it("renders welcome message", () => {
    renderWithProviders(<Dashboard />)
    expect(screen.getByRole("heading")).toHaveTextContent(/welcome/i)
  })

  it("opens settings on button click", async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard />)
    await user.click(screen.getByRole("button", { name: /settings/i }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})
```

### Zustand Store Testing

```ts
// stores/__tests__/auth.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { useStore } from "../index"

describe("auth store", () => {
  beforeEach(() => {
    // Reset store between tests
    useStore.setState({ token: null, isAuthenticated: false })
  })

  it("login sets token and isAuthenticated", () => {
    useStore.getState().login("abc123")
    expect(useStore.getState().token).toBe("abc123")
    expect(useStore.getState().isAuthenticated).toBe(true)
  })
})
```

### Pytest for FastAPI

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def auth_headers():
    """Generate valid JWT for testing."""
    from app.services.auth_service import create_token
    token = create_token({"sub": "test-user", "role": "admin"})
    return {"Authorization": f"Bearer {token}"}
```

```python
# tests/test_items.py
import pytest

@pytest.mark.anyio
async def test_create_item(client, auth_headers):
    resp = await client.post(
        "/items/",
        json={"title": "Test Item", "tags": ["python"]},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Test Item"
    assert data["tags"] == ["python"]

@pytest.mark.anyio
async def test_create_item_unauthorized(client):
    resp = await client.post("/items/", json={"title": "Test"})
    assert resp.status_code == 403  # or 401
```

### Test Organization

```
# Frontend
src/
├── features/
│   └── dashboard/
│       ├── Dashboard.tsx
│       └── Dashboard.test.tsx     # Co-located
├── test/
│   ├── setup.ts                   # Global setup
│   └── utils.tsx                  # Custom render

# Backend
tests/
├── conftest.py                    # Shared fixtures
├── test_auth.py                   # Per-router tests
├── test_items.py
└── fixtures/
    └── sample_items.json
```

**Pitfalls**:
- Always use `userEvent.setup()` over `fireEvent` — it simulates real user behavior
- Don't test implementation details (state internals) — test user-visible behavior
- pytest: use `@pytest.mark.anyio` (or `@pytest.mark.asyncio`) for async tests
- Reset Zustand store in `beforeEach` — state leaks between tests otherwise

---

## 7. Security

### JWT Best Practices

**Backend (FastAPI)**:
```python
import jwt
from datetime import datetime, timedelta, timezone

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def create_refresh_token(user_id: str) -> str:
    return jwt.encode(
        {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
```

**Key rules**:
- Short-lived access tokens (15-30 min), longer refresh tokens (7 days)
- Store refresh tokens in `httpOnly` cookies, NOT localStorage
- Access tokens: send via `Authorization: Bearer` header
- Include `exp`, `iat`, and `sub` claims minimum
- Use `HS256` for single-service, `RS256` for multi-service/microservices
- Never put sensitive data in JWT payload (it's base64, not encrypted)

**Frontend token handling**:
```ts
// services/api.ts — attach token to requests
const api = {
  fetch: async (url: string, options: RequestInit = {}) => {
    const token = useStore.getState().token
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: "include", // sends httpOnly cookies (refresh token)
    })
  },
}
```

### CORS Configuration

```python
# Production — explicit origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://myapp.com", "https://www.myapp.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,  # cache preflight for 10 min
)
```

**Rules**:
- Never `allow_origins=["*"]` with `allow_credentials=True` — spec violation
- In dev, use explicit `http://localhost:5173` instead of `*`
- `allow_methods` — list only the methods you actually use
- `allow_headers` — list only the headers you actually send

### Input Validation

```python
# Backend — Pydantic does the heavy lifting
class UserCreate(BaseModel):
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=8, max_length=128)

# Path parameters — validate in router
@router.get("/items/{item_id}")
async def get_item(item_id: str = Path(..., pattern=r"^[a-zA-Z0-9_-]+$")):
    ...
```

```ts
// Frontend — validate before sending (zod + shadcn form)
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

// Always validate on BOTH client and server
```

### API Key Handling

**Backend**:
```python
# Store API keys in environment variables, never in code
# .env
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...

# app/config.py
class Settings(BaseSettings):
    openai_api_key: str  # Required — app won't start without it
```

**Frontend**:
```ts
// NEVER put API keys in frontend code or VITE_ env vars
// Always proxy through your backend:

// BAD ❌
const res = await fetch("https://api.openai.com/v1/chat", {
  headers: { Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}` },
})

// GOOD ✓
const res = await fetch("/api/ai/chat", { method: "POST", body: JSON.stringify({ prompt }) })
// Backend handles the API key
```

**Security checklist**:
- [ ] JWT tokens have short expiry (<30min for access)
- [ ] Refresh tokens are httpOnly cookies
- [ ] CORS origins are explicit (no wildcards in production)
- [ ] All user input validated server-side via Pydantic
- [ ] No API keys / secrets in frontend code or `VITE_` env vars
- [ ] File paths sanitized to prevent path traversal
- [ ] Rate limiting on auth endpoints (use `slowapi` or similar)
- [ ] Password hashing with `bcrypt` or `argon2`, never plain text
- [ ] HTTPS enforced in production
