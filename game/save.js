// =====================================================================
//  game/save.js - Saving and loading, save codes. READ THE RULES AT THE TOP before changing anything
//  that a save remembers.
// =====================================================================

// ----- Saving and loading -----
// The save lives in the browser. It holds one bundle of progress per class,
// which class is being played, and when the game last ran.
// Fame and the fame upgrades are shared by the whole account. Nothing else is:
// every class has its own levels, gold, equipment, milestones and trophies.
//
// ===== OTHER PEOPLE NOW HAVE SAVES. Read this before changing the game. =====
//
// These changes are always safe. Old saves keep working with no extra effort:
//   - changing any number in data.js, towers.js or a class file
//   - adding a new skill, perk, relic, upgrade, monster, tower trophy or town/fame upgrade
//   - adding a new thing to remember (add it to freshClass, packClass and unpackClass;
//     old saves get the value from freshClass)
//   - changing wording, layout and colours
//
// These changes need care, because saves remember things by their id:
//   - RENAMING an id: the save still has the old one, so the player loses that
//     skill level, perk choice or purchase. Change the "name" instead; nobody sees ids.
//   - REMOVING something: whatever players spent on it is gone. (Skill points are the
//     exception: they are worked out from the level, so they come straight back.)
//   - MOVING a milestone to another floor: perk choices are remembered by floor.
//   - changing what a saved value MEANS, for example gold becoming silver.
// For any of those, add a step to upgradeSave below that rewrites old saves to match,
// and add 1 to saveVersion.
//
// Changing saveName makes the game ignore every existing save: everyone starts again.
// That is the "reset" to warn players about. Avoid it.
const saveName = "lloegrys-idle-save-3";
const saveVersion = 3;
let classSaves = {};

// Set when a save could not be read, so the page can tell the player
let saveProblem = "";

// Set when the game has been opened in a newer tab: this one stops saving (see game/start.js)
let otherTabOpen = false;

// Brings a save made by an older version of the game up to date, one step at a time.
// Each step turns version N into version N + 1, so a very old save passes through them all.
function upgradeSave(data) {
  // Saves made before versions existed are version 1
  if (data.version === undefined) {
    data.version = 1;
  }

  // Version 2: equipment is no longer found in the tower. The blacksmith improves it
  // instead, and the kind of weapon is simply picked. Five town upgrades had no job
  // left, so every class gets back the gold it spent on them.
  if (data.version === 1) {
    for (let className in data.classSaves) {
      let saved = data.classSaves[className];

      if (saved.townLevels !== undefined) {
        if (saved.bank === undefined) {
          saved.bank = 0;
        }
        for (let item of removedTownUpgrades) {
          let bought = saved.townLevels[item.id];
          if (bought !== undefined) {
            for (let i = 0; i < bought; i++) {
              saved.bank = saved.bank + Math.round(item.cost * Math.pow(item.growth, i));
            }
            delete saved.townLevels[item.id];
          }
        }
      }

      // The Quartermaster's favourite weapon becomes the weapon picked at the blacksmith
      if (saved.favouriteGear !== undefined && saved.favouriteGear !== "") {
        saved.nextWeapon = saved.favouriteGear;
      }

      // Found equipment and the backpack are gone
      delete saved.favouriteGear;
      delete saved.backpack;
      delete saved.foundItem;
      delete saved.weaponPower;
      delete saved.armorPower;
      delete saved.weaponRarity;
      delete saved.armorRarity;
    }
    data.version = 2;
  }

  // Version 3: fame and the fame upgrades belong to the account instead of to each
  // class, and the upgrades are all straight multipliers now. Rather than guess how
  // seven classes' purchases should merge, every class's fame is given back, spent
  // and unspent, into the one account, to be spent again.
  if (data.version === 2) {
    let total = 0;

    for (let className in data.classSaves) {
      let saved = data.classSaves[className];

      if (saved.fame !== undefined) {
        total = total + saved.fame;
      }
      if (saved.fameLevels !== undefined) {
        for (let item of oldFameUpgrades) {
          let bought = saved.fameLevels[item.id];
          if (bought !== undefined) {
            for (let i = 0; i < bought; i++) {
              total = total + Math.ceil(item.cost * Math.pow(item.growth, i));
            }
          }
        }
      }

      delete saved.fame;
      delete saved.fameLevels;
    }

    data.fame = total;
    data.fameLevels = {};
    if (total > 0) {
      fameWasRefunded = true;
    }
    data.version = 3;
  }

  // A save with no fame written at the top has none
  if (data.fame === undefined) {
    data.fame = 0;
  }
  if (data.fameLevels === undefined) {
    data.fameLevels = {};
  }

  // An example of a step, for when another is needed:
  //
  // if (data.version === 3) {
  //   for (let className in data.classSaves) {
  //     let saved = data.classSaves[className];
  //     // ...change "saved" here, for example rename saved.skillLevels.oldId...
  //   }
  //   data.version = 4;
  // }

  return data;
}

