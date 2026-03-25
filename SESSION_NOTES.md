# Session notes (for next time)

Summary of what was built in this thread so you can pick up where you left off.

**Last session (wrap-up):** **Company stats** tab; Summary metrics (**Screened or interviewed**, **Avg time to close**); add-form UX (URL + Import, ATS under URL, defaults, single-line dates, position/scope row, location+attendance row, source at bottom, end date auto on not hired/closed); **ATS from URL** (static + learned history); **LinkedIn Easy Apply** ATS option; `apple-touch-icon.png`; desktop session log `cursor-sessions/session-2026-03-17.md`. User runs app at `http://localhost:8080/index.html` (Python `http.server` on 8080).
## Project: Application Tracker

- **Location:** `WebstormProjects/application-tracker`
- **GitHub:** `eob-pro/application-tracker` (pushed via SSH)
- **Stack:** Vanilla JS (primary) + React in `src/`; localStorage; high-contrast dark theme (black bg, off-white text)

## What's in the repo

| Path | Purpose |
|------|--------|
| `index.html` | Main app (vanilla JS) — tabs include List, Add, Companies, Company stats, Summary, Today’s summary; Add: posting URL is 3rd field with **Import from URL** beside it, **ATS** directly under; default status Applied; applied date defaults to today; **Today** on date fields; no original listing date on add |
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

- **application-tracker-applications** — array of apps: company, position, scope, jobId, status, statusHistory, sourceId, originalListingDate, **originalPostingUrl**, atsSystem, **location**, **attendancePolicy**, resumeVersion, coverLetterUsed, customCoverLetter, customResume, **endedAt**, createdAt, updatedAt.
- **application-tracker-companies** — unique company names (index for add-form datalist). **Uniqueness is by lowercased name;** case variants (e.g. Disney / disney) are merged to one canonical spelling (most frequent in apps). Migration `mergeCompaniesByCase()` runs on load.
- **application-tracker-locations** — unique location names (used to power the location datalist; seeded with “New York City” and “Los Angeles Metro”, then extended from apps).
- Statuses: to_apply | applied | screened | interviewed | not_hired | **closed**. Each status change has a timestamp in `statusHistory`.

## UI and behavior

- **Tabs:** List | Add | Companies | **Company stats** | **Summary** | **Today's summary**. Company stats = per-company applied / responded / not hired / closed table. Summary = metrics (incl. screened-or-interviewed, avg time to close), chart, Export local data. Today's summary = applied-today (ET) list.
- **List sort:** Applications sorted by applied date descending (newest first). Uses more horizontal viewport.
- **Applied date:** Add and edit forms include an "Applied date" field (add defaults to **today**); **Today** buttons set any date field to the current local date. Updates first status-history date used for sorting and display.
- **End date:** Optional “End date” (endedAt); on add/edit it sits **next to** applied date. Shown in list. Choosing status **Not hired** or **Closed** sets end date to **today** by default (still editable).
- **Original listing date:** Not on add/edit forms; still stored if present on imported/legacy records and may show as “Listed:” tag in list.
- **Original posting URL:** Optional URL per application; add/edit forms; in list, shown as a “Posting” link tag (`.tag.link`). **ATS auto-detect:** typing/pasting URL or **Import from URL** sets ATS when the host matches known patterns (Workday, Greenhouse, Lever, iCIMS, Taleo, Avature, Rippling, Teamworks, Oracle Cloud / some Oracle job paths) or when past saved applications with the same hostname had an ATS recorded (majority vote; walks up parent domains).
- **Location:** Add and edit forms include a **Location** text + datalist field. The datalist is seeded with “New York City” and “Los Angeles Metro” and grows as you add new locations; location is displayed inline in the list.
- **Attendance policy:** Add form: **Attendance policy** select on the **same row** as **Location** (after Job ID in field order). Options: —, Hybrid, Remote, In-person; shown as a tag in the list. **Source** alone at bottom before Submit.
- **Resume version & cover letter:** Add and edit forms have **datalists** populated from previously used values (getResumeVersions / getCoverLetterValues; fillResumeVersionDatalist / fillCoverLetterDatalist).
- **Import from URL (experimental):** On Add tab, paste a public job URL → “Fetch & parse” fetches via CORS proxy (api.allorigins.win), parses HTML for JSON-LD JobPosting (title, hiringOrganization, identifier, datePosted) and fallbacks (og:title, og:site_name, h1, data-job-id), then pre-fills the add form. User reviews and submits.
- **“To apply” emphasis:** List rows with status `to_apply` get class `application-item--to-apply`: lighter background (#1c1c1c) and left border accent (#6b7280) so they stand out; other statuses unchanged.
- **Summary tab:** **Funnel** table — stages from all applications through waiting, responded, ever screened/interviewed, any terminal (not hired or closed), then split **→ Not hired** and **→ Closed**; columns: Apps, % of all apps, Companies, % of all companies (`companyKey`). **Timing** row below: avg age of open apps, avg time to close, open within avg close period. Per-day chart + Export local data unchanged.
- **Export local data:** On the Summary tab, **Export local data** downloads a JSON snapshot of `applications`, `companies`, and `locations` (`localdata-backup-YYYYMMDD.json`) that you can move into `localdata/` and commit. If the button doesn't respond in normal Safari, allow downloads for the site (Safari → Settings for This Website) or use a Private window.
- **Today's summary tab:** Shows today's date in ET, total count of applications whose "Applied" status falls on today (ET), and a bullet list of Company — Role descending by time applied (getAppliedToday; date comparison via America/New_York).

## ATS / recruiting system options

In `js/app.js` and `src/schema.js`: **Avature**, Teamworks, Greenhouse, Workday, Lever, **LinkedIn Easy Apply**, **Rippling**, iCIMS, **Oracle**, Taleo, **Company site**, Other.

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
- Add richer summary visualizations or filters (e.g. breakdown by location, attendance policy, or ATS) if needed.
