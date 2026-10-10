# 10 · Tech, saves and live updates

Back to the [Masterplan](../../Masterplan.md).

## Today

- Plain HTML, CSS and JavaScript, no build step. Files: `data.js` (numbers and shared
  lists), `towers.js`, `classes/*.js` (one per class), the game's rules in `game/`
  (split from one 3,600-line `game.js` in October 2026: state, bonuses, legend, weekly, equipment,
  abilities, bosses, summary, skills, save, page-build, page-show, fights, feel, start),
  `updates.js` (what changed in each version, shown in the Updates window) and
  `cloud.js` (Supabase accounts and online saves).
- Hosted on GitHub Pages; an upload is `git push`. `version.txt` plus `?v=` on every
  file lets open tabs notice updates. **Every upload: bump the version in three places**
  (see the comment in `index.html`).
- Saves: one bundle per class plus account-wide fame, in `localStorage`, versioned
  (`saveVersion` 3, with `upgradeSave` steps for 1→2 and 2→3). The rules are in the
  comment above `saveName` in `game/save.js`: never rename or remove an id without a step,
  never move a milestone's floor, never change `saveName`.
- Balance testing: a headless-browser bot that plays classes for simulated hours
  (written in the session that produced this plan; it lives outside the repository).

## Online saves and refreshing (fixed October 2026)

Players reported that refreshing could leave the game reloading over and over, with
milestone pop-ups that could not be clicked. The cause was in `cloud.js`. A page sends
its save online as it closes, and never hears the answer. The next page then saw a
revision it did not remember, took that as another device having played, replaced the
browser's save with the online one and reloaded, which sent a save again on the way out.

Every save sent up is now marked with the browser that sent it (`sentBy`). A revision
this browser does not remember is only treated as another device when the save was not
sent from here. A page that has just reloaded to take an online save never does so again
within 30 seconds, whatever the server says; it sends nothing on its way out; and a tab
stopped by a newer tab sends nothing either. The pre-upload check plays these cases
against a pretend server.

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
