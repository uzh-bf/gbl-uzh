import path from "node:path";

import type { NextConfig } from "next";

// @uzh-bf/design-system declares a React 18 peer, so pnpm resolves its subtree
// to react@18 while this app runs react@19. In dev it is additionally consumed
// as raw TypeScript source (its `development` export condition). Handle both.
// Match `development` explicitly: an unset NODE_ENV must NOT enable
// transpilePackages (transpiling the DS source breaks a production build), so
// the unknown case defaults to the safe production path. `next dev` sets
// NODE_ENV=development and `next build` sets production, so both real paths are
// correct.
const isDev = process.env.NODE_ENV === "development";

// Resolve the app's single React copy through pnpm's symlinks (not a hardcoded
// node_modules path, which may not exist under pnpm hoisting in a clean Docker
// build — there the alias would silently no-op and the duplicate React would
// return). require/__dirname are injected by Next's config loader.
const appReactDir = path.dirname(
  require.resolve("react", { paths: [__dirname] }),
);
const appReactDomDir = path.dirname(
  require.resolve("react-dom", { paths: [__dirname] }),
);

// @apollo/client peer-resolves separately for react@18 and react@19, so pnpm
// materialises two physical copies. demo-game imports its hooks from the
// react@19 copy, while `@gbl-uzh/platform/dist` (which creates the client and is
// imported by `_app`) pulls the react@18 copy. Two copies = two distinct
// `ApolloContext` objects: the provider seeds one, `useQuery` reads the other,
// so queries never settle and pages hang on `loading` forever despite the
// network request returning 200. Pin every `@apollo/client` import in this
// app's bundle to a single copy.
const appApolloDir = path.dirname(
  require.resolve("@apollo/client/package.json", { paths: [__dirname] }),
);

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next 16 removed the `eslint` config key (and `next lint`); linting no longer
  // runs during `next build`, so the old `eslint.ignoreDuringBuilds` is gone.
  // Lint runs standalone via the `lint` script (`eslint .`).

  // Dev only: the design system's `development` export points at raw `.tsx`
  // source that `next dev`'s webpack cannot parse on its own. A production build
  // resolves the compiled `dist` instead — transpiling there breaks the build.
  ...(isDev && { transpilePackages: ["@uzh-bf/design-system"] }),

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      // Client bundle only: pin React to this app's single react@19 copy.
      // Without this the design system's react@18 peer adds a second physical
      // React to the browser bundle and hooks crash ("Cannot read properties of
      // null (reading 'useMemo')"). The server build keeps Next's own React
      // resolution (aliasing it there breaks production page-data collection).
      config.resolve.alias = {
        ...config.resolve.alias,
        react: appReactDir,
        "react-dom": appReactDomDir,
        // Collapse the duplicate @apollo/client copies (see appApolloDir above)
        // to one, so the provider and useQuery share a single ApolloContext.
        "@apollo/client": appApolloDir,
        // Some `~/types/*` modules (nexus GraphQL type defs) are imported by
        // client pages for an incidental util (e.g. computePeriodStatus). nexus
        // statically pulls in `prettier`, whose ESM build imports Node builtins
        // (`module`, `v8`, ...) that don't exist in the browser. Production
        // tree-shakes the dead nexus/prettier code; `next dev` does not, so it
        // 500s. prettier is never needed client-side -> stub it to an empty
        // module. (Pre-existing import-boundary smell, surfaced by dev mode.)
        prettier: false,
      };
    }
    return config;
  },
};

export default nextConfig;
