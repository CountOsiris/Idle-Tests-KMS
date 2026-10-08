// =====================================================================
//  game.js - the rules of the game. Loaded last.
//  Lists you are likely to edit live elsewhere:
//    data.js      - tunable numbers and shared relics
//    towers.js    - the towers, their monsters, bosses and trophies
//    classes/     - one file per class
// =====================================================================

// ----- One class's progress -----
// Every class has its OWN copy of everything in this block.
// Switching class swaps all of these (see "Saving and loading").
let gold = 0;
let bank = 0;
let experience = 0;
let fame = 0;
let floor = 1;
let bestFloor = 1;
let room = 1;

let level = 1;
let playerHp = 0;

let weapon = "";
let stance = "";             // the fighting style picked on the Skills tab (only some classes have one)
let savedBuild = {};        // a remembered skill layout, for example { might: 12, rage: 6 }
let autoBuild = false;      // true = new skill points are spent following the saved build
let runCounter = 0;         // a number a class may count up during a run (the Warlock's souls). Back to 0 on death.
let weaponPower = 0;
let armorPower = 0;
let weaponRarity = 0;
let armorRarity = 0;
let foundItem = null;

let upgrades = {};
let skillLevels = {};
let chosenPerks = {};
let ownedRelics = [];

// What has been bought in town, for example { armory: 3, autoEquip: 1 },
// and the favourites picked with the Quartermaster and Tactician ("" means none)
let townLevels = {};
let favouriteGear = "";
let favouriteUpgrade = "";
let potions = 0;

// Which tower the class is climbing, which one it enters after its next death,
// and the best floor it has reached in each, for example { barbarian: 12, warden: 4 }
let tower = "";
let nextTower = "";
let towerBest = {};

// Ascension: how many times the class has ascended, the best floor it has reached
// since the last one (floors above it pay fame), and the fame upgrades it has bought,
// for example { might: 3, vitality: 2 }. "fame" above is the fame it has left to spend.
let ascensions = 0;
let ascensionBest = 1;
let fameLevels = {};

// How long the current ascension has lasted, in seconds of play, and how the last one
// went. Shown on the page so the player can judge when it is time to ascend again.
let ascensionSeconds = 0;
let lastAscensionFame = 0;
let lastAscensionSeconds = 0;

// The ids of the trophies this class has won in other towers (see towers.js)
let trophies = [];

// ----- Numbers the game works out as it goes (not saved) -----
let playerClass = "barbarian";
let playerMaxHp = 0;
let playerAttack = 0;

let encounterType = "monster";
let monsterName = "";
let monsterText = "";
let monsterMaxHp = 0;
let monsterHp = 0;
let monsterAttack = 0;
let monsterArmor = 0;
let monsterWard = 0;        // like armor, but against spells
let monsterGold = 1;
let monsterPoison = 0;
let monsterRegen = 0;
let monsterEnrageStep = 0;
let monsterIsRare = false;
let monsterStunned = false;
let fightTurns = 0;
let monsterIcon = "";
let monsterArt = "";

// Goes up by one for every new room, so the animations can tell when the room changed
let roomCount = 0;

// Damage over time on the monster: bleeding, burning, poison or spirits, depending on the class
let dotStacks = 0;
let upgradeTimer = 0;

// For working out progress made while the game was closed or in the background
let lastTick = Date.now();
let catchingUp = false;
let deaths = 0;

let logLines = [];

function currentClass() {
  return classes[playerClass];
}

// ----- Small helpers the class files use -----
function chance(odds) {
  return Math.random() < odds;
}

function percent(number) {
  return big(Math.round(number * 1000) / 10) + "%";
}

// Writes a big number in a short way: 1234567 becomes "1.23M".
// After the named sizes run out it switches to the "1.23e45" style, so it never breaks.
const bigNames = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

function big(number) {
  if (Math.abs(number) < 10000) {
    return String(Math.round(number * 10) / 10);
  }

  // How many groups of three digits the number has beyond the first
  let size = Math.floor(Math.log10(Math.abs(number)) / 3);
  if (size >= bigNames.length) {
    return number.toExponential(2);
  }

  let shown = number / Math.pow(1000, size);
  return shown.toFixed(2) + bigNames[size];
}

// A weapon hit. The monster's armor blocks some of it, but it always does at least 1.
// Gives back the damage that was dealt.
// ----- Damage types -----
// Every hit has a TYPE (slashing, piercing, fire...; the list is in data.js).
// A monster can be weak to some types and resist others (see towers.js).

// What the monster being fought is weak to and resists
let monsterWeak = [];
let monsterResist = [];

// How many hits this turn were weakened or strengthened by their type.
// Only used to colour the damage number on the fight screen.
let resistedHits = 0;
let boostedHits = 0;

// Is this type on the list? A list can name a type ("fire") or a whole group ("elemental").
function listHasType(list, type) {
  for (let entry of list) {
    if (entry === type) {
      return true;
    }
    if (typeGroups[entry] !== undefined && typeGroups[entry].includes(type)) {
      return true;
    }
  }
  return false;
}

// A list of types in words, for example "slashing, piercing"
function typeNames(list) {
  let names = [];
  for (let entry of list) {
    names.push(damageTypes[entry]);
  }
  return names.join(", ");
}

// How much of a resisted hit is lost right now (0.4 means 40% of it).
// It is deeper in a tower that is not your own, never more than maxResist,
// and penetration takes away from it.
function resistNow() {
  let resist = resistAmount;
  if (isAway()) {
    resist = resist + (floor - 1) * awayResistPerFloor;
  }
  resist = Math.min(maxResist, resist);
  return Math.max(0, resist - totalBonus("penetration"));
}

// What a hit of this type is multiplied by against the monster being fought
function typeMultiplier(type) {
  if (type === undefined) {
    return 1;
  }
  if (listHasType(monsterWeak, type)) {
    boostedHits = boostedHits + 1;
    return 1 + weakAmount;
  }
  if (listHasType(monsterResist, type)) {
    resistedHits = resistedHits + 1;
    return 1 - resistNow();
  }
  return 1;
}

// A normal hit: the monster's armor is taken off it.
// "type" is the damage type, for example "slashing".
function hitMonster(damage, type) {
  damage = Math.max(1, Math.round(damage * typeMultiplier(type)) - monsterArmor);
  monsterHp = monsterHp - damage;
  return damage;
}

// A spell ignores armor, but the monster's WARD is taken off it instead.
// Ward is to a caster what armor is to a fighter.
function spellHitMonster(damage, type) {
  damage = Math.max(1, Math.round(damage * typeMultiplier(type)) - monsterWard);
  monsterHp = monsterHp - damage;
  return damage;
}

// A hit that nothing is taken off: not armor, not ward. For damage that is not
// a weapon swing or a spell (a reflected blow, thorns, a thrown shield).
function magicHitMonster(damage, type) {
  damage = Math.max(1, Math.round(damage * typeMultiplier(type)));
  monsterHp = monsterHp - damage;
  return damage;
}

function healPlayer(amount) {
  playerHp = Math.min(playerMaxHp, playerHp + Math.round(amount));
}

// Adds one stack of damage over time, up to a limit
function addDotStack(most) {
  if (dotStacks < most) {
    dotStacks = dotStacks + 1;
  }
}

// The damage of all the bleeding, burning, poison or spirits this turn.
// Its type is the class's dotType.
function dotDamage() {
  if (dotStacks === 0) {
    return 0;
  }
  return Math.round(dotStacks * currentClass().dotPerStack() * (1 + totalBonus("dotPower")) * typeMultiplier(currentClass().dotType));
}

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

  milestoneList = currentClass().milestones.slice();

  // Every breakthrough reached so far, plus the next one to aim for
  let number = 0;
  while (true) {
    let breakthrough = { floor: breakthroughFloor(number), perks: breakthroughPerks };
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

// Everything that multiplies a number: fame upgrades and breakthrough perks.
// The stats are attack, health, armor, experience, gold, gear and fame.
function multiplier(stat) {
  return fameMultiplier(stat) * perkMultiplier(stat);
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
      total = total + skill.bonus[stat] * skillLevel(skill.id);
    }
  }

  return total;
}

