# CoreKaya Pilates Labs

## Overview

CoreKaya Pilates Labs is a mobile-first web app for customers who purchased CoreKaya Pilates equipment. It features a weekly workout schedule, a labs browser, a shop, and an AI Coach powered by Gemini.

pnpm workspace monorepo using TypeScript.

## Artifacts

- **artifacts/corekaya-app** — React + Vite frontend (port from `PORT` env). Main mobile-first app. PreviewPath: `/`
- **artifacts/api-server** — Express 5 API server (port from `PORT` env). PreviewPath: `/api`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (v3, `import { z } from "zod"`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (ESM bundle for api-server)
- **AI**: Gemini via `@workspace/integrations-gemini-ai` (model: gemini-2.0-flash)

## Database Schema (lib/db/src/schema/)

- **workoutsTable** — 9 workouts (Foundations Flow, Reformer Intensive, Spine Restore, etc.)
- **productsTable** — 10 products (Classic Reformer, Cadillac Tower, accessories, bundles)
- **schedulesTable** — Weekly schedule (Mon-Sun, each day has nullable workout ID FK)
- **userStateTable** — Per-session state (streak, last workout date)
- **userFavoritesTable** — Per-session favorite workout IDs
- **userWishlistTable** — Per-session wishlist product IDs
- **userCompletedWorkoutsTable** — Per-session completed workout history
- **quotesTable** — Quote requests from customers

## Frontend Pages (artifacts/corekaya-app/src/pages/)

- **HomeTab** — Weekly Drop dashboard: calendar strip, today's workout, wishlist, favorites
- **LabsTab** — Filterable workout grid
- **ShopTab** — Product grid with category filtering
- **AiCoachTab** — Concierge mode (Q&A + daily insight) and Instructor Mode (session planner)
- **Player** — Full-screen workout player (state-based, not a route)
- **admin/** — Admin dashboard (password: corekaya2025): overview, workouts CRUD, products CRUD, quotes, schedule editor

## Color Palette

- navy: `#1B2A4A`
- orange: `#E8734A`
- sand: `#F5F0E8`
- charcoal: `#2D3748`

Use `className="bg-navy text-white"` etc. in Tailwind (defined in `@theme` block in index.css).

## API Routes (artifacts/api-server/src/routes/)

- `GET/POST /api/workouts` — list/create workouts
- `GET/PATCH/DELETE /api/workouts/:id` — individual workout ops
- `GET/POST /api/products` — list/create products
- `GET/PATCH/DELETE /api/products/:id` — individual product ops
- `GET /api/schedule/current` + `PUT /api/schedule/current` — weekly schedule
- `GET/POST /api/user/favorites` — toggle workout favorites
- `GET/POST /api/user/wishlist` — toggle product wishlist
- `GET/POST /api/user/progress` — streak + complete workout
- `GET/POST /api/quotes` — quote requests
- `PATCH /api/quotes/:id` — update quote status
- `GET /api/admin/stats` — dashboard stats
- `POST /api/ai/wellness-tip` — AI wellness tip (Gemini)
- `POST /api/ai/ask` — AI coach Q&A (Gemini)
- `POST /api/ai/session-plan` — AI session planner (Gemini)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `tsx artifacts/api-server/src/seed.ts` — seed the database with 9 workouts + 10 products + schedule

## Notes

- **Zod import**: Must use `import { z } from "zod"` (not `zod/v4`) because the workspace uses Zod v3
- **@google/genai**: Must be in `artifacts/api-server/package.json` dependencies because it's externalized by esbuild but still needs to be resolvable at runtime
- **User sessions**: All user state (favorites, wishlist, progress) uses session ID from `x-session-id` header, defaulting to `session-default`
- **Admin password**: `corekaya2025` (stored in localStorage as `adminAuth: "true"`)
