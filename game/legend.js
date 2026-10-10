// =====================================================================
//  game/legend.js - Legend: the layer above ascension.
// =====================================================================
//
// A class that has reached floor legendFloor (data.js) can BECOME A LEGEND. That starts
// it over further back than an ascension does: its best floors and its milestone picks
// go too, so the whole tower is climbed, and every milestone earned, again.
// It pays LEGEND MARKS, which belong to the account like fame does. Marks never buy a
// multiplier: each thing they buy (legendUnlocks in data.js) opens something new, for
// every class. Deeper floors pay more marks, but slowly (the square root of the best
// floor), so a legend is worth becoming again only after going further than last time.
//
//   Lost: everything an ascension loses, and best floors, milestone perks picked,
//         ability slots filled, and the place in other towers.
//   Kept: fame and fame upgrades, trophies, town helpers, legend marks and what they bought.

// ----- The account -----
let legendMarks = 0;
let legendLevels = {};     // what the marks have bought, for example { reliquary: 2 }

function legendLevel(id) {
  if (legendLevels[id] === undefined) {
    return 0;
  }
  return legendLevels[id];
}

// What the legend unlocks add to a number. They work for every class, in full.
function legendBonus(stat) {
  let total = 0;

  for (let item of legendUnlocks) {
    if (item.bonus[stat] !== undefined) {
      total = total + item.bonus[stat] * legendLevel(item.id);
    }
  }

  return total;
}

function legendCost(item) {
  return Math.ceil(item.cost * Math.pow(item.growth, legendLevel(item.id)));
}

function legendUnlockIsMaxed(item) {
  return legendLevel(item.id) >= item.maxLevel;
}

function buyLegendUnlock(item) {
  if (!legendUnlockIsMaxed(item) && legendMarks >= legendCost(item)) {
    legendMarks = legendMarks - legendCost(item);
    legendLevels[item.id] = legendLevel(item.id) + 1;
    recalcStats();
    showClassButtons();
    announce("banner", item.name, item.text);
    updateScreen();
    saveGame();
  }
}

function canBuyLegendUnlock() {
  for (let item of legendUnlocks) {
    if (!legendUnlockIsMaxed(item) && legendMarks >= legendCost(item)) {
      return true;
    }
  }
  return false;
}

// A class that has to be opened with legend marks (unlock: "..." in its file) cannot be
// played until then. Its tower is there for the other classes from the start.
function classIsOpen(className) {
  let unlock = classes[className].unlock;
  return unlock === undefined || legendLevel(unlock) > 0;
}

// ----- Becoming a legend -----
function canBecomeLegend() {
  return bestFloor >= legendFloor;
}

// The marks this class would be paid right now
function legendMarksNow() {
  return Math.floor(Math.sqrt(bestFloor) * legendMarkRate);
}

function becomeLegend() {
  if (!canBecomeLegend()) {
    return;
  }
  if (!confirm("Become a legend? This class starts again from floor 1 and level 1, with every milestone to earn again, for " + legendMarksNow() + " legend marks.")) {
    return;
  }

  let paid = legendMarksNow();
  legendMarks = legendMarks + paid;
  legends = legends + 1;

  // What an ascension does not touch
  bestFloor = 1;
  towerBest = {};
  chosenPerks = {};
  abilitySlots = [];
  runsSinceBest = 0;
  tower = playerClass;
  nextTower = playerClass;
  lastRun = null;

  // ...and then everything an ascension does
  ascensionFame = 0;
  ascensionSeconds = 0;
  ascensionBest = 1;
  startClassOver();

  say("You are a legend. " + paid + " legend marks, and the whole tower to climb again.");
  buildClassScreen();
  startEncounter();
  updateScreen();
  saveGame();
}

// ----- On the page -----
function showLegend() {
  document.getElementById("legend-marks").textContent = big(legendMarks);
  document.getElementById("legend-count").textContent = legends;
  document.getElementById("legend-floor").textContent = legendFloor;
  document.getElementById("legend-best").textContent = bestFloor;

  let button = document.getElementById("legend-btn");
  if (canBecomeLegend()) {
    button.textContent = "Become a legend (+" + legendMarksNow() + " marks)";
    button.disabled = false;
  } else {
    button.textContent = "Become a legend (reach floor " + legendFloor + " first)";
    button.disabled = true;
  }

  for (let item of legendUnlocks) {
    let name = "legend-" + item.id;
    let title = item.name;
    if (item.maxLevel > 1) {
      title = title + " · " + legendLevel(item.id) + " of " + item.maxLevel;
    }

    if (legendUnlockIsMaxed(item)) {
      fillRow(name, title, item.text, "Owned", true);
    } else {
      fillRow(name, title, item.text, legendCost(item) + " marks", legendMarks < legendCost(item));
    }
  }
}
