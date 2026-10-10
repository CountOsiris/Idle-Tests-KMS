// =====================================================================
//  game/page-show.js - Showing things on the page, every second: tabs, rows, goals, equipment cards.
// =====================================================================

// ----- Showing things on the page -----
// The page has tabs: Character, Skills, Town and so on. Only one is open at a time.
// style.css shows the page whose name matches body's data-tab.
// On a wide screen the tower is always visible beside the tabs; on a narrow
// one it is a tab of its own.
const tabNames = ["tower", "character", "inventory", "skills", "town", "travel", "milestones", "ascension", "save"];

function showTab(name) {
  if (!tabIsOpen(name)) {
    name = "tower";
  }
  document.body.dataset.tab = name;

  for (let tabName of tabNames) {
    document.getElementById("tab-" + tabName).classList.toggle("open", tabName === name);
  }

  // The tab is remembered, so that reloading the page does not throw you back to the first one
  openTab = name;
  saveSettings();
}

// NOTHING IN THE GAME CHANGES THE TAB BY ITSELF. Only the player does, by pressing a
// tab button. Whatever happens in the tower (a death, a boss, an upgrade, a
// level) shows as a dot on a tab or a pop-up in the fight, and never moves the player
// off the page they are reading. Keep it that way: do not call showTab from game code.

// Puts a small dot on a tab when something there needs the player's attention
function markTab(name, needsAttention) {
  document.getElementById("tab-" + name).classList.toggle("alert", needsAttention);
}

// Adds a line to the top of the combat log
function say(text) {
  // No point keeping thousands of lines while catching up on time away
  if (catchingUp) {
    return;
  }

  logLines.unshift(text);
  if (logLines.length > maxLogLines) {
    logLines.pop();
  }
}

function showLog() {
  let box = document.getElementById("log");
  box.innerHTML = "";

  for (let line of logLines) {
    let row = document.createElement("p");
    row.textContent = line;
    box.appendChild(row);
  }
}

function timeText(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return hours + "h " + minutes + "m";
  }
  return minutes + "m";
}

function closeAwayReport() {
  document.getElementById("away-report").hidden = true;
}

function showClassButtons() {
  for (let className in classes) {
    let button = document.getElementById("class-" + className);

    if (className === playerClass) {
      button.className = "chosen";
    } else {
      button.className = "";
    }
  }
}

// The list of upgrades collected this run. It stays on the page under the fight,
// so there is all the time in the world to read it. Rebuilt only when it changes.
let upgradesShown = "";

function showUpgrades() {
  document.getElementById("upgrade-boost").textContent = "+" + percent(upgradeBoost() - 1);

  let key = playerClass + JSON.stringify(upgrades);
  if (key === upgradesShown) {
    return;
  }
  upgradesShown = key;

  let box = document.getElementById("upgrades");
  box.innerHTML = "";

  let held = 0;
  for (let upgrade of currentClass().upgrades) {
    if (upgradeLevel(upgrade.id) === 0) {
      continue;
    }
    held = held + upgradeLevel(upgrade.id);

    let row = document.createElement("div");
    row.className = "row";

    let text = document.createElement("div");
    text.className = "row-text";

    let title = document.createElement("p");
    title.className = "row-title";
    title.textContent = upgrade.name + " · level " + upgradeLevel(upgrade.id);
    text.appendChild(title);

    let note = document.createElement("p");
    note.className = "note";
    note.textContent = upgrade.text + " per level";
    text.appendChild(note);

    row.appendChild(text);
    box.appendChild(row);
  }

  document.getElementById("upgrade-count").textContent = held;
  document.getElementById("upgrades-empty").hidden = held > 0;
}

// A description that begins with the name of a weapon ("Axe: ...") or of an element
// ("Fire: ...") only works with that one. If the class is using another right now,
// this gives a few words to say so, so nobody spends points and wonders why nothing changed.
function otherBuildNote(text) {
  let using = currentClass().gearTypes[weapon];
  let names = Object.values(currentClass().gearTypes);

  if (currentClass().stances !== undefined) {
    using = currentClass().stances[stance].name;
    names = [];
    for (let id in currentClass().stances) {
      names.push(currentClass().stances[id].name);
    }
  }

  for (let name of names) {
    if (name !== using && text.startsWith(name + ":")) {
      return " (Does nothing right now: you are using the " + using + ".)";
    }
  }
  return "";
}

