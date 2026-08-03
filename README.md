# catstats

A light dashboard to track a cat's feeding schedule and monitor trends. Built with
Next.js and Prisma (SQLite), designed to run locally or in a small Docker container
on a home NAS.

## Features

- **Main page** — pick a cat from a dropdown, view a bar chart of the day's
  feedings broken out by meal slot (Overnight, Breakfast, Lunch, Dinner,
  Evening), step through past days with a date selector, overlay the previous
  day's amounts for comparison, and overlay a historical average trend line.
  Below the chart: a running total in mL, an estimated calorie range
  (1–1.5 cal/mL), an editable notes field for the day, and a quick "log a
  meal" input that adds to whatever's already logged for the current slot.
- **Audit log** — every feeding record in one chronological list (most
  recently updated first), with inline edit (quantity and cat only) and
  delete.
- **Admin page** — create, rename, and delete cats (deleting a cat is
  irreversible and wipes all of its feeding history and notes); manually back-fill
  a meal for any cat/day/slot; and a "reset all data" control that requires
  typing an exact confirmation phrase before wiping the database.

Feeding quantities are stored in milliliters. Each feeding is keyed by
`(cat, day, meal slot)` — logging again for a slot that already has an entry
adds to the existing amount rather than creating a duplicate row.

## Development

```bash
npm install
npm run dev          # start the dev server (Turbopack) at http://localhost:3000
```

Other useful commands:

```bash
npm run build              # production build
npm run lint                # ESLint
npx tsc --noEmit             # type-check without emitting
npx prisma migrate dev --name <description>   # apply a schema change
npx prisma studio             # browse/edit the SQLite database in a GUI
```

The SQLite database file lives at the project root (`dev.db`, gitignored) and
is configured via `DATABASE_URL` in `.env`.

## Deployment

The app also runs in a Docker container for home NAS / self-hosting. The
container exposes the app on **port 9090** and expects the SQLite database
directory to be bind-mounted so data survives container restarts.

```bash
docker compose up -d --build
```

This builds the image, starts the container, and persists the database to
`./data/catstats.db` on the host (see `docker-compose.yml`). On startup the
container runs `prisma migrate deploy` against the mounted database before
the server starts, so schema updates apply automatically on restart.

Meal time-of-day slots (Overnight/Breakfast/Lunch/Dinner/Evening) and day
boundaries are resolved using the container's local time, so set the `TZ`
environment variable to your local IANA timezone (e.g. `America/Chicago`)
in `docker-compose.yml` or via `docker run -e TZ=...` — otherwise feedings
logged near a slot boundary may land in the wrong bucket. Defaults to
`America/Chicago` if unset.

To build and run without compose:

```bash
docker build -t catstats .
docker run -d -p 9090:9090 -v $(pwd)/data:/data catstats
```

### Pulling the pre-built image

A GitHub Actions workflow (`.github/workflows/docker-publish.yml`) builds and
publishes a multi-arch (`linux/amd64`, `linux/arm64`) image to the GitHub
Container Registry on every push to `main` and on version tags (`vX.Y.Z`).
No local build is required on the NAS:

```bash
docker run -d -p 9090:9090 -v $(pwd)/data:/data \
  ghcr.io/thetechnoweenie/catstats:latest
```

Or point `docker-compose.yml`'s `build: .` at `image:
ghcr.io/thetechnoweenie/catstats:latest` instead to use `docker compose pull`
+ `docker compose up -d` for updates. Available tags: `latest` (tip of
`main`), `<version>`/`<major>.<minor>` (from git tags), and the short commit
SHA.

## A note on how this was built

This project — including a fair amount of the application code, the Docker
setup, and this README — was built with heavy assistance from AI (Claude).
It's a personal/home project, so take that as context rather than a warning,
but if you're reviewing, forking, or relying on this code, it's worth knowing
it wasn't entirely hand-written and reviewing the parts that matter to you
before trusting them.
