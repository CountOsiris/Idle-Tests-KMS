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

Stacked on a computer the fight left the page a strip one row tall (reported the same
day). From 1000 pixels wide the short fight stands in a left column instead, and the
page has the whole height.

The bottom bar was wrong for a computer (the owner: tabs belong on the side or the top
there; the bottom suits a phone because that is where it is held). From 1000 pixels
wide the same bar is across the top, sticky. Picture: [wide](pictures/layout-wide.png).

## Tips (13 October 2026)

The owner: "Players dont understand game, other idle games have tutorials... explains
new features as they unlock. Don't make it overbearing but also make sure it's quick
and snappy."

What other games and the research say: teach just in time, one idea at a time, where
the thing is on screen (a 2012 Memorial University thesis found novices did better with
that than with teaching up front, and AdVenture Capitalist's developers say not to teach
everything at once). Trimps pairs each unlock with one short message. Antimatter
Dimensions keeps a "How to play" that lists only what the player has reached. Melvor
Idle has a task tutorial at the start and its reviews still say players feel lost.

**Built** (`game/tips.js`): 28 tips, each a title and at most two sentences, in one
list. A tip shows the first time its part of the game is reached, on a small card above
the tab bar (the bottom right corner from 1000 pixels wide). It never stops the fight,
is not a window, and waits to be pressed: "Got it", or "Show me" to open the tab it is
about, which has a gold outline meanwhile. Every tip seen is kept in the Guide, a window
opened beside Updates and from Settings, grouped by tab. Settings can switch tips off.

Why it is shaped this way:

- One saved list for the whole account (`seenTips`) and no queue. The tip to show is
  the first in the list that is true and not seen. Becoming a legend puts the best
  floor back to 1, so anything keyed on "floor 10 was just reached" would come round
  again; a saved list cannot.
- A save from before tips is not shown twenty of them. What it has reached is marked
  seen without a word, and it gets one tip, which points at the Guide.
- There is one way to explain a part of the game. A tab used to open with a banner or a
  pop-up of its own. `tabUnlocks` now only says when a tab opens and its tip says what
  it is for, so floor 10 opens two pop-ups where it opened three. An announcement says
  what just happened; a tip says what a thing is; the goals under the fight say what to
  do now; the "?" on a box explains that box in full.
- A number in a tip is built from its constant in data.js, and the check reads the
  list: no id twice, at most two sentences and 30 words, a tip for every tab that opens.

Found on the way: the bottom bar's `display: flex` had been showing every tab button
from the first minute, opened or not. A new player now sees Fight, Hero and Settings.

Pictures: [a new player](pictures/tips-new-player-400.png), [wide](pictures/tips-new-player-wide.png),
[a tip that points at a tab](pictures/tips-hero-tab-400.png), [the same, wide](pictures/tips-hero-tab-wide.png),
[the end of a page, clear of the card](pictures/tips-page-end-400.png), [the Guide](pictures/tips-guide-400.png).

Not done: no highlight boxes round parts of the page, no steps to follow, no rewards
for reading. Trials and breakthroughs have no tip; each arrives as a pop-up that
explains itself.
