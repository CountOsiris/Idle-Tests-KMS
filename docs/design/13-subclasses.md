# 13 · Subclasses (planned, not built)

Back to the [Masterplan](../../Masterplan.md).

**Status: planning only.** Asked for in October 2026: "unlockable subclasses for each
hero, for example the Zealot could get corrupted and go unholy, like an oath breaker
paladin from Baldur's Gate, but locked behind a longer grind to give the game some
longevity." Nothing here is in the game yet. This file is where the idea is worked out
before any of it is built, because it reworks what a class is.

## What a subclass is

A second version of a class that the same hero can become. It keeps the hero and its
history, and changes how it fights and what it is called. The Oathbreaker is still the
Zealot who climbed the Abbey; it has stopped praying.

- **One per class to begin with**, so eight. A second for each could come later.
- **A turn, not a new save.** Level, fame, trophies and the bestiary carry over. The
  class's weapons stay, but each does something different.
- **It can be undone.** A hero can go back, at a cost in time (the next ascension), so
  the choice is a commitment for a run of the game and never a trap. This follows the
  pillar that builds are choices.

## The eight, as first ideas

Each takes the class's own mechanic and turns it over. These are sketches to argue with.

| Class | Subclass | The turn | What changes in a fight |
|---|---|---|---|
| Zealot | **Oathbreaker** | Faith turned to spite | Devotion stops healing and deals its amount as damage each turn. Holy becomes unholy: the Abbey's dead no longer fear it, and the living do. Heals only from kills. |
| Barbarian | **Flesh-Eater** | Rage with nothing left to stop it | Lifesteal can raise health above its limit for the fight, and Rage counts that extra. The longer the run, the hungrier. |
| Warden | **Tyrant** | The shield as a weapon of rule | Vengeance is paid forward: the first hit it takes in a fight is dealt to every later enemy on that floor. |
| Ranger | **Poacher** | Hunting for the trophy, not the meal | Hunter's Mark applies to everything, and marked kills pay gold in place of experience. A gold build. |
| Assassin | **Plaguelord** | Poison let loose | Poison spreads to the next enemy at full stacks and never stops ticking, but the Plaguelord is poisoned too. |
| Warlock | **Lich** | Souls kept, not spent | Souls are no longer lost at death. They are the Lich's health: it has no health bar of its own. |
| Elementalist | **Voidcaller** | A fifth element | The four elements merge into one that takes the worst and best of each: every spell is a random element, and each hit of a new element in a row adds to a chain. |
| Beast Tamer | **Skinwalker** | No animal beside it: it is the animal | The companion's damage becomes the hero's own, and the hero takes the shape (and the weakness) of the beast it carries. |

## How it is earned: the long grind

It should be the longest goal in the game, after Legend.

- **Seen early, earned late.** The subclass is shown as a locked silhouette on the
  Character tab from the start, with its conditions listed, so the player knows what
  the grind is for. Idle games keep people by showing the next thing (Cell to
  Singularity's tree, Antimatter Dimensions' greyed-out layers).
- **Conditions that ask for breadth, not one number**, so it cannot be rushed with the
  one strong build:
  1. the class has become a legend at least three times;
  2. it holds every trophy of its own tower's opposite (the Zealot must clear the
     Crypt to floor 100: the place its faith is weakest);
  3. it has reached rank 5 with one ability of each of its weapons;
  4. a deed particular to the class (the Zealot: fall 1,000 times to the undead).
- **A cost that is paid once**: legend marks, well above the Beast Tamer's 12.

## What it would rework

- **Class files.** A subclass is close to a class file of its own: its own skills,
  milestones, boons, relics and abilities. The cheapest honest way is a second file per
  class (`classes/zealot-oathbreaker.js`) that names its parent and replaces the lists
  it changes, with everything else read from the parent.
- **Saves.** Skill levels, perks and boons are remembered by id per class. A subclass
  needs its own set, kept beside the parent's, so that turning back loses nothing.
- **Balance.** Eight more classes' worth of builds for `tools/balance.sh` to keep
  within reach of each other.
- **Art.** A second picture per class.

## Open questions

1. One subclass per class, or a choice of two (a "fall" and an "ascent")?
2. Is the turn permanent, or can a hero go back? (Suggested above: it can, at a cost.)
3. Do subclasses get towers of their own, or do they change the rules of the class's
   home tower?
4. Should the subclass be account-wide once earned, or earned per class?
