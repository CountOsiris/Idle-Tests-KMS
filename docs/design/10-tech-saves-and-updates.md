# 10 · Tech, saves and live updates

Back to the [Masterplan](../../Masterplan.md).

## Today

- Plain HTML, CSS and JavaScript, no build step. Files: `data.js` (numbers and shared
  lists), `towers.js`, `classes/*.js` (one per class), the game's rules in `game/`
  (ten files, split from one 3,600-line `game.js` in October 2026: state, bonuses,
  equipment, skills, save, page-build, page-show, fights, feel, start), and `cloud.js`
  (Supabase accounts and online saves).
- Hosted on GitHub Pages; an upload is `git push`. `version.txt` plus `?v=` on every
  file lets open tabs notice updates. **Every upload: bump the version in three places**
  (see the comment in `index.html`).
- Saves: one bundle per class plus account-wide fame, in `localStorage`, versioned
  (`saveVersion` 3, with `upgradeSave` steps for 1→2 and 2→3). The rules are in the
  comment above `saveName` in `game/save.js`: never rename or remove an id without a step,
  never move a milestone's floor, never change `saveName`.
- Balance testing: a headless-browser bot that plays classes for simulated hours
  (written in the session that produced this plan; it lives outside the repository).

## Flaws found in review

1. *(Fixed October 2026: split into `game/`.)* **`game.js` does everything.** Combat, progression, saving and the page in one
   3,600-line file of shared variables. It is readable, but each new system makes it
   harder to change one thing safely.
2. **The balance bot is not in the repository.** Every balance claim in these files
   depends on it, and it would be lost with the session.
3. **No automatic checks before an upload.** Old-save loading, "every class plays",
   and "no duplicate names" were run by hand.

## Proposed

- **Split `game.js`** along the lines it already has, keeping the plain style:
  `combat.js`, `progression.js` (levels, skills, fame, milestones), `economy.js`
  (blacksmith, town), `save.js`, `page.js`. Do it at the start of Phase 2, before
  abilities land.
- **Done (October 2026): `tools/`** with the balance bot and the pre-upload check;
  see `tools/README.md`. Originally proposed as:
- **Add `tools/`** (not loaded by the game): the balance bot as `tools/sim.html` with
  a short README, and `tools/check.html` that loads a stored old save and every class
  and reports problems. Run both before each upload.
- **Keep the save rules.** Every phase in the [Roadmap](11-roadmap.md) that renames,
  removes or changes the meaning of anything needs an `upgradeSave` step and a refund
  if players paid for it (the pattern used for the town and fame in October 2026).