function showSkills() {
  document.getElementById("skill-points").textContent = skillPointsLeft();

  // Resetting is free and can be done at any time. The button is greyed out only
  // when there is nothing to give back.
  document.getElementById("reset-skills-btn").disabled = skillPointsSpent() === 0;

  // The x1 / x10 / Max buttons, and the saved build
  showFavourite("skill-amount-buttons", "skill-amount-" + skillBuyAmount);
  document.getElementById("apply-build-btn").disabled = !hasSavedBuild() || skillPointsLeft() < 1;
  document.getElementById("auto-build-box").checked = autoBuild;
  document.getElementById("auto-build-box").disabled = !hasSavedBuild();

  let recipe = [];
  for (let skill of currentClass().skills) {
    if (savedBuild[skill.id] !== undefined) {
      recipe.push(skill.name + " " + savedBuild[skill.id]);
    }
  }
  if (recipe.length === 0) {
    document.getElementById("saved-build-note").textContent = "No build saved yet. Spend your points how you like, then save.";
  } else {
    document.getElementById("saved-build-note").textContent = "Saved: " + recipe.join(", ") + ". Points are shared out in these proportions.";
  }

  // A class can have something to say at the top of its skills
  let noteBox = document.getElementById("skills-note");
  noteBox.hidden = currentClass().skillsNote === undefined;
  if (currentClass().skillsNote !== undefined) {
    noteBox.textContent = currentClass().skillsNote();
  }

  // The stance picker is hidden for a class without stances
  let stances = currentClass().stances;
  document.getElementById("stance").hidden = stances === undefined;
  if (stances !== undefined) {
    document.getElementById("stance-label").textContent = currentClass().stanceLabel + " · " + stances[stance].name;
    document.getElementById("stance-note").textContent = stances[stance].text;
    showFavourite("stance-buttons", "stance-" + stance);
  }

  for (let skill of currentClass().skills) {
    let cost = skillCostOf(skill);
    let price = cost + " points";
    if (cost === 1) {
      price = "1 point";
    }

    // The rank the skill has, and when the next one comes
    let rank = skillRank(skill.id);
    let nextRankAt = (rank + 1) * skillRankSize;
    let title = skill.name + " · level " + skillLevel(skill.id);
    let rankNote = " Rank " + (rank + 1) + " at level " + nextRankAt + ": the whole skill +" + percent(skillRankPower) + " stronger, and its levels cost 1 point more.";
    if (rank > 0) {
      title = title + " · rank " + rank + " (x" + big(skillRankBoost(skill.id)) + ")";
    }

    // Skills have no top level
    fillRow("skill-" + skill.id, title, skill.text + " per level." + rankNote + otherBuildNote(skill.text), price, skillPointsLeft() < cost);
  }
}

function showMilestones() {
  // A new breakthrough appears on the list each time one is reached
  if (document.getElementById("milestones").children.length !== allMilestones().length) {
    buildMilestones();
  }

  for (let milestone of allMilestones()) {
    let unlocked = bestFloor >= milestone.floor;

    let title = "Floor " + milestone.floor;
    if (!unlocked) {
      title = title + " · locked";
    } else if (chosenPerks[milestone.floor] === undefined) {
      title = title + " · pick one";
    }
    document.getElementById("milestone-" + milestone.floor).textContent = title;

    for (let perk of milestone.perks) {
      let button = document.getElementById("perk-" + milestone.floor + "-" + perk.id);
      button.disabled = !unlocked;

      if (chosenPerks[milestone.floor] === perk.id) {
        button.className = "chosen";
      } else {
        button.className = "";
      }
    }
  }
}

