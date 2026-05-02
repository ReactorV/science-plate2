# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
yarn dev        # Start development server
yarn build      # Production build
yarn lint       # Lint with oxlint (fast Rust-based linter, not ESLint)
yarn format     # Format with Prettier
```

No test runner is configured in this project.

## Architecture

**Next.js 16.2.4** with the App Router. This is a major version beyond training data — read `node_modules/next/dist/docs/` before writing Next.js-specific code and heed deprecation notices.

**Stack:**
- React 19.2.4 with the React Compiler enabled (`reactCompiler: true` in `next.config.ts`) — manual memoization (`useMemo`, `useCallback`, `memo`) is largely unnecessary
- `@tanstack/react-query` v5 for server-state / data fetching
- `zustand` v5 for client-side state
- CSS Modules for component styles; `typescript-plugin-css-modules` provides type-safe class name imports
- Path alias: `@/*` → `src/*`

**Source layout:** `src/app/` uses the App Router file conventions (`layout.tsx`, `page.tsx`, route segments as directories).