// The fame upgrades as they were priced before version 3, so that upgradeSave can
// give the fame back
const oldFameUpgrades = [
  { id: "might", cost: 6, growth: 1.45 },
  { id: "vitality", cost: 6, growth: 1.45 },
  { id: "wisdom", cost: 4, growth: 1.45 },
  { id: "fortune", cost: 4, growth: 1.45 },
  { id: "legacy", cost: 6, growth: 1.45 },
  { id: "pathfinder", cost: 10, growth: 1.45 },
  { id: "scavenger", cost: 8, growth: 1.45 },
  { id: "insight", cost: 8, growth: 1.45 },
  { id: "endurance", cost: 10, growth: 2 },
  { id: "mastery", cost: 15, growth: 2 }
];

// Set when an update has just given fame back, so the player can be told
let fameWasRefunded = false;

// Set when a class's skill points had to be given back (see unpackClass)
let skillsWereReset = false;

function tellAboutSkillReset() {
  if (skillsWereReset) {
    skillsWereReset = false;
    say("Skills have changed: they now gain ranks every " + skillRankSize + " levels and cost more as they rise. Your skill points have been given back to spend again (Skills).");
  }
}

// Town upgrades that were removed in version 2, with the prices they had,
// so that upgradeSave can give the gold back
const removedTownUpgrades = [
  { id: "autoEquip", cost: 2000, growth: 1 },
  { id: "quartermaster", cost: 5000, growth: 1 },
  { id: "weaponsmith", cost: 3000, growth: 1.4 },
  { id: "armory", cost: 1000, growth: 1.4 },
  { id: "luckyCharm", cost: 1500, growth: 1.4 }
];

// Takes out anything a save remembers that no longer exists in the game,
// so a removed skill or relic cannot cause trouble. "known" is a list of things with ids.
function keepKnownIds(levels, known) {
  let kept = {};

  for (let thing of known) {
    if (levels[thing.id] !== undefined) {
      kept[thing.id] = levels[thing.id];
    }
  }

  return kept;
}

// What a class looks like before it has ever been played
function freshClass(className) {
  return {
    gold: 0,
    bank: 0,
    experience: 0,
    floor: 1,
    bestFloor: 1,
    room: 1,
    level: 1,
    weapon: randomGearType(className),
    nextWeapon: "",
    stance: "",
    forgeLevels: { weapon: 0, armor: 0 },
    upgrades: {},
    skillLevels: {},
    chosenPerks: {},
    ownedRelics: [],
    townLevels: {},
    favouriteUpgrade: "",
    potions: 0,
    tower: className,
    nextTower: className,
    towerBest: {},
    ascensions: 0,
    ascensionBest: 1,
    ascensionSeconds: 0,
    ascensionFame: 0,
    runStartFloor: 1,
    cruising: true,
    cruiseFloor: 1,
    lastAscensionFame: 0,
    lastAscensionSeconds: 0,
    trophies: [],
    runCounter: 0,
    savedBuild: {},
    autoBuild: false,
    abilitySlots: [],
    abilityModes: {},
    lastRun: null,
    runStats: null,
    runsSinceBest: 0,
    legends: 0
  };
}

// Bundles up the class being played right now
function packClass() {
  return {
    gold: gold,
    bank: bank,
    experience: experience,
    floor: floor,
    bestFloor: bestFloor,
    room: room,
    level: level,
    playerHp: playerHp,
    weapon: weapon,
    nextWeapon: nextWeapon,
    stance: stance,
    forgeLevels: forgeLevels,
    upgrades: upgrades,
    skillLevels: skillLevels,
    chosenPerks: chosenPerks,
    ownedRelics: ownedRelics,
    townLevels: townLevels,
    favouriteUpgrade: favouriteUpgrade,
    potions: potions,
    tower: tower,
    nextTower: nextTower,
    towerBest: towerBest,
    ascensions: ascensions,
    ascensionBest: ascensionBest,
    ascensionSeconds: ascensionSeconds,
    ascensionFame: ascensionFame,
    runStartFloor: runStartFloor,
    cruising: cruising,
    cruiseFloor: cruiseFloor,
    lastAscensionFame: lastAscensionFame,
    lastAscensionSeconds: lastAscensionSeconds,
    trophies: trophies,
    runCounter: runCounter,
    savedBuild: savedBuild,
    autoBuild: autoBuild,
    abilitySlots: abilitySlots,
    abilityModes: abilityModes,
    lastRun: lastRun,
    runStats: runStats,
    runsSinceBest: runsSinceBest,
    legends: legends
  };
}

