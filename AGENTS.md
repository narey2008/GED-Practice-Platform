# GED Practice Platform

This is a Node.js + Express backend with a vanilla JavaScript frontend.

Frontend:
- Main file: frontend/index.html
- Do not convert to React, Vue, Next.js, Vite, or another framework.

Backend:
- Main file: backend/server.js
- Question generators are in backend/generators/

Rules:
- Make small targeted changes.
- Do not rewrite the whole app.
- Preserve test mode, practice mode, learning mode, profile, goals, history, support, and auth flows.
- When changing question generators, keep tags aligned with backend/generators/testBuilder.js.
- Keep the Main Menu "Known Bugs / In Progress" block current: when a user-facing bug is found, consider adding/updating an item; when fixed, remove or revise it. Keep entries short, professional, user-friendly, and never include sensitive/security or internal-only implementation details.

Run locally:
cd backend
npm install
node server.js