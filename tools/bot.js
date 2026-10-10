// =====================================================================
//  tools/bot.js - the balance bot. NOT part of the game.
//  It plays classes for simulated hours, as fast as the computer allows,
//  and reports when each floor was first reached. See tools/README.md.
//
//  Options go after the # in the address, separated by commas, for example
//    #h=14,c=warden          14 hours of the Warden, no ascending
//    #h=24,ascend,c=warlock  24 hours of the Warlock, ascending when stuck
//  h=N         hours to play (default 10)
//  c=name      only this class (default: every class, first weapon)
//  every       every weapon (or element) of each class, not just the first
//  ascend      ascend when allowed and no new floor for "stall" seconds
//  stall=N     seconds without a new floor before ascending (default 600)
//  noup        no boons (to measure what boons are worth)
//  noforge     never use the blacksmith
//  noabilities never put anything in an ability slot
//  only=a+b    spend skill points only on these skill ids
//  perk=text   at milestones, prefer perks whose text contains this
//  fav=id      hire the Tactician with this favourite boon
//  keystones   at floor 51, take the weapon's keystone (and with perk=Name, a shared one
//              by its name at floors 76 and 101). Without this, keystones are left alone.
//  week=N      play under the modifier of week N (0 is the first on the list in data.js).
//              Without this the bot plays with no modifier of the week.
//  t=name      climb this class's tower instead of its own (a challenge), or t=next for
//              the tower of the class after it on the list
//  killers     also say what killed it most in its last two hours, and on which floor
//  duo         a Barbarian for 6 hours, then a new Ranger and Warden on the same account
// =====================================================================

clearInterval(timer);
window.confirm = function () { return true; };

// No modifier of the week, unless asked for one with week=N, so that runs made in
// different weeks can be compared
weekOverride = "none";
if (location.hash.match(/week=(\d+)/)) {
  weekOverride = Number(location.hash.match(/week=(\d+)/)[1]);
}

const HOURS = Number((location.hash.match(/h=([\d.]+)/) || [0, 10])[1]);
const ONLY_CLASS = (location.hash.match(/c=(\w+)/) || [0, ""])[1];
const EVERY = location.hash.includes("every");
const NOUP = location.hash.includes("noup");
const NOFORGE = location.hash.includes("noforge");
const NOABILITIES = location.hash.includes("noabilities");
const ONLY_SKILLS = ((location.hash.match(/only=([\w+]+)/) || [0, ""])[1]).split("+").filter(function (x) { return x !== ""; });
const PERK = decodeURIComponent((location.hash.match(/perk=([^,]+)/) || [0, ""])[1]);
const FAV = (location.hash.match(/fav=(\w+)/) || [0, ""])[1];
const KEYSTONES = location.hash.includes("keystones");
const TOWER = (location.hash.match(/t=(\w+)/) || [0, ""])[1];
const STALL = Number((location.hash.match(/stall=(\d+)/) || [0, 600])[1]);
let ASCEND = location.hash.includes("ascend");

let out = [];
let now = 0;
let lastBest = 1;
let lastBestAt = 0;
let ascensionsDone = 0;
let ascensionTimes = [];
let maxSouls = 0;

function hoursText(seconds) {
  if (seconds < 3600) {
    return Math.round(seconds / 60) + "m";
  }
  return (seconds / 3600).toFixed(1) + "h";
}

// A brand new class. Unless sharing the account, fame starts from nothing too.
function freshStart(className, weaponType, keepAccount) {
  playerClass = className;
  if (!keepAccount) {
    classSaves = {};
    fame = 0;
    fameLevels = {};
  }
  unpackClass(classSaves[className]);
  buildClassScreen();
  weapon = weaponType;
  nextWeapon = weaponType;
  if (TOWER !== "") {
    let names = Object.keys(towers);
    tower = TOWER === "next" ? names[(names.indexOf(className) + 1) % names.length] : TOWER;
    nextTower = tower;
  }
  floor = 1;
  room = 1;
  recalcStats();
  playerHp = playerMaxHp;
  startEncounter();
}

