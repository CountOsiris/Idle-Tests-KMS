// =====================================================================
//  game/equipment.js - The blacksmith and equipment, the town, and boss boons.
// =====================================================================

// ----- Equipment -----
// Equipment is never found in the tower and never lost. A class has one weapon and
// one piece of armor, and the blacksmith in town makes them stronger for banked gold.
//
// There are two slots, "weapon" and "armor". One of them holds the class's SPECIAL
// gear, which comes in several kinds (axe / sword / club, or the Warden's three shields)
// and decides how the class fights. The other holds a plain piece with only a power.
//   - For most classes the special gear is the weapon, and the plain piece is armor.
//   - For the Warden the special gear is the shield (in the armor slot), and the
//     plain piece is the spear (in the weapon slot).
// The variable "weapon" holds the KIND of special gear being used, whichever slot it is in.
// The kind is picked at the blacksmith and changes at the start of the next run.
function specialSlot() {
  if (currentClass().specialSlot !== undefined) {
    return currentClass().specialSlot;
  }
  return "weapon";
}

// What the plain piece is called
function plainLabel() {
  if (currentClass().plainLabel !== undefined) {
    return currentClass().plainLabel;
  }
  return "Armor";
}

// The label shown in front of a slot, like "Weapon", "Armor", "Spear" or "Shield"
function slotLabel(slot) {
  if (slot === specialSlot()) {
    return currentClass().gearLabel;
  }
  return plainLabel();
}

function randomGearType(className) {
  let types = Object.keys(classes[className].gearTypes);
  return types[Math.floor(Math.random() * types.length)];
}

// How many steps the blacksmith has improved a slot ("weapon" or "armor")
function forgeLevel(slot) {
  if (forgeLevels[slot] === undefined) {
    return 0;
  }
  return forgeLevels[slot];
}

// Which tier a step is in: 0 for the first on the gearTiers list, 1 for the second...
// It never goes past the last tier on the list.
function tierOfStep(step) {
  return Math.min(gearTiers.length - 1, Math.floor(step / forgeStepsPerTier));
}

// The attack a weapon gives, or the armor a piece of armor gives, at a step.
// Each +1 adds a little, and each new tier is a jump (see forgeBasePower in data.js).
// (Past the last named tier the multiplying carries on, so there is no top.)
function forgePower(slot, step) {
  // The tier keeps counting past the last named one, so the power never stops growing
  let tier = Math.floor(step / forgeStepsPerTier);
  let plus = step - tier * forgeStepsPerTier;
  let power = forgeBasePower * Math.pow(forgeTierPower, tier) * (1 + forgePlusPower * plus);

  // Armor has half the power of a weapon
  if (slot === "armor") {
    power = power / 2;
  }

  return Math.max(1, Math.round(power * multiplier("gear")));
}

// The price of the next step, in banked gold
function forgeCostOf(slot) {
  return Math.round(forgeCost * Math.pow(forgeCostGrowth, forgeLevel(slot)));
}

function upgradeGear(slot) {
  if (bank >= forgeCostOf(slot)) {
    let tierBefore = Math.floor(forgeLevel(slot) / forgeStepsPerTier);
    bank = bank - forgeCostOf(slot);
    forgeLevels[slot] = forgeLevel(slot) + 1;
    recalcStats();
    if (!announceNewTier(slot, tierBefore)) {
      say("The blacksmith hands you your " + gearName(slot, forgeLevel(slot)) + ".");
    }
    updateScreen();
  }
}

// A banner when a piece of equipment reaches a new tier. Says whether it did.
function announceNewTier(slot, tierBefore) {
  if (Math.floor(forgeLevel(slot) / forgeStepsPerTier) === tierBefore) {
    return false;
  }
  announce("banner", gearName(slot, forgeLevel(slot)), "A new tier at the blacksmith: " + gearStat(slot, forgeLevel(slot)) + ".");
  return true;
}

