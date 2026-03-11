# Application Tracker

A local job application tracker built with React (JSX) and Vite. Data is stored in the browser via `localStorage`.

## Features

- Add applications with company, role, date applied, status, and notes
- Filter by status: All, Applied, Interviewing, Offer, Rejected
- Edit and delete applications
- Persists in the browser (no backend required)

## Setup

```bash
cd application-tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run preview` — preview production build

## GitHub

This project is set up to live in the GitHub repo **application-tracker**.

1. **Create the repo on GitHub** (if you haven’t already):  
   [github.com/new](https://github.com/new) → name it `application-tracker` → Create repository (no need to add README or .gitignore).

2. **Initialize git and push** (run from the project folder):

```bash
cd /Users/cuchulainn/WebstormProjects/application-tracker
git init
git add .
git commit -m "Initial commit: application tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/application-tracker.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username (e.g. `cuchulainn` if that’s your GitHub user).
