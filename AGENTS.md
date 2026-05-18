# GED Practice Platform — Codex Instructions

This is a GED Mathematical Reasoning practice platform.

## Stack

Backend:
- Node.js + Express
- MongoDB Atlas with Mongoose
- JWT authentication
- Main backend file: backend/server.js
- Question generators: backend/generators/

Frontend:
- Vanilla JavaScript single-page app
- Main frontend file: frontend/index.html
- Chart.js loaded by CDN
- Do not convert to React, Vue, Next.js, Vite, or another framework.

## Rules

Make small, targeted changes.

Do not rewrite the app.

Do not break:
- full test mode
- practice mode
- learning mode
- profile UI
- goals system
- test history
- practice history
- support/contact system
- auth/account flows
- chart rendering
- diagram rendering
- hotspot rendering
- drag/drop rendering
- fill-in answers

When editing frontend/index.html:
- Search for the existing function/block first.
- Modify only the needed section.
- Avoid broad rewrites.

When editing question generators:
- Keep skill, subskill, and topic tags aligned with backend/generators/testBuilder.js.
- Make sure focused practice does not generate off-category questions.

## Local run

Rules:
- Make small, targeted changes.
- Do not rewrite the whole app.
- Preserve test mode, practice mode, learning mode, profile, goals, history, support, and auth flows.
- When changing question generators, keep tags aligned with backend/generators/testBuilder.js.
- Keep the Main Menu "Known Bugs / In Progress" block current: when a user-facing bug is found, consider adding/updating an item; when fixed, remove or revise it. Keep entries short, professional, user-friendly, and never include sensitive/security or internal-only implementation details.

Run locally:
=======
From the repo root:
```bash
cd backend
npm install
node server.js