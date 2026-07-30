# Dev container image for the gbl-uzh monorepo (running apps/demo-game).
# glibc base (bookworm) for painless Prisma/esbuild/vite native binaries.
FROM node:24-bookworm-slim

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    DEBIAN_FRONTEND=noninteractive

# Runtime tools: git (repo ops), openssl/ca-certificates (Prisma + TLS),
# procps/util-linux (devrouter process ownership), and curl (healthchecks).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates curl git openssl procps util-linux \
    && rm -rf /var/lib/apt/lists/*

# Pin pnpm to the repo's packageManager version (matches the prod Dockerfile).
# Use npm (not corepack) to avoid corepack's stale signing-key verification.
RUN npm install -g --ignore-scripts pnpm@11.18.0

# Keep the pnpm store inside the image (not on the bind-mounted workspace), so
# it neither pollutes the repo nor fights the host's store.
RUN pnpm config set store-dir "$PNPM_HOME/.pnpm-store"

WORKDIR /workspaces/gbl-uzh
