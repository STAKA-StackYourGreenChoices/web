# web

Next.js 16 + React 19 + Tailwind.

## Run it

```bash
cp .env.example .env.local
pnpm install
pnpm dev            # http://localhost:3000
```

Ctrl-C stops it.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm start:standalone` | Run the production build locally |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright (`pnpm exec playwright install` once, first) |

## Two things that will bite you

**`NEXT_PUBLIC_*` is baked in at build time.** Those values are substituted into
the JavaScript bundle by `next build`; they are not read at runtime. You cannot
build one image and point it at a different API with an env var — the old URL is
already in the shipped JS. That is why `infra/docker-compose.yml` passes
`NEXT_PUBLIC_API_URL` as a `build.args` entry. Server-side code (Server
Components, Route Handlers) reads `process.env` at runtime normally.

**`next.config.ts` sets `output: 'standalone'`,** so plain `next start` does not
work. `public/` and `.next/static` are not part of the standalone bundle and
have to sit next to `server.js` — the Dockerfile does that, and
`pnpm start:standalone` does the same locally.

## Docker

```bash
docker build -t web:local --build-arg NEXT_PUBLIC_API_URL=http://localhost:7070 .
```

 │    Role     │       Email       │    Password    │
  ├─────────────┼───────────────────┼────────────────┤
  │ Admin       │ admin@example.com │ StakaAdmin123! │
  ├─────────────┼───────────────────┼────────────────┤
  │ Normal user │ demo@example.com  │ StakaDemo123!  │
  └─────────────┴───────────────────┴────────────────┘