// The "Buy all I can afford" button: keeps buying whichever step is cheaper
// until the bank cannot pay for either
function upgradeAllGear() {
  let bought = 0;
  let weaponTier = Math.floor(forgeLevel("weapon") / forgeStepsPerTier);
  let armorTier = Math.floor(forgeLevel("armor") / forgeStepsPerTier);

  while (canAffordForge()) {
    let slot = "weapon";
    if (forgeCostOf("armor") < forgeCostOf("weapon")) {
      slot = "armor";
    }
    bank = bank - forgeCostOf(slot);
    forgeLevels[slot] = forgeLevel(slot) + 1;
    bought = bought + 1;
  }

  if (bought > 0) {
    recalcStats();
    say("The blacksmith improves your equipment " + bought + " times: " + gearName("weapon", forgeLevel("weapon")) + " and " + gearName("armor", forgeLevel("armor")) + ".");
    announceNewTier("weapon", weaponTier);
    announceNewTier("armor", armorTier);
    updateScreen();
  }
}

// For example "Bronze Axe", "Iron Ember Shield +7" or "Steel Armor +2".
// "step" is how far the blacksmith has taken it.
function gearName(slot, step) {
  let name = plainLabel();
  if (slot === specialSlot()) {
    name = currentClass().gearTypes[weapon];

    // A named weapon takes the place of the kind's name, and keeps the blacksmith's work
    if (wieldedTrophy() !== null) {
      name = wieldedTrophy().weapon;
    }
  }

  // A class can name the tiers of its own special gear (a bow is not made of bronze)
  let tierNames = gearTiers;
  if (slot === specialSlot() && currentClass().gearTiers !== undefined) {
    tierNames = currentClass().gearTiers;
  }

  let tier = tierOfStep(step);
  name = tierNames[Math.min(tier, tierNames.length - 1)] + " " + name;

  let plus = step - tier * forgeStepsPerTier;
  if (plus > 0) {
    name = name + " +" + plus;
  }
  return name;
}

// ----- The boss weapon -----
// With the Second Weapon legend unlock, a class can pick a second kind of weapon (the
// Elementalist: a second element) and it is drawn for every boss, then put away again.
// So a class can climb with one build and bring another to the fights that suit it.
// Its mastery skill and its boons still have to be earned like any others.

// The kinds a class chooses between: its elements if it has stances, else its weapons
function buildKinds() {
  if (currentClass().stances !== undefined) {
    let kinds = {};
    for (let id in currentClass().stances) {
      kinds[id] = currentClass().stances[id].name;
    }
    return kinds;
  }
  return currentClass().gearTypes;
}

// The kind in hand right now, and a way to change it, whichever of the two it is
function kindInHand() {
  return currentClass().stances !== undefined ? stance : weapon;
}

function takeInHand(kind) {
  if (currentClass().stances !== undefined) {
    stance = kind;
  } else {
    weapon = kind;
  }
  recalcStats();
}

// The kind the class climbs with, even while the boss weapon is drawn (this is what is saved)
function mainKind() {
  return swappedFrom !== "" ? swappedFrom : kindInHand();
}

function chooseBossWeapon(kind) {
  bossWeapon = kind;
  updateScreen();
}

// Runs when a boss appears
function drawBossWeapon() {
  if (totalBonus("secondWeapon") < 1 || buildKinds()[bossWeapon] === undefined || bossWeapon === kindInHand() || swappedFrom !== "") {
    return;
  }
  swappedFrom = kindInHand();
  takeInHand(bossWeapon);
  say("You draw your " + buildKinds()[bossWeapon] + " for the boss.");
}

// Runs when the boss is dead, when you fall, and before every new room
function sheatheBossWeapon() {
  if (swappedFrom !== "") {
    takeInHand(swappedFrom);
    swappedFrom = "";
  }
}

// ----- Named weapons -----
// Won at floor 100 of another class's tower (see towers.js). The class wields one at a
// time, and only that one's passive works.

// Every named weapon the class has won, as its trophy
function namedWeaponsWon() {
  let won = [];
  for (let towerName in towers) {
    for (let trophy of towers[towerName].trophies) {
      if (trophy.weapon !== undefined && trophies.includes(trophy.id)) {
        won.push(trophy);
      }
    }
  }
  return won;
}

// The trophy of the named weapon being wielded, or null
function wieldedTrophy() {
  for (let trophy of namedWeaponsWon()) {
    if (trophy.id === namedWeapon) {
      return trophy;
    }
  }
  return null;
}

