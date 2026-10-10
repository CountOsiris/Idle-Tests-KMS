# 09 · UI, UX and feel

Back to the [Masterplan](../../Masterplan.md).

## Today

- Two columns: the stage and log on the left, 9 tabs on the right.
- Animations: lunges, shakes, floating numbers (coloured for weak and resisted hits),
  a dying "ghost", boss glow, "Victory" and "You died" banners, toasts.
- "What to do next" shows up to three goals; tabs get a dot when something waits.
- Away report after 60 seconds or more away. New-version notice. Cloud saves.

## Flaws found in review

1. **Everything is visible from the first minute.** 9 tabs, the fame shop, the towers
   list, milestones to floor 100. Idle games reveal systems one at a time (Cell to
   Singularity's tree, Antimatter Dimensions' layers); each reveal *is* a reward.
2. **Big moments look like small ones.** A breakthrough and a level both get a toast.
3. **Choices hide in tabs.** Milestone perks wait on the Milestones tab with a dot.
   Fine, but a HUGE choice deserves the stage.
4. **Numbers without context.** "Attack 66.69K" says nothing about whether the next
   floor is close. No "time to next floor" or "you deal 40% of what you need here".

## Done (October 2026)

- Tabs open as the account reaches them (see the table below; Inventory at floor 6,
  Ascension at floor 10, Towers at floor 20 or the first ascension), with a banner or a
  pop-up each. Saved as `unlockedTabs`; old saves open what they have already earned
  without a fuss.
- Three sizes of announcement: toast, banner, and a pop-up "moment" card. Milestone
  perks can be picked straight from the card. A setting turns the cards into banners.
- Banners for a new blacksmith tier, a skill rank, a wall, a trophy, and "you can ascend".
- The Ascension tab compares this ascension's fame per hour with the last one's.

## Proposed

### Unlock the interface

| Tab | Appears when |
|---|---|
| Tower, Character | from the start |
| Skills | first level-up |
| Town (Blacksmith) | first death |
| Inventory | first boss |
| Milestones | floor 5 |
| Ascension | floor 10 (shows "reach floor 15") |
| Towers (challenges) | first ascension or floor 20 |
| Settings | always (small icon) |

Each unlock gets a one-line banner: "The blacksmith opens his forge."

### Make HUGE look HUGE

Three tiers of announcement:

1. **Toast** (as now): levels, floors, boons.
2. **Banner across the stage:** tier jumps, skill ranks, trial perks, wall broken.
3. **Full-stage moment** (dim, title, one-sentence explanation, button): milestone
   keystones, ability unlocks, challenge rewards, new layers. Never during offline
   catch-up; queued until the player looks.

### Context numbers

- On the stage: a "pressure" bar: your damage per turn against the floor's average
  monster health, so a wall is visible as it approaches.
- On the Ascension tab: fame per hour if you ascend now vs. keep pushing (from the
  last few runs).
- On death: the run summary from [Combat](03-combat.md).

### Mobile

Friends will play on phones. The two-column layout stacks into one below 900px today; check
that the stage stays on screen while a tab is open (sticky stage, tabs scroll).
