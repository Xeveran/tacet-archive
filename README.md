# Tacet Archive — Wuthering Waves Planner

A dark, responsive, local-first companion site for organizing Wuthering Waves Resonators, build goals, Echoes, Convene pity, daily activities, and resource counts. It is a static HTML/CSS/JavaScript project that can be hosted directly on GitHub Pages — no build step, server, account, or API key is required.

## Features

- Dashboard with account overview, roster preview, daily checklist, and build queue
- Resonator roster with editable level, Resonance Chain, element, weapon, role, and build status
- Starter Resonator catalog plus support for custom entries
- Build goal queue with progress, category, status, and notes
- Echo vault with sets, cost, main stat, substats, assignments, and lock/reserve flag
- Manual Convene tracker for featured Resonator, featured Weapon, and Standard Convene
- Daily and weekly routine tracker with reset controls
- Editable resource ledger
- JSON export/import for backup and moving data between browsers
- Responsive desktop, tablet, and mobile layouts
- Saves to the browser's `localStorage`

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and this `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, then select your default branch and `/ (root)`.
5. Save. GitHub Pages will provide the site URL once deployment completes.

No `npm install`, bundler, or GitHub Actions workflow is needed. The app uses Google Fonts when the network is available and falls back to system fonts otherwise.

## Data and backups

The app automatically saves to local storage for the browser/device where it is being used. For a backup, choose **Settings & data → Export JSON** (or the download icon in the header). To restore it on another browser, use **Import JSON**. The site does not sync data between devices or to a server.

## Important notes

- This is a fan-made planner, not an official Wuthering Waves app and not affiliated with Kuro Games.
- Seed roster/resource/goals are sample data to make the interface usable on first launch. Edit or remove them to match your account.
- Convene counters, resource counts, Echo stats, and goal progress are manual notes. They are not imported from the game or validated by an authoritative game API.
- The catalog is a starter reference, not a guarantee of exhaustive or perfectly current game data. You can add custom Resonator entries as needed.
- Clearing browser storage clears the local archive unless you have a JSON backup.
