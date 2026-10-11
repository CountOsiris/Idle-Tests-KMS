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
# =====================================================================

import io, os, sys, urllib.request

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
        io.open(os.path.join(folder, name + ".png"), "wb").write(data)

    for path, (what, tile) in OTHER.items():
        if tile.split("/")[-1] + ".png" in unclear:
            refused.append(what + " (" + tile + ")")
            continue
        data = fetch(TILES + tile + ".png")
        assert data[:8] == b"\x89PNG\r\n\x1a\n", tile
        io.open(os.path.join(here, "art", path), "wb").write(data)

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
        from PIL import Image, ImageDraw
        names = [n for n in ART if os.path.exists(os.path.join(folder, n + ".png"))]
        sheet = Image.new("RGB", (9 * 112, ((len(names) + 8) // 9) * 124), (24, 20, 16))
        draw = ImageDraw.Draw(sheet)
        for i, n in enumerate(names):
            tile = Image.open(os.path.join(folder, n + ".png")).convert("RGBA")
            big = tile.resize((tile.width * 3, tile.height * 3), Image.NEAREST)
            x, y = (i % 9) * 112, (i // 9) * 124
            sheet.paste(big, (x + 8, y + 4), big)
            draw.text((x + 4, y + 104), n[:17], fill=(220, 200, 150))
        sheet.save(os.path.join(here, "monster-sheet.png"))
        print("saved monster-sheet.png (a picture to look at; delete it afterwards)")

main()
