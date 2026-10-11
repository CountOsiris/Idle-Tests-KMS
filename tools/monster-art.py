# =====================================================================
#  tools/monster-art.py - fetches the monsters' pixel art. NOT part of the game.
#
#  The pictures are tiles from Dungeon Crawl Stone Soup (https://github.com/crawl/crawl),
#  whose tile artists released them under CC0, a public domain dedication. A few of
#  that game's tiles have an unclear licence; the project keeps a list of them
#  (https://github.com/crawl/tiles, TILES_UNDER_UNKNOWN_LICENSE.md) and this script
#  refuses to take any tile on that list.
#
#    python tools/monster-art.py          fetch every picture in the table below
#    python tools/monster-art.py sheet    also save monster-sheet.png to look at them all
#    python tools/monster-art.py prompts  only write art/PROMPTS.md: a prompt for each
#                                         monster, for drawing or generating your own
#
#  YOUR OWN PICTURES. Save one over a file in art/monsters/ and add its name to
#  art/own-art.txt. This script then leaves it alone for good, and art/CREDITS.md
#  lists it as the game's own. See art/README.md.
#
#  TO GIVE A MONSTER ANOTHER PICTURE: change its line in the table, run this again, and
#  it writes art/monsters/<file>.png. towers.js names that file on the monster's line.
#  art/CREDITS.md is written from the same table.
#
#  WHAT IS DONE TO A TILE. The tiles are 32 pixels square. Shown as big as the fight
#  needs, every pixel was a block, beside classes that are painted large. So each tile
#  is enlarged to 192 pixels with its stair-steps rounded off (three passes of the
#  Scale2x rule, then a soft shrink): see "smooth" below. One tile is also redrawn: there
#  is no boar in the set, so the Wild Boar is the hog, recoloured brown and given a
#  bristled back and tusks ("make_boar"). CC0 allows any change.
#  Needs Python with the numpy and Pillow packages.
# =====================================================================

import io, os, sys, urllib.request

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# How tall and wide the finished pictures are, in pixels (the tiles are 32)
PICTURE_SIZE = 192

# How closely two colours must match to count as the same when edges are rounded off:
# 8 is exactly, 4 is "nearly". Lower smooths more and loses more detail.
COLOUR_BITS = 4

TILES = "https://raw.githubusercontent.com/crawl/crawl/master/crawl-ref/source/rltiles/mon/"
UNKNOWN = "https://raw.githubusercontent.com/crawl/tiles/master/TILES_UNDER_UNKNOWN_LICENSE.md"

