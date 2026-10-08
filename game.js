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
let monsterGold = 1;
let monsterPoison = 0;
let monsterRegen = 0;
let monsterEnrageStep = 0;
let monsterIsRare = false;
let monsterStunned = false;
let fightTurns = 0;
let monsterIcon = "";

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
function hitMonster(damage) {
  damage = Math.max(1, Math.round(damage) - monsterArmor);
  monsterHp = monsterHp - damage;
  return damage;
}

// A magic hit ignores armor
function magicHitMonster(damage) {
  damage = Math.max(1, Math.round(damage));
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

function dotDamage() {
  return Math.round(dotStacks * currentClass().dotPerStack() * (1 + totalBonus("dotPower")));
}

// ----- Adding up bonuses -----
function baseBonus(stat) {
  if (currentClass().base[stat] !== undefined) {
    return currentClass().base[stat];
  }
  return 0;
}

function perkBonus(stat) {
  let total = 0;

  for (let milestone of currentClass().milestones) {
    for (let perk of milestone.perks) {
      if (chosenPerks[milestone.floor] === perk.id && perk.bonus[stat] !== undefined) {
        total = total + perk.bonus[stat];
      }
    }
  }

  return total;
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
  skillLevels = {};
  gold = 0;
  bank = 0;
  potions = 0;
  upgrades = {};
  ownedRelics = [];
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
  return Math.round((armorPower + totalBonus("armor")) * fameMultiplier("armor"));
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

function makeItem(least) {
  let rarity = rollRarity(least);

  // Items get stronger the higher you are in the tower, and with their rarity
  let power = floor * gearPowerPerFloor * (1 + Math.random()) * rarities[rarity].power * fameMultiplier("gear");

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
    weaponPower = Math.max(weaponPower, Math.round(floor * gearPowerPerFloor * fameMultiplier("gear")));
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

function buySkill(skill) {
  if (skillPointsLeft() >= skill.cost) {
    skillLevels[skill.id] = skillLevel(skill.id) + 1;
    recalcStats();
    updateScreen();
  }
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

  playerMaxHp = Math.round(health * (1 + totalBonus("healthPercent")) * fameMultiplier("health"));
  playerAttack = Math.round(attack * (1 + totalBonus("attackPercent")) * fameMultiplier("attack"));

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
  }
}

// ----- Saving and loading -----
// The save lives in the browser. It holds one bundle of progress per class,
// which class is being played, and when the game last ran.
// Nothing is shared between classes: every class has its own fame, trophies and gold.
// Changing this name makes the game ignore every existing save and start fresh.
// Do that after a change that old saves cannot survive.
const saveName = "lloegrys-idle-save-3";
let classSaves = {};

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
    trophies: []
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
    trophies: trophies
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
  if (foundItem !== null && foundItem.slot === specialSlot() && currentClass().gearTypes[foundItem.type] === undefined) {
    foundItem = null;
  }

  dotStacks = 0;
  recalcStats();

  // A class that has never been played starts on full health
  if (playerHp === undefined) {
    playerHp = playerMaxHp;
  }
}

function saveGame() {
  classSaves[playerClass] = packClass();

  let data = {
    playerClass: playerClass,
    classSaves: classSaves,
    lastTick: lastTick
  };

  localStorage.setItem(saveName, JSON.stringify(data));
}

function loadGame() {
  let saved = localStorage.getItem(saveName);

  if (saved !== null) {
    let data = JSON.parse(saved);

    classSaves = data.classSaves;

    // When the game was last running, so we know how long you were away
    lastTick = data.lastTick;

    if (classes[data.playerClass] !== undefined) {
      playerClass = data.playerClass;
    }
  }

  unpackClass(classSaves[playerClass]);
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
// These make buttons out of the lists in data.js and classes/, so new perks,
// upgrades, skills and classes show up without touching index.html

// Runs once, when the game starts
function buildClassButtons() {
  let box = document.getElementById("class-buttons");

  for (let className in classes) {
    let button = document.createElement("button");
    button.id = "class-" + className;
    button.textContent = classes[className].name;
    button.onclick = function () {
      switchClass(className);
    };
    box.appendChild(button);
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
    let row = document.createElement("div");
    row.className = "town-row";

    let button = document.createElement("button");
    button.id = "town-" + item.id;
    button.onclick = function () {
      buyTownUpgrade(item);
    };
    row.appendChild(button);

    let text = document.createElement("p");
    text.className = "note";
    text.textContent = item.text;
    row.appendChild(text);

    box.appendChild(row);
  }
}

// Runs once, when the game starts
function buildTowerList() {
  let box = document.getElementById("towers");

  for (let towerName in towers) {
    let row = document.createElement("div");
    row.className = "tower-row";

    let title = document.createElement("p");
    title.id = "tower-title-" + towerName;
    row.appendChild(title);

    let text = document.createElement("p");
    text.className = "note";
    text.id = "tower-text-" + towerName;
    row.appendChild(text);

    let button = document.createElement("button");
    button.id = "tower-" + towerName;
    button.onclick = function () {
      chooseTower(towerName);
    };
    row.appendChild(button);

    box.appendChild(row);
  }
}

// Runs when the game starts and every time the class changes
function buildClassScreen() {
  let upgradeBox = document.getElementById("upgrades");
  upgradeBox.innerHTML = "";

  for (let upgrade of currentClass().upgrades) {
    let row = document.createElement("p");

    let button = document.createElement("button");
    button.id = "upgrade-" + upgrade.id;
    button.onclick = function () {
      chooseUpgrade(upgrade);
    };
    row.appendChild(button);
    row.appendChild(document.createTextNode(" " + upgrade.text));

    upgradeBox.appendChild(row);
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

  let skillBox = document.getElementById("skills");
  skillBox.innerHTML = "";

  for (let skill of currentClass().skills) {
    let row = document.createElement("div");
    row.className = "skill";

    let button = document.createElement("button");
    button.id = "skill-" + skill.id;
    button.onclick = function () {
      buySkill(skill);
    };
    row.appendChild(button);

    let text = document.createElement("p");
    text.className = "note";
    text.textContent = skill.text + " per level";
    row.appendChild(text);

    skillBox.appendChild(row);
  }

  let milestoneBox = document.getElementById("milestones");
  milestoneBox.innerHTML = "";

  for (let milestone of currentClass().milestones) {
    let row = document.createElement("div");
    row.className = "milestone";

    let title = document.createElement("p");
    title.id = "milestone-" + milestone.floor;
    row.appendChild(title);

    for (let perk of milestone.perks) {
      let button = document.createElement("button");
      button.id = "perk-" + perk.id;
      button.textContent = perk.name + " (" + perk.text + ")";
      button.onclick = function () {
        choosePerk(milestone.floor, perk.id);
      };
      row.appendChild(button);
    }

    milestoneBox.appendChild(row);
  }
}

// ----- Showing things on the page -----
// On narrow screens only one section is shown at a time (the rest is done in style.css)
function showTab(name) {
  document.body.className = "show-" + name;
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
    let button = document.getElementById("upgrade-" + upgrade.id);

    if (upgradeLevel(upgrade.id) >= upgradeCap()) {
      button.textContent = upgrade.name + " (max level)";
      button.disabled = true;
    } else {
      button.textContent = upgrade.name + " level " + (upgradeLevel(upgrade.id) + 1);
      button.disabled = false;
    }
  }
}

function showSkills() {
  document.getElementById("skill-points").textContent = skillPointsLeft();

  for (let skill of currentClass().skills) {
    let button = document.getElementById("skill-" + skill.id);

    let price = skill.cost + " points";
    if (skill.cost === 1) {
      price = "1 point";
    }

    // Skills have no top level
    button.textContent = skill.name + " level " + skillLevel(skill.id) + " (" + price + ")";
    button.disabled = skillPointsLeft() < skill.cost;
  }
}

function showMilestones() {
  for (let milestone of currentClass().milestones) {
    let unlocked = bestFloor >= milestone.floor;

    let title = "Floor " + milestone.floor;
    if (!unlocked) {
      title = title + " (locked)";
    }
    document.getElementById("milestone-" + milestone.floor).textContent = title;

    for (let perk of milestone.perks) {
      let button = document.getElementById("perk-" + perk.id);
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
    let button = document.getElementById("town-" + item.id);

    // The helpers are bought once. Everything else can be bought forever.
    if (townUpgradeIsMaxed(item)) {
      button.textContent = item.name + " (owned)";
      button.disabled = true;
    } else if (item.maxLevel === 1) {
      button.textContent = item.name + " (" + big(townCost(item)) + " gold)";
      button.disabled = bank < townCost(item);
    } else {
      button.textContent = item.name + " level " + (townLevel(item.id) + 1) + " (" + big(townCost(item)) + " gold)";
      button.disabled = bank < townCost(item);
    }
  }

  // The pickers only appear once the Quartermaster or Tactician has been hired
  document.getElementById("favourite-gear").hidden = totalBonus("favouriteGear") < 1;
  document.getElementById("favourite-upgrade").hidden = totalBonus("favouriteUpgrade") < 1;
  showFavourite("favourite-gear-buttons", "favourite-gear-" + favouriteGear);
  showFavourite("favourite-upgrade-buttons", "favourite-upgrade-" + favouriteUpgrade);

  document.getElementById("potions").textContent = potions + " / " + potionLimit();
  document.getElementById("potion-btn").textContent = "Healing potion (" + potionPrice + " gold)";
  document.getElementById("potion-btn").disabled = potions >= potionLimit() || bank < potionPrice;
}

function showTowers() {
  for (let towerName in towers) {
    let place = towers[towerName];

    let title = place.name + " (" + classes[towerName].name + "'s tower)";
    if (towerName === playerClass) {
      title = place.name + " (your home tower)";
    }
    document.getElementById("tower-title-" + towerName).textContent = title;

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
    document.getElementById("tower-text-" + towerName).textContent = text;

    let button = document.getElementById("tower-" + towerName);
    button.className = "";
    button.disabled = false;

    if (towerName === tower && towerName === nextTower) {
      button.textContent = "You are here";
      button.className = "chosen";
      button.disabled = true;
    } else if (towerName === nextTower) {
      button.textContent = "Entering after you fall";
      button.className = "chosen";
      button.disabled = true;
    } else if (towerName === tower) {
      button.textContent = "You are here (stay for the next run)";
    } else {
      button.textContent = "Enter on your next run";
    }
  }
}

// Runs once, when the game starts. The fame upgrades are the same for every class.
function buildFameList() {
  let box = document.getElementById("fame-upgrades");

  for (let item of fameUpgrades) {
    let row = document.createElement("div");
    row.className = "town-row";

    let button = document.createElement("button");
    button.id = "fame-" + item.id;
    button.onclick = function () {
      buyFameUpgrade(item);
    };
    row.appendChild(button);

    let text = document.createElement("p");
    text.className = "note";
    text.id = "fame-text-" + item.id;
    row.appendChild(text);

    box.appendChild(row);
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
    let upgradeButton = document.getElementById("fame-" + item.id);

    // A locked upgrade shows only when it will appear
    if (!fameUpgradeIsUnlocked(item)) {
      upgradeButton.textContent = item.name + " (locked)";
      upgradeButton.disabled = true;

      if (item.unlockAt === 1) {
        document.getElementById("fame-text-" + item.id).textContent = "Unlocks after your first ascension.";
      } else {
        document.getElementById("fame-text-" + item.id).textContent = "Unlocks after " + item.unlockAt + " ascensions.";
      }
      continue;
    }

    if (fameUpgradeIsMaxed(item)) {
      upgradeButton.textContent = item.name + " level " + fameLevel(item.id) + " (max)";
      upgradeButton.disabled = true;
    } else {
      upgradeButton.textContent = item.name + " level " + (fameLevel(item.id) + 1) + " (" + big(fameCost(item)) + " fame)";
      upgradeButton.disabled = fame < fameCost(item);
    }

    document.getElementById("fame-text-" + item.id).textContent = item.text + " So far: " + fameEffectText(item) + ".";
  }
}

// ----- What to do next -----
// A short list under the tower that tells the player what needs their attention
// and what they are working toward. At most three lines, most urgent first.
function nextGoals() {
  let goals = [];

  // Things waiting to be used
  if (skillPointsLeft() > 0) {
    goals.push("You have " + skillPointsLeft() + " skill points to spend (Skills).");
  }
  for (let milestone of currentClass().milestones) {
    if (bestFloor >= milestone.floor && chosenPerks[milestone.floor] === undefined) {
      goals.push("You have a milestone perk to pick for floor " + milestone.floor + " (Milestones).");
      break;
    }
  }
  if (foundItem !== null && isBetter(foundItem)) {
    goals.push("You found better equipment: " + itemName(foundItem) + " (Character).");
  }
  if (canAscend()) {
    goals.push("You can ascend (Ascension).");
  }
  for (let item of fameUpgrades) {
    if (fameUpgradeIsUnlocked(item) && !fameUpgradeIsMaxed(item) && fame >= fameCost(item)) {
      goals.push("You have enough fame for an upgrade (Ascension).");
      break;
    }
  }

  // Things to aim for
  if (!canAscend()) {
    goals.push("Reach floor " + ascendFloorNeeded() + " to ascend. Best since your last ascension: " + ascensionBest + ".");
  }
  for (let milestone of currentClass().milestones) {
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

  document.getElementById("tower-name").textContent = towers[tower].name;
  if (isAway()) {
    document.getElementById("tower-note").textContent = "Away from home: monsters have +" + percent(awayTowerHealth) + " health and +" + percent(awayTowerAttack) + " attack, and you earn +" + percent(awayTowerExperience) + " experience.";
  } else {
    document.getElementById("tower-note").textContent = "Your home tower. " + towers[tower].text;
  }

  document.getElementById("gold").textContent = big(gold);
  document.getElementById("bank").textContent = big(bank);
  document.getElementById("xp").textContent = big(experience);
  document.getElementById("fame").textContent = big(fame);
  document.getElementById("floor").textContent = floor;
  document.getElementById("best-floor").textContent = bestFloor;
  document.getElementById("room").textContent = room;
  document.getElementById("rooms-per-floor").textContent = roomsPerFloor;

  document.getElementById("class").textContent = currentClass().name;
  document.getElementById("class-text").textContent = currentClass().text;
  document.getElementById("level").textContent = level;
  document.getElementById("player-hp").textContent = big(playerHp) + " / " + big(playerMaxHp);
  document.getElementById("player-hp-bar").style.width = Math.max(0, playerHp / playerMaxHp * 100) + "%";
  document.getElementById("attack").textContent = big(playerAttack);
  document.getElementById("total-armor").textContent = big(totalArmor());
  document.getElementById("class-stat").textContent = currentClass().statLine();

  // The level panel: progress toward the next level, and what a level gives
  document.getElementById("level-big").textContent = level;
  document.getElementById("level-progress").textContent = big(experience) + " / " + big(levelCost());
  document.getElementById("level-bar").style.width = Math.min(100, experience / levelCost() * 100) + "%";
  document.getElementById("level-gain").textContent = "+" + currentClass().perLevel.attack + " attack, +" + currentClass().perLevel.maxHp + " health and " + skillPointsPerLevel + " skill point";

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

  document.getElementById("player-icon").textContent = currentClass().icon;
  document.getElementById("player-name").textContent = currentClass().name;
  document.getElementById("monster-icon").textContent = icon;

  // Bosses and rare monsters get a coloured glow (see style.css).
  // classList.toggle switches one class on or off and leaves the animation classes alone.
  document.getElementById("monster-icon").classList.toggle("boss", encounterType === "boss");
  document.getElementById("monster-icon").classList.toggle("rare", inFight && monsterIsRare);

  document.getElementById("upgrade-area").hidden = encounterType !== "upgrade";
  document.getElementById("upgrade-timer").textContent = upgradeTimer;

  // Flag the Tower tab when an upgrade is waiting, in case another tab is open
  if (encounterType === "upgrade") {
    document.getElementById("tab-tower").textContent = "Tower (!)";
  } else {
    document.getElementById("tab-tower").textContent = "Tower";
  }

  if (inFight) {
    document.getElementById("monster-hp").textContent = big(Math.max(0, monsterHp)) + " / " + big(monsterMaxHp);
    document.getElementById("monster-hp-bar").style.width = Math.max(0, monsterHp / monsterMaxHp * 100) + "%";
    document.getElementById("monster-attack").textContent = big(monsterAttack);
    document.getElementById("monster-armor").textContent = big(monsterArmor);
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
  document.getElementById("favourite-gear-label").textContent = "Favourite " + currentClass().gearLabel.toLowerCase() + ":";

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
  monsterGold = type.gold;
  monsterPoison = traitOf(type, "poison");
  monsterRegen = traitOf(type, "regen");

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
      fame = fame + (floor - ascensionBest);
      ascensionBest = floor;
    }
    checkTowerProgress();
  }

  for (let milestone of currentClass().milestones) {
    if (newBest && floor === milestone.floor) {
      say("Milestone unlocked! Pick a perk for reaching floor " + floor + ".");
    }
  }

  startEncounter();
}

// ----- What happens in a room -----
function die() {
  let payout = floor * experiencePerFloor * (1 + totalBonus("experience")) * fameMultiplier("experience");
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
  reward = Math.round(reward * monsterGold * (1 + totalBonus("gold")) * fameMultiplier("gold"));
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
    gold = gold + Math.round(floor * goldPerFloor * chestGold * (1 + totalBonus("gold")) * fameMultiplier("gold"));
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

// Plays one of the CSS animations on something on the page.
// Taking the class off and reading offsetWidth makes the browser start it afresh.
function animate(id, animationName) {
  let element = document.getElementById(id);
  element.classList.remove(animationName);
  void element.offsetWidth;
  element.classList.add(animationName);
}

// A number or word that floats up from a fighter and fades.
// kind is "hit", "hurt", "heal" or "word". late = true makes it wait for the monster's turn.
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

function animatedStep() {
  // Nothing to animate if nobody is looking, or the player has asked their device for less motion
  if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    step();
    return;
  }

  let wasFight = encounterType === "monster" || encounterType === "boss";
  let roomBefore = roomCount;
  let deathsBefore = deaths;
  let monsterHpBefore = monsterHp;
  let playerHpBefore = playerHp;

  step();

  let died = deaths !== deathsBefore;
  let newRoom = roomCount !== roomBefore;
  let playerChange = playerHp - playerHpBefore;

  if (died) {
    animate("stage", "death");
    floatText("player-side", "You fell!", "hurt", false);
    animate("monster-mover", "appear");
    return;
  }

  if (wasFight) {
    // Your turn: you lunge, and the monster is hit or defeated
    animate("player-mover", "lunge-right");

    if (newRoom) {
      floatText("monster-side", "Defeated!", "word", false);
    } else {
      // A regenerating monster can end the turn with more health than it started
      let dealt = monsterHpBefore - monsterHp;
      if (dealt > 0) {
        floatText("monster-side", "-" + big(dealt), "hit", false);
        animate("monster-icon", "shake");
      } else if (dealt < 0) {
        floatText("monster-side", "+" + big(-dealt), "heal", false);
      }

      // The monster's turn, a moment later
      if (playerChange < 0) {
        animate("monster-mover", "lunge-left");
        animate("player-icon", "shake-late");
        floatText("player-side", "-" + big(-playerChange), "hurt", true);
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
buildTownList();
buildFameList();
buildTowerList();
buildClassScreen();
startEncounter();
tick();
let timer = setInterval(tick, 1000);
