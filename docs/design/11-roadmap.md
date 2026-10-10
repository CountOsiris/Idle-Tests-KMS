# 11 · Roadmap

Back to the [Masterplan](../../Masterplan.md).

Each phase ends with a balance run (every class, every build) and an old-save check
before upload. Order within a phase is the suggested order of work.

## Phase 1: Make every reward mean something

Goal: nothing the player earns becomes noise; the layers stop competing.

**Status (10 October 2026): built, not yet uploaded.** Items 1 to 7 are done, with
two changes from the plan: blacksmith milestones became bigger tier jumps (no separate
every-25-steps milestone), and flat *armor* rewards were kept, because armor is now a
rating whose worth lasts. "Layers get distinct jobs" (moving percentages out of
milestone perks) moves to Phase 2 with the keystone perks.
Added during Phase 1: runs sweep through floors the class clears without slowing down
(see [Core loop and pacing](02-core-loop-and-pacing.md)).

1. Convert flat rewards (milestone perks, trophies, relics, town) to percentages.
   [Economy](07-economy-and-currencies.md)
2. Player armor as a share of each hit; give the Bladed Shield its own number.
   [Combat](03-combat.md)
3. Blacksmith tier jumps x1.5 and a milestone every 25 steps.
   [Equipment](08-equipment-and-items.md)
4. Interface unlocks one tab at a time, with banners. [UI](09-ui-ux-and-feel.md)
5. Three tiers of announcement (toast, banner, full-stage). [UI](09-ui-ux-and-feel.md)
6. Ascension tab: fame per hour now vs. pushing. [Core loop](02-core-loop-and-pacing.md)
7. Move the balance bot and an old-save check into `tools/`. [Tech](10-tech-saves-and-updates.md)

Done when: a fresh player sees a new tab or system at least every 20 minutes for the
first 3 hours, and no reward in the game is a flat number.

## Phase 2: Combat with depth

1. ~~Split `game.js` into files.~~ Done: `game/`. [Tech](10-tech-saves-and-updates.md)
2. ~~Ability system, slots at floors 10, 35, 75; six abilities per class.~~ Done:
   five per class (six for the Elementalist), each Auto / Bosses only / Manual.
   [Combat](03-combat.md)
3. ~~Boss mechanics, one or two per tower.~~ Done: one per boss, five kinds.
   [Combat](03-combat.md)
4. ~~Run summary on death.~~ Done. [Combat](03-combat.md)
5. ~~Build balance pass: every weapon within ±25% of its class to floor 50.~~ Done:
   measured with `tools/balance.sh`, every build is inside the target with no class
   number changed. [Classes](04-classes-and-builds.md)
6. ~~Keystone perks at 50, 75, 100.~~ Done, one floor later so they never replace a
   build perk: one per weapon or element at 51, three shared ones at 76 and at 101.
   [Classes](04-classes-and-builds.md)

Done when: two builds of the same class look different on the stage, and every boss
announces what it does.

## Phase 3: Challenge towers

1. ~~Challenge tiers with goals and rules in every away tower.~~ Done: six tiers and
   one rule for challengers in each tower. [Towers](05-towers-and-challenges.md)
2. ~~Rewards ladder: % stats → techniques → abilities → relic slot → keystone and named
   weapon.~~ Done, except the named weapon. [Towers](05-towers-and-challenges.md),
   [Equipment](08-equipment-and-items.md)
3. ~~Suggest the best away tower when the home tower hits a wall.~~ Done.
4. Separate relics (mechanical, rarer) from boons. [Equipment](08-equipment-and-items.md)

Done when: a class stuck at a wall has a visible, worthwhile challenge to go and win.

## Phase 4: The long game

1. Second prestige layer ("Legend") after floor 100. [Progression layers](06-progression-layers.md)
2. Beast Tamer, the eighth class.
3. Rotating weekly challenge modifiers across all towers.

## Not planned (by decision)

Loot drops, risk-of-loss mechanics, death taxes, timers the player must beat, paid
randomness.
