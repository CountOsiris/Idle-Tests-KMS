# 03 · Combat

Back to the [Masterplan](../../Masterplan.md).

## How a fight works today

- One step per second. The class acts (its own `attack` function), then the monster
  attacks unless stunned, frozen or kept at range.
- **Damage pipeline:** attack x skill/perk percentages x fame "damage" x boon boost x
  type multiplier (weak +25%, resist -40% up to 60% in away towers) x (1 - armor or
  ward share, cut by penetration).
- **Monster traits:** poison (part of the attack ignores your armor), regeneration,
  enrage (grows each turn), flying (weapon swings miss 25%), lunge (strikes first),
  ward (blocks spells). After 30 turns every fight "drags on" and the monster
  hits 10% harder each turn.
- **Your sustain:** 20% heal per kill, lifesteal, devotion, rest rooms, potions
  (drunk at 30% health).
- **Bosses:** a monster with x2.2 health and x1.3 attack. No mechanics of their own.

## What Echoes of Creation does that we don't

From its store page and reviews: auto-combat you can **watch and learn from**, 40+
**abilities** chosen per build, 120+ **unique items** that define builds, and dungeons
whose depth depends on "each choice". The depth comes from *what the character does*
in a fight changing with the build, visibly. Our fights change numbers, rarely
behaviour.

## Flaws found in review

1. **Few decisions touch a fight.** A Barbarian with an axe and one with a sword look
   the same on screen; only the numbers differ.
2. **Bosses are not events.** Same rhythm as a normal monster, just longer.
3. **Defence is flat.** Your armor subtracts a fixed number from each hit. At 60,000
   damage hits, 183 armor does nothing. Monster armor and ward already became a
   *share* of each hit (October 2026); the player side has not.
4. **The fight is hard to read.** Weak and resisted hits are coloured, but there is no
   view of *why* a run ended (what killed you, how much healing came from where).

## Proposed

### A. Abilities (the biggest single addition)

**Built October 2026.** Slots open at floors 10, 35 and 75 (a pop-up lets you fill each
one). Every class has five abilities (the Elementalist six): one per weapon or element,
one defensive or support, and one boss killer with a 30-turn cooldown. Each ability is
set to **Auto**, **Bosses only** (the boss killers' default) or **Manual** (the user's
decision: "toggle automation on abilities... auto use some and maybe a boss killer one
manually"). The ability bar under the fight shows cooldowns; pressing a ready ability
uses it on the next turn whatever its setting. Rules in `game/abilities.js`, each
class's list in its file. Measured: about 10 to 20% faster to the first wall, every
build. Ability ranks are not built yet.

Revised the same day, after "some spells feel weaker or like they bring less value":
abilities deal **turns of your own damage** (an average of what your normal turns
really did, crits, bleeding, reflects and all), so every ability grows with its build.
Each weapon ability adds roughly a third to a half to your damage; ones that also stun,
freeze or guard deal a little less. Boss killers deal 8 to 10 turns at once. This made
the weakest builds gain the most (Spiked Shield 7.0 → 4.6 hours to the first wall), and
`midGrowth` went from 1.04 to 1.05 to keep the first wall at about 4 to 7 hours.

Each class gets **ability slots**, filled from a short list per class, that fire by
themselves on a cooldown or a trigger. Still fully idle: the player chooses *which*,
never *when*.

- Slots unlock at milestones: slot 1 at floor 10, slot 2 at floor 35, slot 3 at
  floor 75. That gives three of the "HUGE" moments in
  [the reward cadence](02-core-loop-and-pacing.md).
- Each class gets about six abilities: two per weapon style plus two that suit any
  weapon, following the skill rule (one weapon, one class identity).
- Examples:
  - Barbarian, *Cleave* (axe): every 5 turns, a hit that adds 3 bleed stacks.
  - Warden, *Shield Slam* (any): when you block or reflect 3 times, stun.
  - Ranger, *Volley* (shortbow): every 6 turns, 5 arrows at once.
  - Warlock, *Soul Burst* (any): spend 50 souls for a hit worth 10x attack.
  - Elementalist, *Elemental Shift*: swap to the element the monster is weak to
    for 3 turns. This is the Elementalist's identity made visible.
  - Zealot, *Judgement Day* (mace): the next 3 hits are all Judgements.
- Abilities scale with rank like skills, and accept the same multiply words.

### B. Boss mechanics

**Built October 2026.** Every boss has one mechanic, from floor 10 up (the floor 5 boss
fights plainly). Its rule is written under its description, and what it is doing right
now sits above its health bar. Numbers in `data.js` (`bossMechanics`), rules in
`game/bosses.js`, which boss has which in `towers.js`. Differences from the table below:
the shield blocks everything for its 5 turns (burst only helps by ending the fight
before half health); a minion has 10% of the boss's health, comes twice, and whatever
is left of the hit that kills it is wasted; the reflect aura costs 3 of the boss's
attacks over the whole fight, half for a ranged class; armor rises 4% a turn to 80%.
Armor up is only used in the two towers whose own class casts spells. Measured: the
first wall is reached about 6% later (5.5 → 5.8 hours averaged over 21 runs), inside
the 4 to 7 hour target, so no other number was changed.

Give each tower's bosses one or two rules from a small menu, shown on the stage:

| Mechanic | What it does | What counters it |
|---|---|---|
| Shield phase | Below 50% health, takes 75% less damage for 5 turns | burst, damage over time |
| Summons | Adds a minion that must die first | multi-hit (shortbow, lightning) |
| Enrage timer | Gets x2 attack after 20 turns | fast kills |
| Reflect aura | Returns 20% of damage taken | lifesteal, ranged |
| Armor up | Armor share grows each turn | club, penetration, spells |

Counters line up with existing builds, which makes away towers a puzzle of "which of
my builds answers this tower". That ties combat to [challenges](05-towers-and-challenges.md).

### C. Player defence as a share (done, October 2026)

Built as a rating: share blocked = 60% x armor / (armor + 10 + 1 x floor). The
Character tab shows "blocks N% here". The Bladed Shield still throws "times your armor"
(the rating), so it needed no change.

Turn player armor into a share of each hit (same rule as monsters, capped at 60%).
Needs care for the Warden, whose Bladed Shield throws "times your armor": give the
throw its own number (shield power from the blacksmith) instead of reading armor.

### D. Readability

- A **run summary** on death: damage by source, healing by source, what killed you,
  boons held. Two lines in the log and a fuller card on the Character tab.
- Ability and boss-mechanic icons above the health bars.
- Optional "watch mode" speed: 1x or 2x step speed while the tab is open.