// Highlights the button of the current favourite in one of the pickers
function showFavourite(boxId, favouriteButtonId) {
  for (let button of document.getElementById(boxId).children) {
    if (button.id === favouriteButtonId) {
      button.className = "chosen";
    } else {
      button.className = "";
    }
  }
}

function showTown() {
  for (let item of townUpgrades) {
    let name = "town-" + item.id;
    let price = big(townCost(item)) + " gold";

    // The helpers are bought once. Everything else can be bought forever.
    if (townUpgradeIsMaxed(item)) {
      fillRow(name, item.name, item.text, "Owned", true);
    } else if (item.maxLevel === 1) {
      fillRow(name, item.name, item.text, price, bank < townCost(item));
    } else {
      fillRow(name, item.name + " · level " + townLevel(item.id), item.text, price, bank < townCost(item));
    }
  }

  // The picker only appears once the Tactician has been hired
  document.getElementById("favourite-upgrade").hidden = totalBonus("favouriteUpgrade") < 1;
  showFavourite("favourite-upgrade-buttons", "favourite-upgrade-" + favouriteUpgrade);

  showBlacksmith();

  document.getElementById("potions").textContent = potions + " / " + potionLimit();
  document.getElementById("potion-btn").textContent = potionPrice + " gold";
  document.getElementById("potion-btn").disabled = potions >= potionLimit() || bank < potionPrice;
}

// What a piece of equipment gives at a step: "+12 attack" or "+6 armor"
function gearStat(slot, step) {
  if (slot === "weapon") {
    return "+" + big(forgePower(slot, step)) + " attack";
  }
  return "+" + big(forgePower(slot, step)) + " armor";
}

// Can the blacksmith's next step for either piece be paid for?
function canAffordForge() {
  return bank >= forgeCostOf("weapon") || bank >= forgeCostOf("armor");
}

function showBlacksmith() {
  for (let slot of ["weapon", "armor"]) {
    let step = forgeLevel(slot);
    let note = gearStat(slot, step) + ". Next: " + gearName(slot, step + 1) + ", " + gearStat(slot, step + 1) + ".";

    fillRow("forge-" + slot, slotLabel(slot) + " · " + gearName(slot, step), note, big(forgeCostOf(slot)) + " gold", bank < forgeCostOf(slot));
    document.getElementById("forge-" + slot + "-title").className = "row-title rarity-" + Math.min(5, tierOfStep(step));
  }

  document.getElementById("forge-all").disabled = !canAffordForge();

  // A class with only one kind of gear has nothing to pick between
  document.getElementById("weapon-picker").hidden = Object.keys(currentClass().gearTypes).length < 2;
  showFavourite("weapon-buttons", "weapon-" + nextWeapon);

  // What the picked kind does. The class's own description is written for the gear
  // being used, so this borrows it by pretending for a moment to use the picked one.
  let using = weapon;
  weapon = nextWeapon;
  let effect = currentClass().gearInfo() + " Damage: " + typeNames(currentClass().damageTypes()) + ".";
  weapon = using;

  let types = currentClass().gearTypes;
  if (nextWeapon === weapon) {
    document.getElementById("weapon-picker-note").textContent = effect + " Picking another kind changes it after your next fall, and the blacksmith's work carries over.";
  } else {
    document.getElementById("weapon-picker-note").textContent = effect + " You are still fighting with the " + types[weapon] + ": the change is made after your next fall.";
  }
}

// A sentence for the tower list: how well the damage this class is dealing RIGHT NOW
// (with the gear and stance it has) does against the monsters of a tower
function towerMatchup(towerName) {
  let types = currentClass().damageTypes();
  let place = towers[towerName];
  let all = place.monsters.concat(place.bosses);
  let weak = 0;
  let resisted = 0;

  for (let monster of all) {
    for (let type of types) {
      if (listHasType(monster.weak || [], type)) {
        weak = weak + 1;
      } else if (listHasType(monster.resist || [], type)) {
        resisted = resisted + 1;
      }
    }
  }

  let chances = all.length * types.length;
  let note = "Against your " + typeNames(types) + " damage: " + percent(resisted / chances) + " of it is resisted here and " + percent(weak / chances) + " hits a weakness.";
  if (place.ward !== undefined) {
    note = note + " Its monsters are warded against spells.";
  }
  if (place.lunge === true) {
    note = note + " Its beasts strike first, unless you fight from range.";
  }
  return note;
}

