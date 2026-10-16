# tools

Testing tools. The game never loads anything in this folder.
They need Microsoft Edge (installed on Windows) and Git Bash.

Every run opens its own hidden Edge. `tools/run.sh` lets only 3 be open at once and
makes the rest wait their turn, because many at once crashed the PC. To change the
limit for one command: `LLOEGRYS_MAX_EDGE=2 bash tools/run.sh ...`

## The balance bot

Plays classes for simulated hours in a hidden browser, as fast as the computer
allows, spending skill points, picking perks, using the blacksmith and (if asked)
ascending, then reports when each floor was first reached.

```
bash tools/run.sh sim "h=14"                   every class, 14 hours, no ascending
bash tools/run.sh sim "h=24,ascend,c=warlock"  one class, 24 hours, ascending when stuck
bash tools/run.sh sim "h=6,every,c=barbarian"  every weapon of one class
```

All the options are listed at the top of `bot.js`. A 14-hour run of every class
takes about a minute. The bot plays well but not perfectly; compare runs with each
other, not with real players, and run twice before trusting a small difference.

## The balance report

```
bash tools/balance.sh                 every build, 30 hours, 3 runs, time to floor 50
bash tools/balance.sh 30 5 50 ranger  hours, runs, floor, and one class only
```

Says how each weapon or element compares with the average of its class, and marks any
that is more than 25% off. For the deep game, play everything for 100 hours and read
floors 100 to 500 and "best":

```
bash tools/run.sh sim "h=100,every,ascend,killers"
```

Two more options say WHY a build is where it is. `probe` prints, floor by floor, the
hero's attack against a monster's health and its health against a monster's attack, and
what the deepest run's damage was made of. `mul=health:3,after=75` is a what-if: play
as if a floor 75 perk tripled health (any stat `multiplier` knows), to see what a build
is short of before changing its perks.

```
bash tools/run.sh sim "h=100,every,ascend,probe,c=warden"
bash tools/run.sh sim "h=100,every,ascend,c=warden,mul=damage:3+health:3,after=75"
```

And `skillcheck` tests every skill: how much slower a build climbs with that skill left
unbought. A skill that makes the climb FASTER when skipped is a trap.

```
bash tools/run.sh sim "h=20,ascend,skillcheck,to=50,runs=10,c=ranger"
```

`skillcheck` only says faster or slower. To see whether a skill makes a class climb
DEEPER, play 100 hours with it never bought (`skip=` takes skill ids) beside a normal run:

```
bash tools/run.sh sim "h=100,every,ascend,skip=toughness,c=barbarian"
```

`perkcheck` does the same for milestone perks: one climb with each perk forced. With
`every` it tests each weapon, `pf=50+75+100` keeps it to those floors, `pruns=3` averages
three climbs. One climb is only good to about 25 floors, so average a kind of perk over
many builds before believing a gap.

```
bash tools/run.sh sim "h=30,every,perkcheck,pf=50+75+100,c=warden"
```

`edge` says how fights go at the deepest floors a class can reach: turns to win an
ordinary fight and a boss, and how many ordinary hits bring the hero down (from the
AVERAGE hit: a class with a guard takes half its hits behind it, and the middle hit lies).

For another class's tower, `t=ranger,home=15` plays 15 hours at home first and only then
goes there, as a player would. A class sent there from its first minute gets nowhere,
and that says nothing about the tower.

```
bash tools/run.sh sim "h=30,every,ascend,home=15,t=ranger"
```

A build whose "best" is several times the others', or that has no killers at all, has
found something that grows without limit. Run it after changing a class, a boss or a tower. When a
build looks wrong, ask the bot what is killing it before changing its numbers:

```
bash tools/run.sh sim "h=22,every,ascend,killers,c=ranger"
```

## The pre-upload check

Loads an old save into the current game, checks it came through, plays every class,
opens every tab, and checks the content lists (no name used twice, no missing text).

```
bash tools/run.sh check tools/saves/save-v3.json
```

It ends with `ALL GOOD` or the number of problems. Run it with every save in
`tools/saves/` before uploading.

## A picture of the page

```
bash tools/run.sh shot "openUpdates();" picture.png
```

Opens the game as a new player, runs the code given, and saves a picture of the page.

## A new version

```
bash tools/version.sh 20261011a
```

Sets the version in all three places (see the comment in `index.html`). Then add an
entry for it at the top of `updates.js`: the pre-upload check fails without one.

## Friends and chat, without the real server

```
python tools/fake-cloud.py        the game at http://127.0.0.1:8642/, with a pretend server
python tools/friends-check.py     (in another window) checks the friends and chat functions
```

`fake-cloud.py` answers the game's online calls from a Postgres database on this
computer, in place of Supabase, so two browsers (or two Edge profiles) can add each
other and chat without touching anybody's real account. The database needs
`cloud-setup.sql` run on it, a schema called `extensions` and the roles `anon` and
`authenticated`, as Supabase has; the top of `fake-cloud.py` says how. `friends-check.py`
makes new accounts each run and must end `ALL GOOD`.

After changing the friends part of `cloud-setup.sql`, run the whole file again in
Supabase's SQL Editor. Until then the live game says friends are not switched on yet.

## The monsters' pictures

```
python tools/monster-art.py          fetch every picture again
python tools/monster-art.py sheet    and save monster-sheet.png to look at them all
```

The monsters and bosses are tiles from Dungeon Crawl Stone Soup, released by their
artists under CC0 (free to use, no conditions). The table at the top of the script says
which tile is which monster; change a line and run it to swap a picture. It refuses any
tile on that project's list of tiles with an unclear licence, and writes `art/CREDITS.md`.

## The saves

- `save-v1.json`: made by the version before the blacksmith (save version 1).
- `save-v3.json`: made by the version live on 9 October 2026 (save version 3).
- `save-v3-20261010a.json`: made by version 20261010a, the one live on 10 October 2026
  before boss mechanics, keystones, challenge towers, Legend and the Beast Tamer:
  three classes played, one ascension, relics held that no longer exist.

When an upload changes `saveVersion`, make a save with the version that is live
before the upload and add it here, so every future update is checked against it.

## The map

```
python tools/map.py
```

Writes `docs/MAP-WORDS.md`: every bonus word, who gives it, whether any of those can be
bought forever, and where the game reads it. It prints the words that are given but read
nowhere (they do nothing) and the ones read but never given. Run it after changing
content. `docs/MAP.md` explains how to read it.
