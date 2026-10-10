# Lloegrys Idle: Masterplan

The one-page view of what this game is, where it stands, and where it is going.
Each section points to a design file in `docs/design/` that holds the detail.
When an idea is decided, it goes into the right design file, not here.

Last reviewed: 10 October 2026, after Phases 2 to 4 were built.

---

## The game in one paragraph

An idle tower-climber with eight classes. Each class climbs its own
tower, fighting on its own while you are away, and grows stronger through levels,
skills, a blacksmith and milestones. Death is never a loss: it banks what you earned
and starts the next, stronger run. Every class can also challenge the other classes'
towers, which are built to resist it, to win permanent unlocks it could never get at
home. Underneath it all runs ascension: start a class over for fame, which makes
every class on the account stronger.

## Pillars

These decide arguments. A feature that serves none of them waits.

1. **Numbers go big, forever.** No ceilings. Every purchase can be bought again, and
   the overflow of any capped stat turns into something else.
2. **Death is the goal, never a risk.** Falling always pays. Nothing permanent is lost.
3. **Seven ways to fight.** Every class, and every weapon within it, plays differently
   and has a reason to exist. Builds are choices, not traps.
4. **Your tower, then theirs.** Home towers are where you grow; away towers are
   challenges that pay in permanent unlocks.
5. **Steady drip, rare floods.** Small upgrades every minute, a big one every hour,
   a game-changing one every few days.
6. **Idle-first, active-rewarding.** Everything works with the game closed. Watching
   and choosing should feel good, never mandatory.

Detail: [Vision and pillars](docs/design/01-vision-and-pillars.md)

## Where the game stands (October 2026)

Built and live (version 20261010a): 7 classes, 22 weapon builds, 7 towers with 43
monster kinds, boss boons and relics, the blacksmith, skills with ranks, class
milestones to floor 100, trials and endless breakthroughs, account-wide fame with
catch-up, trophies, town, offline progress, cloud saves, and a new-version notice.

Built since, not yet uploaded (versions 20261010b to 20261010n; the in-game Updates
window lists each): abilities, boss mechanics, a run summary, keystones, challenge
towers with rules and a rewards ladder, a suggested challenge, mechanical relics,
Legend, the Beast Tamer and its tower, and a modifier of the week. Every item on the
[Roadmap](docs/design/11-roadmap.md) is done except the ones listed under "Still open".

The gaps the plan set out to close (1 to 6 are now built; what is left is below):

| # | Gap | Why it matters | File |
|---|-----|----------------|------|
| 1 | Combat is a stat check. No abilities, few decisions, bosses fight like big monsters. | It is half of what makes Echoes of Creation sticky. | [Combat](docs/design/03-combat.md) |
| 2 | Away towers pay small flat bonuses (+5 attack). | The "challenge their tower" pillar has no payoff worth chasing. | [Towers and challenges](docs/design/05-towers-and-challenges.md) |
| 3 | Too many layers hand out the same "x1.5 attack". | Big moments blur together; nothing feels HUGE. | [Progression layers](docs/design/06-progression-layers.md) |
| 4 | Flat rewards rot (+30 health is nothing at 60,000 attack). Player armor is still flat. | Early rewards become noise, late defence fails. | [Economy](docs/design/07-economy-and-currencies.md) |
| 5 | Every system is visible from minute one (9 tabs). | Idle games reveal systems one at a time; it is their main source of "something new". | [UI and feel](docs/design/09-ui-ux-and-feel.md) |
| 6 | Build balance is uneven late (crit builds about twice as fast as bleed). | Undercuts pillar 3. | [Classes and builds](docs/design/04-classes-and-builds.md) |

## Still open

- **Named weapons** from tier 100 of a challenge tower ([Equipment](docs/design/08-equipment-and-items.md)).
- **Each class's own relics** are still plain numbers; only the shared ones do something.
- **A second weapon carried into a run**, as a Legend unlock ([Progression layers](docs/design/06-progression-layers.md)).
- **Earth and the Void Tome** are about 35% faster than their classes to floor 75,
  though inside the target to floor 50
  ([Classes and builds](docs/design/04-classes-and-builds.md)).
- **"Layers get distinct jobs"**: milestone perks still hand out percentages.
- The Beast Tamer has no art.

## The plan

| Phase | Theme | Headline work |
|---|---|---|
| 1 | Make every reward mean something | Flat rewards become multipliers or mechanics; player armor becomes a share; layers get distinct jobs; tab unlocking. |
| 2 | Combat with depth | Class abilities on cooldowns, boss mechanics, readable fights. |
| 3 | Challenge towers | Away towers as challenges with goals and build-defining permanent unlocks. |
| 4 | The long game | A second prestige layer past floor 100, the Beast Tamer, seasonal-style challenge rotations. |

Detail and order of work: [Roadmap](docs/design/11-roadmap.md)

## The design files

| File | What it holds |
|---|---|
| [01 Vision and pillars](docs/design/01-vision-and-pillars.md) | What the game should feel like, the reference games, how the screen looks in my head |
| [02 Core loop and pacing](docs/design/02-core-loop-and-pacing.md) | The loops from one second to one month; walls and jumps; the target curve |
| [03 Combat](docs/design/03-combat.md) | How a fight works now and how it should deepen |
| [04 Classes and builds](docs/design/04-classes-and-builds.md) | The seven classes, their builds, the skill layout rules, balance |
| [05 Towers and challenges](docs/design/05-towers-and-challenges.md) | Home towers, away towers, trophies, challenge design |
| [06 Progression layers](docs/design/06-progression-layers.md) | Every layer of progress, what each resets, and what job each does |
| [07 Economy and currencies](docs/design/07-economy-and-currencies.md) | Gold, fame, experience, skill points; sources and sinks; flat vs multiplier |
| [08 Equipment and items](docs/design/08-equipment-and-items.md) | The blacksmith, relics, boons, and where build-defining items could live |
| [09 UI, UX and feel](docs/design/09-ui-ux-and-feel.md) | Screens, feedback, how big moments are shown, unlocking the interface |
| [10 Tech, saves and live updates](docs/design/10-tech-saves-and-updates.md) | Code layout, save rules, versioning, the balance bot |
| [11 Roadmap](docs/design/11-roadmap.md) | The phases in order, with what "done" means for each |
| [12 Open questions](docs/design/12-open-questions.md) | Decisions waiting on you |

## Sources

- Anthony Pecorella, *The Math of Idle Games*, parts [I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i) and [III](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii) (Kongregate; GDC Europe 2016 talk [*Quest for Progress*](https://www.slideshare.net/slideshow/quest-for-progress-gdc-europe-2016/65405507))
- [Incremental game](https://en.wikipedia.org/wiki/Incremental_game) and [Cell to Singularity](https://en.wikipedia.org/wiki/Cell_to_Singularity) (Wikipedia)
- Echoes of Creation: [Google Play listing](https://play.google.com/store/apps/details?id=echoforgegames.echoesofcreation&hl=en_US), [PocketGamer preview](https://www.pocketgamer.com/echoes-of-creation/upcoming-rpg-preview/), [IncrementalDB](https://www.incrementaldb.com/game/echoes-of-creation-auto-rpg)
- Design knowledge of Realm Grinder, Antimatter Dimensions, Clicker Heroes, NGU Idle and Melvor Idle, cited where used.