function showTowers() {
  for (let towerName in towers) {
    let place = towers[towerName];
    let name = "tower-" + towerName;

    let title = place.icon + " " + place.name + " · " + classes[towerName].name + "'s tower";
    if (towerName === playerClass) {
      title = place.icon + " " + place.name + " · your home tower";
    }

    let best = 0;
    if (towerBest[towerName] !== undefined) {
      best = towerBest[towerName];
    }
    let text = place.text + " " + towerMatchup(towerName) + " Your best floor here: " + best + ".";

    for (let trophy of place.trophies) {
      text = text + " Trophy at floor " + trophy.floor + ": " + trophy.name + " (" + trophy.text + ")";
      if (trophies.includes(trophy.id)) {
        text = text + ", won.";
      } else if (towerName === playerClass) {
        text = text + ", cannot be won in your home tower.";
      } else {
        text = text + ", not won yet.";
      }
    }

    let button = document.getElementById(name);
    button.className = "";

    if (towerName === tower && towerName === nextTower) {
      fillRow(name, title, text, "You are here", true);
      button.className = "chosen";
    } else if (towerName === nextTower) {
      fillRow(name, title, text, "Entering after you fall", true);
      button.className = "chosen";
    } else if (towerName === tower) {
      fillRow(name, title, text, "Stay here", false);
    } else {
      fillRow(name, title, text, "Enter next run", false);
    }
  }
}

// What a fame upgrade has added up to so far, for example "x1.95 attack"
function fameEffectText(item) {
  let parts = [];

  if (item.multiply !== undefined) {
    for (let stat in item.multiply) {
      // Small multipliers keep two decimals (x1.25); huge ones use the short form
      let times = Math.pow(item.multiply[stat], fameLevelInEffect(item.id));
      if (times < 1000) {
        parts.push("x" + Math.round(times * 100) / 100 + " " + stat);
      } else {
        parts.push("x" + big(times) + " " + stat);
      }
    }
  }
  if (item.add !== undefined) {
    for (let stat in item.add) {
      // Shares like 0.1 are written as 10%
      let amount = item.add[stat] * fameLevel(item.id);
      if (item.addAsPercent) {
        parts.push(percent(amount) + " " + item.addLabel);
      } else {
        parts.push("+" + amount + " " + item.addLabel);
      }
    }
  }

  return parts.join(", ");
}

// For example "34 fame in 1h 12m (28.3 an hour)"
function fameRateText(fameEarned, seconds) {
  if (seconds < 60) {
    return big(fameEarned) + " fame so far";
  }
  return big(fameEarned) + " fame in " + timeText(seconds) + " (" + big(fameEarned / (seconds / 3600)) + " an hour)";
}

// A sentence to help decide when to ascend. Fame per hour falls the longer an
// ascension lasts; once it drops below the last ascension's, starting again is
// usually the faster way to earn fame.
function ascendAdvice() {
  if (!canAscend()) {
    return "";
  }
  if (ascensions === 0) {
    return "Your first ascension: the fame it pays buys upgrades that make every class's next climb faster.";
  }
  if (ascensionSeconds < 600 || lastAscensionSeconds < 600) {
    return "";
  }

  let now = ascensionFame / (ascensionSeconds / 3600);
  let last = lastAscensionFame / (lastAscensionSeconds / 3600);
  if (now < last * 0.9) {
    return "Fame is coming in slower than in your last ascension (" + big(now) + " an hour, against " + big(last) + "). Ascending now is probably faster.";
  }
  return "Fame is still coming in about as fast as in your last ascension (" + big(now) + " an hour, against " + big(last) + "), so pushing on is fine.";
}