// Puts a saved bundle back into the game's numbers
function unpackClass(saved) {
  // Start from a fresh class, then lay the saved numbers on top.
  // That way anything missing from an older save still gets a sensible value.
  let data = Object.assign(freshClass(playerClass), saved);

  gold = data.gold;
  bank = data.bank;
  experience = data.experience;
  floor = data.floor;
  bestFloor = data.bestFloor;
  room = data.room;
  level = data.level;
  playerHp = data.playerHp;
  weapon = data.weapon;
  nextWeapon = data.nextWeapon;
  stance = data.stance;
  forgeLevels = data.forgeLevels;
  upgrades = data.upgrades;
  skillLevels = data.skillLevels;
  chosenPerks = data.chosenPerks;
  ownedRelics = data.ownedRelics;
  townLevels = data.townLevels;
  favouriteUpgrade = data.favouriteUpgrade;
  potions = data.potions;

  // In case a favourite was renamed or removed since the save was made
  let favouriteExists = false;
  for (let upgrade of currentClass().upgrades) {
    if (upgrade.id === favouriteUpgrade) {
      favouriteExists = true;
    }
  }
  if (!favouriteExists) {
    favouriteUpgrade = "";
  }
  tower = data.tower;
  nextTower = data.nextTower;
  towerBest = data.towerBest;
  ascensions = data.ascensions;
  ascensionBest = data.ascensionBest;
  ascensionSeconds = data.ascensionSeconds;
  lastAscensionFame = data.lastAscensionFame;
  ascensionFame = data.ascensionFame;
  runStartFloor = data.runStartFloor;
  cruising = data.cruising;
  cruiseFloor = data.cruiseFloor;

  // Saves from before this was counted: until then, fame only came from new floors
  if (saved !== undefined && saved.ascensionFame === undefined) {
    ascensionFame = ascensionBest - 1;
  }
  lastAscensionSeconds = data.lastAscensionSeconds;
  trophies = data.trophies;
  runsSinceBest = data.runsSinceBest;
  legends = data.legends;
  runCounter = data.runCounter;
  savedBuild = data.savedBuild;
  autoBuild = data.autoBuild;

  // Abilities: only ones the class still has, and no more than its open slots
  abilitySlots = data.abilitySlots.filter(function (id) {
    return abilityById(id) !== null;
  }).slice(0, openAbilitySlots());
  abilityModes = data.abilityModes;
  resetAbilitiesForRun();
  // "Your damage per turn" is measured afresh: the number left by another class would be wrong
  recentDamage = 0;

  // The run summary: the last finished run, and the count of the one being played
  lastRun = data.lastRun;
  if (lastRun === undefined || lastRun === null || typeof lastRun.damage !== "object" || !Array.isArray(lastRun.killerRules)) {
    lastRun = null;
  }
  runStats = Object.assign(freshRunStats(), data.runStats);
  if (typeof runStats.kills !== "number" || typeof runStats.damage !== "object" || typeof runStats.healing !== "object" || typeof runStats.taken !== "object") {
    runStats = freshRunStats();
  }

  // In case a tower or gear type was renamed or removed since the save was made
  if (towers[tower] === undefined) {
    tower = playerClass;
  }
  if (towers[nextTower] === undefined) {
    nextTower = tower;
  }
  if (currentClass().gearTypes[weapon] === undefined) {
    weapon = randomGearType(playerClass);
  }

  // With nothing else picked at the blacksmith, the next run uses the same weapon
  if (currentClass().gearTypes[nextWeapon] === undefined) {
    nextWeapon = weapon;
  }

  // A class with stances always has one picked: the first on its list to begin with
  if (currentClass().stances === undefined) {
    stance = "";
  } else if (currentClass().stances[stance] === undefined) {
    stance = Object.keys(currentClass().stances)[0];
  }

  // Forget anything the save remembers that is no longer in the game.
  // Skill points spent on a removed skill come back by themselves.
  skillLevels = keepKnownIds(skillLevels, currentClass().skills);
  savedBuild = keepKnownIds(savedBuild, currentClass().skills);
  upgrades = keepKnownIds(upgrades, currentClass().upgrades);

  let knownRelics = [];
  for (let id of ownedRelics) {
    for (let relic of allRelics()) {
      if (relic.id === id) {
        knownRelics.push(id);
      }
    }
  }
  ownedRelics = knownRelics;

  // A perk choice only counts if that milestone still has that perk
  let knownPerks = {};
  for (let milestone of allMilestones()) {
    for (let perk of milestone.perks) {
      if (chosenPerks[milestone.floor] === perk.id) {
        knownPerks[milestone.floor] = perk.id;
      }
    }
  }
  chosenPerks = knownPerks;

  dotStacks = 0;
  recalcStats();

  // Skill levels cost more points the higher they go (see "RANKS"). A save made before
  // that can hold more levels than its points now pay for: give the points back.
  if (skillPointsLeft() < 0) {
    skillLevels = {};
    if (autoBuild && hasSavedBuild()) {
      spendOnSavedBuild();
    }
    recalcStats();
    skillsWereReset = true;
  }

  // A class that has never been played starts on full health
  if (playerHp === undefined) {
    playerHp = playerMaxHp;
  }
}

