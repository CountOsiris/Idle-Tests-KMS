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

    unclear = set()
    for line in fetch(UNKNOWN).decode("utf-8").splitlines():
        if line.startswith("- "):
            unclear.add(line[2:].strip())

    refused = []
    for name, (monster, tile) in ART.items():
        if tile.split("/")[-1] + ".png" in unclear:
            refused.append(monster + " (" + tile + ")")
            continue
        data = fetch(TILES + tile + ".png")
        assert data[:8] == b"\x89PNG\r\n\x1a\n", tile
        finish(data, name).save(os.path.join(folder, name + ".png"), optimize=True)

    for path, (what, tile) in OTHER.items():
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
        credits.append("| `" + name + ".png` | " + monster + " | `mon/" + tile + ".png` |")
    credits += ["", "## Other pictures from the same tile set", "", "| File | Used for | Dungeon Crawl tile |", "|---|---|---|"]
    for path, (what, tile) in OTHER.items():
        credits.append("| `art/" + path + "` | " + what + " | `mon/" + tile + ".png` |")
    io.open(os.path.join(here, "art", "CREDITS.md"), "w", encoding="utf-8", newline="\n").write("\n".join(credits) + "\n")

    print("fetched " + str(len(ART) - len(refused)) + " pictures into art/monsters")
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
