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