function saveGame() {
  // Never write over a save that could not be read: the player may still get it back.
  // Nor over the save of a newer tab that has taken over.
  if (saveProblem !== "" || otherTabOpen) {
    return;
  }

  classSaves[playerClass] = packClass();

  let data = {
    version: saveVersion,
    playerClass: playerClass,
    classSaves: classSaves,
    fame: fame,
    fameLevels: fameLevels,
    legendMarks: legendMarks,
    legendLevels: legendLevels,
    unlockedTabs: unlockedTabs,
    lastTick: lastTick
  };

  localStorage.setItem(saveName, JSON.stringify(data));
}

function loadGame() {
  let saved = localStorage.getItem(saveName);

  if (saved !== null) {
    // If anything at all goes wrong reading the save, we end up in "catch" below
    // instead of the game breaking
    try {
      let data = JSON.parse(saved);

      // Keep a copy of the save as it was before an update changes it
      if (data.version !== saveVersion) {
        localStorage.setItem(saveName + "-before-update", saved);
      }
      data = upgradeSave(data);

      classSaves = data.classSaves;
      fame = data.fame;
      fameLevels = keepKnownIds(data.fameLevels, fameUpgrades);

      // Legend marks: saves from before they existed have none
      legendMarks = typeof data.legendMarks === "number" ? data.legendMarks : 0;
      legendLevels = keepKnownIds(data.legendLevels || {}, legendUnlocks);
      if (Array.isArray(data.unlockedTabs)) {
        unlockedTabs = data.unlockedTabs;
      }

      // When the game was last running, so we know how long you were away
      lastTick = data.lastTick;

      if (classes[data.playerClass] !== undefined && classIsOpen(data.playerClass)) {
        playerClass = data.playerClass;
      }

      unpackClass(classSaves[playerClass]);
      return;
    } catch (error) {
      // Start a new game for now, but leave the old save exactly where it is
      saveProblem = saved;
      classSaves = {};
      fame = 0;
      fameLevels = {};
      legendMarks = 0;
      legendLevels = {};
      playerClass = "barbarian";
      lastTick = Date.now();
    }
  }

  unpackClass(classSaves[playerClass]);
}

// Tells the player their save could not be read, and gives them its code to send in
function showSaveProblem() {
  if (saveProblem === "") {
    return;
  }

  document.getElementById("save-problem").hidden = false;

  // Put the unreadable save in the Save tab as a code, if it can be turned into one
  try {
    document.getElementById("save-code").value = btoa(saveProblem);
  } catch (error) {
    document.getElementById("save-code").value = saveProblem;
  }
}

// The player gives up on the save that could not be read. A copy is still kept aside.
function startNewSave() {
  localStorage.setItem(saveName + "-unreadable", saveProblem);
  saveProblem = "";
  document.getElementById("save-problem").hidden = true;
  saveGame();
}

function switchClass(className) {
  if (className === playerClass || !classIsOpen(className)) {
    return;
  }

  classSaves[playerClass] = packClass();
  playerClass = className;
  unpackClass(classSaves[playerClass]);

  buildClassScreen();
  logLines = [];
  say("You are now playing the " + currentClass().name + ".");
  tellAboutSkillReset();
  startEncounter();
  updateScreen();
  saveGame();
}

function resetSave() {
  if (confirm("Delete your save for ALL classes and start again?")) {
    clearInterval(timer);
    localStorage.removeItem(saveName);
    location.reload();
  }
}

// --- Save codes ---
// A save code is the whole save turned into one long piece of text,
// so it can be kept somewhere safe or moved to another device.
function exportSave() {
  saveGame();

  let box = document.getElementById("save-code");
  box.value = btoa(localStorage.getItem(saveName));
  box.select();
  document.getElementById("save-message").textContent = "Copy this code and keep it somewhere safe.";
}

function importSave() {
  let code = document.getElementById("save-code").value.trim();
  let data = null;

  // If the code is damaged, atob or JSON.parse fails and we end up in "catch"
  try {
    data = JSON.parse(atob(code));
  } catch (error) {
    data = null;
  }

  if (data === null || data.classSaves === undefined) {
    document.getElementById("save-message").textContent = "That is not a valid save code.";
    return;
  }

  if (confirm("Replace your current save with this one?")) {
    // No time-away reward for the time the code spent in a drawer
    data.lastTick = Date.now();

    clearInterval(timer);
    localStorage.setItem(saveName, JSON.stringify(data));
    location.reload();
  }
}
