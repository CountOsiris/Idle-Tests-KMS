# 04 · Classes and builds

Back to the [Masterplan](../../Masterplan.md).

## The seven classes today

| Class | Identity | Builds (weapon → style) | Class mechanic |
|---|---|---|---|
| Barbarian | Two-handed, lifesteal | Axe → bleed · Sword → crit and parry · Club → stun and armor break | Rage (more damage below half health) |
| Warden | Spear and shield, defence | Spiked → reflect · Tower → block, strong spear · Bladed → shield thrown for armor x N | Vengeance (hits taken added to the next thrust); armor |
| Ranger | Archer, range | Longbow → slow crits · Shortbow → many arrows · Crossbow → armor and resistance piercing | Range (enemy misses opening turns); Hunter's Mark |
| Assassin | Stealth, poison | Venom Dagger → poison · Stiletto → crits · Shadow Blade → dodge and counter | Ambush, Vanish, dodge |
| Warlock | Arcane glass cannon | Arcane Tome → crits · Void Tome → % of enemy health · Rune Tome → casts twice | Souls (more damage per kill this run, softened past 100) |
| Elementalist | Four elements | One pair of gloves; element picked any time: Fire → burn · Ice → crits · Lightning → bolts · Earth → boulders and stun | None (the element choice is the identity) |
| Zealot | Holy crusader | Holy Mace → holy damage, Judgement · Mace and Shield → block and strike back · Holy Tome → overflow healing burns | Devotion (healing per turn), Crusade (damage grows per turn) |

Planned eighth: **Beast Tamer**. Animal companions first, mythical beasts much later.

## Rules every class follows (user decisions)

- Skills: **Power** (+3% attack), **Toughness** (+3% health), **one mastery per
  weapon**, and **at most one class skill** that helps every weapon. Nothing that
  duplicates a weapon skill.
- Skills gain a rank every 10 levels: whole skill +50%, next levels cost 1 more point.
- A weapon change goes through **everything**: skills, boons, relics, perks at every
  milestone floor (5 to 100), breakthroughs.
- Same name for the same thing everywhere; descriptions name the mechanic the page
  uses ("Rage: ...", "Vengeance: ...").
- Nothing a player must set up before a weapon works.
- A home tower never resists what its class deals.

## Flaws found in review

1. **Uneven late game.** Measured over 30 hours: Warlock Arcane Tome reached floor 100
   in about 16 hours, Ranger Longbow in about 21, Barbarian Axe only floor 60 at 28.
   Crit builds pull ahead; damage over time falls behind.
2. **Milestone perks mostly add percentages.** "+25% attack, +4 bleed stacks" is
   fine at floor 20 and flat by floor 75. The big floors should change behaviour
   ("bleeding can now crit", "every third arrow is a Volley").
3. **The Elementalist has no class skill**, and its element changes any time, unlike
   every other class's weapon. That is a deliberate exception today; it should stay
   one only if it is the Elementalist's hook (see Elemental Shift in
   [Combat](03-combat.md)).
4. **No cross-class identity.** Pillar 4 says challenges give "tools to compete in
   other towers"; today no class can borrow anything from another.

## Proposed

- **Balance target:** for every class, each weapon build reaches floor 50 within
  ±25% of the class average, measured with the balance bot (see
  [Tech](10-tech-saves-and-updates.md)). Tune with each build's own `multiply`
  words, not with global numbers.
- **Keystone perks** at floors 50, 75 and 100: one per build that changes a rule.
  Path of Exile's keystones (which Echoes of Creation draws on) are the model: a
  strong benefit with a real cost or condition.
- **Borrowed techniques** from away-tower trophies: e.g. winning the Warden's tower
  teaches every class "Brace: 10% of damage taken is reflected". Each tower teaches
  one technique per depth tier. See [Towers and challenges](05-towers-and-challenges.md).
- **Abilities** per class, as in [Combat](03-combat.md).
