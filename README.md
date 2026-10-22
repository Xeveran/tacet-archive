# Tacet Archive — Wuthering Waves Planner

Tacet Archive is a dark, responsive, local-first Wuthering Waves companion site. It is a static HTML/CSS/JavaScript project that can be hosted directly on GitHub Pages — no build step, backend, sign-in, or API key is needed.

## Features

- Dashboard with account overview, Resonator roster, weapon counts, daily checklist, and build queue
- Resonator roster with current/target levels, Resonance Chains, element, weapon type, role, and calculated materials
- Weapon tracker with a catalog of weapons, rarity/type, assigned Resonator, current/target level, and calculated materials
- Collective Build Planner that merges all included Resonator and Weapon requirements by item and shows which builds need each item as icon tiles
- Material inventory for EXP materials, ascension materials, local specialties, currencies, and weapon upgrade materials; owned quantities are deducted from the Build Planner totals
- Breakpoint-based requirements for levels 1, 20, 40, 50, 60, 70, 80, and 90
- Daily and weekly routine tracker with reset controls
- Optional progress/note queue for Forte or other goals
- JSON export/import for backup and moving data between browsers
- Responsive desktop, tablet, and mobile layouts
- Saves to the current browser's `localStorage`

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload **all four application files** — `index.html`, `styles.css`, `game-data.js`, and `app.js` — plus this `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, then select the default branch and `/(root)`.
5. Save. GitHub Pages will provide the site URL after deployment completes.

No `npm install`, bundler, GitHub Actions workflow, or server is needed. Google Fonts are optional; system fonts are used as a fallback.

## Data and calculations

The bundled Resonator, Weapon, item, EXP, and level cost reference data was extracted from the supplied **Wuthering Waves - Planner.xlsx** workbook. All calculations happen in your browser. The planner calculates level EXP materials, leveling Shell Credits, and level ascension requirements up to each selected target. It does **not** calculate Forte/skill-upgrade material requirements yet, and it does not connect to your game account. The supplied workbook has some weapon catalog rows without ascension-material families; for those entries, the app shows a warning and calculates EXP and Shell Credits only. Custom weapon names that do not match the workbook catalog have the same limitation. Check costs against the current in-game version before farming, especially as patches change game data.

The collective planner sums required quantities across included Resonators and Weapons. Each material tile shows its total requirement, inventory count, remaining amount, and icons for every tracked build that needs the item. You can turn a Resonator or Weapon off for planning from its edit dialog.

## Data and backups

Data is stored locally in the browser/device being used. Choose **Settings & data → Export JSON** (or the download icon in the header) to back it up, then use **Import JSON** to restore it elsewhere. Data is not synced between devices. The app can migrate the first-version saved roster and discard the now-removed Echo Vault/Convene Log fields when loading or importing an older Tacet Archive backup.

## Important notes

- This is a fan-made planner, not an official Wuthering Waves app and not affiliated with Kuro Games.
- Starter Resonators, weapons, currency counts, and build goals are sample data; edit them to match your account.
- The material inventory is manual; changing an inventory count updates the Build Planner's remaining quantities.
- Clearing browser storage clears the local archive unless you have a JSON backup.
