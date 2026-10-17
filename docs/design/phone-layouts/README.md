# Phone layouts tried on 17 October 2026

The owner asked for a cleaner phone view after the mobile game Reckoner Idle. Three
layouts were tried side by side on a throwaway copy of the game. Layout A was chosen
and built into the game properly (the "A phone, after Reckoner Idle" block at the end
of `style.css`, and the `phone-top` header in `index.html`). B and C are kept here in
case we come back to them. The game never loads anything in this folder.

- **A.** One-row header, the fight as a framed scene over the tower's picture, chips
  under it, round hero faces, a framed bottom tray. This is what the game has now.
- **B.** The light touch: the same header and picture, but today's cards and hero tiles
  kept, and only the tower and monster descriptions hidden.
- **C.** A, with the fight pinned to the top of the screen as a short strip while the
  other tabs scroll under it.

The pictures: `fight-tab.png` and `hero-tab.png` show the old phone view and A, B, C
next to each other; `a-and-c-whole-page.png` shows A and C scrolled down the whole page.

## Seeing them again

The prototype is not code for the game: `proto.js` moves parts of the page around after
it loads, which is quick for trying things and wrong for keeping. To look at it again:

1. Copy the whole game to a folder outside this one.
2. In the copy's `index.html`, add `<link rel="stylesheet" href="proto.css">` before
   `</head>` and `<script src="proto.js"></script>` before `</body>`, and copy the three
   files here next to it.
3. Open `index.html?v=b` (or `a`, `c`, `base`) in a narrow window. `&tab=character`
   opens another tab.

`compare.html` shows all four next to each other, one frame each. It needs two more
things in the copy: a `save-pre.js` that puts a save in the browser (see "check" in
`tools/run.sh` for how), and the "One tab at a time" lines in `game/start.js` taken
out, or the frames stop each other.

`proto.css` was written against the game as it was that day (20261016e). Since A is now
in the game itself, B and C would sit on top of it; to try one for real, start from its
rules in `proto.css` and the A block in `style.css`.