# our file name -> (the monster or boss it is for, the tile's path in Dungeon Crawl)
ART = {
    # Orc Stronghold
    "goblin": ("Goblin", "humanoids/goblin"),
    "orc-grunt": ("Orc Grunt", "humanoids/orcs/orc"),
    "warg": ("Warg", "animals/warg"),
    "orc-warrior": ("Orc Warrior", "humanoids/orcs/orc_warrior"),
    "orc-berserker": ("Orc Berserker", "humanoids/orcs/orc_knight"),
    "ogre": ("Ogre", "humanoids/ogre"),
    "orc-warlord": ("Orc Warlord", "humanoids/orcs/orc_warlord"),
    "ogre-chieftain": ("Ogre Chieftain", "humanoids/two_headed_ogre"),
    "warg-mother": ("Warg Mother", "animals/hound"),
    # Raider's Pass
    "cutpurse": ("Cutpurse", "humanoids/halfling"),
    "raider": ("Raider", "humanoids/humans/human"),
    "crossbowman": ("Crossbowman", "humanoids/elves/deep_elf_archer"),
    "duelist": ("Duelist", "humanoids/elves/deep_elf_blademaster"),
    "raider-captain": ("Raider Captain", "humanoids/humans/imperial_myrmidon"),
    "pit-fighter": ("Pit Fighter", "humanoids/ironbound_thunderhulk"),
    "bandit-king": ("Bandit King", "humanoids/humans/vault_warden"),
    "twin-blades": ("The Twin Blades", "humanoids/humans/hell_knight"),
    "warlord-of-the-pass": ("Warlord of the Pass", "humanoids/humans/vault_sentinel"),
    # Wildwood
    "wild-boar": ("Wild Boar", "animals/hog"),
    "giant-spider": ("Giant Spider", "animals/wolf_spider"),
    "dire-wolf": ("Dire Wolf", "animals/wolf"),
    "treant": ("Treant", "fungi_plants/treant"),
    "forest-troll": ("Forest Troll", "humanoids/troll"),
    "dire-bear": ("Dire Bear", "animals/black_bear"),
    "spider-queen": ("Spider Queen", "animals/broodmother"),
    "elder-treant": ("Elder Treant", "fungi_plants/thorn_hunter"),
    "troll-king": ("Troll King", "humanoids/iron_troll"),
    # The Undercity
    "sewer-rat": ("Sewer Rat", "animals/rat"),
    "thug": ("Thug", "humanoids/hobgoblin"),
    "smuggler": ("Smuggler", "humanoids/kobold_brigand"),
    "watchman": ("Watchman", "humanoids/humans/vault_guard"),
    "plague-bearer": ("Plague Bearer", "undead/bloated_husk"),
    "enforcer": ("Enforcer", "humanoids/gnoll_sergeant"),
    "rat-king": ("Rat King", "animals/sewage_sovereign"),
    "guildmaster": ("Guildmaster", "humanoids/humans/servant_of_whispers"),
    "butcher": ("The Butcher", "humanoids/oni"),
    # Iron Crypt
    "skeleton": ("Skeleton", "undead/skeletal_warrior"),
    "armored-ghoul": ("Armored Ghoul", "undead/ghoul"),
    "bone-knight": ("Bone Knight", "undead/ancient_champion"),
    "iron-golem": ("Iron Golem", "nonliving/iron_golem"),
    "crypt-guardian": ("Crypt Guardian", "undead/guardian_mummy"),
    "death-knight": ("Death Knight", "humanoids/humans/death_knight"),
    "bone-lich": ("Bone Lich", "undead/lich"),
    "iron-colossus": ("Iron Colossus", "humanoids/giants/iron_giant"),
    "entombed-king": ("The Entombed King", "undead/royal_mummy"),
    # Storm Peak
    "harpy": ("Harpy", "demihumanoids/harpy"),
    "rock-imp": ("Rock Imp", "demons/iron_imp"),
    "frost-wisp": ("Frost Wisp", "nonliving/orb_of_winter"),
    "venom-drake": ("Venom Drake", "dragons/swamp_drake"),
    "magma-hound": ("Magma Hound", "animals/hell_hound"),
    "storm-giant": ("Storm Giant", "humanoids/giants/titan"),
    "thunderbird": ("Thunderbird", "animals/shard_shrike"),
    "mountain-heart": ("Mountain Heart", "nonliving/crystal_guardian"),
    "red-dragon": ("Red Dragon", "dragons/fire_dragon"),
    # Haunted Abbey
    "zombie": ("Zombie", "undead/zombies/zombie_human"),
    "ghoul": ("Ghoul", "undead/necrophage"),
    "restless-monk": ("Restless Monk", "humanoids/humans/burial_acolyte"),
    "wraith": ("Wraith", "undead/wraith"),
    "vampire-thrall": ("Vampire Thrall", "undead/vampire"),
    "banshee": ("Banshee", "undead/drowned_soul"),
    "abbot": ("The Abbot", "humanoids/humans/ragged_hierophant"),
    "vampire-lord": ("Vampire Lord", "undead/vampire_bloodprince"),
    "lich-bishop": ("Lich Bishop", "undead/dread_lich"),
    # The Wild Reaches
    "hyena": ("Hyena", "animals/jackal"),
    "tusker": ("Tusker", "animals/hell_hog"),
    "viper": ("Viper", "animals/adder"),
    "sabrecat": ("Sabrecat", "animals/manticore"),
    "rhino": ("Rhino", "animals/death_yak"),
    "great-ape": ("Great Ape", "animals/howler"),
    "pride-lord": ("Pride Lord", "demihumanoids/sphinx_marauder"),
    "elder-serpent": ("Elder Serpent", "animals/anaconda"),
    "mammoth-matriarch": ("Mammoth Matriarch", "animals/elephant_dire"),
}