function trophyBonus(stat) {
  let total = 0;

  for (let towerName in towers) {
    for (let trophy of towers[towerName].trophies) {
      if (trophies.includes(trophy.id) && trophy.bonus[stat] !== undefined) {
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
// Fame is the ascension currency. Each class earns and spends its own.
//
//   - Reaching a floor for the first time SINCE THE LAST ASCENSION pays 1 fame.
//   - Ascending starts the class again from level 1, and makes every floor pay again.
//   - Fame buys permanent upgrades (the fameUpgrades list in data.js) that survive
//     ascending. Most have no top level, so a class can grow stronger forever.
function fameLevel(id) {
  if (fameLevels[id] === undefined) {
    return 0;
  }
  return fameLevels[id];
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
  return ascensions >= item.unlockAt;
}

function buyFameUpgrade(item) {
  if (fameUpgradeIsUnlocked(item) && !fameUpgradeIsMaxed(item) && fame >= fameCost(item)) {
    fame = fame - fameCost(item);
    fameLevels[item.id] = fameLevel(item.id) + 1;
    recalcStats();
    updateScreen();
  }
}

// How many times bigger the fame upgrades make something: attack, health, armor,
// experience or gold. Every level of an upgrade multiplies again, so they compound:
// three levels of "x1.25 attack" is 1.25 x 1.25 x 1.25 = x1.95.
function fameMultiplier(stat) {
  let total = 1;

  for (let item of fameUpgrades) {
    if (item.multiply !== undefined && item.multiply[stat] !== undefined) {
      total = total * Math.pow(item.multiply[stat], fameLevel(item.id));
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
  if (!confirm("Ascend? You start again from level 1, and every floor pays fame again.")) {
    return;
  }

  // Remember how this ascension went, to compare the next one against
  lastAscensionFame = ascensionBest - 1;
  lastAscensionSeconds = ascensionSeconds;
  ascensionSeconds = 0;

  ascensions = ascensions + 1;
  ascensionBest = 1;

  // What is lost: levels, stats, skills, experience, gold and the run in progress.
  // The Legacy fame upgrade gives some levels back straight away.
  level = 1 + fameAdd("startLevels");
  experience = 0;

  // The skills are about to be wiped. If no build was ever saved, remember this one,
  // so that it can be had back with one click.
  if (!hasSavedBuild()) {
    saveBuild();
  }
  skillLevels = {};

  // Any levels kept through Legacy give skill points straight away
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

  // Town upgrades with several levels are lost too. The helpers you buy once are kept.
  for (let item of townUpgrades) {
    if (item.maxLevel !== 1) {
      delete townLevels[item.id];
    }
  }

  // What is kept: fame and fame upgrades, best floors, milestones and perks, trophies and town helpers
  startingGear();
  playerHp = playerMaxHp;
  logLines = [];
  say("You ascend! Every floor will pay fame again.");
  startEncounter();
  updateScreen();
  saveGame();
}

// Everything in the game asks this for its numbers:
// the class's own base + skills + milestone perks + relics + upgrades + trophies + town
function totalBonus(stat) {
  return baseBonus(stat) + skillBonus(stat) + perkBonus(stat) + relicBonus(stat) + upgradeBonus(stat) + trophyBonus(stat) + townBonus(stat);
}

// ----- Chances and overflow -----
// Nothing in the game has a top level, but a chance cannot usefully go past its
// limit. So whatever is bought beyond the limit "overflows" into something else:
//   - critical chances past 100%          -> extra critical damage
//   - dodge, parry and block past 60%     -> all damage taken is reduced
//   - stun and freeze past 60%            -> extra damage
//   - equipment drop chance past 50%      -> better rarities
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

// Equipment luck: the drop chance beyond its limit makes better rarities more likely
function gearLuck() {
  return Math.max(0, monsterDropChance + totalBonus("dropChance") - maxDropChance);
}

function townUpgradeIsMaxed(item) {
  return item.maxLevel > 0 && townLevel(item.id) >= item.maxLevel;
}

function totalArmor() {
  return Math.round((armorPower + totalBonus("armor")) * (1 + totalBonus("armorPercent")) * multiplier("armor"));
}

// ----- Relics -----
function gainRelic() {
  let choices = allRelics();
  let relic = choices[Math.floor(Math.random() * choices.length)];

  ownedRelics.push(relic.id);
  recalcStats();
  say("You claim a relic: " + relic.name + " (" + relic.text + ").");
}

// ----- Equipment -----
// Equipment is found inside the tower and is lost when you die.
//
// There are two slots, "weapon" and "armor". One of them holds the class's SPECIAL
// gear, which comes in several kinds (axe / sword / club, or the Warden's three shields)
// and decides how the class fights. The other holds a plain piece with only a power.
//   - For most classes the special gear is the weapon, and the plain piece is armor.
//   - For the Warden the special gear is the shield (in the armor slot), and the
//     plain piece is the spear (in the weapon slot).
// The variable "weapon" holds the KIND of special gear being used, whichever slot it is in.
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

// For example "Sword +4", "Rare Ember Shield +7" or "Fine Armor +2"
function gearName(slot, type, power, rarity) {
  let name = plainLabel();
  if (slot === specialSlot()) {
    name = currentClass().gearTypes[type];
  }

  if (rarities[rarity].name !== "") {
    name = rarities[rarity].name + " " + name;
  }
  return name + " +" + power;
}

function itemName(item) {
  return gearName(item.slot, item.type, item.power, item.rarity);
}

// What is written after a slot's label on the page. The plain piece leaves out
// its own name there, so that it reads "Armor: Fine +2" and not "Armor: Fine Armor +2".
function slotText(slot, power, rarity) {
  if (slot === specialSlot()) {
    return gearName(slot, weapon, power, rarity);
  }
  if (rarities[rarity].name !== "") {
    return rarities[rarity].name + " +" + power;
  }
  return "+" + power;
}

// Picks a rarity by its chance (see the rarities list in data.js).
// "least" is the lowest rarity allowed: 0 for anything, 2 for Rare or better...
function rollRarity(least) {
  // Luck pushes the roll toward 1, where the rare end of the list is.
  // With no luck this is a plain roll between 0 and 1.
  let roll = Math.pow(Math.random(), 1 / (1 + gearLuck() * luckStrength));
  let rarity = rarities.length - 1;

  for (let i = 0; i < rarities.length; i++) {
    if (roll < rarities[i].chance) {
      rarity = i;
      break;
    }
    roll = roll - rarities[i].chance;
  }

  return Math.max(rarity, least);
}

// The kind of special gear the player is after: the favourite, or the only
// kind there is for a class with just one (the Elementalist's gloves)
function wantedGear() {
  let types = Object.keys(currentClass().gearTypes);
  if (types.length === 1) {
    return types[0];
  }
  return favouriteGear;
}

// Favourite luck that is not needed to find the favourite kind. It makes that
// kind stronger instead. A class with one kind of gear needs none, so all of it is spare.
function favouriteLuckSpare() {
  if (Object.keys(currentClass().gearTypes).length === 1) {
    return totalBonus("favouriteLuck");
  }
  return overflow("favouriteLuck", 1);
}

function makeItem(least) {
  let rarity = rollRarity(least);

  // Items get stronger the higher you are in the tower, and with their rarity
  let power = floor * gearPowerPerFloor * (1 + Math.random()) * rarities[rarity].power * multiplier("gear");

  let slot = "armor";
  if (Math.random() < 0.5) {
    slot = "weapon";
  }

  // Armor has half the power of a weapon
  if (slot === "armor") {
    power = power / 2;
  }

  let type = "plain";
  if (slot === specialSlot()) {
    type = randomGearType(playerClass);

    // The Weaponsmith in town makes the favourite kind turn up more often
    if (favouriteGear !== "" && chance(totalBonus("favouriteLuck"))) {
      type = favouriteGear;
    }
    if (type === wantedGear()) {
      power = power * (1 + favouriteLuckSpare() * favouritePowerPerLuck);
    }
  }

  return { slot: slot, type: type, power: Math.max(1, Math.round(power)), rarity: rarity };
}

function isBetter(item) {
  if (item.slot === "weapon") {
    return item.power > weaponPower;
  }
  return item.power > armorPower;
}

function equipItem(item) {
  if (item.slot === "weapon") {
    weaponPower = item.power;
    weaponRarity = item.rarity;
  } else {
    armorPower = item.power;
    armorRarity = item.rarity;
  }

  // Changing the kind of special gear changes how the class fights
  if (item.slot === specialSlot()) {
    weapon = item.type;
    dotStacks = 0;
  }

  recalcStats();
}

// Should the Squire equip this item for you?
function squireWants(item) {
  if (totalBonus("autoEquip") < 1) {
    return false;
  }

  // With a favourite kind of special gear, other kinds are left alone,
  // and the favourite is always taken over a kind that is not
  if (item.slot === specialSlot() && favouriteGear !== "") {
    if (item.type !== favouriteGear) {
      return false;
    }
    if (weapon !== favouriteGear) {
      return true;
    }
  }

  return isBetter(item);
}

// "least" is the lowest rarity the item can be (0 for anything)
function findItem(least) {
  let item = makeItem(least);

  if (squireWants(item)) {
    equipItem(item);
    say("You found and equipped " + itemName(item) + "!");
  } else {
    foundItem = item;
    say("You found " + itemName(item) + "!");
  }
}

function equipFound() {
  if (foundItem !== null) {
    equipItem(foundItem);
    foundItem = null;
    updateScreen();
  }
}

function startingGear() {
  weapon = randomGearType(playerClass);
  if (favouriteGear !== "") {
    weapon = favouriteGear;
  }

  // The Armory in town gives every run a head start
  weaponPower = totalBonus("startGear");

  // Starting a run part-way up the tower (the Pathfinder fame upgrade) skips the
  // floors where gear would have been found, so it comes with ordinary gear for that floor
  if (floor > 1) {
    weaponPower = Math.max(weaponPower, Math.round(floor * gearPowerPerFloor * multiplier("gear")));
  }
  armorPower = Math.ceil(weaponPower / 2);
  weaponRarity = 0;
  armorRarity = 0;
  foundItem = null;
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

// Pass "" to go back to having no favourite
function chooseFavouriteGear(type) {
  favouriteGear = type;
  updateScreen();
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

// ----- Upgrade areas -----
// Upgrades are free, you pick one per area, and they only last until you die
function upgradeLevel(id) {
  if (upgrades[id] === undefined) {
    return 0;
  }
  return upgrades[id];
}

function chooseUpgrade(upgrade) {
  if (encounterType !== "upgrade" || upgradeLevel(upgrade.id) >= upgradeCap()) {
    return;
  }

  upgrades[upgrade.id] = upgradeLevel(upgrade.id) + 1;
  recalcStats();
  say("You chose " + upgrade.name + " (level " + upgrades[upgrade.id] + ").");
  nextRoom();
  updateScreen();
}

// Is there a favourite upgrade, and can it still be levelled up?
function favouriteIsAvailable() {
  return favouriteUpgrade !== "" && upgradeLevel(favouriteUpgrade) < upgradeCap();
}

// The top level of the upgrades picked in upgrade areas. The Mastery fame upgrade raises it.
function upgradeCap() {
  return maxUpgradeLevel + fameAdd("upgradeCap");
}

// The floor a run starts on. Normally 1; the Pathfinder fame upgrade starts runs
// part-way to the best floor reached since the last ascension.
function startFloor() {
  return Math.max(1, Math.floor(ascensionBest * pathfinderShare()));
}

// How far up the tower Pathfinder starts a run. Every level closes part of the gap
// to maxStartShare, so it can be bought forever but never quite gets there.
function pathfinderShare() {
  return maxStartShare * (1 - Math.pow(pathfinderFade, fameAdd("pathfinder")));
}

// If the player is away, a random upgrade is taken for them
function takeRandomUpgrade() {
  let choices = [];
  for (let upgrade of currentClass().upgrades) {
    if (upgradeLevel(upgrade.id) < upgradeCap()) {
      choices.push(upgrade);
    }
  }

  if (choices.length > 0) {
    let upgrade = choices[Math.floor(Math.random() * choices.length)];

    // The Tactician takes your favourite instead, as long as it is not at its limit
    for (let choice of choices) {
      if (choice.id === favouriteUpgrade) {
        upgrade = choice;
      }
    }

    upgrades[upgrade.id] = upgradeLevel(upgrade.id) + 1;
    recalcStats();
    if (upgrade.id === favouriteUpgrade) {
      say("You took your favourite upgrade: " + upgrade.name + " (level " + upgrades[upgrade.id] + ").");
    } else {
      say("Time ran out, so you took " + upgrade.name + " (level " + upgrades[upgrade.id] + ").");
    }
  }
}

// ----- Skills -----
// Every level gives skill points, and skills are bought with them.
// Skills last until the class ascends, and can be reset for free to try another build.
function skillLevel(id) {
  if (skillLevels[id] === undefined) {
    return 0;
  }
  return skillLevels[id];
}

// All the skill points the class has earned: some for every level after the first
function skillPointsEarned() {
  return (level - 1) * skillPointsPerLevel;
}

function skillPointsSpent() {
  let spent = 0;

  for (let skill of currentClass().skills) {
    spent = spent + skill.cost * skillLevel(skill.id);
  }

  return spent;
}

function skillPointsLeft() {
  return skillPointsEarned() - skillPointsSpent();
}

// How many levels one click on a skill buys: 1, 10, or 0 for "as many as you can afford".
// Not saved: it goes back to 1 when the page is opened again.
let skillBuyAmount = 1;

function setSkillBuyAmount(amount) {
  skillBuyAmount = amount;
  updateScreen();
}

function buySkill(skill) {
  let bought = 0;

  while (skillPointsLeft() >= skill.cost && (skillBuyAmount === 0 || bought < skillBuyAmount)) {
    skillLevels[skill.id] = skillLevel(skill.id) + 1;
    bought = bought + 1;
  }

  if (bought > 0) {
    recalcStats();
    updateScreen();
  }
}

// ----- Saved builds -----
// A saved build is a remembered skill layout. It is used as a RECIPE, not a shopping
// list: "12 Might, 6 Rage" means "two points of Might for every one of Rage". So it
// can be followed with 20 points or with 2,000, and never runs out.

function hasSavedBuild() {
  return Object.keys(savedBuild).length > 0;
}

// Remembers the skills as they are right now
function saveBuild() {
  savedBuild = {};
  for (let skill of currentClass().skills) {
    if (skillLevel(skill.id) > 0) {
      savedBuild[skill.id] = skillLevel(skill.id);
    }
  }
  updateScreen();
}

// Spends every point it can, following the saved build. Each point goes to the
// skill that is furthest behind its share of the recipe.
function spendOnSavedBuild() {
  let spent = false;

  while (true) {
    let pick = null;
    let pickNeed = 0;

    for (let skill of currentClass().skills) {
      let wanted = savedBuild[skill.id];
      if (wanted === undefined || skill.cost > skillPointsLeft()) {
        continue;
      }

      // A skill at level 0 that the recipe wants 12 of is needed more than
      // one at level 5 that the recipe wants 6 of
      let need = wanted / (skillLevel(skill.id) + 1);
      if (need > pickNeed) {
        pick = skill;
        pickNeed = need;
      }
    }

    if (pick === null) {
      break;
    }
    skillLevels[pick.id] = skillLevel(pick.id) + 1;
    spent = true;
  }

  if (spent) {
    recalcStats();
  }
}

function applySavedBuild() {
  spendOnSavedBuild();
  updateScreen();
}

function setAutoBuild(on) {
  autoBuild = on;
  if (autoBuild) {
    spendOnSavedBuild();
  }
  updateScreen();
}

// Changes the fighting style (the Elementalist's element). It is free and can be done at any time.
function chooseStance(id) {
  stance = id;
  recalcStats();
  updateScreen();
}

// Gives every skill point back
function resetSkills() {
  skillLevels = {};
  recalcStats();
  updateScreen();
}

// ----- Milestones -----
// Reaching a floor for the first time unlocks its perks forever
function choosePerk(milestoneFloor, perkId) {
  if (bestFloor >= milestoneFloor) {
    chosenPerks[milestoneFloor] = perkId;
    recalcStats();
    updateScreen();
  }
}

function resetPerks() {
  chosenPerks = {};
  recalcStats();
  updateScreen();
}

// ----- Towers -----
// A class is "away" when it climbs a tower that is not its own
function isAway() {
  return tower !== playerClass;
}

// The tower is not entered straight away: it is where the next run starts, after you fall
function chooseTower(towerName) {
  nextTower = towerName;
  updateScreen();
}

// Runs every time a new floor is reached
function checkTowerProgress() {
  if (towerBest[tower] === undefined || floor > towerBest[tower]) {
    towerBest[tower] = floor;
  }

  // Trophies can only be won away from home
  if (!isAway()) {
    return;
  }

  for (let trophy of towers[tower].trophies) {
    if (floor >= trophy.floor && !trophies.includes(trophy.id)) {
      trophies.push(trophy.id);
      recalcStats();
      say("Trophy won: " + trophy.name + " (" + trophy.text + ")!");
    }
  }
}

// ----- Stats and levelling -----
// Health and attack are built up in three steps:
//   1. the flat numbers: the class's base, what its levels give, equipment, perks, relics...
//   2. times the percentages from skills (attackPercent and healthPercent)
//   3. times the fame upgrades
function recalcStats() {
  let levelsGained = level - 1;

  let health = totalBonus("maxHp") + levelsGained * currentClass().perLevel.maxHp;
  let attack = totalBonus("attack") + levelsGained * currentClass().perLevel.attack + weaponPower;

  playerMaxHp = Math.round(health * (1 + totalBonus("healthPercent")) * multiplier("health"));
  playerAttack = Math.round(attack * (1 + totalBonus("attackPercent")) * multiplier("attack"));

  if (playerHp > playerMaxHp) {
    playerHp = playerMaxHp;
  }
}

function levelCost() {
  return level * levelCostPerLevel;
}

// Levels are bought automatically as soon as there is enough experience.
// Each one makes the class stronger by itself and gives skill points.
function levelUpWhilePossible() {
  let gained = 0;

  while (experience >= levelCost()) {
    experience = experience - levelCost();
    level = level + 1;
    gained = gained + 1;
  }

  if (gained > 0) {
    recalcStats();
    say("You reach level " + level + "!");

    // New skill points are spent straight away if the player asked for that
    if (autoBuild && hasSavedBuild()) {
      spendOnSavedBuild();
    }
  }
}

// ----- Saving and loading -----
// The save lives in the browser. It holds one bundle of progress per class,
// which class is being played, and when the game last ran.
// Nothing is shared between classes: every class has its own fame, trophies and gold.
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
const saveVersion = 1;
let classSaves = {};

// Set when a save could not be read, so the page can tell the player
let saveProblem = "";

// Brings a save made by an older version of the game up to date, one step at a time.
// Each step turns version N into version N + 1, so a very old save passes through them all.
function upgradeSave(data) {
  // Saves made before versions existed are version 1
  if (data.version === undefined) {
    data.version = 1;
  }

  // An example of a step, for when one is needed:
  //
  // if (data.version === 1) {
  //   for (let className in data.classSaves) {
  //     let saved = data.classSaves[className];
  //     // ...change "saved" here, for example rename saved.skillLevels.oldId...
  //   }
  //   data.version = 2;
  // }

  return data;
}

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
    fame: 0,
    floor: 1,
    bestFloor: 1,
    room: 1,
    level: 1,
    weapon: randomGearType(className),
    stance: "",
    weaponPower: 0,
    armorPower: 0,
    weaponRarity: 0,
    armorRarity: 0,
    foundItem: null,
    upgrades: {},
    skillLevels: {},
    chosenPerks: {},
    ownedRelics: [],
    townLevels: {},
    favouriteGear: "",
    favouriteUpgrade: "",
    potions: 0,
    tower: className,
    nextTower: className,
    towerBest: {},
    ascensions: 0,
    ascensionBest: 1,
    fameLevels: {},
    ascensionSeconds: 0,
    lastAscensionFame: 0,
    lastAscensionSeconds: 0,
    trophies: [],
    runCounter: 0,
    savedBuild: {},
    autoBuild: false
  };
}

// Bundles up the class being played right now
function packClass() {
  return {
    gold: gold,
    bank: bank,
    experience: experience,
    fame: fame,
    floor: floor,
    bestFloor: bestFloor,
    room: room,
    level: level,
    playerHp: playerHp,
    weapon: weapon,
    stance: stance,
    weaponPower: weaponPower,
    armorPower: armorPower,
    weaponRarity: weaponRarity,
    armorRarity: armorRarity,
    foundItem: foundItem,
    upgrades: upgrades,
    skillLevels: skillLevels,
    chosenPerks: chosenPerks,
    ownedRelics: ownedRelics,
    townLevels: townLevels,
    favouriteGear: favouriteGear,
    favouriteUpgrade: favouriteUpgrade,
    potions: potions,
    tower: tower,
    nextTower: nextTower,
    towerBest: towerBest,
    ascensions: ascensions,
    ascensionBest: ascensionBest,
    fameLevels: fameLevels,
    ascensionSeconds: ascensionSeconds,
    lastAscensionFame: lastAscensionFame,
    lastAscensionSeconds: lastAscensionSeconds,
    trophies: trophies,
    runCounter: runCounter,
    savedBuild: savedBuild,
    autoBuild: autoBuild
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
  fame = data.fame;
  floor = data.floor;
  bestFloor = data.bestFloor;
  room = data.room;
  level = data.level;
  playerHp = data.playerHp;
  weapon = data.weapon;
  stance = data.stance;
  weaponPower = data.weaponPower;
  armorPower = data.armorPower;
  weaponRarity = data.weaponRarity;
  armorRarity = data.armorRarity;
  foundItem = data.foundItem;

  upgrades = data.upgrades;
  skillLevels = data.skillLevels;
  chosenPerks = data.chosenPerks;
  ownedRelics = data.ownedRelics;
  townLevels = data.townLevels;
  favouriteGear = data.favouriteGear;
  favouriteUpgrade = data.favouriteUpgrade;
  potions = data.potions;

  // In case a favourite was renamed or removed since the save was made
  if (currentClass().gearTypes[favouriteGear] === undefined) {
    favouriteGear = "";
  }

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
  fameLevels = data.fameLevels;
  ascensionSeconds = data.ascensionSeconds;
  lastAscensionFame = data.lastAscensionFame;
  lastAscensionSeconds = data.lastAscensionSeconds;
  trophies = data.trophies;
  runCounter = data.runCounter;
  savedBuild = data.savedBuild;
  autoBuild = data.autoBuild;

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

  // A class with stances always has one picked: the first on its list to begin with
  if (currentClass().stances === undefined) {
    stance = "";
  } else if (currentClass().stances[stance] === undefined) {
    stance = Object.keys(currentClass().stances)[0];
  }
  if (foundItem !== null && foundItem.slot === specialSlot() && currentClass().gearTypes[foundItem.type] === undefined) {
    foundItem = null;
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

  // A class that has never been played starts on full health
  if (playerHp === undefined) {
    playerHp = playerMaxHp;
  }
}

function saveGame() {
  // Never write over a save that could not be read: the player may still get it back
  if (saveProblem !== "") {
    return;
  }

  classSaves[playerClass] = packClass();

  let data = {
    version: saveVersion,
    playerClass: playerClass,
    classSaves: classSaves,
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

      // When the game was last running, so we know how long you were away
      lastTick = data.lastTick;

      if (classes[data.playerClass] !== undefined) {
        playerClass = data.playerClass;
      }

      unpackClass(classSaves[playerClass]);
      return;
    } catch (error) {
      // Start a new game for now, but leave the old save exactly where it is
      saveProblem = saved;
      classSaves = {};
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
  if (className === playerClass) {
    return;
  }

  classSaves[playerClass] = packClass();
  playerClass = className;
  unpackClass(classSaves[playerClass]);

  buildClassScreen();
  logLines = [];
  say("You are now playing the " + currentClass().name + ".");
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

// ----- Building the page -----
// These make the lists on the page out of the lists in data.js, towers.js and classes/,
// so new perks, upgrades, skills and classes show up without touching index.html.
// The "build" functions make the rows once. The "show" functions further down
// fill in the words and numbers, every second.

// Makes one row of a list: a title and a note on the left, a button on the right.
// The parts get the ids  name + "-title",  name + "-note"  and  name  (the button itself).
function addRow(box, name, whenClicked) {
  let row = document.createElement("div");
  row.className = "row";
  row.id = name + "-row";

  let text = document.createElement("div");
  text.className = "row-text";

  let title = document.createElement("p");
  title.className = "row-title";
  title.id = name + "-title";
  text.appendChild(title);

  let note = document.createElement("p");
  note.className = "note";
  note.id = name + "-note";
  text.appendChild(note);

  let button = document.createElement("button");
  button.id = name;
  button.onclick = whenClicked;

  row.appendChild(text);
  row.appendChild(button);
  box.appendChild(row);
}

// Writes into the three parts of a row made by addRow
function fillRow(name, title, note, buttonText, buttonOff) {
  document.getElementById(name + "-title").textContent = title;
  document.getElementById(name + "-note").textContent = note;
  document.getElementById(name).textContent = buttonText;
  document.getElementById(name).disabled = buttonOff;
}

// Runs once, when the game starts
function buildClassButtons() {
  let box = document.getElementById("class-buttons");

  for (let className in classes) {
    let button = document.createElement("button");
    button.id = "class-" + className;
    button.textContent = classes[className].icon + " " + classes[className].name;
    button.onclick = function () {
      switchClass(className);
    };
    box.appendChild(button);
  }
}

// One dot for every room on a floor, shown under the floor number
function buildRoomPips() {
  let box = document.getElementById("room-pips");

  for (let i = 1; i <= roomsPerFloor; i++) {
    let pip = document.createElement("span");
    pip.id = "pip-" + i;
    box.appendChild(pip);
  }
}

// A button that marks a favourite. Used for the Quartermaster and the Tactician.
function addFavouriteButton(box, id, label, whenClicked) {
  let button = document.createElement("button");
  button.id = id;
  button.textContent = label;
  button.onclick = whenClicked;
  box.appendChild(button);
}

// Runs once, when the game starts
function buildTownList() {
  let box = document.getElementById("town-upgrades");

  for (let item of townUpgrades) {
    addRow(box, "town-" + item.id, function () {
      buyTownUpgrade(item);
    });
  }
}

// Runs once, when the game starts
function buildTowerList() {
  let box = document.getElementById("towers");

  for (let towerName in towers) {
    addRow(box, "tower-" + towerName, function () {
      chooseTower(towerName);
    });
  }
}

// Runs once, when the game starts. The fame upgrades are the same for every class.
function buildFameList() {
  let box = document.getElementById("fame-upgrades");

  for (let item of fameUpgrades) {
    addRow(box, "fame-" + item.id, function () {
      buyFameUpgrade(item);
    });
  }
}

// Runs when the game starts and every time the class changes
function buildClassScreen() {
  let upgradeBox = document.getElementById("upgrades");
  upgradeBox.innerHTML = "";

  for (let upgrade of currentClass().upgrades) {
    addRow(upgradeBox, "upgrade-" + upgrade.id, function () {
      chooseUpgrade(upgrade);
    });
  }

  // The favourite pickers list this class's own weapons and upgrades
  let gearBox = document.getElementById("favourite-gear-buttons");
  gearBox.innerHTML = "";
  addFavouriteButton(gearBox, "favourite-gear-", "Any", function () {
    chooseFavouriteGear("");
  });
  for (let type in currentClass().gearTypes) {
    addFavouriteButton(gearBox, "favourite-gear-" + type, currentClass().gearTypes[type], function () {
      chooseFavouriteGear(type);
    });
  }

  let favouriteBox = document.getElementById("favourite-upgrade-buttons");
  favouriteBox.innerHTML = "";
  addFavouriteButton(favouriteBox, "favourite-upgrade-", "None", function () {
    chooseFavouriteUpgrade("");
  });
  for (let upgrade of currentClass().upgrades) {
    addFavouriteButton(favouriteBox, "favourite-upgrade-" + upgrade.id, upgrade.name, function () {
      chooseFavouriteUpgrade(upgrade.id);
    });
  }

  // The stance picker on the Skills tab, for a class that has stances
  let stanceBox = document.getElementById("stance-buttons");
  stanceBox.innerHTML = "";
  if (currentClass().stances !== undefined) {
    for (let id in currentClass().stances) {
      addFavouriteButton(stanceBox, "stance-" + id, currentClass().stances[id].name, function () {
        chooseStance(id);
      });
    }
  }

  let skillBox = document.getElementById("skills");
  skillBox.innerHTML = "";

  for (let skill of currentClass().skills) {
    addRow(skillBox, "skill-" + skill.id, function () {
      buySkill(skill);
    });
  }

  buildMilestones();
}

// Runs when the class changes, and again whenever a new breakthrough joins the list
function buildMilestones() {
  let milestoneBox = document.getElementById("milestones");
  milestoneBox.innerHTML = "";

  for (let milestone of allMilestones()) {
    let row = document.createElement("div");
    row.className = "milestone";

    let title = document.createElement("p");
    title.className = "row-title";
    title.id = "milestone-" + milestone.floor;
    row.appendChild(title);

    let choices = document.createElement("div");
    choices.className = "choices";

    for (let perk of milestone.perks) {
      let button = document.createElement("button");
      button.id = "perk-" + milestone.floor + "-" + perk.id;
      button.textContent = perk.name + " (" + perk.text + ")";
      button.onclick = function () {
        choosePerk(milestone.floor, perk.id);
      };
      choices.appendChild(button);
    }

    row.appendChild(choices);
    milestoneBox.appendChild(row);
  }
}

// ----- Showing things on the page -----
// The page has tabs: Character, Skills, Town and so on. Only one is open at a time.
// style.css shows the page whose name matches body's data-tab.
// On a wide screen the tower is always visible beside the tabs; on a narrow
// one it is a tab of its own.
const tabNames = ["tower", "character", "skills", "town", "travel", "milestones", "ascension", "save"];

function showTab(name) {
  document.body.dataset.tab = name;

  for (let tabName of tabNames) {
    document.getElementById("tab-" + tabName).classList.toggle("open", tabName === name);
  }
}

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

function showUpgrades() {
  for (let upgrade of currentClass().upgrades) {
    let maxed = upgradeLevel(upgrade.id) >= upgradeCap();

    let title = upgrade.name + " · level " + upgradeLevel(upgrade.id);
    if (maxed) {
      title = upgrade.name + " · level " + upgradeLevel(upgrade.id) + " (the most for this run)";
    }

    fillRow("upgrade-" + upgrade.id, title, upgrade.text, "Choose", maxed);
  }
}

function showSkills() {
  document.getElementById("skill-points").textContent = skillPointsLeft();

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

  // The stance picker is hidden for a class without stances
  let stances = currentClass().stances;
  document.getElementById("stance").hidden = stances === undefined;
  if (stances !== undefined) {
    document.getElementById("stance-label").textContent = currentClass().stanceLabel + " · " + stances[stance].name;
    document.getElementById("stance-note").textContent = stances[stance].text;
    showFavourite("stance-buttons", "stance-" + stance);
  }

  for (let skill of currentClass().skills) {
    let price = skill.cost + " points";
    if (skill.cost === 1) {
      price = "1 point";
    }

    // Skills have no top level
    fillRow("skill-" + skill.id, skill.name + " · level " + skillLevel(skill.id), skill.text + " per level", price, skillPointsLeft() < skill.cost);
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

  // The pickers only appear once the Quartermaster or Tactician has been hired
  // (and a class with only one kind of gear has nothing to pick between)
  document.getElementById("favourite-gear").hidden = totalBonus("favouriteGear") < 1 || Object.keys(currentClass().gearTypes).length < 2;
  document.getElementById("favourite-upgrade").hidden = totalBonus("favouriteUpgrade") < 1;
  showFavourite("favourite-gear-buttons", "favourite-gear-" + favouriteGear);
  showFavourite("favourite-upgrade-buttons", "favourite-upgrade-" + favouriteUpgrade);

  document.getElementById("potions").textContent = potions + " / " + potionLimit();
  document.getElementById("potion-btn").textContent = potionPrice + " gold";
  document.getElementById("potion-btn").disabled = potions >= potionLimit() || bank < potionPrice;
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
    let text = place.text + " Your best floor here: " + best + ".";

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
      let times = Math.pow(item.multiply[stat], fameLevel(item.id));
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
      if (stat === "pathfinder") {
        parts.push(percent(pathfinderShare()) + " " + item.addLabel);
      } else if (item.addAsPercent) {
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
    return fameEarned + " fame so far";
  }
  return big(fameEarned) + " fame in " + timeText(seconds) + " (" + big(fameEarned / (seconds / 3600)) + " an hour)";
}

function showAscension() {
  document.getElementById("fame-owned").textContent = big(fame);
  document.getElementById("this-ascension").textContent = fameRateText(ascensionBest - 1, ascensionSeconds);
  if (ascensions === 0) {
    document.getElementById("last-ascension").textContent = "none yet";
  } else {
    document.getElementById("last-ascension").textContent = fameRateText(lastAscensionFame, lastAscensionSeconds);
  }
  document.getElementById("ascensions").textContent = ascensions;
  document.getElementById("ascension-best").textContent = ascensionBest;
  document.getElementById("ascend-floor").textContent = ascendFloorNeeded();

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
      let when = "Unlocks after " + item.unlockAt + " ascensions.";
      if (item.unlockAt === 1) {
        when = "Unlocks after your first ascension.";
      }
      fillRow(name, item.name, when, "Locked", true);
      continue;
    }

    let title = item.name + " · level " + fameLevel(item.id);
    let note = item.text + " So far: " + fameEffectText(item) + ".";

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
  if (hasPerkToPick()) {
    goals.push("You have a milestone perk to pick (Milestones).");
  }
  if (foundItem !== null && isBetter(foundItem)) {
    goals.push("You found better equipment: " + itemName(foundItem) + " (Character).");
  }
  if (canAscend()) {
    goals.push("You can ascend (Ascension).");
  }
  if (canBuyFameUpgrade()) {
    goals.push("You have enough fame for an upgrade (Ascension).");
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
  markTab("tower", encounterType === "upgrade");
  markTab("character", foundItem !== null && isBetter(foundItem));
  markTab("skills", skillPointsLeft() > 0);
  markTab("milestones", hasPerkToPick());
  markTab("ascension", canAscend() || canBuyFameUpgrade());
}

function showRelics() {
  let names = [];

  for (let id of ownedRelics) {
    for (let relic of allRelics()) {
      if (relic.id === id) {
        names.push(relic.name + " (" + relic.text + ")");
      }
    }
  }

  if (names.length === 0) {
    document.getElementById("relics").textContent = "none";
  } else {
    document.getElementById("relics").textContent = names.join(", ");
  }
}

function updateScreen() {
  showClassButtons();
  showUpgrades();
  showSkills();
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
    text = "Gold and a piece of equipment.";
    icon = "💰";
  }
  if (encounterType === "upgrade") {
    title = "Upgrade Area";
    text = "Choose an upgrade below.";
    icon = "⭐";
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

  document.getElementById("upgrade-area").hidden = encounterType !== "upgrade";
  document.getElementById("upgrade-timer").textContent = upgradeTimer;

  if (inFight) {
    document.getElementById("monster-hp").textContent = big(Math.max(0, monsterHp)) + " / " + big(monsterMaxHp);
    document.getElementById("monster-hp-bar").style.width = Math.max(0, monsterHp / monsterMaxHp * 100) + "%";
    document.getElementById("monster-hp-trail").style.width = Math.max(0, monsterHp / monsterMaxHp * 100) + "%";
    document.getElementById("monster-attack").textContent = big(monsterAttack);
    document.getElementById("monster-armor").textContent = big(monsterArmor);
    document.getElementById("monster-ward").textContent = big(monsterWard);
    document.getElementById("monster-dot").textContent = big(dotDamage());
  }

  // Classes without damage over time have no dotLabel, so that part is hidden
  if (currentClass().dotLabel === undefined) {
    document.getElementById("dot-part").hidden = true;
  } else {
    document.getElementById("dot-part").hidden = false;
    document.getElementById("dot-label").textContent = currentClass().dotLabel;
  }

  // The two equipment rows. The colour of the text shows the rarity (see style.css).
  document.getElementById("gear-label").textContent = slotLabel("weapon");
  document.getElementById("weapon").textContent = slotText("weapon", weaponPower, weaponRarity);
  document.getElementById("weapon").className = "rarity-" + weaponRarity;
  document.getElementById("armor-label").textContent = slotLabel("armor");
  document.getElementById("armor").textContent = slotText("armor", armorPower, armorRarity);
  document.getElementById("armor").className = "rarity-" + armorRarity;
  document.getElementById("weapon-info").textContent = currentClass().gearInfo();
  document.getElementById("favourite-gear-label").textContent = "Favourite " + currentClass().gearLabel.toLowerCase();

  if (foundItem === null) {
    document.getElementById("found-item").textContent = "nothing";
    document.getElementById("found-item").className = "";
  } else {
    document.getElementById("found-item").textContent = itemName(foundItem);
    document.getElementById("found-item").className = "rarity-" + foundItem.rarity;
  }
  document.getElementById("equip-btn").disabled = foundItem === null;
}

// ----- Building each room -----
function pickMonsterType(isBoss) {
  if (isBoss) {
    // Bosses come in order: floor 5 is the first, floor 10 the second...
    let bosses = towers[tower].bosses;
    return bosses[(floor / 5 - 1) % bosses.length];
  }

  let choices = [];
  for (let type of towers[tower].monsters) {
    if (type.minFloor <= floor) {
      choices.push(type);
    }
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

// A monster only lists the traits it has, so a missing one counts as 0
function traitOf(type, trait) {
  if (type[trait] === undefined) {
    return 0;
  }
  return type[trait];
}

function spawnMonster(isBoss) {
  let type = pickMonsterType(isBoss);

  monsterName = type.name;
  monsterText = type.text;
  // How many times stronger than floor 1 the monsters are here (see data.js)
  let growth = Math.pow(1 + monsterGrowth * (floor - 1), monsterCurve);
  monsterMaxHp = Math.round(monsterHealth * growth * type.hp);
  monsterAttack = Math.round(monsterDamage * growth * type.attack);
  monsterArmor = Math.floor(floor * monsterArmorPerFloor * type.armor);

  // Ward works like armor. A monster can have its own, or it uses its tower's.
  // A tower with none written has no ward at all.
  let ward = 0;
  if (type.ward !== undefined) {
    ward = type.ward;
  } else if (towers[tower].ward !== undefined) {
    ward = towers[tower].ward;
  }
  monsterWard = Math.floor(floor * monsterArmorPerFloor * ward);
  monsterGold = type.gold;
  monsterPoison = traitOf(type, "poison");
  monsterRegen = traitOf(type, "regen");

  // What it is weak to and resists (a monster with neither just leaves them out)
  monsterWeak = type.weak || [];
  monsterResist = type.resist || [];

  // Monsters in another class's tower are stronger
  if (isAway()) {
    monsterMaxHp = Math.round(monsterMaxHp * (1 + awayTowerHealth));
    monsterAttack = Math.round(monsterAttack * (1 + awayTowerAttack));
  }

  monsterStunned = false;
  dotStacks = 0;
  fightTurns = 0;

  monsterIsRare = !isBoss && Math.random() < rareChance;

  if (isBoss) {
    monsterMaxHp = monsterMaxHp * 3;
    monsterAttack = Math.round(monsterAttack * 1.5);
    say("BOSS: " + monsterName + " blocks the way!");
  } else if (monsterIsRare) {
    monsterName = "Rare " + monsterName;
    monsterMaxHp = monsterMaxHp * 2;
    monsterAttack = Math.round(monsterAttack * 1.25);
    say("A " + monsterName + " appears!");
  } else if ("AEIOU".includes(monsterName[0])) {
    say("An " + monsterName + " appears.");
  } else {
    say("A " + monsterName + " appears.");
  }

  // How much an enraging monster's attack grows each turn
  monsterEnrageStep = Math.ceil(monsterAttack * traitOf(type, "enrage"));
  monsterHp = monsterMaxHp;

  // A monster uses its tower's picture unless it has one of its own
  monsterIcon = towers[tower].icon;
  if (type.icon !== undefined) {
    monsterIcon = type.icon;
  }

  // Pixel art, if this monster has been given some ("" means it has not)
  monsterArt = "";
  if (type.art !== undefined) {
    monsterArt = type.art;
  }

  // Some classes get ready at the start of a fight
  if (currentClass().startFight !== undefined) {
    currentClass().startFight();
  }
}

function startEncounter() {
  roomCount = roomCount + 1;

  if (room === roomsPerFloor) {
    if (floor % 5 === 0) {
      encounterType = "boss";
    } else {
      encounterType = "monster";
    }
  } else {
    let roll = Math.random();
    if (roll < 0.65) {
      encounterType = "monster";
    } else if (roll < 0.78) {
      encounterType = "rest";
    } else if (roll < 0.9) {
      encounterType = "chest";
    } else {
      encounterType = "upgrade";
      upgradeTimer = upgradeWaitTime;
      say("You find an upgrade area. Choose an upgrade!");
    }
  }

  monsterIsRare = false;
  if (encounterType === "monster") {
    spawnMonster(false);
  } else if (encounterType === "boss") {
    spawnMonster(true);
  }
}

function nextRoom() {
  let newBest = false;
  room = room + 1;

  if (room > roomsPerFloor) {
    room = 1;
    floor = floor + 1;
    say("You climb to floor " + floor + ".");

    if (floor > bestFloor) {
      bestFloor = floor;
      newBest = true;
    }

    // Every floor reached for the first time since the last ascension pays fame
    if (floor > ascensionBest) {
      fame = fame + (floor - ascensionBest) * multiplier("fame");
      ascensionBest = floor;
    }
    checkTowerProgress();
  }

  for (let milestone of allMilestones()) {
    if (newBest && floor === milestone.floor) {
      say("Milestone unlocked! Pick a perk for reaching floor " + floor + ".");
    }
  }

  startEncounter();
}

// ----- What happens in a room -----
function die() {
  let payout = floor * experiencePerFloor * (1 + totalBonus("experience")) * multiplier("experience");
  if (isAway()) {
    payout = payout * (1 + awayTowerExperience);
  }
  payout = Math.round(payout);
  say("You fell on floor " + floor + ", earned " + big(payout) + " experience and banked " + big(gold) + " gold.");

  deaths = deaths + 1;
  experience = experience + payout;
  levelUpWhilePossible();
  bank = bank + gold;
  gold = 0;
  upgrades = {};
  ownedRelics = [];
  runCounter = 0;
  floor = startFloor();
  room = 1;
  if (floor > 1) {
    say("You find your way back up to floor " + floor + ".");
  }

  // The next run starts in whichever tower was chosen
  if (nextTower !== tower) {
    tower = nextTower;
    say("You enter " + towers[tower].name + ".");
  }

  startingGear();

  // Some classes set something up at the start of a run
  if (currentClass().startRun !== undefined) {
    currentClass().startRun();
  }

  playerHp = playerMaxHp;
  startEncounter();
}

function victory() {
  let reward = floor * goldPerFloor;
  if (encounterType === "boss") {
    reward = reward * bossGold;
  }
  if (monsterIsRare) {
    reward = reward * rareGold;
  }
  reward = Math.round(reward * monsterGold * (1 + totalBonus("gold")) * multiplier("gold"));
  gold = gold + reward;

  healPlayer(playerMaxHp * (healOnKill + fameAdd("healOnKill")));

  say("You defeat the " + monsterName + " and earn " + big(reward) + " gold.");
  // Bosses and rare monsters always drop equipment, and it is better than usual
  if (encounterType === "boss") {
    findItem(bossDropRarity);
    gainRelic();
  } else if (monsterIsRare) {
    findItem(rareDropRarity);
  } else if (chance(Math.min(maxDropChance, monsterDropChance + totalBonus("dropChance")))) {
    findItem(0);
  }

  // Some classes gain something from every kill
  if (currentClass().whenKill !== undefined) {
    currentClass().whenKill();
  }
  nextRoom();
}

function monsterAttacks() {
  // Enraging monsters hit harder every turn
  monsterAttack = monsterAttack + monsterEnrageStep;

  let avoided = currentClass().whenAttacked();

  // An avoided attack does nothing more. A reflected attack still lands, even if the
  // reflection killed the monster: otherwise enough reflect would make a class unkillable.
  if (avoided) {
    return;
  }

  // Your armor works the same way as the monster's, but poison goes straight through it
  let damage = Math.max(1, monsterAttack - totalArmor());
  damage = damage + Math.round(monsterAttack * monsterPoison);
  damage = Math.max(1, Math.round(damage / damageDivider()));
  playerHp = playerHp - damage;

  if (playerHp <= 0) {
    die();
  } else if (potions > 0 && playerHp <= playerMaxHp * 0.3) {
    potions = potions - 1;
    healPlayer(playerMaxHp * (potionHealing + totalBonus("potionPower")));
    say("You drink a healing potion!");
  }
}

function fightMonster() {
  fightTurns = fightTurns + 1;

  // A fight that drags on gets more dangerous, so that none can last forever
  if (fightTurns === longFightTurns) {
    say("The fight drags on. The " + monsterName + " grows more dangerous every turn!");
  }
  if (fightTurns >= longFightTurns) {
    monsterAttack = Math.ceil(monsterAttack * 1.1);
  }

  currentClass().attack();

  let deathsBefore = deaths;

  if (monsterHp > 0) {
    if (monsterRegen > 0) {
      monsterHp = Math.min(monsterMaxHp, monsterHp + Math.round(monsterMaxHp * monsterRegen));
    }

    if (monsterStunned) {
      // A stunned, frozen or out-of-reach enemy misses its turn
      monsterStunned = false;
    } else {
      monsterAttacks();
    }
  }

  // If that attack killed you, a new run has already started and this fight is over
  if (deaths !== deathsBefore) {
    return;
  }

  if (monsterHp <= 0) {
    victory();
  }
}

// One second of the game
function step() {
  ascensionSeconds = ascensionSeconds + 1;

  if (encounterType === "monster" || encounterType === "boss") {
    fightMonster();
  } else if (encounterType === "rest") {
    playerHp = playerMaxHp;
    say("You rest and recover all your health.");
    nextRoom();
  } else if (encounterType === "chest") {
    gold = gold + Math.round(floor * goldPerFloor * chestGold * (1 + totalBonus("gold")) * multiplier("gold"));
    findItem(0);
    nextRoom();
  } else if (encounterType === "upgrade") {
    // With a favourite picked (the Tactician, in town) there is nothing to wait for.
    // Otherwise wait a while for the player to choose, then move on by itself.
    upgradeTimer = upgradeTimer - 1;
    if (upgradeTimer <= 0 || favouriteIsAvailable()) {
      takeRandomUpgrade();
      nextRoom();
    }
  }
}

// ----- Animations -----
// The game's rules know nothing about animations. Instead we note the numbers
// before a second is played, play it, and animate whatever changed.
// The movements themselves are described in style.css (look for "Animations").

// A hit this big, as a share of the target's full health, gets a bigger number and a jolt
const bigHitShare = 0.3;

// Every animation there is. They are the class names in style.css under "Animations".
const animationNames = ["lunge-right", "lunge-left", "shake", "shake-late", "appear", "death", "jolt", "pop", "dying", "banner-show"];

// Plays one of the CSS animations on something on the page.
// Something can only play one at a time, so any earlier one is cleared first.
// Reading offsetWidth in between makes the browser start the new one afresh.
function animate(id, animationName) {
  let element = document.getElementById(id);

  for (let name of animationNames) {
    element.classList.remove(name);
  }
  void element.offsetWidth;
  element.classList.add(animationName);
}

// A number or word that floats up from a fighter and fades.
// kind is "hit", "hurt", "heal" or "word", and can have " big" added.
// late = true makes it wait for the monster's turn.
function floatText(sideId, text, kind, late) {
  let bubble = document.createElement("span");
  bubble.className = "float " + kind;
  if (late) {
    bubble.className = bubble.className + " late";
  }
  bubble.textContent = text;

  // It removes itself once it has finished floating
  bubble.onanimationend = function () {
    bubble.remove();
  };
  document.getElementById(sideId).appendChild(bubble);
}

// A short message that pops up over the fight and fades: a level gained, an item found...
// kind decides its colour: "good", "floor", "bad", or "rarity-0" to "rarity-5" for items.
function toast(text, kind) {
  let box = document.getElementById("toasts");

  // Never more than three at once: the oldest makes room
  if (box.children.length >= 3) {
    box.children[0].remove();
  }

  let note = document.createElement("div");
  note.className = "toast " + kind;
  note.textContent = text;
  note.onanimationend = function () {
    note.remove();
  };
  box.appendChild(note);
}

// ----- Settings -----
// Settings belong to the device, not to the save: they are kept under their own
// name in the browser, and a save code does not carry them.
const settingsName = "lloegrys-idle-settings";
let animationsOn = true;

function loadSettings() {
  let saved = localStorage.getItem(settingsName);

  if (saved !== null) {
    try {
      animationsOn = JSON.parse(saved).animationsOn !== false;
    } catch (error) {
      animationsOn = true;
    }
  }

  showSettings();
}

function setAnimations(on) {
  animationsOn = on;
  localStorage.setItem(settingsName, JSON.stringify({ animationsOn: animationsOn }));
  showSettings();
}

function showSettings() {
  document.getElementById("animations-box").checked = animationsOn;

  // style.css switches every animation off when the body has "no-motion"
  document.body.classList.toggle("no-motion", !animationsOn);
}

// Big words that fade in across the whole fight and out again.
// kind is "died" (blood red) or "won" (gold).
function showBanner(text, kind) {
  let banner = document.getElementById("banner");
  banner.textContent = text;
  banner.className = "banner " + kind;
  animate("banner", "banner-show");
}

// Shows a fighter's picture: its pixel art if it has some, otherwise its emoji.
// A class, monster or boss gets pixel art by adding  art: "art/its-file.png"  to its entry.
function drawPicture(id, icon, art) {
  let element = document.getElementById(id);

  if (art === undefined || art === "") {
    element.dataset.art = "";
    element.classList.remove("has-art");
    element.textContent = icon;
    return;
  }

  // Only swap the image when it is a different one, or it would flicker every second
  if (element.dataset.art !== art) {
    let image = document.createElement("img");
    image.src = art;
    image.alt = "";

    // Small drawings (true pixel art, up to 96 pixels tall) are kept sharp when
    // shown bigger. Large detailed pictures are scaled smoothly instead.
    image.onload = function () {
      image.classList.toggle("sharp", image.naturalHeight <= 96);
    };

    element.textContent = "";
    element.appendChild(image);
    element.dataset.art = art;
    element.classList.add("has-art");
  }
}

function animatedStep() {
  // Nothing to animate if nobody is looking, or animations are switched off
  if (document.hidden || !animationsOn) {
    step();
    return;
  }

  // What things look like before this second is played
  let wasFight = encounterType === "monster" || encounterType === "boss";
  let wasBoss = encounterType === "boss";
  let roomBefore = roomCount;
  let deathsBefore = deaths;
  resistedHits = 0;
  boostedHits = 0;
  let monsterHpBefore = monsterHp;
  let monsterMaxHpBefore = monsterMaxHp;
  let monsterIconBefore = monsterIcon;
  let monsterArtBefore = monsterArt;
  let playerHpBefore = playerHp;
  let floorBefore = floor;
  let levelBefore = level;
  let fameBefore = fame;
  let relicsBefore = ownedRelics.length;
  let trophiesBefore = trophies.length;
  let foundBefore = foundItem;
  let weaponBefore = weaponPower;
  let armorBefore = armorPower;

  step();

  let died = deaths !== deathsBefore;
  let newRoom = roomCount !== roomBefore;
  let playerChange = playerHp - playerHpBefore;

  // Things worth a pop-up message, whatever else happened
  if (level > levelBefore) {
    toast("Level " + level + "!", "good");
    animate("header-level", "pop");
  }
  if (fame > fameBefore) {
    animate("fame", "pop");
  }
  if (trophies.length > trophiesBefore) {
    toast("Trophy won!", "good");
  }

  if (died) {
    animate("stage", "death");
    showBanner("You died", "died");
    toast("Fell on floor " + floorBefore, "bad");
    animate("monster-mover", "appear");
    return;
  }

  if (wasBoss && newRoom) {
    showBanner("Victory", "won");
  }

  if (floor > floorBefore) {
    toast("Floor " + floor, "floor");
    animate("floor", "pop");
  }
  if (ownedRelics.length > relicsBefore) {
    toast("Relic claimed!", "good");
  }

  // Equipment: either the Squire put it on, or it is waiting on the Character tab
  if (weaponPower > weaponBefore) {
    toast("Equipped " + gearName("weapon", weapon, weaponPower, weaponRarity), "rarity-" + weaponRarity);
  } else if (armorPower > armorBefore) {
    toast("Equipped " + gearName("armor", weapon, armorPower, armorRarity), "rarity-" + armorRarity);
  } else if (foundItem !== null && foundItem !== foundBefore) {
    toast("Found " + itemName(foundItem), "rarity-" + foundItem.rarity);
  }

  if (wasFight) {
    // Your turn: you lunge, and the monster is hit or defeated
    animate("player-mover", "lunge-right");

    if (newRoom) {
      // The defeated monster fades away where it stood, while the next room arrives
      drawPicture("monster-ghost", monsterIconBefore, monsterArtBefore);
      animate("monster-ghost", "dying");
    } else {
      // A regenerating monster can end the turn with more health than it started
      let dealt = monsterHpBefore - monsterHp;

      // The number is coloured when the monster was weak to the hit, or resisted it
      let feel = "";
      if (boostedHits > 0 && resistedHits === 0) {
        feel = " weak";
      } else if (resistedHits > 0 && boostedHits === 0) {
        feel = " resisted";
      }

      if (dealt >= monsterMaxHpBefore * bigHitShare) {
        floatText("monster-side", "-" + big(dealt), "hit big" + feel, false);
        animate("monster-icon", "shake");
        animate("stage", "jolt");
      } else if (dealt > 0) {
        floatText("monster-side", "-" + big(dealt), "hit" + feel, false);
        animate("monster-icon", "shake");
      } else if (dealt < 0) {
        floatText("monster-side", "+" + big(-dealt), "heal", false);
      }

      // The monster's turn, a moment later
      if (playerChange < 0) {
        animate("monster-mover", "lunge-left");
        animate("player-icon", "shake-late");

        if (-playerChange >= playerMaxHp * bigHitShare) {
          floatText("player-side", "-" + big(-playerChange), "hurt big", true);
        } else {
          floatText("player-side", "-" + big(-playerChange), "hurt", true);
        }
      }
    }
  }

  // Healing: lifesteal, a rest area, a potion, or the breather after a kill
  if (playerChange > 0) {
    floatText("player-side", "+" + big(playerChange), "heal", wasFight);
  }

  if (newRoom) {
    animate("monster-mover", "appear");
  }
}

// ----- Time away -----
// Plays through the seconds you missed, very fast, then reports what happened.
// The game was not really running: it works out the time away from the clock.
function playTimeAway(seconds) {
  let counted = Math.min(seconds, maxAwaySeconds);

  let deathsBefore = deaths;
  let experienceBefore = experience;
  let goldBefore = gold + bank;
  let bestFloorBefore = bestFloor;

  catchingUp = true;
  for (let i = 0; i < counted; i++) {
    step();
  }
  catchingUp = false;

  let report = "While you were away for " + timeText(seconds);
  if (seconds > maxAwaySeconds) {
    report = report + " (only " + timeText(maxAwaySeconds) + " counts)";
  }
  report = report + ", your " + currentClass().name + " fell " + (deaths - deathsBefore) + " times";
  report = report + " and earned " + big(experience - experienceBefore) + " experience";
  report = report + " and " + big(gold + bank - goldBefore) + " gold.";
  if (bestFloor > bestFloorBefore) {
    report = report + " New best floor: " + bestFloor + "!";
  }

  document.getElementById("away-text").textContent = report;
  document.getElementById("away-report").hidden = false;
}

// Runs once a second. If more than a second has passed (the game was closed,
// or the browser slowed a hidden tab down), it catches up on what was missed.
function tick() {
  let now = Date.now();
  let seconds = Math.max(1, Math.round((now - lastTick) / 1000));
  lastTick = now;

  if (seconds >= awayReportAfter) {
    playTimeAway(seconds);
  } else {
    for (let i = 0; i < seconds; i++) {
      // Only the last second is animated when several are played at once
      if (i === seconds - 1) {
        animatedStep();
      } else {
        step();
      }
    }
  }

  updateScreen();
  saveGame();
}

// ----- Start the game -----
loadGame();
buildClassButtons();
buildRoomPips();
buildTownList();
buildFameList();
buildTowerList();
buildClassScreen();
showTab("tower");
loadSettings();
showSaveProblem();
startEncounter();
tick();
let timer = setInterval(tick, 1000);
