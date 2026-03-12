# Session notes (for next time)

Summary of what was built in this thread so you can pick up where you left off.

**Last session:** Added experimental “Import from URL” (fetch + parse job page → pre-fill add form) and styled “To apply” list rows lighter with a left border so they stand out.

## Project: Application Tracker

- **Location:** `WebstormProjects/application-tracker`
- **GitHub:** `eob-pro/application-tracker` (pushed via SSH)
- **Stack:** Vanilla JS (primary) + React in `src/`; localStorage; high-contrast dark theme (black bg, off-white text)

## What's in the repo

| Path | Purpose |
|------|--------|
| `index.html` | Main app (vanilla JS) — tabs: List, Add, Companies; Add tab includes “Import from URL” (experimental) |
| `css/index.css` | Styles (dark theme, tag styles including `.tag.link` for posting URL) |
| `js/app.js` | All app logic, add/edit/delete, filter, import, company merge, datalists |
| `parse-pdf.html` | Upload job-history PDF → parse by date + job lines → download JSON |
| `data/backfill.json` | Parsed backfill from “job history 3:11 import.pdf” (184 apps) |
| `import-now.html` | One-click import: embeds backfill, merges into localStorage, redirects to tracker |
| `bulk-mark-not-hired.html` | One-time page: marks listed jobs as “not hired” in localStorage |
| `bulk-date-2026.html` | One-time page: rewrote 2025 dates to 2026 in applications (already run) |
| `src/` | React/Vite version (same schema, same dark CSS) |
| `TODO.md` | Todo list (currently empty) |
| `.cursor/rules/environment.mdc` | Cursor rule: MacBook Air, Safari for auth, port 8080 for localhost |

## Data model (localStorage)

- **application-tracker-applications** — array of apps: company, position, scope, jobId, status, statusHistory, sourceId, originalListingDate, **originalPostingUrl**, atsSystem, resumeVersion, coverLetterUsed, customCoverLetter, customResume, **endedAt**, createdAt, updatedAt.
- **application-tracker-companies** — unique company names (index for add-form datalist). **Uniqueness is by lowercased name;** case variants (e.g. Disney / disney) are merged to one canonical spelling (most frequent in apps). Migration `mergeCompaniesByCase()` runs on load.
- Statuses: to_apply | applied | screened | interviewed | not_hired. Each status change has a timestamp in `statusHistory`.

## UI and behavior

- **Tabs:** List | Add | Companies. List shows applications; Add has form + import; Companies shows A–Z list of companies applied to.
- **List sort:** Applications sorted by applied date descending (newest first). Uses more horizontal viewport.
- **Applied date:** Add and edit forms include an "Applied date" field so you can set or change when you applied; this updates the first status-history date used for sorting and display.
- **End date:** Optional “End date” (endedAt) per application (e.g. when notified not hired); in add/edit forms and list.
- **Original posting URL:** Optional URL per application; add/edit forms; in list, shown as a “Posting” link tag (`.tag.link`).
- **Resume version & cover letter:** Add and edit forms have **datalists** populated from previously used values (getResumeVersions / getCoverLetterValues; fillResumeVersionDatalist / fillCoverLetterDatalist).
- **Import from URL (experimental):** On Add tab, paste a public job URL → “Fetch & parse” fetches via CORS proxy (api.allorigins.win), parses HTML for JSON-LD JobPosting (title, hiringOrganization, identifier, datePosted) and fallbacks (og:title, og:site_name, h1, data-job-id), then pre-fills the add form. User reviews and submits.
- **“To apply” emphasis:** List rows with status `to_apply` get class `application-item--to-apply`: lighter background (#1c1c1c) and left border accent (#6b7280) so they stand out; other statuses unchanged.

## ATS / recruiting system options

In `js/app.js` and `src/schema.js`: Teamworks, Greenhouse, Workday, Lever, **Rippling**, iCIMS, Taleo, **Company site**, Other.

## One-time / backfill flows (already run or available)

1. **Import backfill:** Open `import-now.html` → merges `data/backfill.json` (from PDF) into localStorage → redirects to `index.html`.
2. **Bulk “not hired”:** Open `bulk-mark-not-hired.html` → matches listed jobs by date+company+position → sets status to `not_hired` and appends to statusHistory → redirects to tracker.
3. **Bulk 2025→2026 dates:** Open `bulk-date-2026.html` (one-time) to rewrite 2025 dates to 2026 in applications.

## Git / GitHub

- Remote: `git@github.com:eob-pro/application-tracker.git` (SSH).
- SSH key: account-level key (e.g. `~/.ssh/id_ed25519_github`). **Not** as a repo deploy key — deploy key caused “permission denied to deploy key” until key was on account and SSH config used `IdentitiesOnly yes`.
- To avoid re-entering passphrase: add key to agent with `ssh-add --apple-use-keychain ~/.ssh/id_ed25519_github`; in `~/.ssh/config` for `Host github.com` use `AddKeysToAgent yes` and `UseKeychain yes`.
- Normal update: `git add .` → `git commit -m "..."` → `git push origin main`.

## User environment (for AI context)

Stored in `.cursor/rules/environment.mdc`: MacBook Air, Safari for authenticated websites, port **8080** for localhost.

## Possible next steps

- Add more sources/ATS in `js/app.js` (and `src/schema.js` if using React).
- Refine parse-pdf.html if PDF layout changes.
- Add applied-date field to the React version in `src/` if desired.
