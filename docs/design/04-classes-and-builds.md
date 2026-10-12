# 04 · Classes and builds

Back to the [Masterplan](../../Masterplan.md).

## The seven classes today

| Class | Identity | Builds (weapon → style) | Class mechanic |
|---|---|---|---|
| Barbarian | Two-handed, lifesteal | Axe → bleed · Sword → crit and parry · Club → stun and armor break | Rage (more damage below half health) |
| Warden | Spear and shield, defence | Spiked → reflect · Tower → block, strong spear · Bladed → shield thrown for armor x N | Vengeance (hits taken added to the next thrust); armor |
| Ranger | Archer, range | Longbow → slow crits · Shortbow → many arrows · Crossbow → armor and resistance piercing | Range (enemy misses opening turns); Hunter's Mark |
| Assassin | Stealth, poison | Venom Dagger → poison · Stiletto → crits · Shadow Blade → dodge and counter | Ambush, Vanish, dodge |
| Warlock | Arcane glass cannon | Arcane Tome → crits · Void Tome → % of enemy health · Rune Tome → casts twice | Souls (the run buff every class has) |
| Elementalist | Four elements | One pair of gloves; element picked any time: Fire → burn · Ice → crits · Lightning → bolts · Earth → boulders and stun | None (the element choice is the identity) |
| Zealot | Holy crusader | Holy Mace → holy damage, Judgement · Mace and Shield → block and strike back · Holy Tome → overflow healing burns | Devotion (healing per turn), Crusade (damage grows per turn) |

| Beast Tamer | A staff, and an animal that fights | Wolf Pack → many bites, each harder than the last · Bear → a maul that stuns, and it takes hits for you · Hawk → critical dives, and the enemy misses | Bond (the companion hits harder the more hurt you are) |

The **Beast Tamer** was built in October 2026 with animal companions; mythical beasts
are still for much later. It is opened with 12 legend marks, so it is a late reward, and
its tower, the Wild Reaches, can be challenged by every class from the start.

## Rules every class follows (user decisions)

- Skills: **Power** (+3% attack), **Toughness** (+3% health and +1.5% attack), **one mastery per
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

## Why shield builds stalled, and the fix (11 October 2026)

Measured with the bot's `probe` option: an ordinary monster's hit against the hero's
whole health was 5 to 7 hits to die on floor 10, one hit by floor 40, a tenth of a hit
by floor 100 and a hundredth by floor 200, for every class. Monster attack grew exactly
as fast as monster health, and monster health is set against player damage, which has
far more multipliers than player health has. So from floor 40 the only way to climb was
to kill on the first turn. Tripling health from floor 75 moved almost no build; tripling
damage moved all of them. Shields, blocking, healing, armor and Toughness did nothing,
and the builds made of them stopped 100 floors short.

**Built.** Past floor 35 a monster's attack follows the floor formula and 1.6% a floor
(`attackEaseFloor`, `deepAttackGrowth` in data.js); the walls and the steeper
percentages are for health alone. A hit now stays near the size it has on floor 35:
between half and twice the hero's health, all the way to floor 200.

| | Before | After |
|---|---|---|
| Deepest floor in 100 hours, weakest to strongest build | 165 to 287 | 254 to 306 |
| Hours to floor 100 | 16 to 32 | 9 to 16 |
| Hours to floor 35 (the first wall) | 4 to 7 | 3.6 to 6.9, unchanged by this |
| Floors gained from 2.5 times the health, floor 75 on | about 0 for most builds | 25 to 50 for most; none for the archers and the Stiletto, who are never hit |

Two things were tried and dropped. Counting the spiked shield's reflection on the
monster's "strength" (its attack before the easing) made reflection grow with the tower
for free: floor 442. It is counted on the real attack. And the sweep rule (fights won
in two turns) was tested as the cause and was not: five turns changed nothing.

The floor 100 perks of twelve builds were then lifted, and the Spiked Shield's
reflection perks cut (x2.5 to x1.25), since it now survives without them.

**Skills, tested one at a time** (`skillcheck`: the climb to floor 50 with a skill left
unbought, ten climbs each). Hunter's Mark, Bond, Crusade and Plating made a build 5% to
12% FASTER when skipped; Rage and Ambush Training did nothing. All were strengthened and
now measure between -5% and +8%, the noise of the test. Still open: the Warden's Power
(about 11% faster without it, because shields do not use attack much) and Plating behind
a Tower Shield (9%).

Faster to floor 100 than before is accepted: the strongest builds lost about a quarter
of that time, and the weak ones caught up with them.

## Souls, and what builds up over a run (11 October 2026, later)

A player reached floor 143 with a Warlock whose souls were worth over +1000%, and
reported that no other class was worth playing. Souls were the Warlock's own
multiplier: a base, a skill with no top level, a boon, five perks and a relic all
raised it, and it multiplied critical hits and echoes that already multiply each
other. No other class had anything that grew over a run.

**Built.** Every class counts the kills of a run and grows stronger with them
(`runDamagePer100` in data.js: +20% for 100, each doubling after that worth the same
again). Each class has its own name for it; the Warlock's is still Souls. Nothing in
the game raises it, for any class. The Warlock's soul perks, skill, boon and relic
keep their ids and give attack and health.

Deepest floor in 100 hours: 268 to 314, the Warlock at 268 to 276. To floor 35: 3.3 to
6.7 hours. To floor 50: 5.4 to 9.1, every build within 25% of its class.

