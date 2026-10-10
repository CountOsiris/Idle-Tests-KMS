# 08 · Equipment and items

Back to the [Masterplan](../../Masterplan.md).

## Today

- **Decided October 2026 (after tester feedback):** no loot from enemies, gear is never
  lost, the weapon kind is picked and changes on the next run.
- **Blacksmith:** one weapon and one armor (shield and spear for the Warden), improved
  for gold: Bronze → Iron → Steel → Mithril → Adamant → Runic, +1 to +9 within each.
  Bows, tomes and gloves have their own tier names. Past Runic the number keeps
  climbing. One level shared by every weapon kind; reset at ascension.
- **Boons:** one per boss, suited to the weapon, no top level, +10% attack and health
  each on top of their own effect.
- **Relics:** one per boss, suited to the weapon, lost at death.

## Flaws found in review

1. **The weapon has no story.** "Iron Axe +3" is a number with a name. Echoes of
   Creation's appeal is items that *change* a build (120+ uniques).
2. **Tier jumps are mild.** x1.2 per tier is barely felt (see the
   [reward cadence](02-core-loop-and-pacing.md)).
3. **Relics and boons overlap.** Both come from bosses, both are build-filtered, both
   are lost at death. Players will not tell them apart.

## Proposed

- **Tier jumps x1.5**, and a banner when a new tier is forged.
- **Named weapons from challenges.** Each away-tower keystone (tier 100, see
  [Towers and challenges](05-towers-and-challenges.md)) is also a *named weapon* for
  the class that wins it: "Bloodletter, the Warlord's Axe: bleeding can crit". Equip
  it instead of the forged one; it inherits the blacksmith level. Earned, not dropped,
  which keeps the October decision.
- **Built October 2026: relics separated from boons.** A relic comes from the boss of
  every 25th floor and from about one rare monster in seven (`relicBossEvery`,
  `relicRareChance`), and the eleven every class can find each do something (a saved
  life, attacks thrown back, faster abilities) where a boon adds a number. Relic slots
  from tier 75 keep the first ones claimed. Still open: each class's own relics are
  plain numbers, and the named weapons.
- **Separate relics from boons:**
  - Boons: small, stackable, weapon-leaning (as now).
  - Relics: rarer (only on floors that are multiples of 25, and on rare monsters),
    each one *mechanical* ("the first hit of each fight is a critical"), not a stat.
- **Relic slot** that survives death, from challenges (tier 75), so a favourite relic
  can become part of a build.
