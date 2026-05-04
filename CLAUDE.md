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

- For slow client-side navigations: `Suspense` alone is not enough — you must also export `unstable_instant` from the route. Read `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.mdx` before making changes.

**Stack:**
- React 19.2.4 with the React Compiler enabled (`reactCompiler: true` in `next.config.ts`) — manual memoization (`useMemo`, `useCallback`, `memo`) is largely unnecessary
- `@tanstack/react-query` v5 for server-state / data fetching
- `zustand` v5 for client-side state
- CSS Modules for component styles; `typescript-plugin-css-modules` provides type-safe class name imports
- Path alias: `@/*` → `src/*`

**Source layout:** `src/app/` uses the App Router file conventions (`layout.tsx`, `page.tsx`, route segments as directories).

# Project Agent Pipeline

This project uses a 4-agent pipeline. Agents are invoked via slash commands.

## Pipeline Order
1. /architect — plans everything, creates feature folder and all spec artifacts
2. /coder     — implements based on arch-output.md and tasks.md
3. /tester    — writes and runs tests, produces test-output.md
4. /reviewer  — final quality gate, produces review.md

## Feedback Loops
- Loop A: tester writes test-failures.md → /coder fixes → re-run /tester only
- Loop B: reviewer writes review.md → /coder fixes → re-run /tester + /reviewer

## Artifact Location
All artifacts live in .specify/specs/<feature>/

## Constitution
Project principles live in .specify/memory/constitution.md
All agents read this before starting.

## Behavioral section
1. Don’t assume. Don’t hide confusion. Surface tradeoffs.
2. Minimum code that solves the problem. Nothing speculative.
3. Touch only what you must. Clean up only your own mess.
4. Define success criteria. Loop until verified.
