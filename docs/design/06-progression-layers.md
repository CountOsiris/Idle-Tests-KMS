# 06 · Progression layers

Back to the [Masterplan](../../Masterplan.md).

## Every layer, and what resets it

| Layer | Gained by | Lost at death | Lost at ascension | Shared by all classes |
|---|---|---|---|---|
| Boons | each boss (no top level) | yes | yes | no |
| Relics | each boss | yes | yes | no |
| Souls (Warlock) | kills | yes | yes | no |
| Gold carried | kills, chests | banked | yes | no |
| Experience, levels | death payout | no | yes | no |
| Skill points, skills | levels | no | yes | no |
| Blacksmith steps | banked gold | no | yes | no |
| Town upgrades with levels | banked gold | no | yes | no |
| Town helpers (Tactician) | banked gold | no | no | no |
| Class milestones (5 to 100) | first reach | no | no | no |
| Trials (15, 25, 40, 60, 90) | first reach | no | no | no |
| Breakthroughs (150, then x1.5 apart) | first reach | no | no | no |
| Trophies | away-tower floors | no | no | no |
| Fame and fame upgrades | new floors since ascending; bosses from floor 15 | no | no (spent fame is kept) | **yes** (full power up to the class's own ascension count, a quarter beyond) |

## Flaws found in review

1. **Too many layers do the same job.** Trials, breakthroughs, fame (Might, Vitality),
   milestone perks, skills (Power, Toughness), trophies and the town all give
   "more attack" or "more health". With 14 layers and one verb, no single reward
   can feel huge, which works against the "every now and then a HUGE upgrade" goal.
2. **The reset table is hard to see in the game.** The Ascension tab lists what is
   kept and lost in a sentence; players learn the rest by surprise.
3. **No layer above ascension.** Pecorella notes that later games add a second
   prestige (Realm Grinder's reincarnation, AdVenture Capitalist's Mega Bucks) to
   "rein in growth" and give a new ladder. Floor 100+ needs one.

## Proposed: one job per layer

| Layer | Its job (only this) |
|---|---|
| Boons | This run's flavour: lean the run toward the weapon. |
| Relics | This run's surprises. |
| Levels and Power/Toughness | Steady baseline growth. |
| Weapon masteries and class skill | Build depth. |
| Blacksmith | Gold sink; tier jumps are the medium "pop". |
| Milestone perks | Build-defining choices (keystones at 50, 75, 100). |
| Trials | The big raw multipliers (keep as is: they are the "flood"). |
| Breakthroughs | Endless scaling past 100. |
| Trophies / challenge tiers | Techniques, abilities, keystones (new mechanics). |
| Fame | Account-wide multipliers (keep as is). |
| **Next layer (new)** | Unlocks a new mechanic each time (see below). |

So: move "+X% attack" out of milestone perks (into trials) and out of trophies (into
techniques), and the layers stop competing.

## Built, October 2026: Legend

A class that has reached floor 100 can become a legend on the new Legend tab
(`game/legend.js`; numbers and the list of unlocks in `data.js`). It loses what an
ascension loses and also its best floors, picked perks, slotted abilities and place in
other towers; it keeps fame, trophies and town helpers. It is paid the square root of
its best floor in legend marks (floor 100 pays 10), shared by the account. Marks buy
six things, none of them a multiplier: an ability slot from floor 1, a second boon
from every boss, relic slots, starting levels, free potions, and the eighth class. Not built: a second weapon carried into each run.

## Proposed: the second prestige layer ("Legend")

- Unlocks after a class reaches floor 100 for the first time.
- Resets that class's milestones' *pickable* perks (not trophies, not fame), and
  restarts its best floors.
- Pays **Legend marks**, from the square root of the deepest floor ever reached
  (Pecorella: square-root formulas need roughly 4x the progress for 2x the reward,
  which stops repeat-resetting at the same point).
- Legend marks unlock things, not multipliers: an extra ability slot, a second weapon
  carried into each run (swap at a boss), an extra boon choice, the eighth class.

Design it only after Phase 1 to 3 of the [Roadmap](11-roadmap.md): it needs the late
game to be in balance first.
