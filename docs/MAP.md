# The map: where everything is, and how it connects

Read this before adding or changing content. It exists because of mistakes that all had
one cause: a number was changed without following where it goes. A perk was written
that was a worse copy of its neighbour. Souls were given a skill with no top level, and
multiplied damage that critical hits and echoes already multiplied. Health perks were
tuned for months while health did nothing past floor 40.

Two files go with this one:

- [MAP-WORDS.md](MAP-WORDS.md) lists every bonus word, who gives it and where it is read.
  It is written by `python tools/map.py`. Run it after changing content.
- [MAP-BRACKETS.md](MAP-BRACKETS.md) lists, build by build, its own words, its multipliers
  and what its path collects at floors 50, 75 and 100. `python tools/brackets.py` writes it
  and prints what breaks the rule of section 3.
- [design/](design/) holds the reasons, one file a subject. This file holds the wiring.

---

## 1. Where things are

| File | What is in it |
|---|---|
| `data.js` | Every number that is not a class's own: the difficulty curve, walls, attack easing, fame upgrades, legend unlocks, town, relics, trials, keystones, breakthroughs, the week's modifiers, the run buff. |
| `towers.js` | The eight towers: monsters, bosses, the rule for challengers, six trophies each. |
| `classes/<name>.js` | One class: base numbers, boons (`upgrades`), skills, milestones and their perks, breakthroughs, abilities, relics (the last of each weapon is its legendary), and the functions that make it fight. |
| `updates.js` | The in-game Updates window. The top entry must be the current version. |
| `game/state.js` | The variables of the class being played, and the three ways to hit a monster. |
| `game/bonuses.js` | `totalBonus` and `multiplier`: how every bonus word is added up. Fame, perks, trophies, relics. |
| `game/skills.js` | `recalcStats` (attack and health), levels, skill ranks, tower progress. |
| `game/fights.js` | A turn (`fightMonster`), a monster (`spawnMonster`), the curve (`towerGrowth`, `attackGrowth`), winning, dying, where a run starts. |
| `game/abilities.js` | Abilities, and `runDamageBoost`: the kills of a run, kill streak, momentum, boss slayer, opener, finisher. |
| `game/bosses.js` | Boss mechanics: shield, summons, enrage, reflect, armor up. |
| `game/equipment.js` | The blacksmith, potions, boons held, the sweep (`startFloor`), named weapons. |
| `game/legend.js`, `weekly.js`, `companion.js`, `summary.js`, `tidy.js` | Legend marks; the week's modifier; the Second Climber; the run summary and bestiary; folding cards. |
| `game/save.js`, `cloud.js` | Saving. `packClass` is everything a class owns. |
| `game/page-build.js`, `page-show.js`, `feel.js`, `start.js` | The page: built once, redrawn every turn, animated, and the clock. |
| `tools/` | The balance bot, the pre-upload check, the map. Never loaded by the game. |

**One class at a time.** The game's state is plain global variables for the class being
played. The other classes sit in `classSaves`, packed. Anything that plays another class
(switching, the Second Climber) packs one and unpacks the other.

---

## 2. How one number becomes damage

Follow this chain before touching any link in it.

```
attack  =  (base attack + levels x perLevel.attack + weapon power)        game/skills.js recalcStats
           x (1 + attackPercent)        <- skills, boons, perks: ADDED together
           x multiplier("attack")       <- perks, breakthroughs, trophies: MULTIPLIED
           x (1 + 10% x boons held)     <- upgradeBoost

a hit   =  attack
           x the weapon's own rule      <- classes/<name>.js: crit, echo, stacks, boulder...
               the build's words are ADDED (critPower, bleedStacks, echoChance...)
               then x multiplier("<build word>")   (swordCrit, bleed, echo...)
           x multiplier("damage")       <- fame's Might, 1.2 a level, no top level
           x abilityDamageBoost()       <- runDamageBoost: 1 + kills of the run + kill
                                           streak + momentum + boss slayer + opener + finisher
           x weakness or resistance, less armor or ward            game/state.js hitMonster

health  =  (base health + levels x perLevel.maxHp)
           x (1 + healthPercent) x multiplier("health") x (1 + 10% x boons held)

a hit taken = monster attack x (1 - armor share) / damageDivider x multiplier("damageTaken")
```

Abilities deal "turns of your damage": a running average of what normal turns dealt
(`recentDamage`). They inherit everything above, so they are 35% to 60% of all damage for
every build, and a buff to a build's normal turn is also a buff to its abilities.

**Added or multiplied is the whole question.** Things in one bracket are added to each
other, so the tenth is worth less than the first. Brackets multiply each other, so a new
bracket is worth the same however many there are. A reward that opens a NEW bracket is
far stronger than its number looks.

---

## 3. What grows, and what it is allowed to multiply