# Pictures that are not monsters: the path under art/ -> (what it is for, the tile)
OTHER = {
    "beasttamer.png": ("The Beast Tamer (the class)", "humanoids/humans/ironbound_beastmaster"),
}

# What each monster looks like, in a few words: the line art/PROMPTS.md gives for it
# (python tools/monster-art.py prompts). Written for someone drawing or generating a
# picture of their own. Every name in ART needs a line here.
LOOK = {
    "goblin": "a small green goblin with long ears, clutching a bulging coin purse and a rusty knife",
    "orc-grunt": "a thick-necked grey-green orc in scraps of hide, holding a notched cleaver",
    "warg": "a huge shaggy black wolf with a heavy jaw and yellow eyes, hackles up",
    "orc-warrior": "a broad orc in battered iron plates with a round shield and a war axe",
    "orc-berserker": "a bare-chested orc painted with red war paint, roaring, an axe in each hand",
    "ogre": "a towering fat ogre with a tree-trunk club and a tiny head",
    "orc-warlord": "a scarred orc chief in spiked black armor and a horned helm, a banner on his back",
    "ogre-chieftain": "a two-headed ogre draped in skulls, the heads arguing, holding a boulder on a chain",
    "warg-mother": "an enormous scarred she-wolf, grey at the muzzle, with pups' eyes in the dark behind her",
    "cutpurse": "a slight hooded thief in patched leather, a dagger in one hand and a stolen purse in the other",
    "raider": "a wild-haired raider in furs, charging with a raised sword and no shield",
    "crossbowman": "a lean mercenary in a kettle helm, sighting down a heavy crossbow",
    "duelist": "a poised swordsman in a dark doublet, rapier forward and off hand behind his back",
    "raider-captain": "a raider captain in a plumed helm and a breastplate, pointing a sabre",
    "pit-fighter": "a massive shaven-headed brawler with chained fists and old scars",
    "bandit-king": "a grinning bandit lord in a stolen crown and a fur cloak, with a jewelled mace",
    "twin-blades": "two identical masked fighters back to back, each with a curved blade",
    "warlord-of-the-pass": "a giant armored warlord in a wolf pelt, holding a great axe across the mountain road",
    "wild-boar": "a dark brown wild boar with a bristled ridge along its back and curved ivory tusks, head down to charge",
    "giant-spider": "a hairy brown spider the size of a horse, front legs raised, many black eyes",
    "dire-wolf": "a lean grey forest wolf, far too large, snarling with its ears flat",
    "treant": "a walking oak with a face in its bark, moss on its shoulders, branch arms",
    "forest-troll": "a hunched moss-green troll with long arms, a wide mouth and bark-like skin",
    "dire-bear": "a great black bear reared on its hind legs, claws out",
    "spider-queen": "a bloated pale spider with a crown of spines, egg sacs and web around her",
    "elder-treant": "an ancient thorn-covered tree giant, dead branches for a crown, glowing green eyes",
    "troll-king": "a huge grey troll in a crown of antlers, with a stone hammer",
    "sewer-rat": "a mangy brown rat as big as a dog, with red eyes and a wet tail",
    "thug": "a heavy-set street thug with a broken nose, a cudgel and rolled sleeves",
    "smuggler": "a wiry smuggler in a long coat with a lantern and a hooked knife",
    "watchman": "a city watchman in a blue tabard and a steel cap, with a halberd, bought and paid for",
    "plague-bearer": "a swollen, bandaged figure dripping green, flies around it",
    "enforcer": "a tall enforcer in studded leather with a spiked club and a guild badge",
    "rat-king": "a tangle of giant rats tied by their tails, wearing a crown of scrap",
    "guildmaster": "a thin elegant figure in a dark hood and silk, face in shadow, a thin dagger held low",
    "butcher": "a vast man in a bloody apron and a sack mask, with a cleaver and a meat hook",
    "skeleton": "a skeleton in a rusted helm with a sword and a cracked shield",
    "armored-ghoul": "a grey-skinned ghoul bolted into mismatched plate armor, claws through the gauntlets",
    "bone-knight": "a skeletal knight in ornate dark armor, with a tattered cloak and a great sword",
    "iron-golem": "a blocky iron golem with rivets, a furnace glow in its chest and fists like anvils",
    "crypt-guardian": "a tall bandaged mummy with a bronze mask and a hooked spear",
    "death-knight": "a black-armored knight with a skull visor and a sword that burns with pale flame",
    "bone-lich": "a robed skeleton sorcerer, blue fire in its eye sockets, with a staff of bones",
    "iron-colossus": "a giant iron statue of a king come to life, taller than the vault, rust at its joints",
    "entombed-king": "a crowned royal mummy in gold and lapis, rising from a sarcophagus",
    "harpy": "a winged woman with talons, feathered arms and a shrieking mouth",
    "rock-imp": "a small grey stone imp with stubby wings and a wicked grin",
    "frost-wisp": "a floating orb of blue-white frost with trailing ice crystals",
    "venom-drake": "a small green wingless dragon with a frilled neck, dripping venom",
    "magma-hound": "a black hound with cracks of glowing lava in its hide and a burning mane",
    "storm-giant": "a bearded giant wreathed in cloud, a lightning bolt in his fist",
    "thunderbird": "a great eagle with storm-blue feathers and sparks along its wings",
    "mountain-heart": "a living mass of jagged crystal with a glowing core, floating above broken rock",
    "red-dragon": "a red dragon coiled on a peak, wings spread, fire in its throat",
    "zombie": "a shambling corpse in a torn shroud, one arm reaching",
    "ghoul": "a crouched, hairless corpse-eater with long claws and a split jaw",
    "restless-monk": "a dead monk in a rotting habit, the hood empty but for two points of light, holding a censer",
    "wraith": "a hovering black shade in a tattered robe, with long fingers and no face",
    "vampire-thrall": "a pale servant in old livery with blood at the mouth and hollow eyes",
    "banshee": "a ghostly woman with streaming white hair, mid-scream",
    "abbot": "a gaunt abbot in ragged vestments and a broken mitre, holding a crooked staff",
    "vampire-lord": "a tall vampire noble in a red-lined cloak, with claws and a cold smile",
    "lich-bishop": "a skeletal bishop in rotted gold vestments, with a black crozier and a halo of green fire",
    "hyena": "a spotted hyena with a sloping back, laughing with bared teeth",
    "tusker": "a red-eyed giant warthog with four tusks and a bony armored head",
    "viper": "a coiled green-and-black viper, hood flared, fangs out",
    "sabrecat": "a tawny big cat with sabre teeth, crouched to spring",
    "rhino": "a grey rhinoceros with a cracked horn, pawing the dust",
    "great-ape": "a silverback ape beating its chest, mouth open in a roar",
    "pride-lord": "a huge black-maned lion with battle scars, standing on a rock",
    "elder-serpent": "a colossal python, thick as a tree, with old scars and moss on its scales",
    "mammoth-matriarch": "an old mammoth with long curved tusks, broken at one tip, and ragged ears",
}

