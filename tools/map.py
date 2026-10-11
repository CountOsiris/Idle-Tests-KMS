# =====================================================================
#  tools/map.py - writes docs/MAP-WORDS.md: every bonus word in the game, who gives it,
#  and where the game reads it. NOT part of the game.
#
#    python tools/map.py
#
#  The game's rewards are all "bonus words" (attackPercent, bleedStacks, secondWind...).
#  A skill, boon, perk, relic, trophy, town upgrade, legend unlock or week's modifier
#  GIVES a word, either added (bonus) or multiplied (multiply), and somewhere a rule
#  READS it. This script lists both sides, and says plainly when they do not meet:
#    - a word that is given but never read does nothing at all
#    - a word that is read but never given is a rule nobody can reach
#    - a word that can grow without limit and multiplies damage is where a runaway starts
#  Run it after adding or changing content, and read the top of the file it writes.
#  docs/MAP.md explains how the pieces fit together.
# =====================================================================

import io, os, re, glob

HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

def read(path):
    return io.open(os.path.join(HERE, path), encoding="utf-8").read()

CONTENT = ["data.js", "towers.js"] + sorted("classes/" + os.path.basename(p) for p in glob.glob(os.path.join(HERE, "classes", "*.js")))
CODE = sorted("game/" + os.path.basename(p) for p in glob.glob(os.path.join(HERE, "game", "*.js"))) + CONTENT

# What kind of thing a line of content is, from the list it sits in
LISTS = [
    ("upgrades: [", "boon"), ("skills: [", "skill"), ("milestones: [", "perk"), ("breakthroughs: [", "breakthrough"),
    ("relics: [", "relic"), ("trophies: [", "trophy"), ("abilities: [", "ability"),
    ("const relics = [", "relic"), ("const townUpgrades = [", "town"), ("const fameUpgrades = [", "fame"),
    ("const legendUnlocks = [", "legend"), ("const weeklyModifiers = [", "week"), ("const trialMilestones = [", "perk"),
    ("const keystoneMilestones = [", "perk"), ("const breakthroughPerks = [", "breakthrough"), ("awayRule:", "tower rule"),
]

given = {}      # word -> {"bonus"/"multiply" -> [(kind, where, value, endless)]}

def note(word, how, kind, where, value, endless):
    given.setdefault(word, {}).setdefault(how, []).append((kind, where, value, endless))

for path in CONTENT:
    kind = "base"
    for number, line in enumerate(read(path).splitlines(), 1):
        stripped = line.strip()
        if stripped.startswith("//"):
            continue
        for marker, name in LISTS:
            if marker in line:
                kind = name
        if stripped.startswith("base: {"):
            for word, value in re.findall(r"(\w+): (-?[\d.]+)", stripped[len("base: {"):]):
                note(word, "bonus", "base", path + ":" + str(number), value, False)
            continue
        # Things with no top level can be bought again and again: a skill, a boon, and a
        # fame or town upgrade whose maxLevel is 0
        endless = kind in ("skill", "boon") or "maxLevel: 0" in line
        for how in ("bonus", "multiply", "add"):
            for block in re.findall(how + r": \{([^}]*)\}", line):
                for word, value in re.findall(r"(\w+): (-?[\d.]+)", block):
                    note(word, "bonus" if how == "add" else how, kind, path + ":" + str(number), value, endless)

# Where each word is read
READERS = [
    (r'totalBonus\("(\w+)"\)', "added"), (r'cappedChance\("(\w+)"\)', "added, capped"), (r'overflow\("(\w+)"', "overflow"),
    (r'multiplier\("(\w+)"\)', "multiplied"), (r'fameMultiplier\("(\w+)"\)', "multiplied"), (r'fameAdd\("(\w+)"\)', "added"),
    (r'legendBonus\("(\w+)"\)', "added"), (r'abilityStacks\([^,]+, "(\w+)"\)', "added"),
]
read_at = {}    # word -> {how -> [where]}
for path in CODE:
    for number, line in enumerate(read(path).splitlines(), 1):
        if line.strip().startswith("//"):
            continue
        for pattern, how in READERS:
            for word in re.findall(pattern, line):
                read_at.setdefault(word, {}).setdefault(how, []).append(path + ":" + str(number))

# Words the code reads through a variable (totalBonus(stat)), so no line names them
INDIRECT = {
    "attack": "recalcStats (game/skills.js): flat attack",
    "maxHp": "recalcStats (game/skills.js): flat health",
    "damage": "every hit (hitMonster, spellHitMonster, magicHitMonster in game/state.js)",
}

words = sorted(set(given) | set(read_at))
dead, unreachable, endless_multipliers = [], [], []
rows = []
for word in words:
    gives = given.get(word, {})
    reads = read_at.get(word, {})
    sources = {}
    endless_kinds = set()
    for how in gives:
        for kind, where, value, endless in gives[how]:
            sources[(how, kind)] = sources.get((how, kind), 0) + 1
            if endless:
                endless_kinds.add(kind)
    given_text = ", ".join(("x " if how == "multiply" else "+ ") + kind + " (" + str(count) + ")" for (how, kind), count in sorted(sources.items())) or "nothing"
    read_text = "; ".join(how + ": " + ", ".join(places[:3]) + (" and " + str(len(places) - 3) + " more" if len(places) > 3 else "") for how, places in sorted(reads.items()))
    if word in INDIRECT:
        read_text = (read_text + "; " if read_text else "") + INDIRECT[word]
    if not read_text:
        read_text = "NOWHERE"
        if gives:
            dead.append(word)
    if not gives and word not in ("damage",):
        unreachable.append(word)
    rows.append("| `" + word + "` | " + given_text + " | " + (", ".join(sorted(endless_kinds)) or "no") + " | " + read_text + " |")

lines = [
    "# Every bonus word: who gives it, and where it is read",
    "",
    "Written by `python tools/map.py`. Do not edit by hand: change the content and run it",
    "again. [MAP.md](MAP.md) explains how these fit together.",
    "",
    "## Read this first",
    "",
    "**Given but read nowhere (these do nothing):** " + (", ".join("`" + w + "`" for w in dead) or "none") + ".",
    "",
    "**Read but given by nothing (a rule nobody can reach):** " + (", ".join("`" + w + "`" for w in unreachable) or "none") + ".",
    "",
    "\"No top level\" names the sources that can be bought again and again (a skill, a boon,",
    "an endless fame or town upgrade). A word with such a source grows for as long as the",
    "player plays. That is fine for a word that is ADDED to a percentage, and it is how the",
    "game is meant to scale. It is where to look first when something runs away: the word",
    "must either be capped where it is read (see \"added, capped\" and \"overflow\"), or feed",
    "something that is not multiplied again by another endless word.",
    "",
    "## The words",
    "",
    "`+` is added (bonus), `x` is multiplied (multiply). The number is how many things give it.",
    "",
    "| Word | Given by | No top level | Read at |",
    "|---|---|---|---|",
] + rows
io.open(os.path.join(HERE, "docs", "MAP-WORDS.md"), "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
print("wrote docs/MAP-WORDS.md: " + str(len(words)) + " words")
print("given but never read: " + (", ".join(dead) or "none"))
print("read but never given: " + (", ".join(unreachable) or "none"))
