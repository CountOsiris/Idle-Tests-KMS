// =====================================================================
//  game/bonuses.js - Adding up bonuses: milestones and breakthroughs, fame and ascension, chances
//  and overflow, builds, relics.
// =====================================================================

// ----- Adding up bonuses -----
function baseBonus(stat) {
  if (currentClass().base[stat] !== undefined) {
    return currentClass().base[stat];
  }
  return 0;
}

// ----- Milestones and breakthroughs -----
// A class's own milestones come from its file. After the last of them, "breakthroughs"
// carry on forever, further and further apart (see data.js). Both work the same way:
// reach the floor once, ever, and pick one of its perks to keep.

// The floor of breakthrough number 0, 1, 2... rounded to a tidy number
function breakthroughFloor(number) {
  let exact = breakthroughFirstFloor * Math.pow(breakthroughSpacing, number);
  return Math.round(exact / 25) * 25;
}

// The list is rebuilt only when the class or the best floor changes, because
// the game asks for it many times a second
let milestoneList = [];
let milestoneListFor = "";

function allMilestones() {
  let key = playerClass + " " + bestFloor;
  if (milestoneListFor === key) {
    return milestoneList;
  }

  // The class's own milestones, and the trials and keystones every class has, in floor order
  milestoneList = currentClass().milestones.concat(trialMilestones).concat(keystoneMilestones);
  milestoneList.sort(function (a, b) {
    return a.floor - b.floor;
  });

  // Every breakthrough reached so far, plus the next one to aim for
  let number = 0;
  while (true) {
    let breakthrough = { floor: breakthroughFloor(number), perks: breakthroughPerks.concat(currentClass().breakthroughs || []) };
    milestoneList.push(breakthrough);
    if (breakthrough.floor > bestFloor) {
      break;
    }
    number = number + 1;
  }

  milestoneListFor = key;
  return milestoneList;
}

function perkBonus(stat) {
  let total = 0;

  for (let milestone of allMilestones()) {
    for (let perk of milestone.perks) {
      if (chosenPerks[milestone.floor] === perk.id && perk.bonus !== undefined && perk.bonus[stat] !== undefined) {
        total = total + perk.bonus[stat];
      }
    }
  }

  return total;
}

// Breakthrough perks multiply instead of adding
function perkMultiplier(stat) {
  let total = 1;

  for (let milestone of allMilestones()) {
    for (let perk of milestone.perks) {
      if (chosenPerks[milestone.floor] === perk.id && perk.multiply !== undefined && perk.multiply[stat] !== undefined) {
        total = total * perk.multiply[stat];
      }
    }
  }

  return total;
}

// Trophies can multiply too (most of them do: a flat bonus would fade as the class grows)
function trophyMultiplier(stat) {
  let total = 1;

  for (let towerName in towers) {
    for (let trophy of towers[towerName].trophies) {
      if (trophies.includes(trophy.id) && trophy.multiply !== undefined && trophy.multiply[stat] !== undefined) {
        total = total * trophy.multiply[stat];
      }
    }
  }

  return total;
}

// Everything that multiplies a number: fame upgrades, milestone and breakthrough perks, trophies.
// The stats are damage, attack, health, armor, experience, gold, gear and fame.
function multiplier(stat) {
  return fameMultiplier(stat) * perkMultiplier(stat) * trophyMultiplier(stat);
}

// The relics this class can find: the shared ones plus its own
function allRelics() {
  return relics.concat(currentClass().relics);
}

function relicBonus(stat) {
  let total = 0;

  for (let relic of allRelics()) {
    for (let id of ownedRelics) {
      if (id === relic.id && relic.bonus[stat] !== undefined) {
        total = total + relic.bonus[stat];
      }
    }
  }

  return total;
}

function upgradeBonus(stat) {
  let total = 0;

  for (let upgrade of currentClass().upgrades) {
    if (upgrade.bonus[stat] !== undefined) {
      total = total + upgrade.bonus[stat] * upgradeLevel(upgrade.id);
    }
  }

  return total;
}

function skillBonus(stat) {
  let total = 0;

  for (let skill of currentClass().skills) {
    if (skill.bonus[stat] !== undefined) {
      total = total + skill.bonus[stat] * skillLevel(skill.id) * skillRankBoost(skill.id);
    }
  }

  return total;
}

function trophyBonus(stat) {
  let total = 0;

  for (let towerName in towers) {
    for (let trophy of towers[towerName].trophies) {
      if (trophies.includes(trophy.id) && trophy.bonus !== undefined && trophy.bonus[stat] !== undefined) {
        total = total + trophy.bonus[stat];
      }
    }
  }

  return total;
}

function townBonus(stat) {
  let total = 0;

  for (let item of townUpgrades) {
    if (item.bonus[stat] !== undefined) {
      total = total + item.bonus[stat] * townLevel(item.id);
    }
  }

  return total;
}