function showAscension() {
  document.getElementById("fame-owned").textContent = big(fame);
  document.getElementById("this-ascension").textContent = fameRateText(ascensionFame, ascensionSeconds);
  if (ascensions === 0) {
    document.getElementById("last-ascension").textContent = "none yet";
  } else {
    document.getElementById("last-ascension").textContent = fameRateText(lastAscensionFame, lastAscensionSeconds);
  }
  document.getElementById("ascensions").textContent = ascensions;
  document.getElementById("account-ascensions").textContent = totalAscensions();
  document.getElementById("ascension-best").textContent = ascensionBest;
  document.getElementById("catch-up-count").textContent = ascensions;
  document.getElementById("catch-up-share").textContent = percent(fameCatchUpShare);
  document.getElementById("ascend-floor").textContent = ascendFloorNeeded();

  document.getElementById("ascend-advice").textContent = ascendAdvice();

  let button = document.getElementById("ascend-btn");
  if (canAscend()) {
    button.textContent = "Ascend";
    button.disabled = false;
  } else {
    button.textContent = "Ascend (reach floor " + ascendFloorNeeded() + " first)";
    button.disabled = true;
  }

  for (let item of fameUpgrades) {
    let name = "fame-" + item.id;

    // A locked upgrade shows only when it will appear
    if (!fameUpgradeIsUnlocked(item)) {
      let when = "Unlocks after " + item.unlockAt + " ascensions, counting every class.";
      if (item.unlockAt === 1) {
        when = "Unlocks after your first ascension, with any class.";
      }
      fillRow(name, item.name, when, "Locked", true);
      continue;
    }

    let title = item.name + " · level " + fameLevel(item.id);
    let note = item.text + " For this class: " + fameEffectText(item) + ".";

    // Levels this class has not caught up with yet
    let waiting = fameLevel(item.id) - fameLevelsAtFull(item.id);
    if (waiting > 0) {
      note = note + " (" + fameLevelsAtFull(item.id) + " at full power, " + waiting + " at " + percent(fameCatchUpShare) + " until this class ascends more.)";
    }

    if (fameUpgradeIsMaxed(item)) {
      fillRow(name, title, note, "Max", true);
    } else {
      fillRow(name, title, note, big(fameCost(item)) + " fame", fame < fameCost(item));
    }
  }
}

// ----- What to do next -----
// A short list under the tower that tells the player what needs their attention
// and what they are working toward. At most three lines, most urgent first.

// Is there an unlocked milestone with no perk picked yet?
function hasPerkToPick() {
  for (let milestone of allMilestones()) {
    if (bestFloor >= milestone.floor && chosenPerks[milestone.floor] === undefined) {
      return true;
    }
  }
  return false;
}

function canBuyFameUpgrade() {
  for (let item of fameUpgrades) {
    if (fameUpgradeIsUnlocked(item) && !fameUpgradeIsMaxed(item) && fame >= fameCost(item)) {
      return true;
    }
  }
  return false;
}

function nextGoals() {
  let goals = [];

  // Things waiting to be used
  if (skillPointsLeft() > 0) {
    goals.push("You have " + skillPointsLeft() + " skill points to spend (Skills).");
  }
  if (hasEmptyAbilitySlot()) {
    goals.push("You have an empty ability slot (Skills).");
  }
  if (hasPerkToPick()) {
    goals.push("You have a milestone perk to pick (Milestones).");
  }
  if (canAscend()) {
    goals.push("You can ascend (Ascension).");
  }
  if (canBuyFameUpgrade()) {
    goals.push("You have enough fame for a fame upgrade (Ascension).");
  }
  if (canAffordForge()) {
    goals.push("The blacksmith can improve your equipment (Town).");
  }

  // Things to aim for
  if (!canAscend()) {
    goals.push("Reach floor " + ascendFloorNeeded() + " to ascend. Best since your last ascension: " + ascensionBest + ".");
  }
  for (let milestone of allMilestones()) {
    if (bestFloor < milestone.floor) {
      goals.push("Reach floor " + milestone.floor + " to unlock a milestone perk.");
      break;
    }
  }
  if (isAway()) {
    for (let trophy of towers[tower].trophies) {
      if (!trophies.includes(trophy.id)) {
        goals.push("Reach floor " + trophy.floor + " here to win a trophy: " + trophy.name + ".");
        break;
      }
    }
  }

  return goals.slice(0, 3);
}