// "" puts the named weapon away
function wieldNamedWeapon(id) {
  namedWeapon = id;
  recalcStats();
  updateScreen();
}

// Picks the kind of weapon to fight with. It is taken up at the start of the next run.
function chooseWeapon(type) {
  nextWeapon = type;
  updateScreen();
}

// Runs at the start of every run: the weapon picked at the blacksmith is taken up
function startRunGear() {
  if (currentClass().gearTypes[nextWeapon] === undefined) {
    nextWeapon = weapon;
  }
  if (nextWeapon !== weapon) {
    weapon = nextWeapon;
    say("You take up your " + gearName(specialSlot(), forgeLevel(specialSlot())) + ".");
  }
  dotStacks = 0;
  recalcStats();
}

// ----- The town -----
// Merchants trade banked gold for things that last beyond one run
function townLevel(id) {
  if (townLevels[id] === undefined) {
    return 0;
  }
  return townLevels[id];
}

// Each level costs "growth" times more than the last
function townCost(item) {
  return Math.round(item.cost * Math.pow(item.growth, townLevel(item.id)));
}

function buyTownUpgrade(item) {
  if (!townUpgradeIsMaxed(item) && bank >= townCost(item)) {
    bank = bank - townCost(item);
    townLevels[item.id] = townLevel(item.id) + 1;
    recalcStats();
    updateScreen();
  }
}

function chooseFavouriteUpgrade(id) {
  favouriteUpgrade = id;
  updateScreen();
}

function potionLimit() {
  return maxPotions + totalBonus("potionSlots");
}

function buyPotion() {
  if (potions < potionLimit() && bank >= potionPrice) {
    bank = bank - potionPrice;
    potions = potions + 1;
    updateScreen();
  }
}

// ----- Boss upgrades (the page calls them BOONS) -----
// The player sees the word "boon" for these, so that "upgrade" on the page only ever
// means something bought: at the blacksmith, in town or with fame.
// Every boss gives one upgrade, straight away, with nothing to click and nothing to
// wait for. It is always one that suits the weapon being used (see fitsBuild), and
// it lasts until you die. What a run has collected is listed under the fight.
function upgradeLevel(id) {
  if (upgrades[id] === undefined) {
    return 0;
  }
  return upgrades[id];
}

// How many levels of upgrades bosses have given this run, all added together
function upgradesHeld() {
  let total = 0;
  for (let upgrade of currentClass().upgrades) {
    total = total + upgradeLevel(upgrade.id);
  }
  return total;
}

// Every level held also multiplies attack and health (see bossUpgradePower in data.js)
function upgradeBoost() {
  return 1 + bossUpgradePower * upgradesHeld();
}

// The floor a run starts on (see "Sweeping through the easy floors" in data.js): the
// deepest floor the last run reached without slowing down. A run that slowed down at
// its very first fight was started too high, so the next one starts half as high.
function startFloor() {
  if (cruiseFloor > runStartFloor) {
    return cruiseFloor;
  }
  return Math.max(1, Math.floor(runStartFloor / 2));
}


// The last upgrade a boss gave, for the pop-up message. Not saved.
let lastUpgrade = null;

// Runs when a boss is defeated
function gainBossUpgrade() {
  let choices = [];
  for (let upgrade of currentClass().upgrades) {
    if (fitsBuild(upgrade)) {
      choices.push(upgrade);
    }
  }

  // (Every class has boons that suit any weapon, so this never happens. Boons have no top level.)
  if (choices.length === 0) {
    return;
  }

  let upgrade = choices[Math.floor(Math.random() * choices.length)];

  // The Tactician gets you your favourite instead, as long as it is one of the choices
  if (totalBonus("favouriteUpgrade") >= 1) {
    for (let choice of choices) {
      if (choice.id === favouriteUpgrade) {
        upgrade = choice;
      }
    }
  }

  upgrades[upgrade.id] = upgradeLevel(upgrade.id) + 1;
  lastUpgrade = upgrade;
  recalcStats();
  say("The boss leaves you a boon: " + upgrade.name + ", level " + upgrades[upgrade.id] + " (" + upgrade.text + ").");
}
