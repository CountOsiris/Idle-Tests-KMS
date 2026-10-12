# 14 · The combat loop: research, where we stand, and a proposal

Back to the [Masterplan](../../Masterplan.md). Wiring is in [MAP.md](../MAP.md).

Asked for on 11 October 2026: "Multiplications are okay if thought out and ACROSS the
board for all classes, not only one class. Multiplications are what make idles fun, but
you need to consider the gameplay loop: do we want players to one-shot or be one-shot?
How long do we want combats to last? Do research on ALL of that."

This file is the research and a proposal. **Nothing in it is built yet.**

## 1. What other games and designers do

How good each source is, is said beside it. Nobody publishes a target number for an
idle game's fight length, so the last three points are practice seen in games, not rules.

**Costs grow by multiplying, income by adding, and multipliers are the bridge.** Anthony
Pecorella (producer of AdVenture Capitalist), *The Math of Idle Games*, part I: an idle
game is "a seesaw between production rates and costs", done "by having costs grow
exponentially while production grows at a linear or polynomial rate." Multipliers exist
"to (temporarily) get production closer to, or ahead of, costs." So a multiplier is not
a reward on top of the curve. It is the thing that lets the player catch the curve for a
while, and the stall that follows is the design working. Primary source, strong.

**A reset should pay by a root, not in proportion.** The same series, part III, lists the
formulas: Realm Grinder and AdVenture Capitalist pay the square root of earnings (twice
the reward needs about four times the run), Cookie Clicker the cube root (eight times),
Egg, Inc. about the seventh root. A game that pays for the run alone and ignores earlier
runs has "very flat curves". Primary source, strong.

**Added things go in one bucket; each multiplier is its own.** Community write-ups of
Diablo 4 and Warframe describe the same structure we have: bonuses of one kind are summed,
and separate kinds multiply. Ten +20% bonuses multiplied are worth over twice the same ten
added. Diablo 4's patch 1.2.0 moved critical damage INTO the added bucket to rein builds
in: live games tune by choosing the bucket, not the number. Wikis and forums, moderate.

**A wall can be a clock instead of a death.** Clicker Heroes has no player health at all.
Every fifth zone is a boss with a 30 second timer; fail and you fall back. The wall is
"can you deal this much in this long", which only damage answers. Game guides, moderate.

**In games with a health bar, the idle rule is "survive the biggest hit".** Melvor Idle
players' rule of thumb: you are safe to idle if your auto-eat threshold is above the
enemy's max hit. Damage reduction is the stat that makes deep content possible. And
killing in one hit is seen as a WASTE there, because time goes on waiting for the next
monster. Player forums, moderate.

**Trading attack for health is offered as a choice.** Trimps gives formations: one for
more damage, one for more health, and players use the health one "to push to new zones
where monsters would one-shot" them. Wiki, moderate.

**Designers pick a hit count and tune to it.** Obsidian tuned The Outer Worlds 2 by
choosing how many hits an ordinary enemy should take and adjusting its health until
playtests matched. One designer's stated rule: an average enemy takes three average
hits. And monsters commonly have more health for their damage than players do, because
the player heals and a long slow loss is less frustrating than a sudden one. One
developer interview, one blog, one wiki: weak to moderate.

## 2. Where our game stands (measured)

All 25 builds, 100 hours each, 11 October 2026 (`h=100,every,ascend,probe`).

| Floor | Turns to kill an ordinary monster (lowest, middle, highest build) | Ordinary hits a hero survives, on health and armor alone | Share of damage from abilities (middle) |
|---|---|---|---|
| 10 | 2.5 · 3.5 · 5.5 | 4.6 · 5.7 · 10.2 | 0% |
| 20 | 1.8 · 2.6 · 3.8 | 2.9 · 4.1 · 7.0 | 39% |
| 35 | 1.6 · 2.1 · 3.1 | 0.9 · 1.6 · 2.5 | 47% |
| 50 | 1.3 · 2.0 · 4.0 | 1.2 · 2.1 · 3.4 | 53% |
| 100 | 1.2 · 2.1 · 4.0 | 0.9 · 1.4 · 2.2 | 54% |
| 200 | 1.3 · 2.0 · 3.0 | 0.5 · 1.3 · 2.1 | 59% |