| Layer | Grows by | Top level | Lost when | Feeds |
|---|---|---|---|---|
| Level | experience from falling; cost rises with level | none | ascending | flat attack and health, skill points |
| Blacksmith | gold; x1.9 a tier | none | ascending | flat attack, armor |
| Skills | 1 point a level; a rank every 10 levels | none | ascending | added words: attackPercent, healthPercent, the build's words |
| Boons | one a boss; +10% attack and health each | lost each run | falling | added words, and the 10% bracket |
| Kills of the run | 1 a kill; 100 count in full, then log | soft | falling | +20% damage per 100 counted. Nothing raises it. |
| Milestone perks | best floor: 5 to 100, then trials | one pick a floor | becoming a legend | added words and multipliers |
| Breakthroughs | floors 150, 225, 337... | none, but rarer | becoming a legend | multipliers |
| Trophies | other classes' towers, six each | 42 a class | never | words, techniques, an ability, a relic slot |
| Relics | relic bosses, rare monsters | 3 copies; one legendary | falling | words; a legendary multiplies |
| Fame | first time on a floor since ascending; bosses | none; cost x1.45 a level | never | Might x1.2 damage, Vitality x1.2 health and armor |
| Legend marks | square root of best floor, on becoming a legend | each unlock once | never | account-wide unlocks |