# The same, for the pictures in OTHER
OTHER_LOOK = {
    "beasttamer.png": "a weathered tamer in furs and leather with a hooked staff, a wolf at heel and a hawk on the wrist",
}

# What every prompt starts with, so the pictures belong together and beside the classes
PROMPT_STYLE = "Dark fantasy game sprite, detailed pixel art, a single full figure seen from the side and facing left, muted earthy colours with one strong accent, lit from the upper left, soft dark outline, plain transparent background, no ground, no text, no border."

# art/own-art.txt: the pictures the game's owner made or had made. This script never
# replaces those, and credits them separately. One file name a line.
def own_art(here):
    path = os.path.join(here, "art", "own-art.txt")
    if not os.path.exists(path):
        return set()
    names = set()
    for line in io.open(path, encoding="utf-8").read().splitlines():
        line = line.strip()
        if line != "" and not line.startswith("#"):
            names.add(line[:-4] if line.endswith(".png") else line)
    return names

def write_prompts(here):
    missing = [n for n in ART if n not in LOOK] + [n for n in OTHER if n not in OTHER_LOOK]
    assert not missing, "no line in LOOK for: " + ", ".join(missing)
    lines = [
        "# Prompts for the monsters' pictures",
        "",
        "Written by `python tools/monster-art.py prompts` from the lists in that file. To change",
        "a line, change it there. How to put a finished picture in the game is in",
        "[README.md](README.md).",
        "",
        "## The style line",
        "",
        "Put this in front of every prompt, so the pictures belong together:",
        "",
        "> " + PROMPT_STYLE,
        "",
        "## One line for each picture",
        "",
        "| File to save it as | Monster | Prompt |",
        "|---|---|---|",
    ]
    for name, (monster, tile) in ART.items():
        lines.append("| `art/monsters/" + name + ".png` | " + monster + " | " + LOOK[name] + " |")
    for path, (what, tile) in OTHER.items():
        lines.append("| `art/" + path + "` | " + what + " | " + OTHER_LOOK[path] + " |")
    io.open(os.path.join(here, "art", "PROMPTS.md"), "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
    print("wrote art/PROMPTS.md (" + str(len(ART) + len(OTHER)) + " prompts)")

def fetch(url):
    with urllib.request.urlopen(url, timeout=30) as answer:
        return answer.read()

def scale2x(rgba):
    # One pass of the Scale2x rule: every pixel becomes four, and a corner takes the
    # colour of its two neighbours where they agree. That turns a stair-step into a slope.
    # "Agree" means nearly the same colour, not exactly: the tiles shade with many close
    # tones, and asking for an exact match left every block inside a figure untouched.
    # Each colour is compared by its top COLOUR_BITS bits only.
    drop = 8 - COLOUR_BITS
    key = ((rgba[..., 0].astype(np.int64) >> drop) << 16) | ((rgba[..., 1].astype(np.int64) >> drop) << 8) | (rgba[..., 2].astype(np.int64) >> drop)
    key[rgba[..., 3] < 16] = -1
    pad = np.pad(key, 1, mode="edge")
    colours = np.pad(rgba, ((1, 1), (1, 1), (0, 0)), mode="edge")
    up, right, left, down = pad[:-2, 1:-1], pad[1:-1, 2:], pad[1:-1, :-2], pad[2:, 1:-1]
    up_c, right_c, left_c, down_c = colours[:-2, 1:-1], colours[1:-1, 2:], colours[1:-1, :-2], colours[2:, 1:-1]

    out = np.repeat(np.repeat(rgba, 2, axis=0), 2, axis=1).copy()
    top_left = (left == up) & (left != down) & (up != right)
    top_right = (up == right) & (up != left) & (right != down)
    bottom_left = (down == left) & (down != right) & (left != up)
    bottom_right = (right == down) & (right != up) & (down != left)
    out[0::2, 0::2][top_left] = up_c[top_left]
    out[0::2, 1::2][top_right] = right_c[top_right]
    out[1::2, 0::2][bottom_left] = left_c[bottom_left]
    out[1::2, 1::2][bottom_right] = down_c[bottom_right]
    return out

def smooth(tile):
    # 32 pixels -> 256 with rounded steps -> a soft shrink to PICTURE_SIZE.
    # (The colours are multiplied by their transparency first, or the see-through
    # pixels round the edge would bleed a dark rim into the picture.)
    rgba = np.array(tile.convert("RGBA"))
    for _ in range(3):
        rgba = scale2x(rgba)
    work = rgba.astype(np.float32)
    alpha = work[..., 3:4] / 255.0
    work[..., :3] *= alpha
    big = Image.fromarray(work.clip(0, 255).astype(np.uint8), "RGBA")

    # A median filter flattens what is left of the blocks into even areas of colour
    # without smearing the outlines, the way a blur would
    big = Image.merge("RGBA", [band.filter(ImageFilter.MedianFilter(9)) for band in big.split()])
    soft = big.filter(ImageFilter.GaussianBlur(0.8)).resize((PICTURE_SIZE, PICTURE_SIZE), Image.LANCZOS)
    work = np.array(soft).astype(np.float32)
    alpha = work[..., 3:4] / 255.0
    work[..., :3] = np.where(alpha > 0, work[..., :3] / np.maximum(alpha, 1e-6), 0)
    picture = Image.fromarray(work.clip(0, 255).astype(np.uint8), "RGBA")

    # ...and a little sharpening brings the edges back up
    return picture.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))

