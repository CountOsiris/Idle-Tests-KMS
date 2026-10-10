# 07 · Economy and currencies

Back to the [Masterplan](../../Masterplan.md).

## Currencies today

| Currency | Comes from | Spent on | Notes |
|---|---|---|---|
| Gold | kills (floor x 1, bosses x5, rare x3), chests (x4); banked at death | blacksmith, town, potions | Gold is never spent inside the tower, so a run can be fully idle. |
| Experience | death payout: floor x 20 (away towers +50%) | levels, bought automatically | Level N costs N x 50. |
| Skill points | 1 per level | skills | Cost rises by 1 every 10 levels of a skill. |
| Fame | 1 per new floor since ascending; bosses from floor 15 (0.3 at 15, 2.9 at 100) | fame upgrades (account-wide) | Shared by all classes. |

## Sinks and their curves

- **Blacksmith:** 25 gold, then x1.3 per step. Power +1 per step, x1.2 per tier.
  Infinite.
- **Town:** six items; most x1.4 per level; Tactician one-off.
- **Fame upgrades:** five multipliers, x1.45 cost per level.

Pecorella's AdVenture Capitalist uses x1.07 per generator with x2 milestones at 25, 50
owned. Our steeper x1.3 means fewer, weightier purchases, which suits a game you check
in on rather than click in.

## Flaws found in review

1. **Flat rewards rot.** Milestone perks give "+30 health", "+5 attack"; trophies give
   "+40 health". The Warlock in the October screenshot had 66,690 attack. Every flat
   reward becomes invisible within a few hours. (Rule already set for new content:
   prefer percentages and multipliers. The old flat rewards were never converted.)
2. **Gold has one real sink.** Late on, the town's levelled items are tiny next to the
   blacksmith, so gold means "blacksmith" only. Fine, but the blacksmith then needs its
   own milestones to stay interesting.
3. **Experience is invisible.** It is earned only at death and spent automatically.
   Players can't feel it. Showing "next level in N deaths" would help.
4. **Potions** are bought one at a time for a fixed 150 gold, forever. They don't scale.

## Done (October 2026)

- Flat attack and health rewards converted: boons and relics give +5% / +10%, milestone
  perks at floors 5 and 10 give x1.1 / x1.15, trophies give x1.1 / x1.15 / x1.25.
  Flat armor kept (armor is a rating now: see [Combat](03-combat.md)).
- Blacksmith tiers are a jump (x1.9 per tier, +6% per step inside one); a new tier
  gets a banner. This replaced the "milestone every 25 steps" idea below.

## Proposed

- Convert every flat reward to a percentage or multiplier (save-safe: change numbers,
  keep ids). Candidate rule: +5 attack becomes +10% attack, +30 health becomes +10%
  health, +3 armor becomes +5% armor.
- **Blacksmith milestones:** every 25 steps, a multiplier (x2 power) that shows as a
  banner: AdVenture Capitalist's purchase-spike trick, and a "HUGE" moment that costs
  nothing to build.
- Potions: price scales with floor reached; a "keep stocked" toggle buys them at death.
- Show expected experience on the Character tab ("about 3 more falls to level 46").
