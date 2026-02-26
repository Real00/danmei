# Repository Guidelines

## Project Structure & Module Organization
- Main app code lives in `reader/`.
- Backend TypeScript is in `reader/src/`:
  - `routes/` for HTTP endpoints
  - `services/` for fetch, parse, cache, and URL logic
  - `app.ts` composition and `server.ts` runtime entry
- Frontend TypeScript source is in `reader/web-src/` (state, UI, domain, reader actions).
- Browser assets are in `reader/public/` (`index.html`, `styles.css`, generated `app.js`).
- Tests are in `reader/test/` with fixtures in `reader/test/fixtures/`.

## Build, Test, and Development Commands
Run commands from `reader/`:
- `pnpm install`: install dependencies.
- `pnpm dev`: compile frontend bundle and start dev server with `tsx`.
- `pnpm build`: build frontend (`public/app.js`) and backend (`dist/`).
- `pnpm start`: production-style run (`build` then `node dist/server.js`).
- `pnpm test`: run all `.test.ts` files via Node test runner (`tsx --test`).
- `pnpm typecheck`: strict compile checks for server, web, and test TS configs.

## Coding Style & Naming Conventions
- Language: TypeScript (Node 18+, CommonJS runtime).
- Indentation: 2 spaces; keep semicolon usage consistent with existing files.
- Naming:
  - `camelCase` for functions/variables
  - `PascalCase` for exported types/interfaces
  - lowercase directory names grouped by responsibility (`services`, `ui`, `state`, `reader`).
- Keep modules focused; avoid re-introducing large all-in-one files.
- After frontend changes, regenerate and commit `reader/public/app.js`.

## Testing Guidelines
- Framework: Node built-in `node:test`, executed through `tsx`.
- Test files use `*.test.ts` naming under `reader/test/`.
- Prefer deterministic unit tests with mocked fetchers (see `test/api-routes.test.ts`).
- Use HTML fixtures for parser regressions (`reader/test/fixtures/*.html`).

## Commit & Pull Request Guidelines
- Follow Conventional Commit style seen in history:
  - `feat(reader): ...`
  - `feat: ...`
  - `ci: ...`
- Recommended format: `<type>(<scope>): <imperative summary>`.
- PRs should include:
  - concise change summary and rationale
  - impacted paths/modules
  - verification steps (e.g., `pnpm test`, `pnpm typecheck`, `pnpm build`)
  - screenshots/GIFs for UI behavior changes.

## Security & Configuration Tips
- Runtime envs: `PORT`, `DANMEI_UA`, `DANMEI_DEBUG`, `DANMEI_PLAYWRIGHT`.
- URL fetch logic is intentionally restricted to `dmxs.org`; preserve this constraint.
- Do not commit credentials or local-only debug settings.
