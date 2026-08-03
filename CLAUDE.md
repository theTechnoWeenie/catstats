# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## About

catstats is a light dashboard to track a cat's feeding schedule and monitor trends.

## Design

The site should use a material design to display all elements in a clean simple look.
This site should work both on a desktop browser and phone app so the cat's feeding can be tracked on the go.  
There is no authorization on this application. 

### Data model

The feeding quantites should be in milliliters. 

Calories can be calculated as a range of 1 - 1.5 calories per 1 mL

Meals will be divided by time of day, and should be one of the following:

* Overnight - 12AM - 6:59AM
* Breakfast - 7AM - 10:59AM
* Lunch - 11AM - 3:59PM
* Dinner - 4PM - 8:59PM
* Evening - 9PM - 11:59PM

Meals should be associated with a day, and with a cat. 

This should all be stored in the sqlite database, and should have an index that allows for efficient data selection by cat and secondarily by day. 

### Views

There should be three views: 

* The Main Page
* The Audit Log Page
* The Admin Page 

These views are full described below


#### Main Page

This should be the main entry point to the application and should display the title "Cat Stats" 

There should be a "Cat" drop down to select which cat you are viewing and all inputs on the page should be related to this cat. Creation of a cat will be on the admin page, and the main page should display "add a cat to get started" when no cats are present.

There should be a graph with the current day so far displayed in a bar chart with a y axis for milliliters and the x axis should be the feeding time quantas described in the data model. 
The graph should have a date selector to display a previous day's data, and should have the ability to overlay yesterday's data on the graph along side of today's data via a toggle
The graph should also have the ability to toggle a trend line on that will use all the historical data from this cat. 

Below the graph there should be a summary of how much the cat has consumed in mL, the calorie estimate, and have an editable field for notes on the displayed day.

There should also be an input field for the quantity in mL of a recently administered meal which should then be diplayed on the graph when entered. This quantity should be entered as a the meal described in the data model by time of day. If this meal already has data for this day, add this quantity to the amount that was already there. 

#### Audit Log Page

This page should display a chronological order of all the meals by the last updated time. 
Each row should only contain 1 meal, the date, and the cat it is associated with. 
Each row should also have a delete and edit option. Delete should remove the row entirely, edit should only allow editing of quantity and cat values. 

#### Admin Page

This page should allow for creating, editing and deleting a cat. If a cat is deleted, it should also remove all associated data with that cat, and alert the user that this is not a reversible operation. 
This page should also have a place to manually input a meal with a date selector, quantity, and cat. 
This page should also include a "reset all data" button that will wipe the database entirely. This should require the user to type "yes delete my data" into a confirmation box before deleting the data. 


## Deployment

This application shoudl run both locally using the `npm run dev` command to test things out and also in a docker container that can be hosted on a NAS or equivalent for home labs. This container file should map in the file the directory that will contian the sqlite database so the database persists over restarts of the coaninter. The container should expose the application on port 9090.


## Commands

- `npm run dev` — start the dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `next/core-web-vitals` + `next/typescript`)
- `npx tsc --noEmit` — type-check without emitting
- `npx prisma migrate dev --name <description>` — create and apply a new migration after editing `prisma/schema.prisma`
- `npx prisma generate` — regenerate the Prisma Client into `src/generated/prisma` (runs automatically via `postinstall`; re-run manually after schema edits if the dev server doesn't pick it up)
- `npx prisma studio` — browse/edit the SQLite database in a GUI

There is no test suite yet.

## Architecture

Next.js App Router (`src/app`) + Prisma 7 with the `sqlite` provider, using the `better-sqlite3` driver adapter (Prisma 7 requires an explicit driver adapter — there is no implicit engine-based connection).

- `prisma/schema.prisma` defines two models: `Cat` and `Feeding` (a feeding belongs to one cat; `amount` + `unit` + `fedAt` capture what/when). The SQLite file lives at the project root (`dev.db`, gitignored), matching `DATABASE_URL="file:./dev.db"` in `.env`.
- Prisma Client is generated to `src/generated/prisma` (gitignored, regenerated via `postinstall`/`prisma generate`). **Import from `@/generated/prisma/client`, not `@/generated/prisma`** — the new `prisma-client` generator has no barrel `index.ts`; `client.ts` is the intended entry point.
- `src/lib/prisma.ts` builds the singleton `PrismaClient`, wiring it to `PrismaBetterSqlite3` from `@prisma/adapter-better-sqlite3` using `DATABASE_URL`. The adapter strips a leading `file:` prefix itself, so the raw env value can be passed straight through.
- `prisma.config.ts` (not `schema.prisma`) is where the CLI reads `DATABASE_URL` from — this is the Prisma 7 config-driven workflow, distinct from how the runtime client connects (via the adapter above).
- `src/app/page.tsx` is a server component that reads cats/feedings directly via the Prisma singleton (`export const dynamic = "force-dynamic"` — the dashboard is always live data, no caching) and renders `LogFeedingForm`, a client component that POSTs to `src/app/api/{cats,feedings}/route.ts` and calls `router.refresh()` to re-pull server data.
- API routes under `src/app/api/**/route.ts` do their own inline validation (no schema library) and return `NextResponse.json` with appropriate status codes — follow this pattern for new routes rather than introducing a validation dependency.

### Prisma 7 gotchas specific to this repo

- Any new SQL-touching code must go through the adapter in `src/lib/prisma.ts` — don't call `new PrismaClient()` bare, it requires an `adapter` (or `accelerateUrl`) argument and will fail to type-check.
- After changing `prisma/schema.prisma`, run `prisma migrate dev` (dev) — this both updates `dev.db` and regenerates the client.
- `.claude/skills/prisma-*` (installed by `prisma init`) has detailed skill docs for Prisma CLI usage, driver adapters, and the v7 upgrade path if something about the config-driven workflow is unclear.
