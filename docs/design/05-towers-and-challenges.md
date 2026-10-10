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

## Built, October 2026

- Every tower has a **rule for challengers** (`awayRule` in `towers.js`), shown on the
  Towers tab and above the fight: war drums in the Stronghold (everything enrages),
  ambush in the Pass, no potions in the Wildwood, a lost first turn in the Undercity,
  no healing after a kill in the Crypt, slower abilities on Storm Peak, and a health
  drain in the Abbey. A rule is a set of bonus words added to the challenger's own, so
  a new rule is one line.
- Every tower has **six tiers**: floors 10, 20, 30, 50, 75 and 100.
- The tiers pay on a **ladder**, the same in every tower: a percentage at 10 and 20; a
  percentage and a **technique** at 30 (Bloodthirst, Brace, Keen Eye, Sidestep, Soul
  Siphon, Exploit, Prayer: each a small piece of that tower's class); an **ability**
  any class can slot at 50; a **relic slot** at 75 (a relic kept through death; seven
  towers, so up to six for any one class); and at 100 a **passive** that changes a rule.
  Techniques and passives are bonus words on the trophy; an ability is written on the
  trophy the way a class writes its own.
- **The suggested challenge.** The Towers tab always names the tower where the class's
  current damage does best among those with a trophy left, and what its next tier pays.
  After 12 runs in a row with no new best floor at home (`stuckAfterRuns`), a banner, a
  line under the fight and a dot on the Towers tab point there too.
- **The week's modifier.** One of seven twists (`weeklyModifiers` in `data.js`, rules in
  `game/weekly.js`) is in force each week for every class in every tower, changing on
  Monday (UTC) for everyone at once. Each helps one way and bites another, and they are
  kept mild because the pacing was tuned without them. The balance bot plays with none.
- Not built: the named weapon at tier 100.
- Not built: a rule on a single tier ("floor 50 boss within 30 turns"). The plan below
  describes it; a rule for the whole tower was simpler to read and to play idle.

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
