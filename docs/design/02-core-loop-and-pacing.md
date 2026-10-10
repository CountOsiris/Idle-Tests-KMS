# 02 · Core loop and pacing

Back to the [Masterplan](../../Masterplan.md).

## The loops, from smallest to largest

| Loop | Length | What happens | What the player decides |
|---|---|---|---|
| Turn | 1 second | You attack, the monster attacks, effects tick. | Nothing (idle). |
| Room | 5 to 60 seconds | Fight, rest, or chest. 4 rooms per floor. | Nothing. |
| Boss | every 5 floors | Harder fight; gives a boon, a relic and (floor 15+) fame. | Favourite boon (Tactician). |
| Run | 1 minute to hours | Climb until you fall. Death banks gold and experience. | Weapon for the next run; skills and blacksmith between runs. |
| Ascension | 30 to 60 minutes early, longer later | Reset the class for fame. | When to ascend; how to spend fame. |
| Milestone | hours to days | First reach of floors 5 to 100, then breakthroughs from 150. | One perk per milestone. |
| Challenge (away tower) | days | Climb another class's tower for trophies. | Which tower, which build. |

## How the idle math works (Pecorella)

Costs grow exponentially, production grows polynomially, and multipliers temporarily
push production ahead of cost. Exponential growth "will eventually catch and far exceed
any polynomial growth" (*The Math of Idle Games*, part I), so the designer's whole job is
deciding *where* it catches up, and what breaks the wall when it does.

In this game:

- **Monsters** are the cost curve. Their strength on floor F is
  `(1 + 0.22 (F-1))^2`, plus 4% per floor from 20 to 50, 3% per floor beyond 50, and
  a one-off jump at each wall (floors 35, 50, 75, 100). Bosses x2.2 health.
- **The player** is the production curve: levels (polynomial), blacksmith steps
  (exponential cost, roughly linear power with tier jumps), skill ranks, boons,
  relics, and multipliers from milestones, trials, breakthroughs and fame.
- **Walls** are deliberate and listed in `data.js` (`towerWalls`).

## The target curve (measured October 2026, bot playing a fresh class)

| Floor | First reached | What breaks the next stretch |
|---|---|---|
| 10 | about 20 minutes | levels, blacksmith |
| 15 | about 45 minutes (first ascension) | fame |
| 20 | about 1.5 hours | milestone at 20 |
| 30 | 2.5 to 4 hours | trial at 25 |
| **35: first wall** | 4 to 7 hours | ascensions, trial at 40 |
| 40 to 45 | 6 to 12 hours | |
| **50: second wall** | 8 to 15 hours | milestone at 50, breakthrough path |
| 60 | 15 to 24 hours | |

Rule: the first hours must never stall. Floors keep coming at least every 10 to 15
minutes until the first wall.

## Reward cadence: "steady drip, rare floods"

What the user asked for: "some upgrades are less and every now and then you get a HUGE
upgrade". Pecorella's version: make runs "somewhat 'bumpy' with slow parts and fast
parts", and use big multipliers at milestones to create bursts (his example: x16 at 500
owned).

| Size | How often | Today | Proposed |
|---|---|---|---|
| Drip | every few seconds | damage numbers, kills, gold | keep |
| Small | every minute or two | levels, blacksmith steps, skill points | keep |
| Medium | every 10 to 30 minutes | boons, relics, skill ranks, new floors | **Blacksmith tier jumps** should be a felt jump (x1.5 power at each new tier, not x1.2). |
| Large | every few hours | milestone perks, trials, walls falling | Milestone perks should change *how* a build plays, not only add 30%. See [Classes and builds](04-classes-and-builds.md). |
| HUGE | every few days | breakthroughs, ascension unlocks | Each should **open something**: a new ability slot, a new tower rule, a new layer. Antimatter Dimensions' lesson: a reset that unlocks a mechanic is remembered; a reset that multiplies is forgotten. |

## Sweeping through easy floors (built October 2026)

A run remembers how far it got while every fight took 2 turns or fewer; the next run
starts there, with the boons of every boss passed. Swept floors pay no gold and no
experience (the first test paid them again on every death, and dying fast at a wall
became the quickest way to grow: floor 100 in 9 hours instead of 22+). A run that
slows at its first fight was started too high, and the next starts half as high.
Ascending and changing tower start from floor 1. Numbers in `data.js` (`cruiseTurns`).

## Flaws found in review

1. **Same reward, many places.** Trials, breakthroughs, fame, perks and boons all say
   "attack x1.X". The HUGE moments drown in medium ones. Fix: give each layer a job
   ([Progression layers](06-progression-layers.md)).
2. **Ascension early is a trap for impatient players.** The bot showed that ascending
   whenever progress slows can leave a player at floor 15 for hours. The "Ascension"
   tab should show the expected fame per hour of ascending now vs. pushing (a simple
   comparison, like Realm Grinder's prestige preview).
3. **Offline is capped at 8 hours** with no visible note of it until the report. Show
   the cap on the Settings tab, and consider raising it with a fame upgrade.
4. **Runs are long and samey after a wall.** During a wall the player has nothing to
   do but wait. Idle games fill walls with *a different thing to work on*: here, away
   towers (challenges) are the natural filler. See
   [Towers and challenges](05-towers-and-challenges.md).
