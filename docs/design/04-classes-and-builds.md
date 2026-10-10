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

| Beast Tamer | A staff, and an animal that fights | Wolf Pack → many bites, each harder than the last · Bear → a maul that stuns, and it takes hits for you · Hawk → critical dives, and the enemy misses | Bond (the companion hits harder the more hurt you are) |

The **Beast Tamer** was built in October 2026 with animal companions; mythical beasts
are still for much later. It is opened with 12 legend marks, so it is a late reward, and
its tower, the Wild Reaches, can be challenged by every class from the start.

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

## Balance, measured October 2026

`bash tools/balance.sh` plays every build several times and compares each with its
class. Hours to floor 50, ascending when stuck, averaged over 3 to 6 runs: Barbarian
9.1 to 10.2, Warden 6.4 to 7.6, Ranger 9.6 to 10.2, Assassin 7.5 to 11.0, Warlock 7.6
to 8.8, Elementalist 7.8 to 9.7, Zealot 9.0 to 9.8. Every build is within 25% of its
class; the Stiletto is the closest to the edge (23% faster than the Assassin average).
No class number was changed to get there.

Two things were wrong with the measuring, not with the builds:

- The bot always took the first perk at a milestone, so only each class's first weapon
  got its floor 20 perk. It now takes the perk written for the weapon in use.
- The first version of the reflect aura threw back overkill and ignored armor, so
  killing a reflecting boss in one hit killed the player. That doubled the time to
  floor 50 for five classes and made the Longbow and Earth look broken. It was found by
  asking the bot what was killing it (`killers` option), and fixed in `game/bosses.js`.

**Floor 75, measured later the same month** (hours, ascending when stuck, 2 runs of 40
hours): Barbarian 20 to 26, Warden 14 to 19, Ranger 14 to 19, Assassin 15 to 24, Warlock
8 to 16, Elementalist 9 to 17, Zealot 17 to 20, Beast Tamer 12 to 15. Before it,
Barbarian and Zealot took 31 to 36 hours: their towers have reflecting bosses, and deep
in the tower one reflected blow was most of a life, so killing such a boss in one hit
meant dying on turn 1. One blow now throws back at most a quarter of the player's health.

Earth gathered its boulder on the first turn of every fight, took a free hit for it,
and never reached floor 75. It now throws first. That was worth far more than its
damage: the boulder went from 400% to 220% of attack and Earth is still the fastest
element (20% faster than its class to floor 50, about 35% to floor 75). Lowering its
perks and its stun chance did not change that. Void Tome is the other build well ahead
of its class late (about 35% to floor 75). Both are inside the target to floor 50.

## Deep scaling, measured and fixed (later in October 2026)

Players reported that some characters scale out of control. `bash tools/run.sh sim
"h=100,every,ascend,killers"` plays every build for 100 hours and reports floors 150 to
500 and the deepest floor reached. The first run: the deepest floor ranged from 121
(Mace and Shield) to 539 (Stiletto), and a Void Tome reached floor 23,195 without
falling. Three causes, in the order found:

1. **The Void Tome's tear was multiplied by fame.** It is "a share of the enemy's
   health", but it went through the spell's damage, so fame's Might multiplied it until
   one spell removed more than all of any monster's health. It is now taken straight
   off the enemy and nothing makes it bigger. It also no longer counts as "your damage
   per turn", or an ability worth 3 turns would take three shares at once.
2. **Relics piled up without limit.** A run hundreds of floors long held the same relic
   dozens of times: abilities with no cooldown, armor that blocked everything. One relic
   can now be held three times (`relicMostCopies`), cooldowns are never cut by more than
   60%, and armor never blocks more than 85%. This also removed the luck: two 100-hour
   runs of the same build used to differ by a factor of three, and now agree within 10%.
3. **Builds whose damage comes late in a fight fell behind.** Deep in the tower a fight
   lasts a turn or two, so bleeding, poison, and blows that answer a dodge or a block
   never arrive. The floor 50 and 100 perks of the Axe, Shadow Blade, Mace and Shield
   and Venom Dagger now also multiply attack (and health for the first three). The
   Barbarian's floor 75 perks multiply attack where they used to add to it. The
   Stiletto's and Ice's critical perks went from x2 to x1.6, and Earth was trimmed.

After (one 100-hour run of each build; two runs differ by about 10%):

| | before | after |
|---|---|---|
| Hours to floor 100 | 13.6 to 49 | 15.3 to 33.6 |
| Deepest floor in 100 hours | 121 to 539, and one that never fell | 164 to 285 |

Slowest to floor 100 now: Shadow Blade (33.6), Mace and Shield (33.3), Axe (32.5).
Fastest: Arcane Tome (15.3), Longbow (16.6), Stiletto (17.2).

## Proposed

- **Balance target:** for every class, each weapon build reaches floor 50 within
  ±25% of the class average, measured with the balance bot (see
  [Tech](10-tech-saves-and-updates.md)). Tune with each build's own `multiply`
  words, not with global numbers.
- **Built October 2026.** Keystones are perks marked with a star, on optional
  milestones of their own one floor past the big ones. Every weapon and element has one
  at floor 51 (22 in all, in the class files), and every class is offered three shared
  ones at floor 76 and three at floor 101 (`keystoneMilestones` in `data.js`). Each
  changes a rule and costs something; a class may take one per milestone, or none. A
  keystone's rule is a bonus word of its own, so adding one needs a perk line and a few
  lines where the rule bites.
  They were first built as extra choices on floors 50, 75 and 100. Measured, taking one
  there meant giving up a x2 build perk, and almost every keystone made the climb slower.
  On their own floors, hours to floor 75 with the weapon's keystone against without
  (2 to 3 runs, so only large gaps mean anything): most builds within 15%; faster with
  Barbed Wall (Spiked Shield, 19 to 12), Landslide (Earth, never to 16), Event Horizon
  (Void Tome, 10 to 8) and Conflagration (Fire, 17 to 14); slower with Neurotoxin
  (Venom Dagger, 21 to 24). Earth without Landslide is the one build far behind its
  class at floor 75; that is older than keystones and still open.
- **Keystone perks** at floors 50, 75 and 100: one per build that changes a rule.
  Path of Exile's keystones (which Echoes of Creation draws on) are the model: a
  strong benefit with a real cost or condition.
- **Borrowed techniques** from away-tower trophies: e.g. winning the Warden's tower
  teaches every class "Brace: 10% of damage taken is reflected". Each tower teaches
  one technique per depth tier. See [Towers and challenges](05-towers-and-challenges.md).
- **Abilities** per class, as in [Combat](03-combat.md).