A first attempt kept souls as the Warlock's own, at about a third of their size (x2.6
at floor 200 against x1.6 for the others). The owner asked for the mechanic to stop
being a source of scaling at all, and that is simpler to keep balanced.

## Bleed, poison and burn (11 October 2026, later still)

The owner: "some choices feel weak / useless such as bleed". Measured with `probe`:
bleeding was 15% to 19% of an axe's damage up to floor 100, and poison 5% to 12% of a
venom dagger's. A hit added one stack whatever the limit, and a fight lasts two or three
turns, so the limit was never reached and everything that raised it did nothing.

**Built.** A wounding hit adds a third of the limit (`dotShareAHit` in data.js). The
masteries give damage only (a stack a level on top of 8% a level would have multiplied
with itself), a stack is worth more (bleed 16% of attack, poison 13%, burn 16%), and
the late multipliers are smaller (x1.4 where they were x2.5 and x3). Bleeding is now
19% to 46% of an axe's damage and poison 16% to 30%. Deepest floor in 100 hours: Axe
285, Venom 277, Fire 273.

A share of the enemy's health for bleed, the owner's own idea, was not built: the Void
Tome already does that, and damage that does not depend on the hero's strength has run
away twice (the Void Tome to floor 23,195, the Spiked Shield to 442). The ramp was the
real fault.

Seen while measuring, not yet acted on: abilities are 35% to 60% of every build's
damage, the same for all of them, which is a large part of why builds feel alike.

## Perk paths that were traps (11 October 2026)

The owner: "there's just not much to build". Each class offers its weapon's perks and a
class-theme path beside them. Played for 60 hours on each path (the bot's `perk=`):

| Path | Against the weapon perks, before | After |
|---|---|---|
| Rage (Barbarian) | 40 to 68 floors behind | Axe 6 behind, Sword 27, Club 43 |
| Crusade (Zealot) | 46 to 67 behind | level (3 to 5 ahead) |
| Ambush (Assassin) | level or ahead | unchanged |
| The soul perks (Warlock) | about 20 ahead | unchanged |
| Vengeance (Warden) | level with Spiked and Bladed, 53 behind with Tower | unchanged |

Rage was all or nothing at half health and Crusade gave nothing on the first turn, and
a fight lasts two or three turns. **Built.** Rage grows as health falls (`rageShare`),
Crusade counts the first turn, and Frenzy and Blood God carry attack and health.

Still traps, left on purpose or not yet solved: Vengeance behind a Tower Shield (a
blocked hit owes nothing), Rage with a Club (a stunned enemy does not hurt you), and
the Ranger's health perks (an archer is seldom hit).

## Milestone perks, tested one at a time (11 October 2026)

`perkcheck` plays the first weapon of each class for 40 hours once for every perk of
every milestone, with that perk forced. One climb each, so only gaps of 20 floors mean
anything. Most milestones came out level. The traps it found:

- **Plunderer** (floor 35, every class): 5 to 40 floors behind Veteran in seven classes
  of eight. Now gold x2 and gear 10% stronger.
- **Perks that add a percentage beside ones that multiply**: Ravager, Nightwalker,
  Master Assassin, Titan, Saint, Martyr, Hand of God. Now multipliers.
- **Health for the Ranger** (Hardy, Trial of Endurance, Forest Guardian): 40 to 50
  floors behind, because an archer is seldom hit. Not solved: it is the class, not
  the perks.

## 300 hours (11 October 2026)

Every build played for 300 hours, once: deepest floors 319 to 428. Nothing runs away.
The builds that use health as well as damage (Spiked 428, Tower 405, Shield 391, Club
388) pull ahead of the glass cannons (the tomes, Shortbow, Ice: 319 to 325) as fame
piles up, because Might and Vitality both feed them.

Tried and dropped: a faster deep attack growth (1.02 for 1.016) left the spread as wide
(295 to 378) and sent the Spiked Shield to 445, since its reflection grows with the
monster's attack; and taking fame's Might out of reflection with a fixed x6 to make up
for it put floor 35 at 1.7 hours. The slow drift of the Spiked Shield stays open.

## Milestones as choices (11 October 2026, last)

The owner: "75f Soul Eater way stronger than Arcane Supremacy? What's even the point.
Cull any repeats, make milestones meaningful choices not forced decisions."

Every class had the same shape at floors 50, 75 and 100: a plain "attack x", a plain
"health x", a perk for each weapon, and a class-theme perk. The weapon and theme perks
gave attack as well, so the plain attack perk was a worse copy of four neighbours.

**Built.** The plain perks keep their ids and names and became different kinds of
choice: a boss hunter and a second life at floor 75, a mending perk at floor 100, armor
as a multiplier at floor 50. The Warlock's three soul perks, which were one perk three
times, are a kill streak, leech and momentum. The Ranger's defensive perks carry
something an archer can use.

**Kept from coming back.** The check now fails if any milestone perk gives nothing that
a neighbour does not give as much of or more (run against the old files it names
Warlord against four perks and Arcane Supremacy against Abyss and Soul Eater).

Forced one perk at a time (`perkcheck`, 40 hours, one climb each, so gaps under 20 floors
are noise): the boss hunter first came out 18 to 28 floors behind on three of four
classes and was raised; Soul Collector came out 24 ahead and was lowered. Not measured
again after those two changes.