def make_boar(hog):
    # The hog is pink. A boar is dark brown, darker along the back, with a ridge of
    # bristles, a darker snout and two ivory tusks. Drawn on the 32 pixel tile.
    work = np.array(hog.convert("RGBA")).astype(np.float32)
    red, green, blue, alpha = work[..., 0], work[..., 1], work[..., 2], work[..., 3]
    hide = (alpha > 0) & (red > 60) & (red > green + 10)
    light = (red + green + blue) / 3.0
    rows = np.arange(32).reshape(32, 1)
    shade = np.clip(0.62 + (rows - 5) * 0.022, 0.55, 1.0)
    for channel, share in enumerate((0.58, 0.40, 0.27)):
        work[..., channel] = np.where(hide, light * share * shade, work[..., channel])

    boar = Image.fromarray(work.clip(0, 255).astype(np.uint8), "RGBA").copy()
    pixel = boar.load()
    for x, top in ((11, 4), (13, 3), (15, 3), (17, 2), (19, 3), (21, 3), (23, 4)):
        pixel[x, top] = (20, 14, 10, 255)
        pixel[x, top + 1] = (58, 40, 27, 255)
    for x in range(12, 24):
        pixel[x, 5] = (52, 36, 24, 255)
    for x, y in ((5, 22), (5, 21), (6, 20), (8, 22), (8, 21)):
        pixel[x, y] = (236, 226, 196, 255)
    pixel[6, 19] = (250, 244, 224, 255)
    for x, y in ((1, 18), (2, 18), (3, 18), (1, 19), (3, 19), (1, 20), (3, 20), (1, 21), (3, 21)):
        pixel[x, y] = (96, 66, 50, 255)
    pixel[7, 15] = (15, 10, 8, 255)
    return boar