// ----- Fame and ascension -----
// Fame is the ascension currency. It belongs to the account: every class earns into
// the same fame, and what it buys makes every class stronger.
//
//   - Reaching a floor for the first time SINCE THE LAST ASCENSION pays 1 fame.
//   - Every boss from floor fameBossFloor up pays fame each time it is beaten (bossFameAt).
//   - Ascending starts the class again from level 1, and makes every floor pay again.
//   - Fame buys permanent upgrades (the fameUpgrades list in data.js) that survive
//     ascending. Most have no top level, so a class can grow stronger forever.
function fameLevel(id) {
  if (fameLevels[id] === undefined) {
    return 0;
  }
  return fameLevels[id];
}

// All fame is earned through here, so the page can say how fast it is coming in
function gainFame(amount) {
  fame = fame + amount;
  ascensionFame = ascensionFame + amount;
}

// BOSS FAME: the reliable income. Every boss on floor fameBossFloor or deeper pays
// fame EVERY time it is beaten, not only the first time, and deeper bosses pay more
// (see data.js). So a class stuck at a wall still earns fame on every run.
function bossFameAt(bossFloor) {
  if (bossFloor < fameBossFloor) {
    return 0;
  }
  return bossFame * Math.pow(bossFloor / fameBossFloor, bossFameCurve) * multiplier("fame");
}

// Each level costs "growth" times more than the last
function fameCost(item) {
  return Math.ceil(item.cost * Math.pow(item.growth, fameLevel(item.id)));
}

// A top level of 0 means the upgrade can be bought forever
function fameUpgradeIsMaxed(item) {
  return item.maxLevel > 0 && fameLevel(item.id) >= item.maxLevel;
}

// Fame upgrades are locked behind ascensions: each one appears after a certain number
function fameUpgradeIsUnlocked(item) {
  return totalAscensions() >= item.unlockAt;
}

// How many times the account has ascended: every class's ascensions added together
function totalAscensions() {
  let total = ascensions;

  for (let className in classSaves) {
    if (className !== playerClass && classSaves[className].ascensions !== undefined) {
      total = total + classSaves[className].ascensions;
    }
  }

  return total;
}

function buyFameUpgrade(item) {
  if (fameUpgradeIsUnlocked(item) && !fameUpgradeIsMaxed(item) && fame >= fameCost(item)) {
    fame = fame - fameCost(item);
    fameLevels[item.id] = fameLevel(item.id) + 1;
    recalcStats();
    updateScreen();
  }
}

// CATCHING UP. Fame upgrades are bought once for the whole account, but a class only
// gets the full power of as many levels as it has ascended itself. The levels beyond
// that count for a share (fameCatchUpShare in data.js, a quarter) until it catches up.
//   Might at level 5, and this class has ascended twice:
//   2 levels at full power + 3 levels at a quarter = as good as level 2.75
// So a new class on an old account gets a head start, not a free ride past every wall.
function fameLevelsAtFull(id) {
  return Math.min(fameLevel(id), ascensions);
}

function fameLevelInEffect(id) {
  let full = fameLevelsAtFull(id);
  return full + (fameLevel(id) - full) * fameCatchUpShare;
}

// How many times bigger the fame upgrades make something: attack, health, armor,
// experience or gold. Every level of an upgrade multiplies again, so they compound:
// three levels of "x1.25 attack" is 1.25 x 1.25 x 1.25 = x1.95.
function fameMultiplier(stat) {
  let total = 1;

  for (let item of fameUpgrades) {
    if (item.multiply !== undefined && item.multiply[stat] !== undefined) {
      total = total * Math.pow(item.multiply[stat], fameLevelInEffect(item.id));
    }
  }

  return total;
}

// For fame upgrades that add something instead, like extra starting levels
function fameAdd(stat) {
  let total = 0;

  for (let item of fameUpgrades) {
    if (item.add !== undefined && item.add[stat] !== undefined) {
      total = total + item.add[stat] * fameLevel(item.id);
    }
  }

  return total;
}

// The floor that must be reached before the class can ascend (see data.js).
// It is the same every time, so each ascension gets there faster than the last.
function ascendFloorNeeded() {
  return ascendFirstFloor + ascendFloorStep * ascensions;
}

function canAscend() {
  return ascensionBest >= ascendFloorNeeded();
}

function ascend() {
  if (!canAscend()) {
    return;
  }
  if (!confirm("Ascend? This class starts again from level 1, and every floor pays fame again.")) {
    return;
  }

  // Remember how this ascension went, to compare the next one against
  lastAscensionFame = ascensionFame;
  ascensionFame = 0;
  lastAscensionSeconds = ascensionSeconds;
  ascensionSeconds = 0;

  ascensions = ascensions + 1;
  ascensionBest = 1;

  startClassOver();
  say("You ascend! Every floor will pay fame again.");
  startEncounter();
  updateScreen();
  saveGame();
}

