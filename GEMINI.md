# GEMINI.md - Project Context & Reference

## Project Overview
**Name:** FirefoxDashboard
**Goal:** A minimalist, local-first browser dashboard with clock, search, and credential management.
**Stack:** React (Vite), CSS Modules/Variables, Node.js.

## Current State
- **Frontend:**
  - **Layout:** Shared layout with `Clock`, `Background`, and `framer-motion` page transitions.
  - **Dashboard (`/`):** Greeting, multiline search bar, and navigation to credentials.
  - **Credentials (`/creds`):** Full CRUD functionality for encrypted credentials with search filtering and detail modals.
  - **Styling:** Dark theme with purple accents, "Outfit" font.
- **Backend:**
  - **Server:** Express 5.x server serving both the API and the built frontend.
  - **Database:** SQLite (`better-sqlite3`) for persistent storage.
  - **Security:** AES-256-GCM encryption for all credential data.
- **Production Readiness:**
  - Unified port (1337) for API and Frontend.
  - Production build workflow (`npm run full`).
  - Autostart capability via `start_dashboard.bat` or PM2.

## Tech Decisions
- **Port:** 1337 (Unified port for production).
- **Navigation:** `react-router-dom` with `Layout` wrapper.
- **State Management:** React state integrated with Backend REST API.
- **Routing:** Express 5 compatible routing (Note: Wildcard catch-all currently disabled for stability).

## Production & Automation
- **Single Command Start:** `npm run full` (Builds frontend and starts server).
- **Background Service:** Recommended usage with PM2 (`pm2 start server/index.js --name "dashboard"`).
- **Startup:** Windows startup shortcut to `start_dashboard.bat`.

## File Structure Highlights
- `server/index.js`: Main entry point, serves API and static files from `/dist`.
- `server/db.js`: Database initialization and schema.
- `src/Pages/Creds.jsx`: Primary interface for credential management.
- `start_dashboard.bat`: Helper for manual startup/automation.
