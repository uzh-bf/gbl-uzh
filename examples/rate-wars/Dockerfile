FROM node:24.16-alpine AS base

RUN apk add --no-cache git

# Install pnpm and turbo
RUN npm install -g pnpm@11.6.0 turbo@2.0.4

# Set pnpm store directory
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm config set store-dir $PNPM_HOME/.pnpm-store


FROM base as prune
WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/.pnpm-store \
    # HACK: Install without frozen lockfile - reevaluate after upgrades branch is merged
    pnpm install --no-frozen-lockfile

# Prune application with Turbo
RUN turbo prune --scope="@gbl-uzh/demo-game" --docker


# Install dependencies only when needed
FROM base AS builder
WORKDIR /app

# Copy only package files needed for installation
COPY --from=prune /app/out/json/ .

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/.pnpm-store \
    # HACK: Install without frozen lockfile - reevaluate after upgrades branch is merged
    pnpm install --no-frozen-lockfile

COPY --from=prune /app/out/full/ .

RUN pnpm build


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy only the necessary files for running the application
COPY --from=builder --chown=nextjs:nodejs /app/apps/demo-game/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/demo-game/.next/static ./apps/demo-game/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/demo-game/public ./apps/demo-game/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/demo-game/.env.production ./apps/demo-game/.env.production

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "apps/demo-game/server.js"]
