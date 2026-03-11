# Application Tracker

A local job application tracker built in **vanilla JavaScript**. Data is stored in the browser via `localStorage`. No build step required.

## Features

- **Company** (unique index), **position**, **scope**, **job ID**, **status** (to apply → applied → screened → interviewed → not hired) with **date stamps** per status change
- **Source** (LinkedIn, The Ladders, Indeed, Teamworks, Glassdoor, Lensa), **original listing date**, **ATS** (Teamworks, Greenhouse, Workday, etc.)
- **Resume version** and **cover letter used** (free text), **custom resume** / **custom cover letter** (checkboxes)
- Filter by status, edit and delete applications
- Persists in the browser (no backend required)

## Run the app (vanilla JavaScript)

Open `index.html` in your browser (double-click or drag into a browser). For best results use a local server to avoid CORS with `file://`:

```bash
cd application-tracker
npx serve .
# or: python3 -m http.server 8000
```

Then open [http://localhost:3000](http://localhost:3000) (or the URL shown).

## React (Vite) version

The React/JSX version is in `src/`. To run it:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

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