// What an ascension takes away, and becoming a legend too (game/legend.js)
function startClassOver() {
  // What is lost: levels, stats, skills, experience, gold and the run in progress.
  // (Starting levels come from the Old Roads legend unlock.)
  level = 1 + fameAdd("startLevels") + totalBonus("startLevels");
  experience = 0;

  // The skills are about to be wiped. If no build was ever saved, remember this one,
  // so that it can be had back with one click.
  if (!hasSavedBuild()) {
    saveBuild();
  }
  skillLevels = {};

  // Any starting levels give skill points straight away
  if (autoBuild) {
    spendOnSavedBuild();
  }
  gold = 0;
  bank = 0;
  potions = 0;
  upgrades = {};
  ownedRelics = [];
  runCounter = 0;
  floor = 1;
  room = 1;
  runStartFloor = 1;
  cruising = true;
  cruiseFloor = 1;

  // Town upgrades with several levels are lost too. The helpers you buy once are kept.
  for (let item of townUpgrades) {
    if (item.maxLevel !== 1) {
      delete townLevels[item.id];
    }
  }

  // So is the blacksmith's work, which was paid for with gold: back to the first tier
  forgeLevels = { weapon: 0, armor: 0 };

  // What is kept: fame and fame upgrades, best floors, milestones and perks, trophies and town helpers
  startRunGear();
  resetAbilitiesForRun();
  runStats = freshRunStats();
  potions = totalBonus("freePotions");
  playerHp = playerMaxHp;
  logLines = [];
}

// The rule of the tower being challenged (see "awayRule" in towers.js). It only counts
// away from home: a class's own tower has no rule for it.
function towerRule() {
  if (towers[tower] === undefined || !isAway() || towers[tower].awayRule === undefined) {
    return null;
  }
  return towers[tower].awayRule;
}

function towerRuleBonus(stat) {
  let rule = towerRule();
  if (rule === null || rule.bonus[stat] === undefined) {
    return 0;
  }
  return rule.bonus[stat];
}

// Everything in the game asks this for its numbers:
// the class's own base + skills + milestone perks + relics + upgrades + trophies + town
// + the rule of the tower being challenged + what legend marks have bought
function totalBonus(stat) {
  return baseBonus(stat) + skillBonus(stat) + perkBonus(stat) + relicBonus(stat) + upgradeBonus(stat) + trophyBonus(stat) + townBonus(stat) + towerRuleBonus(stat) + legendBonus(stat);
}

// ----- Chances and overflow -----
// Nothing in the game has a top level, but a chance cannot usefully go past its
// limit. So whatever is bought beyond the limit "overflows" into something else:
//   - critical chances past 100%          -> extra critical damage
//   - dodge, parry and block past 60%     -> all damage taken is reduced
//   - stun and freeze past 60%            -> extra damage
// The class files say exactly what each of their chances overflows into.

// For chances that must never reach 100% (see maxChance in data.js)
function cappedChance(stat) {
  return Math.min(maxChance, totalBonus(stat));
}

// How far a stat has gone past a limit (0 if it has not)
function overflow(stat, limit) {
  return Math.max(0, totalBonus(stat) - limit);
}

// A sentence for the page that says what the overflow is doing, or nothing if there is none
function overflowNote(amount, what) {
  if (amount <= 0) {
    return "";
  }
  return " The chance beyond its limit gives +" + percent(amount) + " " + what + ".";
}

// Damage taken is divided by this. Classes that can dodge, parry or block
// turn the overflow of that chance into it (see their damageDivider function).
function damageDivider() {
  if (currentClass().damageDivider !== undefined) {
    return currentClass().damageDivider();
  }
  return 1;
}

function townUpgradeIsMaxed(item) {
  return item.maxLevel > 0 && townLevel(item.id) >= item.maxLevel;
}

// The share of a monster's hit your armor blocks on this floor (see data.js).
// (The Iron Skin keystone raises the limit: "armorLimit".)
function armorShareBlocked() {
  let armor = Math.max(0, totalArmor());
  return (maxArmorShare + totalBonus("armorLimit")) * armor / (armor + armorHalfBase + armorHalfPerFloor * floor);
}

function totalArmor() {
  return Math.round((armorPower + totalBonus("armor")) * (1 + totalBonus("armorPercent")) * multiplier("armor"));
}

// ----- Builds -----
// An upgrade or a relic can belong to one build: build: "axe" in the class file.
// It is then only given while that weapon is being used (or that stance, for a class
// whose builds are stances, like the Elementalist's elements). One with no build
// suits every weapon.
function fitsBuild(thing) {
  return thing.build === undefined || thing.build === weapon || thing.build === stance;
}

// ----- Relics -----
// Rare finds that change how a run plays (see "Relics" in data.js for where they come from).
// A relic that only works with another weapon is never given.
function gainRelic() {
  let choices = [];
  for (let relic of allRelics()) {
    if (fitsBuild(relic)) {
      choices.push(relic);
    }
  }
  let relic = choices[Math.floor(Math.random() * choices.length)];

  ownedRelics.push(relic.id);
  recalcStats();
  announce("banner", "Relic: " + relic.name, relic.text + ".");
}