**The rule that keeps it from running away.** Multiplying is what makes an idle game
fun, and it is safe when it is ACROSS THE BOARD: every class and every build gets the
same brackets (the owner's rule, 11 October 2026). What breaks the game is a bracket
that one class has and the others do not, most of all one fed by something with no top
level. That is what souls did: only the Warlock had them, a skill with no top level
raised soul power, souls multiplied spells, and spells were already critical hits times
echoes. So, before adding anything that multiplies:

- does every build get one like it? If not, either give them one or make it added;
- what feeds it? If a skill, a boon or anything else that can be bought forever does,
  it is a bracket that never stops growing: every build must then have the same one.

`MAP-WORDS.md` marks every word that has a source with no top level.
[design/14](design/14-combat-loop-research.md) proposes the brackets every build should
have, and how long a fight should last.

**The watch list: builds whose own words multiply each other.** Every build is attack
(grown by Power) times its weapon's word (grown by its mastery), which is two things
with no top level multiplied: that is the game's normal pace. These builds have a THIRD,
because two of their own words multiply each other. Found by reading `MAP-WORDS.md` in
October 2026. None runs away in 300 hours (the Rune Tome is the shallowest build
there), because skill levels come from levels and are lost on ascending. Do not add a
fourth, and look here first if one of them pulls ahead.

| Build | The two words that multiply | Both have no top level through |
|---|---|---|
| Rune Tome | `echoChance` (more casts) x `echoPower` (each echo) | skill, boon |
| Shortbow | `quickShot` (more arrows) x `arrowPower` | skill, boon |
| Lightning | `extraBolts` (more bolts) x `boltPower` | skill, boon |
| Longbow | `heavyShot` (every arrow) x `aimPower` (critical shots) | skill, boon |
| Spiked Shield | `reflect` x `shieldPower` | skill, boon |
| Bladed Shield | `throwPower` x `shieldPower` | skill, boon |
| Axe, Venom Dagger, Fire | stacks (`bleedStacks`, `poisonStacks`, `burnStacks`) x `dotPower` | boon for stacks, skill for power |
| Holy Mace | `smite` x `judgement` on every third hit | skill, boon |

**The monster's side** (`towerGrowth` and `attackGrowth` in game/fights.js):

```
health on floor F  =  38 x (1 + 0.22 x (F - 1))^2  x 1.05 a floor from 20 to 50
                      x 1.03 a floor past 50  x the walls (35, 50, 75, 100)
attack on floor F  =  the same up to floor 35; past it only the first term and 1.013 a floor
and from floor 10, rising to floor 35: health x2 and attack x0.08 (longFights in data.js).
A fight drags on after 6 turns (16 for a boss): attack then grows 50% a turn (fightClock).
```

A boss has 2.2 times the health and 1.3 times the attack. Deep in the tower health grows
about 4% a floor, so 20% more damage is worth about 5 floors.

---

## 4. What went wrong before, and what now catches it

| Mistake | Why it happened | What catches it now |
|---|---|---|
| A perk that is a worse copy of its neighbour (Arcane Supremacy beside Soul Eater) | Each class had a plain "attack x" beside perks that gave attack and more | `tools/check.js` section 4b fails on any perk whose every number a neighbour matches or beats |
| A reward that adds a percentage beside ones that multiply (Ravager, Master Assassin) | Section 2: an added percentage joins a full bracket | `perkcheck` in the bot: forces each perk in turn and shows the gap |
| A multiplier fed by something with no top level (souls) | Section 3's rule was not written down | `MAP-WORDS.md`, the "No top level" column. Read it for every word you touch |
| Damage that does not depend on the hero (Void Tome's share of health, reflection on the monster's own growth) | It is taken straight from the monster's numbers, so the tower's growth feeds it | It must have a ceiling where it is read, and must not be multiplied by fame. Play 300 hours when adding one |
| A mechanic that needs a long fight (bleed one stack a hit, Rage below half health, Crusade from the second turn) | Fights last two or three turns. Anything that takes five turns to matter never matters | `probe` in the bot prints turns a kill and what the damage was made of |
| A stat that does nothing (health past floor 40, Toughness) | Monster attack grew as fast as monster health | `probe` prints the hero's health against a monster's hit, floor by floor; `skillcheck` shows a skill that speeds the climb when skipped |
| A choice that only keeps you alive (Toughness, Trial of Endurance, the health perks at floors 50, 75 and 100) | A climb stops at the clock, and only damage beats a clock. Health buys about 0.4 of what the same attack buys, so every health-only choice was a trap: 10 to 37 floors behind its neighbours, and Toughness cost 7 floors when bought | It carries a share of attack as well (12 October 2026). When adding a defence choice, give it attack too, and run `perkcheck` or the bot's `skip=` to see it is level |
| Measuring a class with a guard by its middle hit, or a tower by a class sent there from its first minute | Half a Warden's hits land behind a guard, so the middle one said 40 hits to die. A fresh class in an away tower gets nowhere, which says nothing about the tower | `edge` reports the average hit; `home=15` plays at home first |
| Flat numbers (+3 armor at floor 75) | A flat number is worth nothing against one that grows 4% a floor | Give a percentage or a multiplier. Flat numbers only on the first ten floors |
| A buff that works but cannot be seen (Phoenix Feather) | It wrote one line with another name in it | Say the thing's own name in the log, and mark it used on the page |

---

## 5. Before adding or changing content

1. **Find the word.** Look it up in `MAP-WORDS.md`: who else gives it, is it added or
   multiplied, where is it read, is there a ceiling.
2. **Place it in the chain** (section 2). Does it join a bracket or open a new one?
3. **Check the rule** (section 3). Can it be bought forever? Then it must be added, and it
   must not feed a number that something else multiplies without limit.
4. **Compare it with its neighbours.** On a milestone, each perk should be a different
   kind of choice: the weapon, the class's theme, staying alive, something useful.
5. **Ask how long a fight is.** Two or three turns. Will this have happened by then?
6. **Measure**, with the tool that fits (`tools/README.md` has the commands):

| Changed | Run |
|---|---|
| Anything | `bash tools/run.sh check tools/saves/<each save>.json` must end `ALL GOOD`; `python tools/map.py` |
| A weapon, a skill, a class's numbers | `bash tools/balance.sh 14 2 35 <class>` and `30 2 50`: every build within 25% of its class |
| A perk | the bot's `perkcheck`: no perk more than about 20 floors from its neighbours |
| A skill | the bot's `skillcheck`: no skill that speeds the climb when left unbought |
| Anything that scales | 100 hours of every build (`h=100,every,ascend`): deepest floors within about 50 of each other; 300 hours for anything new that grows |
| The page | a picture with `bash tools/run.sh shot`, wide and narrow |

7. **Then** bump the version (`bash tools/version.sh`), add the Updates entry, commit.

**Where the game stands** (12 October 2026, version 20261012a, the numbers to compare
against): floor 35 in 2.0 to 5.7 hours, floor 50 in 3.4 to 8.7, floor 100 in 7 to 16; deepest
floor in 100 hours 294 to 343 across the 25 builds in one run (296 to 356 when every run
is pooled), in 300 hours 376 to 452. At the deepest floors a class can reach (the bot's
`edge`): an ordinary fight about 5 turns, a boss about 11, about 6 ordinary hits to die
(more for a class with a guard). Every build wins all six trophies in every other tower
within 15 hours there, after 15 at home.

**One run is not a measurement.** The same build's deepest floor in 100 hours moves by 13
floors from one run to the next, and once by 55. Pool at least four runs before calling a
build weak or strong, and average a kind of perk over many builds.

**Measure the edge, not the average.** A class climbs until something stops it, so a
change that makes monsters softer mostly moves the edge deeper. To change how a fight at
the edge FEELS, change what stops the climb (the clock, `fightClock` in data.js).

---

## 6. Saves

Friends play the live game, so an old save must always load.

- Never rename or remove an id (a skill, a perk, a boon, a relic, a trophy), and never
  move a milestone's floor, without a step in `upgradeSave` (game/save.js). To retire
  something, keep its id and change what it gives.
- A class's save is `packClass` in game/save.js. A new variable a class owns goes there
  and in `freshClass`. A new account-wide variable goes in `saveGame` and `loadGame`.
- `tools/saves/` holds three old saves. The check loads each.
