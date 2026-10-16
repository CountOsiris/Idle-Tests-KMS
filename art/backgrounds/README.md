# Tower backgrounds

The picture behind the fight on a wide screen, one for each tower. A tower uses one
through its `background:` line in towers.js. Phones do not show them.

Made by the owner with the image generator Dola AI (October 2026). Each one was cut
down to remove the generator's mark in the bottom-right corner, and saved as a
1920-pixel JPG to keep the game quick to load. The Wild Reaches came out square and
small, so it is a strip from its middle, enlarged: a new one at 16:9 would be sharper.

The game dims each picture and darkens it along the ground, so the names and numbers
stand out (style.css, "A tower's painted background").

## To make one

Pick the 16:9 shape in the generator, and paste the whole prompt. Keep everything but
the scene and the ground the same, so the pictures belong together:

> Wide 16:9 landscape image, 1920x1080. Dark fantasy pixel art game battle background, 16-bit retro style with visible pixels. Side view of **(the scene)**. Flat empty **(the ground)** across the bottom third of the image. The centre of the image is open, calm and darker, with no objects in the middle. Muted earthy colours, darker at the bottom and edges. Completely empty scene: no people, no characters, no creatures, no text, no logo, no border, no frame, no user interface.

| File | Tower | The scene | The ground |
|---|---|---|---|
| orc-stronghold.jpg | Orc Stronghold | a crude orc fortress of sharpened logs and iron spikes, war banners and smoking braziers, under a burnt orange dusk sky | trampled mud ground |
| raiders-pass.jpg | Raider's Pass | a narrow rocky mountain pass with a broken wagon and an abandoned camp, cliffs on both sides, under a grey-blue overcast sky | dusty gravel road |
| wildwood.jpg | Wildwood | an ancient forest clearing with huge mossy trees and twisted roots, green light through the canopy | mossy forest floor with fallen leaves |
| undercity.jpg | The Undercity | a dark sewer street under a city, stone arches, dripping pipes, purple and amber lanterns | wet cobblestone floor |
| iron-crypt.jpg | Iron Crypt | a cold stone crypt hall with iron coffins and armoured statues along the walls, pale blue torchlight | cracked flagstone floor |
| storm-peak.jpg | Storm Peak | a windswept mountain summit, jagged peaks behind, a teal storm sky with distant lightning | bare rock with patches of snow |
| haunted-abbey.jpg | Haunted Abbey | a ruined gothic abbey hall, broken stained glass windows, toppled pews, guttering candles | worn stone tile floor with violet mist |
| wild-reaches.jpg | The Wild Reaches | open golden-brown grassland, lone dead trees, distant hills, a wide hazy sky | short dry grass and dirt |

For a new tower: save the picture here, and add  `background: "art/backgrounds/<file>"`
under the tower's `sky:` line in towers.js.
