# Tech Stack Best Practices — Quick Reference

## Vite + React + TypeScript
- Use `resolve.alias` in vite.config.ts aligned with `tsconfig.json` paths
- Type env vars via `src/vite-env.d.ts`: `interface ImportMetaEnv { readonly VITE_BACKEND_URL: string }`
- Feature-based folder structure: pages/, components/, lib/, store/, types/
- Lazy load routes: `const Ideas = lazy(() => import('./pages/Ideas'))`

## React Router v6
- Use `createBrowserRouter` + `RouterProvider` for data-loading patterns
- Layout routes with `<Outlet/>` for shared Navbar/Footer
- Protected route: wrapper component checking auth state, redirects to login

## Zustand
- Slices pattern: one file per domain (aiConfig, ideas, auth)
- Middleware order: `devtools(persist(store))` — devtools outermost
- Atomic selectors: `const count = useStore(s => s.count)` — never return whole store
- Actions outside components for testability

## Tailwind CSS + shadcn/ui
- Vite plugin: `@tailwindcss/vite` (v4+)
- CSS variable theming for dark mode
- shadcn components: copy into `src/components/ui/`, customize via cva variants

## FastAPI
- Router-based: `routers/auth.py`, `routers/ideas.py`, etc.
- Use `lifespan` context manager (not deprecated `on_startup`)
- `pydantic-settings` for config from .env
- SSE: `StreamingResponse(generator(), media_type="text/event-stream")`
- File locking: `aiofiles` + `asyncio.Lock` for concurrent JSON read/write
- Annotated dependencies: `Annotated[str, Depends(get_current_user)]`

## Testing
- Frontend: Vitest + jsdom + React Testing Library
  - Custom render with providers (router, store)
  - `userEvent.setup()` for realistic interactions
  - Reset Zustand stores in `beforeEach`
- Backend: pytest + httpx AsyncClient + ASGITransport
  - `@pytest.fixture` for test client and temp data files
  - Override dependencies for testing

## Security
- JWT: short-lived tokens (7 days per plan), verify with secret
- CORS: explicit allowed origins, never `*` in production
- Never prefix client-exposed API keys with `VITE_` — always proxy
- Pydantic validates all input automatically
- Admin password: bcrypt hash comparison (or simple constant-time compare)