# Tiles that are redrawn before they are smoothed: our file name -> the function that does it
REDRAWN = {
    "wild-boar": make_boar,
}

def finish(data, name):
    # A fetched tile, as bytes, becomes the picture the game shows
    tile = Image.open(io.BytesIO(data)).convert("RGBA")
    if name in REDRAWN:
        tile = REDRAWN[name](tile)
    return smooth(tile)

def main():
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    folder = os.path.join(here, "art", "monsters")
    os.makedirs(folder, exist_ok=True)

    if len(sys.argv) > 1 and sys.argv[1] == "prompts":
        write_prompts(here)
        return
    own = own_art(here)

    unclear = set()
    for line in fetch(UNKNOWN).decode("utf-8").splitlines():
        if line.startswith("- "):
            unclear.add(line[2:].strip())

    refused = []
    for name, (monster, tile) in ART.items():
        if name in own:
            continue
        if tile.split("/")[-1] + ".png" in unclear:
            refused.append(monster + " (" + tile + ")")
            continue
        data = fetch(TILES + tile + ".png")
        assert data[:8] == b"\x89PNG\r\n\x1a\n", tile
        finish(data, name).save(os.path.join(folder, name + ".png"), optimize=True)

    for path, (what, tile) in OTHER.items():
        if path[:-4] in own:
            continue
        if tile.split("/")[-1] + ".png" in unclear:
            refused.append(what + " (" + tile + ")")
            continue
        data = fetch(TILES + tile + ".png")
        assert data[:8] == b"\x89PNG\r\n\x1a\n", tile
        finish(data, path).save(os.path.join(here, "art", path), optimize=True)

    credits = [
        "# Art credits",
        "",
        "## Monsters and bosses (`art/monsters/`)",
        "",
        "Tiles from [Dungeon Crawl Stone Soup](https://github.com/crawl/crawl), by its tile",
        "artists, released under [CC0](https://creativecommons.org/publicdomain/zero/1.0/)",
        "(a public domain dedication: free to use, with no conditions). None of them is on",
        "that project's [list of tiles with an unclear licence](https://github.com/crawl/tiles/blob/master/TILES_UNDER_UNKNOWN_LICENSE.md);",
        "`tools/monster-art.py`, which fetched them, refuses any that is.",
        "",
        "CC0 asks for no credit. It is given here gladly.",
        "",
        "The tiles are 32 pixels square. Each has been enlarged to " + str(PICTURE_SIZE) + " pixels with its",
        "edges rounded off, and the Wild Boar is the hog tile recoloured and given tusks and",
        "bristles. Both are done by `tools/monster-art.py`.",
        "",
        "| File | Used for | Dungeon Crawl tile |",
        "|---|---|---|",
    ]
    for name, (monster, tile) in ART.items():
        if name not in own:
            credits.append("| `" + name + ".png` | " + monster + " | `mon/" + tile + ".png` |")
    credits += ["", "## Other pictures from the same tile set", "", "| File | Used for | Dungeon Crawl tile |", "|---|---|---|"]
    for path, (what, tile) in OTHER.items():
        if path[:-4] not in own:
            credits.append("| `art/" + path + "` | " + what + " | `mon/" + tile + ".png` |")
    if own:
        credits += ["", "## The game's own pictures", "", "Made for this game (listed in `art/own-art.txt`), not taken from the tile set:", ""]
        for name in sorted(own):
            credits.append("- `" + name + ".png`")
    io.open(os.path.join(here, "art", "CREDITS.md"), "w", encoding="utf-8", newline="\n").write("\n".join(credits) + "\n")

    print("fetched " + str(len([n for n in ART if n not in own]) - len(refused)) + " pictures into art/monsters" + (", and left " + str(len(own)) + " of your own alone" if own else ""))
    if refused:
        print("REFUSED (unclear licence), pick another tile: " + ", ".join(refused))

    if len(sys.argv) > 1 and sys.argv[1] == "sheet":
        names = [n for n in ART if os.path.exists(os.path.join(folder, n + ".png"))]
        sheet = Image.new("RGB", (9 * 112, ((len(names) + 8) // 9) * 124), (24, 20, 16))
        draw = ImageDraw.Draw(sheet)
        for i, n in enumerate(names):
            big = Image.open(os.path.join(folder, n + ".png")).convert("RGBA").resize((96, 96), Image.LANCZOS)
            x, y = (i % 9) * 112, (i // 9) * 124
            sheet.paste(big, (x + 8, y + 4), big)
            draw.text((x + 4, y + 104), n[:17], fill=(220, 200, 150))
        sheet.save(os.path.join(here, "monster-sheet.png"))
        print("saved monster-sheet.png (a picture to look at; delete it afterwards)")

main()
