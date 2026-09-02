# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && pnpm install --frozen-lockfile

FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ⚠️ NEXT_PUBLIC_* values are INLINED into the client bundle by `next build`.
# They are NOT read at runtime, so they must arrive here as build args — which
# is why every preview builds its own image.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV=production
ARG NEXT_PUBLIC_SENTRY_DSN
ARG GIT_SHA=dev
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

FROM node:22-alpine AS runtime
RUN apk add --no-cache curl && \
    addgroup -g 1001 -S nodejs && \
    adduser  -u 1001 -S nextjs -G nodejs
WORKDIR /app

ARG GIT_SHA=dev
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 GIT_SHA=$GIT_SHA

# public/ and .next/static are NOT part of the standalone bundle.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public           ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
