# web

Next.js 16. Ships as a Docker image to GHCR; deployed by the pipeline in
[`infra`](../infra).

## Local development

```bash
nvm use                    # Node 22, from .nvmrc
cp .env.example .env.local
pnpm install
pnpm dev                   # :3000
```

## Tests

| Command | What it is | Needs browsers |
|---|---|---|
| `pnpm test:unit` | Vitest + React Testing Library | no |
| `pnpm test:e2e` | Playwright — builds the app, then drives it | **yes** |
| `pnpm test:e2e:smoke` | The `@smoke` subset, re-run against live previews | **yes** |

```bash
pnpm exec playwright install    # once
pnpm test:all
```

Point the suite at a deployed environment instead of building locally:

```bash
PREVIEW_URL=https://pr-123-web.preview.yourdomain.com pnpm test:e2e:smoke
```

> Async Server Components are not unit-testable with RTL today. Test the pure
> data functions they call as units, and cover the rendered result with
> Playwright. Forcing RTL to render an async RSC is wasted effort.

Visual baselines must be generated on Linux — font rendering differs enough
between macOS and Linux to fail every diff:

```bash
docker run --rm -v "$PWD:/work" -w /work \
  mcr.microsoft.com/playwright:v1.62.1-noble \
  npx playwright test --update-snapshots
```

## Git hooks

| Hook | Runs | Bypass |
|---|---|---|
| `pre-commit` | lint-staged, typecheck, unit tests | `--no-verify` |
| `commit-msg` | commitlint (Conventional Commits) | `--no-verify` |
| `pre-push` | lint, typecheck, unit, Playwright | `SKIP_E2E=1 git push` |

## ⚠️ The `NEXT_PUBLIC_*` build-time trap

`NEXT_PUBLIC_*` variables are **substituted into the JavaScript bundle during
`next build`**. They are not read at runtime. Consequences:

- You **cannot** build one image and point it at a different API with a runtime
  env var. The old URL is already in the shipped JS.
- Therefore **every preview builds its own image**, with
  `--build-arg NEXT_PUBLIC_API_URL=…`. This is why the web build sits on the
  PR's critical path in a way the API build does not.
- It is also why `production.yml` rebuilds rather than promoting the staging
  image the way `api` does.
- Server-side code (Server Components, Route Handlers, Server Actions) reads
  `process.env` at runtime normally. Only `NEXT_PUBLIC_` values are frozen.

**To make the image promotable**: stop using `NEXT_PUBLIC_API_URL` in client
code. Have the browser call a same-origin `/api/…` path and let a Route Handler
proxy it to the backend using a server-side `API_URL`. More indirection, but it
decouples build from environment — the right trade past two environments.

## Standalone output

`next.config.ts` sets `output: 'standalone'`, so `next start` does **not** work.
`public/` and `.next/static` are not part of the standalone bundle and must be
copied next to `server.js` — the Dockerfile does this, and
`pnpm start:standalone` does the same locally so Playwright exercises the same
server that ships.
