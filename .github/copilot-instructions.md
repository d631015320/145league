# GitHub Copilot / Agent Instructions for league-app

Quick, actionable guidance to help AI agents be productive in this repository.

## Big picture
- Frontend: React + Vite (see `package.json` scripts: `web`, `dev`, `build`, `preview`). UI entry is `src/main.jsx` and app shell is `src/App.jsx`.
- Desktop shell: Electron wrapper under `electron/` (CJS files). Desktop app loads dev server at `http://localhost:5173` in dev and `dist/index.html` in production. Key files: `electron/main.cjs`, `electron/preload.cjs`.
- Backend: Firebase used for auth and Firestore reads/writes. Config and exported helpers live in `src/lib/firebase.js`.

## Key developer workflows
- Dev desktop (hot reload + electron): `npm run dev` — runs Vite + waits on it and spawns Electron. Note: `electron/*` files must be `.cjs` due to `type: module` in `package.json`.
- Web (browser only): `npm run web` — runs Vite dev server.
- Build for production web: `npm run build` then for desktop the packaged electron should load `dist/index.html` (packaging is not in repo scripts).
- Linting: `npm run lint` uses ESLint configured in repo.

## Conventions & patterns (project-specific)
- Mixed Module Types: repository uses ESM for most code (`type: module`), but Electron main/preload are CommonJS (`.cjs`). When adding new Electron files, use `.cjs`.
- Electron scaffolding: `electron/main.cjs` (window creation), `electron/preload.cjs` (contextBridge API exposed to renderer).

## Files to inspect when changing behavior
- UI: `src/components/*` and `src/charts/*` for visualization patterns.
- Tab pages: `src/components/tabs/` contains Dashboard, Leaderboard, MatchHistory, NewGameForm, Settings.
- Firebase usage: `src/lib/firebase.js` — exported helpers are re-used elsewhere; treat Firebase config as sensitive.

## Safety, environment, and gotchas
- Secrets: `src/lib/firebase.js` contains Firebase config; avoid committing additional private keys or service accounts. Treat Firestore rules and API keys carefully.
- Electron modules: because the project is ESM by default, Electron main and preload must be `.cjs` to run correctly.

## Examples to reference in PRs / patches
- Add new IPC channel: follow pattern in `electron/main.cjs` and expose functions via `electron/preload.cjs`, then use `window.electronAPI` in renderer.

---
If any of the sections above are unclear or you'd like domain-specific examples, tell me which part to expand and I will iterate. ✅
