# BrowserDashboard

A minimalist, highly functional browser dashboard built with React and Vite. Features a clean dark theme, custom clock/calendar, and a dedicated credentials manager.

## Features

### 🏠 Dashboard
*   **Minimalist Design:** Dark theme with purple accents (`#bb86fc` / `#7c4dff`) and "Outfit" font.
*   **Smart Search:**
    *   Multiline input (Shift+Enter expands).
    *   Direct URL navigation (e.g., `youtube.com` goes to site).
    *   Default Google Search integration.
    *   No distractions (spellcheck/autocorrect disabled).
*   **Clock & Calendar:**
    *   Real-time clock with styled AM/PM.
    *   Interactive Calendar popup (hover to peek, click to pin).
    *   "Today" highlight.

### 🔐 Credentials Manager (`/creds`)
*   **Searchable Grid:** Filter credentials by service name or tags.
*   **Detail View:** Modal popup to view full credential data.
*   **Secure Layout:** Designed for privacy and ease of access.
*   *(Currently using Mock Data - Backend in progress)*

## Tech Stack
*   **Frontend:** React, Vite
*   **Styling:** CSS Modules, CSS Variables (Theming), Flexbox/Grid
*   **Font:** Outfit (via `@fontsource`, offline-ready)

## Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/sarthak23j/BrowserDashboard.git
    cd BrowserDashboard
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
    Open `http://localhost:1337` in your browser.

## Roadmap
- [ ] Backend Implementation (Node.js + SQLite) for Credentials.
- [ ] "Add Credential" Form.
- [ ] Weather Widget.
- [ ] Customizable Quick Links.

## License
MIT