// What a sensible player does between fights
function manage() {
  let c = currentClass();

  if (FAV !== "") {
    townLevels.tactician = 1;
    favouriteUpgrade = FAV;
  }

  // Skills: the cheapest next level among the skills that work with this weapon
  let guard = 0;
  while (guard++ < 100000) {
    let pick = null;
    for (let skill of c.skills) {
      if (otherBuildNote(skill.text) !== "") {
        continue;
      }
      if (ONLY_SKILLS.length > 0 && !ONLY_SKILLS.includes(skill.id)) {
        continue;
      }
      if (skillCostOf(skill) > skillPointsLeft()) {
        continue;
      }
      if (pick === null || skillLevel(skill.id) < skillLevel(pick.id)) {
        pick = skill;
      }
    }
    if (pick === null) {
      break;
    }
    skillLevels[pick.id] = skillLevel(pick.id) + 1;
  }

  // Milestones: the perk written for the weapon (or element) in use if there is one,
  // otherwise the first that works with it, or one that matches "perk="
  let buildName = c.stances !== undefined ? c.stances[stance].name : c.gearTypes[weapon];
  for (let milestone of allMilestones()) {
    // A keystone milestone is optional: left alone unless asked for
    if (milestone.keystones === true) {
      if (KEYSTONES && bestFloor >= milestone.floor && chosenPerks[milestone.floor] === undefined) {
        let keystone = milestone.perks.find(function (p) {
          return p.text.startsWith(buildName + ":") || (PERK !== "" && p.name.includes(PERK));
        });
        if (keystone !== undefined) {
          chosenPerks[milestone.floor] = keystone.id;
        }
      }
      continue;
    }
    if (bestFloor >= milestone.floor && chosenPerks[milestone.floor] === undefined) {
      let perk = milestone.perks[milestone.perks.length > 2 ? 0 : 1];
      if (otherBuildNote(perk.text) !== "") {
        perk = milestone.perks.find(function (p) { return otherBuildNote(p.text) === ""; });
      }
      for (let p of milestone.perks) {
        if (p.text.startsWith(buildName + ":")) {
          perk = p;
        }
      }
      for (let p of milestone.perks) {
        if (PERK !== "" && p.text.includes(PERK)) {
          perk = p;
        }
      }
      chosenPerks[milestone.floor] = perk.id;
    }
  }

  // Abilities: the weapon's own first, then a boss killer, then anything that fits
  if (!NOABILITIES) {
    let ranked = classAbilities().filter(function (a) { return fitsBuild(a); }).sort(function (a, b) {
      let score = function (x) { return x.build !== undefined ? 0 : (x.bossKiller ? 1 : 2); };
      return score(a) - score(b);
    });
    abilitySlots = abilitySlots.filter(function (id) { return fitsBuild(abilityById(id)); });
    for (let ability of ranked) {
      if (abilitySlots.length < openAbilitySlots() && !abilitySlots.includes(ability.id)) {
        abilitySlots.push(ability.id);
      }
    }
  }

  if (!NOFORGE) {
    while (canAffordForge()) {
      let slot = forgeCostOf("armor") < forgeCostOf("weapon") ? "armor" : "weapon";
      bank = bank - forgeCostOf(slot);
      forgeLevels[slot] = forgeLevel(slot) + 1;
    }
  }

  if (ASCEND && canAscend() && ascensionSeconds - lastBestAt > STALL) {
    ascensionTimes.push(hoursText(ascensionSeconds) + "@" + ascensionBest);
    ascend();
    ascensionsDone++;
    lastBestAt = 0;
    lastBest = 1;

    // Fame: Might and Vitality kept level, then the others
    let order = ["might", "vitality", "wisdom", "scavenger", "fortune"];
    let spending = true;
    while (spending) {
      spending = false;
      let low = Math.min(fameLevel("might"), fameLevel("vitality"));
      for (let id of order) {
        let item = fameUpgrades.find(function (x) { return x.id === id; });
        if (item === undefined || !fameUpgradeIsUnlocked(item) || fame < fameCost(item)) {
          continue;
        }
        if ((id === "might" || id === "vitality") && fameLevel(id) > low) {
          continue;
        }
        if (id !== "might" && id !== "vitality" && fameLevel(id) >= low) {
          continue;
        }
        buyFameUpgrade(item);
        spending = true;
        break;
      }
    }
  }
  recalcStats();
}

