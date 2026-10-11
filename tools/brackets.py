# =====================================================================
#  tools/brackets.py - writes docs/MAP-BRACKETS.md: for every build of every class,
#  which words it has in which bracket, and how many multipliers each path collects.
#  NOT part of the game.
#
#    python tools/brackets.py
#
#  The rule (docs/MAP.md, section 3): multiplying is fine when every build gets the same
#  brackets. This lists the brackets build by build so that an odd one out shows, and
#  prints what breaks the rule:
#    - two skills of a class that give exactly the same words (one is a copy)
#    - a build with more, or fewer, words that multiply each other than the rest
#    - a path whose milestone perks multiply more often than the other paths'
# =====================================================================

import io, os, re, glob

HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
problems = []
out = ["# Brackets, build by build", "",
       "Written by `python tools/brackets.py`. Do not edit by hand. [MAP.md](MAP.md) says how to read it.", ""]

def words(block_name, line):
    found = {}
    for block in re.findall(block_name + r": \{([^}]*)\}", line):
        for word, value in re.findall(r"(\w+): (-?[\d.]+)", block):
            found[word] = float(value)
    return found

for path in sorted(glob.glob(os.path.join(HERE, "classes", "*.js"))):
    name = os.path.basename(path)[:-3]
    text = io.open(path, encoding="utf-8").read()
    lines = text.splitlines()

    # The builds: stances if the class has them, else its gear types
    stances = re.search(r"stances: \{(.*?)\n  \},", text, re.S)
    builds = {}
    if stances:
        for key, label in re.findall(r"(\w+): \{ name: \"([^\"]+)\"", stances.group(1)):
            builds[key] = label
    else:
        gear = re.search(r"gearTypes: \{([^}]*)\}", text)
        for key, label in re.findall(r"(\w+): \"([^\"]+)\"", gear.group(1)):
            builds[key] = label

    kind, floor, keystones = "", 0, False
    items = []
    for line in lines:
        s = line.strip()
        if s.startswith("//"):
            continue
        for marker, k in (("upgrades: [", "boon"), ("skills: [", "skill"), ("milestones: [", "perk"), ("breakthroughs: [", "breakthrough"), ("abilities: [", "ability"), ("relics: [", "relic")):
            if s.startswith(marker):
                kind = k
        m = re.match(r"floor: (\d+),", s)
        if m:
            floor = int(m.group(1)); keystones = False
        if s.startswith("keystones: true"):
            keystones = True
        m = re.match(r"\{ id: \"(\w+)\", name: \"([^\"]+)\"", s)
        if not m or kind in ("", "ability"):
            continue
        label = re.search(r"text: \"([^\"]*)\"", s)
        label = label.group(1) if label else ""
        scope = ""
        for key, build_label in builds.items():
            if label.startswith(build_label + ":"):
                scope = key
        b = re.search(r"build: \"(\w+)\"", s)
        if b:
            scope = b.group(1)
        items.append({"kind": kind, "floor": floor if kind == "perk" else 0, "keystone": keystones and kind == "perk", "legendary": "legendary: true" in s,
                      "name": m.group(2), "scope": scope, "bonus": words("bonus", s), "multiply": words("multiply", s)})

    # Two skills that give exactly the same words
    skills = [i for i in items if i["kind"] == "skill"]
    for a in range(len(skills)):
        for b in range(a + 1, len(skills)):
            if set(skills[a]["bonus"]) == set(skills[b]["bonus"]) and skills[a]["scope"] == skills[b]["scope"]:
                problems.append(name + ": the skills " + skills[a]["name"] + " and " + skills[b]["name"] + " give the same words")

    out += ["## " + name, "", "| Build | Its own words (added) | Its own multipliers | Multiplier perks on its path, floors 50 / 75 / 100 | Breakthroughs |", "|---|---|---|---|---|"]
    shapes = {}
    for key, build_label in builds.items():
        mine = [i for i in items if i["scope"] == key and not i["keystone"] and not i["legendary"]]
        general = ("attackPercent", "healthPercent", "armor", "armorPercent", "attack", "health", "damageTaken", "maxHp")
        added = sorted(set(w for i in mine for w in i["bonus"] if w not in general))
        multiplied = sorted(set(w for i in mine for w in i["multiply"] if w not in general))
        per_floor = []
        for f in (50, 75, 100):
            perks = [i for i in mine if i["kind"] == "perk" and i["floor"] == f]
            per_floor.append(", ".join("x" + str(v).rstrip("0").rstrip(".") + " " + w for i in perks for w, v in i["multiply"].items()) or "none")
        breaks = ", ".join("x" + str(v).rstrip("0").rstrip(".") + " " + w for i in mine if i["kind"] == "breakthrough" for w, v in i["multiply"].items()) or "none"
        out.append("| " + build_label + " | " + (", ".join(added) or "none") + " | " + (", ".join(multiplied) or "none") + " | " + " / ".join(per_floor) + " | " + breaks + " |")
        shapes[build_label] = (len(added), len(multiplied), sum(1 for p in per_floor if p != "none"))
        if not multiplied:
            problems.append(name + ": " + build_label + " has no multiplier of its own")
        if breaks == "none":
            problems.append(name + ": " + build_label + " has no breakthrough of its own")
    counts = sorted(set(v[2] for v in shapes.values()))
    if len(counts) > 1:
        problems.append(name + ": its builds get multiplier perks on different numbers of milestones: " + ", ".join(k + " " + str(v[2]) for k, v in shapes.items()))
    out.append("")

out[3:3] = ["## What breaks the rule", ""] + (["- " + p for p in problems] or ["Nothing."]) + [""]
io.open(os.path.join(HERE, "docs", "MAP-BRACKETS.md"), "w", encoding="utf-8", newline="\n").write("\n".join(out) + "\n")
print("wrote docs/MAP-BRACKETS.md")
for p in problems:
    print("- " + p)
if not problems:
    print("nothing breaks the rule")
