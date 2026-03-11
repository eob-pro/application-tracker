# Session notes (for next time)

Summary of what was built in this thread so you can pick up where you left off.

## Project: Application Tracker

- **Location:** `WebstormProjects/application-tracker`
- **GitHub:** `eob-pro/application-tracker` (pushed via SSH)
- **Stack:** Vanilla JS (primary) + React in `src/`; localStorage; high-contrast dark theme (black bg, off-white text)

## What’s in the repo

| Path | Purpose |
|------|--------|
| `index.html` | Main app (vanilla JS) |
| `css/index.css` | Styles (dark theme) |
| `js/app.js` | All app logic, add/edit/delete, filter, **Import from JSON** |
| `parse-pdf.html` | Upload job-history PDF → parse by date + job lines → download JSON |
| `data/backfill.json` | Parsed backfill from “job history 3:11 import.pdf” (184 apps) |
| `import-now.html` | One-click import: embeds backfill, merges into localStorage, redirects to tracker |
| `bulk-mark-not-hired.html` | One-time page: marks the user’s listed jobs as “not hired” in localStorage |
| `src/` | React/Vite version (same schema, same dark CSS) |

## Data model (localStorage)

- **application-tracker-applications** — array of apps (company, position, scope, jobId, status, statusHistory, sourceId, originalListingDate, atsSystem, resumeVersion, coverLetterUsed, customCoverLetter, customResume, etc.).
- **application-tracker-companies** — unique company names (index for add-form datalist).
- Statuses: to_apply | applied | screened | interviewed | not_hired. Each status change gets a timestamp in `statusHistory`.

## One-time / backfill flows (already run or available)

1. **Import backfill:** Open `import-now.html` → merges `data/backfill.json` (from PDF) into localStorage → redirects to `index.html`.
2. **Bulk “not hired”:** Open `bulk-mark-not-hired.html` → matches listed jobs by date+company+position → sets status to `not_hired` and appends to statusHistory → redirects to tracker.

## Git / GitHub

- Remote: `git@github.com:eob-pro/application-tracker.git` (SSH key `~/.ssh/id_ed25519_github`).
- If you need to fix remotes or auth, see this thread for: removing wrong remote, using PAT vs SSH, creating new SSH key and `~/.ssh/config` for GitHub.

## Possible next steps

- Add more sources/ATS in `schema.js` (or in `js/app.js` constants).
- Refine parse-pdf.html if PDF layout changes.
- Add export (e.g. CSV/JSON) from the tracker.
