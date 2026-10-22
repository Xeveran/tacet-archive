# Tacet Archive — Wuthering Waves Planner

Tacet Archive is a dark, responsive, local-first Wuthering Waves companion app. It is a static HTML/CSS/JavaScript project that runs on GitHub Pages without a backend, build step, login, or API key.

The current interface includes page-specific Resonator/Weapon search, an overlay-dismissible mobile sidebar, wider three-column desktop edit forms, and an alphabetized Weapon catalog selector. Inventory search applies only to the upgrade-material groups, leaving the three pinned material groups visible.

## Features

- Readable, responsive dashboard and Resonator archive with image slots
- Weapon tracker with rarity/type, assignment, current and target levels, and image slots
- **Planner** that combines upgrade requirements across Resonators and Weapons and shows which builds need each item
- Compact, image-led inventory with owned counts deducted from Planner requirements
- Inventory groups for **Universal Currency**, **Resonator EXP Material**, **Weapon EXP Material**, **Free Materials**, **Waveplates Materials**, and other material categories
- Level selectors for `1`, `20`, `20◆`, `40`, `40◆`, `50`, `50◆`, `60`, `60◆`, `70`, `70◆`, `80`, `80◆`, and `90`
- JSON export/import and automatic saves to this browser's `localStorage`
- Editable account label and optional goals/notes

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload all project files and the `assets/` directory to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, then choose your main branch and `/(root)`.
5. Save. GitHub Pages will publish the site URL after deployment finishes.

There is no package installation or build step. Google Fonts are optional; local fallback fonts are available.

## Image files: where to put them

You can add transparent PNG artwork later. The app will automatically use an image when it finds the matching file; if no file exists, it displays the initials placeholder.

- Resonators: `assets/images/resonators/<slug>.png`
- Weapons: `assets/images/weapons/<slug>.png`
- Items/materials: `assets/images/materials/<slug>.png`

The filename is the visible in-app name converted to a lowercase slug: remove accents and apostrophes, replace spaces and punctuation with hyphens, and remove hyphens from the beginning/end. Examples:

| Visible name | Image path |
|---|---|
| `Jinhsi` | `assets/images/resonators/jinhsi.png` |
| `The Shorekeeper` | `assets/images/resonators/the-shorekeeper.png` |
| `Firstlight's Herald` | `assets/images/weapons/firstlights-herald.png` |
| `Premium Resonance Potion` | `assets/images/materials/premium-resonance-potion.png` |
| `Shell Credit` | `assets/images/materials/shell-credit.png` |

Use PNG with transparent backgrounds where possible. Resonator portraits work best around 3:4 or 4:5; weapons and materials work best as square icons. Keep file names exactly as specified, including hyphens. You do not need to edit code when adding images.

## Level and material calculations

The bundled Resonator, Weapon, item, EXP, and level-cost reference data comes from the supplied **Wuthering Waves - Planner.xlsx** workbook. Calculations happen locally in the browser. The app estimates level EXP material and Shell Credit requirements, adds ascension requirements at ascension gates represented in that workbook, and deducts tracked inventory.

The planner uses the workbook's cumulative level EXP and Shell Credit curves, and charges ascension materials at the listed gates (`20◆`, `40◆`, `50◆`, `60◆`, `70◆`, and `80◆`). Please check against your game's current in-game costs if the game is updated.

Some weapon catalog rows in the workbook lack ascension-material mappings. For these, the planner shows a note and calculates EXP and Shell Credits only. Forte/skill-upgrade materials are not currently included in calculated build totals.

The inventory is manual: enter the number you own in each tile. Universal Currency, Resonator EXP Material, and Weapon EXP Material appear first in that order, independent of the category filter. The category filter only changes the materials listed below those three pinned groups.

## Local saves and backups

Data is stored in this browser/device and does not sync to other devices. Use **Settings & data → Export JSON** to make a backup and **Import JSON** to restore it. Keep a backup before clearing browser data. Older archive backups are normalized when imported; data from legacy, unsupported sections is ignored.

## Notes

- Fan-made project; not affiliated with Kuro Games.
- Starter Resonators, weapons, and goals are samples. Edit or replace them to match your account.
- Clearing browser storage clears the local archive unless you have a JSON backup.