function showGoals() {
  let box = document.getElementById("goals");
  box.innerHTML = "";

  for (let goal of nextGoals()) {
    let row = document.createElement("p");
    row.textContent = goal;
    box.appendChild(row);
  }

  // The same things put a dot on their tab
  markTab("town", canAffordForge());
  markTab("skills", skillPointsLeft() > 0 || hasEmptyAbilitySlot());
  markTab("milestones", hasPerkToPick());
  markTab("ascension", canAscend() || canBuyFameUpgrade());
}

// The relic list is rebuilt only when the relics held change
let relicsShown = "";

function showRelics() {
  let key = playerClass + ownedRelics.join(",");
  if (key === relicsShown) {
    return;
  }
  relicsShown = key;

  let box = document.getElementById("relics");
  box.innerHTML = "";
  document.getElementById("relic-count").textContent = ownedRelics.length;
  document.getElementById("relics-empty").hidden = ownedRelics.length > 0;

  // One card for each different relic, saying how many of it are held
  for (let relic of allRelics()) {
    let held = 0;
    for (let id of ownedRelics) {
      if (id === relic.id) {
        held = held + 1;
      }
    }
    if (held === 0) {
      continue;
    }

    let card = document.createElement("div");
    card.className = "item";

    let icon = document.createElement("div");
    icon.className = "item-icon";
    if (relic.icon !== undefined) {
      icon.textContent = relic.icon;
    } else {
      icon.textContent = "💎";
    }
    card.appendChild(icon);

    let text = document.createElement("div");
    text.className = "item-text";

    let label = document.createElement("p");
    label.className = "item-slot";
    label.textContent = "Relic";
    text.appendChild(label);

    let name = document.createElement("p");
    name.className = "row-title";
    name.textContent = relic.name;
    if (held > 1) {
      let count = document.createElement("span");
      count.className = "item-count";
      count.textContent = "  x" + held;
      name.appendChild(count);
    }
    text.appendChild(name);

    let effect = document.createElement("p");
    effect.className = "item-stats";
    effect.textContent = relic.text;
    if (held > 1) {
      effect.textContent = relic.text + " (each)";
    }
    text.appendChild(effect);

    card.appendChild(text);
    box.appendChild(card);
  }
}

