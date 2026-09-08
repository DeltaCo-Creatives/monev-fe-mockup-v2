# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint (config in `.oxlintrc.json`)

No test suite exists in this project.

## What this is

Monev ("monitoring & evaluasi") is a mockup web app for tracking school (SMP) revitalization survey progress, built for a school project. It's a client-only React + Vite SPA with no backend — all data lives in local JSON files and in-memory React state seeded from them (`src/App.jsx`). There is no persistence: edits made in the UI are lost on reload.

## Architecture

**Role-based UI split**: `App.jsx` holds the top-level state (`role`, `categoriesData`, `schoolsData`) and renders one of two entirely separate page trees depending on `role`:
- `pejabat` (official/reviewer) → `src/pages/PejabatFramework.jsx` — dashboards, charts (via `recharts`), category management, school status review/detail views.
- `petugas` (field officer) → `src/pages/PetugasFramework.jsx` — wraps `SurveyWizard`, the data-entry flow for submitting a survey.

All shared state (`categoriesData`, `schoolsData`, and their setters) is passed down as props from `App.jsx` through the Framework pages into components — there is no context or store. When adding features that touch this data, trace the prop chain rather than assuming a global store exists.

**Data model** (`src/data/`):
- `categories.json` — survey "programs"/categories (e.g. a specific revitalization batch), each with `stats` (totalSchools, completedSurveys, pendingSurveys, issuesReported) and `menuOptions` (checklist items surveyed for that category).
- `mock_schools_progress.json` — per-school survey records (`npsn`, `nama`, `provinsi`, `kabupaten`, `categoryId` linking to a category, `status`: `Selesai`/`Proses`/`Belum`/`Kendala`, `petugas`, `kendala`).
- `schools.json` — raw master list of schools, generated from the CSV dataset at the repo root via `convert.py` (a one-off conversion script with a hardcoded local path from its original author's machine — treat it as a reference, not a runnable script, unless the paths are updated first).

Category `stats` counters are updated manually alongside `schoolsData` mutations (see `handleStatusChange` in `PejabatFramework.jsx`) — they are not derived/recomputed from `schoolsData`, so any new code path that changes a school's status must update both in tandem.

**Survey wizard** (`src/components/SurveyWizard/`): a 4-step flow — `Step1SchoolSearch` → `Step2CategorySelect` → `Step3Form` → `Step4Success` — orchestrated by `SurveyWizard.jsx`, which owns the wizard's step state and assembles the final school/survey record.

**Shared UI shell**: `Layout.jsx`, `Header.jsx`, `Sidebar.jsx` wrap both Framework pages and receive `role`/`setRole`/`debugMode` for role switching and a debug toggle.

**Styling**: plain CSS files co-located per component/page (no CSS-in-JS, no Tailwind).
