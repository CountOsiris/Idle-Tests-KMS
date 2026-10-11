# The pictures

- `art/<class>.png` are the classes.
- `art/monsters/<name>.png` are the monsters and bosses. They began as free tiles
  from Dungeon Crawl Stone Soup, fetched and smoothed by `tools/monster-art.py`.
  [CREDITS.md](CREDITS.md) says which is which.

## Replacing a monster's picture with your own

1. Make the picture. [PROMPTS.md](PROMPTS.md) has a prompt for every monster and one
   style line to put in front of each, so that they match.
2. Save it **over the old file**, with the same name: the Goblin is
   `art/monsters/goblin.png`. Nothing else in the game needs to change.
3. Add the file's name to [own-art.txt](own-art.txt), on a line of its own. That stops
   `tools/monster-art.py` from ever fetching the old tile back over it, and moves the
   picture to "the game's own" in the credits.
4. Run `bash tools/run.sh check tools/saves/save-v3.json`. It fails if a picture named
   in `towers.js` is missing or is not a picture.

Pictures can be replaced one at a time. The old and the new sit side by side until
they are all done.

## What a picture should be

| | |
|---|---|
| File | PNG with a **transparent background** |
| Shape | Square is easiest. Any shape works: the game shows every picture 170 pixels tall. |
| Size | 192 pixels or more each way. 256 or 512 is fine. |
| Small pixel art | A picture **96 pixels tall or less** is shown with hard, sharp pixels. Anything taller is scaled softly. So true pixel art should be saved small (64 or 96), or enlarged by whole numbers (4x, 8x) before saving. |
| Facing | Left, towards your hero. The figure's feet should be at the bottom edge: every fighter stands on the same floor. |
| Margin | Little or none. Empty space round the figure makes it look small. |

## A new monster

Add its line to a tower in `towers.js` with `art: "art/monsters/<name>.png"`, put the
picture there, and name it in `own-art.txt`. To have a prompt written for it too, add
it to the `ART` and `LOOK` lists in `tools/monster-art.py` and run
`python tools/monster-art.py prompts`.