function updateScreen() {
  checkTabUnlocks(false);
  showMoment();
  showClassButtons();
  showUpgrades();
  showSkills();
  showAbilities();
  showAbilityBar();
  showMilestones();
  showRelics();
  showTown();
  showTowers();
  showAscension();
  showGoals();
  showLog();

  // The bar across the top
  document.getElementById("header-icon").textContent = currentClass().icon;
  document.getElementById("header-class").textContent = currentClass().name;
  document.getElementById("header-level").textContent = level;
  document.getElementById("header-level-bar").style.width = Math.min(100, experience / levelCost() * 100) + "%";
  document.getElementById("gold").textContent = big(gold);
  document.getElementById("bank").textContent = big(bank);
  document.getElementById("xp").textContent = big(experience);
  document.getElementById("fame").textContent = big(fame);

  // The tower
  document.getElementById("tower-name").textContent = towers[tower].icon + " " + towers[tower].name;

  // Each tower tints the fight with its own colour (the "sky" in towers.js)
  document.getElementById("stage").style.setProperty("--sky", towers[tower].sky);
  if (isAway()) {
    document.getElementById("tower-note").textContent = "Away from home: monsters have +" + percent(awayTowerHealth) + " health and +" + percent(awayTowerAttack) + " attack, and you earn +" + percent(awayTowerExperience) + " experience.";
  } else {
    document.getElementById("tower-note").textContent = "Your home tower. " + towers[tower].text;
  }

  document.getElementById("floor").textContent = floor;
  document.getElementById("best-floor").textContent = bestFloor;

  // One dot per room: gold for rooms cleared, bright for the one you are in
  for (let i = 1; i <= roomsPerFloor; i++) {
    let look = "";
    if (i < room) {
      look = "done";
    } else if (i === room) {
      look = "now";
    }
    document.getElementById("pip-" + i).className = look;
  }

  // The Character tab
  document.getElementById("class").textContent = currentClass().name;
  document.getElementById("class-text").textContent = currentClass().text;
  document.getElementById("level").textContent = level;
  document.getElementById("health").textContent = big(playerMaxHp);
  document.getElementById("player-hp").textContent = big(playerHp) + " / " + big(playerMaxHp);
  // The pale "trail" behind each health bar is set to the same width but moves
  // more slowly (see style.css), so you can see how much a hit just took off
  document.getElementById("player-hp-bar").style.width = Math.max(0, playerHp / playerMaxHp * 100) + "%";
  document.getElementById("player-hp-trail").style.width = Math.max(0, playerHp / playerMaxHp * 100) + "%";
  document.getElementById("attack").textContent = big(playerAttack);
  document.getElementById("total-armor").textContent = big(totalArmor());
  document.getElementById("armor-share").textContent = "blocks " + percent(armorShareBlocked()) + " here";
  document.getElementById("class-stat").textContent = currentClass().statLine();

  // The level panel: progress toward the next level, and what a level gives
  document.getElementById("level-big").textContent = level;
  document.getElementById("level-progress").textContent = big(experience) + " / " + big(levelCost());
  document.getElementById("level-bar").style.width = Math.min(100, experience / levelCost() * 100) + "%";
  document.getElementById("level-gain").textContent = "+" + currentClass().perLevel.attack + " attack, +" + currentClass().perLevel.maxHp + " health and " + skillPointsPerLevel + " skill point";

  // The fight
  let inFight = encounterType === "monster" || encounterType === "boss";

  let title = monsterName;
  let text = monsterText;
  let icon = monsterIcon;
  if (encounterType === "boss") {
    title = "BOSS: " + monsterName;
  }
  if (encounterType === "rest") {
    title = "Rest Area";
    text = "A quiet place to recover.";
    icon = "⛺";
  }
  if (encounterType === "chest") {
    title = "Treasure Chest";
    text = "Gold for the blacksmith.";
    icon = "💰";
  }
  document.getElementById("encounter-title").textContent = title;
  document.getElementById("monster-text").textContent = text;
  document.getElementById("monster-stats").hidden = !inFight;
  document.getElementById("monster-numbers").hidden = !inFight;

  // What the monster is weak to and resists, in words
  let weakNote = "";
  let resistNote = "";
  if (inFight && monsterWeak.length > 0) {
    weakNote = "Weak to " + typeNames(monsterWeak) + " (+" + percent(weakAmount) + ")";
  }
  if (inFight && monsterResist.length > 0) {
    resistNote = "Resists " + typeNames(monsterResist) + " (-" + percent(resistNow()) + ")";
  }
  if (inFight && monsterFlying) {
    if (currentClass().ranged === true) {
      resistNote = resistNote + "  Flying, but you can reach it.";
    } else {
      resistNote = resistNote + "  Flying: your swings miss " + percent(flyingMissChance) + " of the time.";
    }
  }
  if (inFight && monsterLunges && currentClass().ranged !== true) {
    resistNote = resistNote + "  Lunges: it strikes first.";
  }
  document.getElementById("monster-weak").textContent = weakNote;
  document.getElementById("monster-resist").textContent = resistNote;

  // Rooms that are not fights have an emoji only, never pixel art
  let art = monsterArt;
  if (!inFight) {
    art = "";
  }
  drawPicture("player-icon", currentClass().icon, currentClass().art);
  document.getElementById("player-name").textContent = currentClass().name;
  drawPicture("monster-icon", icon, art);

  // When either fighter has real art, the fight is drawn taller to make room for it
  let anyArt = currentClass().art !== undefined || art !== "";
  document.getElementById("stage").classList.toggle("with-art", anyArt);

  // Bosses and rare monsters get a coloured glow (see style.css).
  // classList.toggle switches one class on or off and leaves the animation classes alone.
  document.getElementById("monster-icon").classList.toggle("boss", encounterType === "boss");
  document.getElementById("stage").classList.toggle("boss-fight", encounterType === "boss");
  document.getElementById("monster-icon").classList.toggle("rare", inFight && monsterIsRare);

  if (inFight) {
    document.getElementById("monster-hp").textContent = big(Math.max(0, monsterHp)) + " / " + big(monsterMaxHp);
    document.getElementById("monster-hp-bar").style.width = Math.max(0, monsterHp / monsterMaxHp * 100) + "%";
    document.getElementById("monster-hp-trail").style.width = Math.max(0, monsterHp / monsterMaxHp * 100) + "%";
    document.getElementById("monster-attack").textContent = big(monsterAttack);
    document.getElementById("monster-armor").textContent = percent(armorNow());
    document.getElementById("monster-ward").textContent = percent(wardNow());
    document.getElementById("monster-dot").textContent = big(dotDamage());
  }

  // Classes without damage over time have no dotLabel, so that part is hidden
  if (currentClass().dotLabel === undefined) {
    document.getElementById("dot-part").hidden = true;
  } else {
    document.getElementById("dot-part").hidden = false;
    document.getElementById("dot-label").textContent = currentClass().dotLabel;
  }

  showGear();
}

