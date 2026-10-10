# 05 · Towers and challenges

Back to the [Masterplan](../../Masterplan.md).

This is the concept that makes the game *this* game: every class fights its own tower,
and can challenge the others for permanent unlocks.

## Today

- 7 towers, one per class, 43 monster kinds, each tower with its own colour, ward,
  monster traits and weak/resist lists that suit its class.
- **Away towers:** monsters have +100% health and +50% attack, their resistances grow
  0.5% per floor (to 60%), and dying there pays +50% experience. The tower changes
  after your next death.
- **Trophies:** 3 per tower (floors 10, 20 and 30), permanent and per class. Rewards
  are small and flat: "+5 attack", "+40 health", "+25% gold".
- Penetration (town Whetstone, Ranger's crossbow) cuts resistance, armor and ward.

## Flaws found in review

1. **The payoff is too small.** +5 attack is noise by floor 20. Nobody will spend a
   day in a hostile tower for it. This is the weakest link between the user's core
   concept and the game.
2. **Away towers are just harder home towers.** There is no rule, goal or story; the
   same climb with bigger numbers.
3. **Only floors 10, 20 and 30.** There is nothing to chase in an away tower after
   floor 30.
4. **Per-class trophies** fit "nothing shared", but fame is now shared (October 2026),
   so the rule has already bent once. Worth deciding on purpose
   ([Open questions](12-open-questions.md)).

## Proposed: Challenge Towers

Treat each away tower as a **challenge**, in the sense Antimatter Dimensions and
Realm Grinder use the word: a run under special rules, with a clear goal and a
permanent reward.

### Structure

- Each tower has **challenge tiers**: floors 10, 20, 30, 50, 75, 100, then every 50.
- Each tier has a **goal** and sometimes a **rule**:
  - "Reach floor 20 in the Warlock's Crypt" (plain depth).
  - "Reach floor 30 in the Ranger's Wilds with no potions."
  - "Beat the floor 50 boss in the Zealot's Abbey within 30 turns."
- The tower's rule set is shown on the Towers tab before entering, with your class's
  matchup (already there: "your damage vs. this tower").

### Rewards that matter (ordered from small to HUGE)

| Tier | Reward kind | Example |
|---|---|---|
| 10, 20 | % stat for this class | +10% health (not +40 health) |
| 30 | **Technique**: a borrowed mechanic, small | Warden's tower teaches *Brace*: reflect 10% of damage taken |
| 50 | **Ability** (see [Combat](03-combat.md)) usable by this class | Assassin's Undercity teaches *Smoke Bomb*: dodge the next 2 attacks after a boss lunges |
| 75 | **Relic slot** that keeps one relic through death | |
| 100 | **Keystone**, build-defining | Elementalist's Spire: "your weapon hits also deal 20% as your weakest-matchup element" |

These are the game's answer to Echoes of Creation's 120+ build-defining uniques:
earned by beating a challenge, never rolled from a drop.

### Making away towers worth visiting during a wall

When the home tower hits a wall (floor 35, 50), the Towers tab should *suggest* the
away tower where the class's current build has the best matchup and the nearest
unclaimed tier. Walls then become "time to go raid the Undercity", not "time to wait".

### Rules to keep

- A home tower never resists what its class deals.
- Every class must have tools to compete in every tower (crossbow and penetration
  today; techniques tomorrow).
- Rewards stay permanent and never need re-winning.