In words: **past floor 35 a fight is two turns, and a hero dies to the second hit.** Both
sides nearly one-shot each other. Before today's easing of monster attack it was worse
(a tenth of a hit by floor 100). The first ten floors are the only place a fight is a
fight: three or four turns, six hits to die.

What follows from a two-turn fight, each already seen and patched one at a time:

- anything that ramps (bleed, Crusade, Rage, a boss's enrage) has no time to matter;
- healing, lifesteal and blocking have one hit to work with;
- every build converges on "how much do I deal in two turns", so builds feel alike;
- abilities, which are bursts, are over half of all damage.

## 3. The questions, answered

**Do we want players to one-shot monsters?** Yes on floors they have outgrown, no at the
edge. One-shotting is the reward for growth, and the sweep already skips those floors.
At the deepest floor a class can reach, an ordinary fight should last long enough for
its mechanic to show.

**Do we want players to be one-shot?** No. Nothing a player builds can answer it except
"kill first", which is one answer for 25 builds. A hero should fall because a fight went
on too long or a boss out-lasted it, not to one hit it could not have survived.

**How long should a fight last?** Proposed targets, at the deepest floor a class can
clear:

| | Now | Proposed |
|---|---|---|
| Ordinary monster, turns to kill | 2 | 3 to 5 |
| Ordinary hits a hero survives | 1.4 | 5 to 8 |
| Boss, turns to kill | about 5 | 10 to 15 |
| Boss hits a hero survives (before healing) | about 1 | 6 to 10 |
| What ends a run | one hit | being worn down: damage taken outruns healing, or a boss's enrage |

Five-turn fights make a climb slower turn for turn, so floors would need fewer rooms or
monsters less health-per-floor to keep the same hours. That is tuning, to be measured.

**Multipliers: across the board.** The rule in MAP.md was written too narrowly ("only
fame may multiply"). The owner's rule is the right one: multiplying is what makes an idle
game fun, and it is safe when EVERY build gets the same brackets. Souls broke the game
because one class had a bracket the others did not, fed by a skill with no top level.
Proposed brackets, the same for all 25 builds:

1. attack (added: Power, boons, perks)
2. the weapon's first word (its mastery)
3. the weapon's second word. Eight builds have one today (see the watch list in
   MAP.md); seventeen do not. Give every build one, so that all have the same shape.
4. fame's Might
5. the kills of the run
6. milestone multipliers, the same count on every path

And the mirror for staying alive, which has far fewer brackets today: health (added),
Vitality, a defence word for every build (block, dodge, armor, lifesteal, healing), and
milestone multipliers.

## 4. What I would do, in order

1. **Agree the targets in section 3.** They decide everything after.
2. **Lengthen fights at the edge**: ease monster attack further and raise monster health
   for its damage, until the probe shows 3 to 5 turns and 5 to 8 hits. Keep hours to
   floors 35, 50 and 100 where they are by changing rooms a floor or the curve.
3. **Give every build its second word** (bracket 3), and count multiplier perks per path
   so no path has more.
4. **Re-measure everything**: the two pacing reports, 100 and 300 hours, `perkcheck`,
   `skillcheck`.
5. Then abilities: with longer fights their share falls by itself; see if it needs more.

Steps 2 and 3 change how every class feels and every number in the balance reports. They
are a few days of measuring, and old saves are not affected (only numbers change).

## Sources

- Anthony Pecorella, [The Math of Idle Games, Part I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i) and [Part III](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii) (read in full)
- [Diablo 4 damage buckets](https://www.purediablo.com/diablo4/Damage_Buckets), [a forum explanation](https://us.forums.blizzard.com/en/d4/t/this-is-why-your-damage-sucks%E2%80%94a-psa-on-damage-modifiers/58203), and Warframe's wiki on [additive](https://wiki.warframe.com/w/Additive_Stacking) and [multiplicative](https://wiki.warframe.com/w/Multiplicative_Stacking) stacking (search summaries)
- Clicker Heroes: [beginner's guide](https://earlyguides.com/clicker-heroes/beginners-guide), [a player on boss timers](https://steamcommunity.com/app/363970/discussions/0/3377008022035909311) (search summaries)
- Melvor Idle player threads on [max hit and auto-eat](https://steamcommunity.com/app/1267910/discussions/0/3780248001143951330) and [one-hit kills wasting time](https://steamcommunity.com/app/1267910/discussions/0/561358251644477337) (search summaries)
- Trimps wiki, [Dominance and Heap formations](https://trimps.fandom.com/wiki/Dominance) (search summary; the combat page itself would not load)
- [How Obsidian fixed combat in The Outer Worlds 2](https://www.thumbsticks.com/how-obsidian-fixed-combat-in-the-outer-worlds-2/), [a hits-to-kill design thread](https://community.gamedev.tv/t/hits-to-kill-design-metric/102107), [Health/Damage Asymmetry](https://tropedia.fandom.com/wiki/Health_Damage_Asymmetry) (search summaries)

## 5. What was built (11 October 2026, versions 20261011u and v)

The owner agreed the targets, "as long as you've referenced all the perks, skills and
milestones and balanced to account for this, while making perks and skills not
duplicate in the same brackets".

**Fights last** (`longFights` in data.js). From floor 10, rising to floor 35 and staying
there, monsters have 3 times the health and 0.15 times the attack, and deep attack
growth is 1.3% a floor. What that needed, each found by measuring:

- Healing a turn got ceilings (Devotion 6% of health a turn, the Void Tome 3% a spell):
  with fights of several turns a hero that out-healed a hit could not be killed.
- Crusade counts 8 turns of a fight at most, for the same reason.
- The Void Tome tears a share of the health an enemy has LEFT. A share of full health
  kills anything in a fixed number of turns; it reached floor 520.
- A blow thrown back (Spiked Shield, vengeance, Brace) counts 4 times, because it is a
  share of an attack that is now small.

**One shape for every weapon's perks** (`python tools/brackets.py` lists them). Floor 50
and 100: the build's own multiplier and nothing else. Floor 75: attack x1.3 and
additions to its own words. The "attack x" and "health x" riders that differed from
build to build are gone, and each build is balanced by its own multiplier. The script
fails on two skills of a class that give the same words, a build with no multiplier or
breakthrough of its own, and builds of one class with multipliers on different numbers
of milestones. It prints nothing wrong.

The "second word for every build" of section 3 was not needed: the table shows every
build already has two or more added words of its own and one multiplier.

**Measured against the targets**, all 25 builds, 100 hours:

| | Target | Floors 35 to 50 | Floors 100 to 200 |
|---|---|---|---|
| Turns to kill an ordinary monster | 3 to 5 | 2.9 to 3.3 | 2.4 to 2.9 |
| Ordinary hits a hero survives | 5 to 8 | 7 to 9 | about 3 |

So the early and middle game meet the targets, and the deep game is better than it was
(3 hits, from 1.3) but short of 5. Hero health has fewer ways to grow than damage, and
every attempt to hold 5 hits deep by slowing monster attack further made runs endless:
within a run boons add about 2% health a floor, and monster attack must outgrow that.
Closing the gap needs health to gain what damage has, not a softer monster. Open.

Deepest floor in 100 hours: 286 to 345. Hours to floor 35: 2.6 to 7.3, every build within
25% of its class after the Shadow Blade and Bear were adjusted. Boss fights were not
measured separately.

**Skills, to floor 50** (`skillcheck`, 8 climbs each): most within 10% either way.
Toughness makes the climb to floor 50 faster when SKIPPED for the Elementalist (20% to
36%), the Beast Tamer and the Barbarian (8% to 18%): up to floor 50 a hero now survives 7
to 9 hits, so more health buys nothing there. It matters deeper, where it is 3. Open.

**Perks, one at a time** (`perkcheck`, 40 hours, one climb each, so only gaps of about 40
floors mean anything here). Most milestones are level. Two clear gaps were fixed: the
Wolf Pack's own floor 50 perk was 59 floors behind the general Beastlord beside it, and
Opening Volley was 54 behind Longshot. Still apart and not yet fixed: Scarred Hide (46
behind the Axe's floor 75 perk), and Fire's Inferno 52 ahead of its two neighbours.

## 6. Corrected and finished (11 October 2026, version 20261011w)

**The measurement in section 5 was wrong in two ways**, found when the owner asked for
the weaknesses to be worked on before going live.

- "Turns a kill" averaged a whole run, most of which is floors the class has outgrown.
- "Hits to die" was read at the moment a floor was first reached, when a class is by
  definition about to fall.

The bot's `edge` option now counts every fight within 10 floors of a class's deepest, in
the last third of the hours. By that measure version v had ordinary fights of **9 turns**
at the edge (target 3 to 5) and **2.5 hits** to die (target 5 to 8). Softer monsters only
moved the edge deeper: a class climbs until something stops it, and what stopped it was
the 30-turn rule. So the fix was the thing that stops it:

**The clock** (`fightClock` in data.js). An ordinary fight drags on after 6 turns and a
boss after 14; from then the monster's attack grows 30% a turn. With that, monsters at
x2 health and x0.08 attack (`longFights`), and bosses at four times an ordinary monster's
health:

| At the deepest floors a class can reach | Target | 100 hours | 300 hours |
|---|---|---|---|
| Ordinary fight, turns | 3 to 5 | 4 to 6, middle 6 | 6 to 7 |
| Boss fight, turns | 10 to 15 | 9 to 14, middle 13 | 11 to 15 |
| Ordinary hits to die | 5 to 8 | 4.1 to 10.3, middle 5.7 | middle 6.5 |

(Low, middle and high are the quarter, middle and three-quarter builds of the 25.)
Ordinary fights sit at the top of the target and one turn over it at 300 hours.

**A bug the longer fights exposed.** Void Rift took 6% of an enemy's FULL health through
the path that fame's Might multiplies. It carried a level 17 Void Tome to floor 395. It
now tears a share of the health left and nothing multiplies it (`voidTear`).

**Where every build stands**: deepest floor in 100 hours 286 to 342; in 300 hours 360 to
449, nothing running away. Floor 35 in 2.6 to 6.3 hours and floor 50 in 4.5 to 8.6, every
build within 25% of its class.

**The other paths**, 60 hours against the weapon perks (one climb each, so about 20
floors is noise): Rage +10, +8 and -36 with the Club; Crusade +21, -15, -29; Vengeance
+21, -24, +9; Ambush -33, +33, -18. Crusade and Vengeance were 50 to 76 ahead before
their multipliers were cut from x3 and x4.

**Still open**: Toughness to floor 50 has not been tested again since the clock; Scarred
Hide and Inferno from section 5; the Club on the Rage path.

## 7. The whole game tested again, and the loop as it stands (12 October 2026, version 20261012a)

Asked for: "test all weapons, all builds, all skills, all perks and milestones, to make
sure the speed and strength is not only balanced but falls in line with the research.
All need to be viable, even if some builds are better in the class tower and others in
other towers. Hash out the gameplay loop, then look at longevity."

The record of every attempt, kept or thrown away, is `.audit/balance.tsv` (not in git).

### What the measuring got wrong first

Two alarms in the first baseline were faults in the measure, not in the game.

- **"Elementalists and Wardens take 40 hits to die."** `edge` reported the middle hit. Half
  of those classes' hits land behind a guard, so the middle hit was a guarded one. It now
  reports the average: 9 to 20 hits for them, 4 to 9 for everyone else.
- **"The Tower Shield, Rune Tome and Void Tome are useless in other towers"** (floor 20 to
  50 in 30 hours). The bot sent a new class there from its first minute. With 15 hours at
  home first (`home=15`), every one of the 25 builds wins all six trophies in every other
  tower within the next 15 hours. The lowest is floor 100 (the Sword in Storm Peak).

And one run is not a measurement: the same build's deepest floor in 100 hours moves by 13
floors between runs, once by 55. Builds are compared on four runs or more below.

### One cause behind every trap found

**A climb stops at the clock, and only damage beats a clock.** More health buys one or two
more turns of a fight that is already dragging on. Measured over 125 forced climbs, health
is worth about 0.4 of the same attack. So every choice that ONLY kept a hero alive was a
trap, and they all were:

| The trap | How far behind | Now | After |
|---|---|---|---|
| Toughness (+3% health) | 100 hours with it never bought was 7 floors DEEPER; 17 of 25 builds | +3% health and +1.5% attack | level (0.7 floors the other way) |
| Trial of Endurance | 24 floors behind Trial of Power | keeps its health and armor, gains attack (x1.22 at floor 15 up to x1.5 at 90); Balance is attack x1.3 with health and armor x1.2 | 10 behind |
| The health perk at floor 50, 75 and 100 of every class | 21, 30 and 37 floors behind the weapon's own perk (theme perks: 4 to 15) | attack x1.2 at floors 50 and 75, x1.4 at 100, beside what they gave | 9, 16 and 11 behind |

Doubling Toughness to +6% health was tried first and thrown away: it closed the gap to
floor 35, did nothing to floor 100, and pushed hits to die past the target.

This is the Trimps answer from section 1 (trade attack for health as a choice) and not
the Clicker Heroes one (no health at all): the sturdy choice costs some attack, it does
not cost the climb.

The Warlock's Soul Mastery gave attack and health, the same two words as the new
Toughness. It now gives +2% attack and abilities ready 0.5% sooner (that word has a
ceiling of 60% where it is read). The Warlock's depth did not move.

### The clock, tightened

At 30% a turn a hero with health to spare outlasted the clock by two or three turns, so
ordinary fights at the edge were 6 to 9 turns. Six what-ifs later: **50% a turn, and 16
turns for a boss** (ordinary fights still drag on after 6).

| At the deepest floors a class can reach, 100 hours | Target | Before | Now |
|---|---|---|---|
| Ordinary fight, turns (middle build) | 3 to 5 | 6 | 5 |
| Builds inside 3 to 5 | | 8 of 25 | 14 to 16 of 25 |
| Boss fight, turns (middle build) | 10 to 15 | 12 | 10 to 11 |
| Ordinary hits to die (middle build) | 5 to 8 | 6.3 | 6.5 |

At 300 hours the middle ordinary fight is 6 turns again and 9 builds are inside the
target. Not solved.

### Every build

| | Before | Now |
|---|---|---|
| Hours to floor 35 and 50, builds more than 25% off their class | 0 (six runs pooled) | 0 |
| Deepest floor in 100 hours, runs pooled | 280 to 346 | 296 to 356 |
| Deepest floor in 300 hours | 360 to 449 | 376 to 452 |
| Away towers: builds with all six trophies of a tower in 15 hours there | all | all |

Lifted by their own multiplier, as section 5 set out: the Axe (Reaver x2 to x2.5), the Bear
(Ursa Major x1.8 to x2.4), the Void Tome (Hungering Void x2.4 to x3.3), the Shadow Blade
(Shade x3 to x4.5). The first three rose 15 to 25 floors to the middle of the field. The
Wolf Pack was the one build running ahead: its mastery fed bite power AND pack tactics,
two of its own words that multiply. Tactics now grow half as fast, and it sits with Fire
and the Longbow.

**The other towers do sort the builds.** A build's best tower away is often not the best
for its class: the Club reaches 226 in the Haunted Abbey and 140 in the Undercity; Mace and
Shield 211 in the Orc Stronghold and 146 in the Wildwood; Lightning 248 in the Iron Crypt.
The Undercity, Storm Peak and the Wildwood are the hard ones (about 170 on average), Raider's
Pass the easy one (194).

### Still open

- **The Shadow Blade** is the shallowest build (296; the field's middle is 319). A bigger
  number does not help it: its hit after a dodge already kills, and what it waits for is
  the dodge, which stops at 60%. Raising Umbra from x4 to x5.5 gave nothing and was thrown
  away. It needs a change to how it fights, not to what it multiplies.
- **The Longbow** reached 397 in one run of four (342, 333 and 348 in the others) and
  kills bosses in 3 to 5 turns. Watch it; one run is not enough to cut it.
- **Bosses fall fast to the glass builds** (Longbow, Crossbow, Shortbow, Axe, Club: 3 to 9
  turns against a target of 10 to 15) and slowly to the Tower Shield (18).
- **Single perks** that one climb put 30 floors or more behind, not yet confirmed by a
  second: Kindred, Apex, Reckoning, First Blood, Soul Collector, Retribution, Soul Eater.
- **Power and Toughness** are both a little under the masteries (to floor 100 a climb is 3%
  and 7% faster without them). Inside the noise of the check, and they are the plain
  choices on purpose.

### The loop, as measured

| Loop | How long | What moves |
|---|---|---|
| A fight at the edge | 5 turns; a boss 10 to 13 | the weapon's own mechanic has time to show; a hero falls to the clock, not to one blow |
| A run | minutes | boons, kills of the run; ends where a fight cannot be won inside the clock |
| An ascension | about every 45 minutes (130 in 100 hours) | fame |
| A milestone | floors 5 to 100: the first 8 to 15 hours | one perk, and each of the three kinds (weapon, theme, staying alive) is now a real pick |
| A tower away | 15 hours for all six trophies | permanent unlocks; which tower suits depends on the build |
| A breakthrough | floors 150, 225, 337, then 506 | a multiplier |

### Longevity: where it runs dry

Played 300 hours on one class, every build:

- Floors 5 to 100 hold twelve milestones (seven of the class, five trials) and are gone in 8 to 15 hours.
- Floor 150 comes at 10 to 27 hours, 200 at 16 to 44, 300 at 58 to 108.
- From hour 100 to hour 300 a class gains about 90 floors: one new floor every two hours.
- The third breakthrough (floor 337) is passed between hours 100 and 300 (every build is
  past 376 by then). The fourth is at 506, and no build reaches it in 300 hours (the
  deepest is 452). **So once floor 337 is behind it, a class has no reward ahead on its
  own tower that it can reach.** That is the gap.
- Legend marks buy 137 marks' worth in all (everything on the list, every level). Floor
  100 pays 10 and floor 400 pays 20, so the list is bought out in seven to fourteen legends.
- What does not run dry: seven other towers for each class (about 15 hours each, 42
  trophies), eight classes, and fame.

So one class has 100 to 150 hours of rewards on its own tower and about 100 more in the
other seven. Three ways to fill the gap past floor 337, none built, the owner's choice:

1. **Breakthroughs closer together deep down**: every 50 floors past 337 (387, 437, 487...)
   in place of x1.5. A 300 hour class would meet two more. Cheapest: one rule and a list
   of rewards.
2. **Something for legend marks with no last level**, so becoming a legend deep (20 marks
   at floor 400) always buys something.
3. **Subclasses** ([13](13-subclasses.md)), already planned as the long grind per class.