// The two equipment cards are rebuilt only when something about them changes
let gearShown = "";

function showGear() {
  // (the effect texts hold numbers that skills and upgrades change, so they are part of the key)
  let key = playerClass + weapon + stance + JSON.stringify(forgeLevels) + weaponPower + armorPower + currentClass().gearInfo();
  if (key === gearShown) {
    return;
  }
  gearShown = key;

  let wornBox = document.getElementById("worn");
  wornBox.innerHTML = "";
  wornBox.appendChild(gearCard("weapon"));
  wornBox.appendChild(gearCard("armor"));
}

// ----- Describing equipment: its picture and what it does -----

// The little picture of a piece of equipment. A class can give each kind of its gear
// an icon (gearIcons) or a drawing (gearArt); anything without one gets a plain icon.
function gearIcon(slot) {
  let icons = currentClass().gearIcons;
  if (slot === specialSlot() && icons !== undefined && icons[weapon] !== undefined) {
    return icons[weapon];
  }
  if (slot !== specialSlot() && currentClass().plainIcon !== undefined) {
    return currentClass().plainIcon;
  }
  if (slot === "weapon") {
    return "⚔️";
  }
  return "🥋";
}

function gearArt(slot) {
  let art = currentClass().gearArt;
  if (slot === specialSlot() && art !== undefined && art[weapon] !== undefined) {
    return art[weapon];
  }
  return "";
}

// Builds the card for the equipment in a slot ("weapon" or "armor")
function gearCard(slot) {
  let step = forgeLevel(slot);

  let card = document.createElement("div");
  card.className = "item";

  let icon = document.createElement("div");
  icon.className = "item-icon";
  if (gearArt(slot) !== "") {
    let image = document.createElement("img");
    image.src = gearArt(slot);
    image.alt = "";
    icon.appendChild(image);
  } else {
    icon.textContent = gearIcon(slot);
  }
  card.appendChild(icon);

  let text = document.createElement("div");
  text.className = "item-text";

  let label = document.createElement("p");
  label.className = "item-slot";
  label.textContent = slotLabel(slot);
  text.appendChild(label);

  // The name takes the colour of its tier
  let name = document.createElement("p");
  name.className = "row-title rarity-" + Math.min(5, tierOfStep(step));
  name.textContent = gearName(slot, step);
  text.appendChild(name);

  let stats = document.createElement("p");
  stats.className = "item-stats";
  stats.textContent = gearStat(slot, step);
  text.appendChild(stats);

  // The special gear also says how it makes the class fight
  if (slot === specialSlot()) {
    let effect = document.createElement("p");
    effect.className = "note";
    effect.textContent = currentClass().gearInfo() + " Damage: " + typeNames(currentClass().damageTypes()) + ".";
    text.appendChild(effect);
  }

  card.appendChild(text);
  return card;
}
