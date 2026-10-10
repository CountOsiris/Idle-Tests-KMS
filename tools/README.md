# tools

Testing tools. The game never loads anything in this folder.
They need Microsoft Edge (installed on Windows) and Git Bash.

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
that is more than 25% off. Run it after changing a class, a boss or a tower. When a
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

## The saves

- `save-v1.json`: made by the version before the blacksmith (save version 1).
- `save-v3.json`: made by the version live on 9 October 2026 (save version 3).
- `save-v3-20261010a.json`: made by version 20261010a, the one live on 10 October 2026
  before boss mechanics, keystones, challenge towers, Legend and the Beast Tamer:
  three classes played, one ascension, relics held that no longer exist.

When an upload changes `saveVersion`, make a save with the version that is live
before the upload and add it here, so every future update is checked against it.
