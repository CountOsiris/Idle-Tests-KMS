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

## Pictures (October 2026)

Every monster and boss has pixel art: 72 tiles from Dungeon Crawl Stone Soup, which its
artists released under CC0. The tiles are 32 pixels square, which showed as blocks
beside the classes' large paintings, so each is enlarged to 192 pixels with its edges
rounded off and its blocks flattened into even areas of colour. The set has no boar,
so the Wild Boar is the hog tile recoloured brown and given tusks and a bristled back.
`tools/monster-art.py` fetches them, does both and holds the list of which tile
is which monster; `art/CREDITS.md` and a line on the Settings tab give the credit. The
check loads every picture named in `towers.js` and the class files, so a wrong file
name fails before an upload.

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

**Built October 2026.** Two thin bars under the fight: your damage per turn as a share of
an ordinary monster's health on this floor ("about 3 turns a kill"), and one of its hits
as a share of your health ("4 to kill you"). The level card says what falling now would
pay and how many such falls the next level needs. The run summary and the fame-per-hour
comparison were built earlier.

- On the stage: a "pressure" bar: your damage per turn against the floor's average
  monster health, so a wall is visible as it approaches.
- On the Ascension tab: fame per hour if you ascend now vs. keep pushing (from the
  last few runs).
- On death: the run summary from [Combat](03-combat.md).

### Mobile

**Built October 2026.** Below 900 pixels wide the fight is a tab of its own, so it was out
of sight while any other tab was open. A strip under the tab buttons, which stay at the
top of the screen, now shows the floor and both health bars on every other tab; pressing
it goes to the fight. Checked in a 400 pixel wide window, not on a real phone.

Friends will play on phones. The two-column layout stacks into one below 900px today; check
that the stage stays on screen while a tab is open (sticky stage, tabs scroll).

## Tidying (11 October 2026)

The owner: "still a lot of clutter on some pages". Idle games with many systems keep
the page quiet by showing a summary and opening detail on request. **Built**
(`game/tidy.js`): a card folds to its heading when the heading is pressed, remembered
per device ("What is kept, and what is lost" starts folded); the paragraph of
explanation under each heading waits behind a "?", with a Settings switch to show them
all; and the Towers tab shows one short row a tower with the next trophy, the full list
behind "All trophies". A card in index.html needs nothing added for this to work.

## The layout (11 October 2026)

The owner: "still very cluttered... a lot of good layouts have all the tabs on the
bottom and a fight in the middle on the top, like switching bars on mobile". **Built**
(the last block of style.css, "The layout"): one column on every screen. The fight
stays at the top in a short form, the open tab's page is under it, and the tabs are a
bar fixed to the bottom with a picture and a word each. The Fight tab opens the whole
fight, the boons and the log. The two-column desktop page and the phone's tabs-on-top
page are both gone; one layout serves both.

Pictures: [a tab](pictures/layout-hero-tab.png), [the Fight tab](pictures/layout-fight-tab.png),
[a narrow window](pictures/layout-phone.png).

The short fight keeps one height through every kind of room (checked), so nothing
under it moves.