function run(className, weaponType, stanceId, hours, ascending, keepAccount) {
  freshStart(className, weaponType, keepAccount);
  if (stanceId !== undefined) {
    stance = stanceId;
    recalcStats();
  }
  ASCEND = ascending;
  ascensionsDone = 0;
  ascensionTimes = [];
  lastBest = 1;
  lastBestAt = 0;
  maxSouls = 0;

  let marks = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 100, 150, 200, 300, 500];
  let reached = {};
  let deathsBefore = deaths;
  let lastDeaths = deaths;
  let mostBoons = 0;

  // What ended the runs of the last two hours, to see what a build is stuck on
  let killers = {};

  for (let i = 1; i <= hours * 3600; i++) {
    now = i;
    step();
    if (NOUP) {
      upgrades = {};
    }
    if (runCounter > maxSouls) {
      maxSouls = runCounter;
    }
    if (ascensionBest > lastBest) {
      lastBest = ascensionBest;
      lastBestAt = ascensionSeconds;
    }
    for (let m of marks) {
      if (reached[m] === undefined && bestFloor >= m) {
        reached[m] = i;
      }
    }
    if (deaths !== lastDeaths && lastRun !== null && i > (hours - 2) * 3600) {
      let killer = lastRun.killer + " F" + lastRun.floor + " (turn " + lastRun.fightTurns + ")";
      killers[killer] = (killers[killer] || 0) + 1;
    }
    if (deaths !== lastDeaths || i % 60 === 0) {
      lastDeaths = deaths;
      manage();
    }
    mostBoons = Math.max(mostBoons, upgradesHeld());
  }

  let line = className + "/" + (stanceId || weaponType) + (TOWER !== "" ? " in " + towers[tower].name : "") + "  ";
  line = line + marks.map(function (m) { return "F" + m + " " + (reached[m] === undefined ? "-" : hoursText(reached[m])); }).join("  ");
  line = line + "  | best " + bestFloor + ", deaths " + (deaths - deathsBefore) + ", level " + level + ", most boons " + mostBoons + ", attack " + big(playerAttack) + ", health " + big(playerMaxHp) + ", armor " + big(totalArmor());
  if (ascending) {
    line = line + ", ascensions " + ascensionsDone;
  }
  if (TOWER !== "") {
    line = line + ", trophies " + trophies.length;
  }
  out.push(line);
  if (ascending) {
    out.push("    ascensions: " + ascensionTimes.slice(0, 14).join(" "));
  }
  if (location.hash.includes("killers")) {
    let ranked = Object.keys(killers).sort(function (a, b) { return killers[b] - killers[a]; }).slice(0, 4);
    out.push("    killers: " + ranked.map(function (k) { return killers[k] + "x " + k; }).join(" | "));
  }
}

try {
  if (location.hash.includes("duo")) {
    run("barbarian", "axe", undefined, 6, true, false);
    out.push("    account now: fame " + Math.round(fame) + " " + JSON.stringify(fameLevels));
    run("ranger", "longbow", undefined, 4, false, true);
    run("warden", "spiked", undefined, 4, false, true);
  } else {
    for (let className in classes) {
      if (ONLY_CLASS !== "" && ONLY_CLASS !== className) {
        continue;
      }
      let types = Object.keys(classes[className].gearTypes);
      if (!EVERY) {
        run(className, types[0], undefined, HOURS, ASCEND, false);
      } else if (classes[className].stances !== undefined) {
        for (let id in classes[className].stances) {
          run(className, types[0], id, HOURS, ASCEND, false);
        }
      } else {
        for (let type of types) {
          run(className, type, undefined, HOURS, ASCEND, false);
        }
      }
    }
  }
} catch (error) {
  out.push("ERROR " + error.stack);
}

let pre = document.createElement("pre");
pre.id = "test-out";
pre.textContent = location.hash + "\n" + out.join("\n");
document.body.appendChild(pre);
