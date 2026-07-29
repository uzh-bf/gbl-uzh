# Dev container image for the gbl-uzh monorepo (running apps/demo-game).
# glibc base (bookworm) for painless Prisma/esbuild/vite native binaries.
FROM node:24-bookworm-slim

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    DEBIAN_FRONTEND=noninteractive

# Runtime tools: git (repo ops), openssl/ca-certificates (Prisma + TLS),
# procps/util-linux (devrouter process ownership), curl (healthchecks), and tar
# (extracting the pinned devrouter process helper).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git openssl ca-certificates procps util-linux curl tar \
    && rm -rf /var/lib/apt/lists/*

# Pin pnpm to the repo's packageManager version (matches the prod Dockerfile).
# Use npm (not corepack) to avoid corepack's stale signing-key verification.
RUN npm install -g pnpm@11.6.0

# Install only the process-lifecycle helper from the exact devrouter release.
RUN npm pack --silent '@devrouter/cli@0.0.31' \
    && tar -xzf 'devrouter-cli-0.0.31.tgz' --strip-components=2 \
        -C /usr/local/bin package/bin/devrouter-process \
    && chmod +x /usr/local/bin/devrouter-process \
    && rm 'devrouter-cli-0.0.31.tgz'

# Keep the pnpm store inside the image (not on the bind-mounted workspace), so
# it neither pollutes the repo nor fights the host's store.
RUN pnpm config set store-dir "$PNPM_HOME/.pnpm-store"

WORKDIR /workspaces/gbl-uzh
