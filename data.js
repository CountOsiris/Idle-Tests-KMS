// =====================================================================
//  data.js - the numbers and lists that every class shares.
//  This file is loaded first. Then towers.js, then one file per class
//  from classes/, and game.js last.
// =====================================================================

// ----- The difficulty curve -----
// A normal monster on floor 1 has this much health and attack...
const monsterHealth = 30;
const monsterDamage = 3;

// ...and both get multiplied on every floor after that:
//   strength on floor F  =  (1 + monsterGrowth x (F - 1)) to the power of monsterCurve
// monsterGrowth decides how long the whole game takes: raise it and every floor
// becomes a bigger wall, lower it and players climb faster.
const monsterGrowth = 0.35;
const monsterCurve = 2;

// Monster armor grows steadily instead: this much per floor
const monsterArmorPerFloor = 0.5;

// ----- Rewards -----
// Gold from a normal monster is this much per floor. Bosses, rare monsters
// and chests multiply it.
const goldPerFloor = 1;
const bossGold = 5;
const rareGold = 3;
const chestGold = 2;

// Dying pays this much experience per floor reached, and going from
// level N to the next costs N times levelCostPerLevel
const experiencePerFloor = 20;
const levelCostPerLevel = 50;

// ----- Ascension -----
// Fame is the ascension currency. Each class earns and spends its own.
// Every floor pays 1 fame the first time it is reached since the last ascension.
// Ascending starts the class again from level 1 and makes every floor pay again.
//
// To ascend, a class must first reach a certain floor. The first time it is
// ascendFirstFloor, and it goes up by ascendFloorStep with every ascension,
// so each ascension means pushing further than the one before.
const ascendFirstFloor = 20;
const ascendFloorStep = 5;

// What fame buys. These are kept forever, through every ascension.
//
// TO ADD ONE: add a line. It needs:
//   id       - a unique name with no spaces (used in the save)
//   name     - what the player sees
//   text     - a short description of what ONE level does
//   cost     - the price of the first level, in fame
//   growth   - each level costs this many times more than the last (1.5 means +50%)
//   maxLevel - how many times it can be bought. 0 means no limit, ever.
// and one of these two:
//   multiply - multiplies something, and every level multiplies again (they compound).
//              It can multiply: attack, health, armor, experience, gold
//   add      - adds something per level. It can add: startLevels (levels kept when ascending).
//              Give it an addLabel too, which is how the total is described on the page.
const fameUpgrades = [
  { id: "might", name: "Might", text: "Multiplies your attack by 1.25.", multiply: { attack: 1.25 }, cost: 3, growth: 1.5, maxLevel: 0 },
  { id: "vitality", name: "Vitality", text: "Multiplies your health and armor by 1.25.", multiply: { health: 1.25, armor: 1.25 }, cost: 3, growth: 1.5, maxLevel: 0 },
  { id: "wisdom", name: "Wisdom", text: "Multiplies the experience you earn by 1.2.", multiply: { experience: 1.2 }, cost: 2, growth: 1.5, maxLevel: 0 },
  { id: "fortune", name: "Fortune", text: "Multiplies the gold you earn by 1.2.", multiply: { gold: 1.2 }, cost: 2, growth: 1.5, maxLevel: 0 },
  { id: "legacy", name: "Legacy", text: "Start every ascension 3 levels higher.", add: { startLevels: 3 }, addLabel: "starting levels", cost: 4, growth: 1.5, maxLevel: 0 }
];

// How much of your health comes back after every kill (0.2 means a fifth)
const healOnKill = 0.2;

// A weapon found on floor F has between F and 2 x F times this much power.
// Armor has half of that.
const gearPowerPerFloor = 0.5;

// ----- Equipment rarity -----
// Every piece of equipment found has one of these rarities.
//   name   - goes in front of the item's name ("" means nothing, for ordinary items)
//   chance - how often it turns up. The chances must add up to 1.
//   power  - the item's power is multiplied by this
// The colours are in style.css: rarity-0 is the first line here, rarity-1 the second...
const rarities = [
  { name: "", chance: 0.6, power: 0.9 },
  { name: "Fine", chance: 0.27, power: 1.1 },
  { name: "Rare", chance: 0.1, power: 1.4 },
  { name: "Epic", chance: 0.03, power: 1.8 }
];

// The lowest rarity a rare monster and a boss can drop.
// 0 is ordinary, 1 is Fine, 2 is Rare, 3 is Epic.
const rareDropRarity = 1;
const bossDropRarity = 2;

// No chance to dodge, parry, block, stun or freeze can go above this (0.6 means 60%),
// however many bonuses are stacked. Without a limit a character could become unkillable.
const maxChance = 0.6;

// ----- Other numbers you can tune -----
const roomsPerFloor = 4;

// Rare monsters are tougher, but pay more gold and always drop an item
const rareChance = 0.1;
const monsterDropChance = 0.1;

// After this many turns a fight "drags on" and the monster hits harder
// every turn, so that no fight can last forever
const longFightTurns = 30;

// In another class's tower, monsters have this much more health and attack,
// and dying there pays this much more experience (0.5 means +50%)
const awayTowerHealth = 1;
const awayTowerAttack = 0.5;
const awayTowerExperience = 0.5;

const maxUpgradeLevel = 5;
const upgradeWaitTime = 15;

// The most time away that counts, and how long away before you get a report
const maxAwaySeconds = 8 * 60 * 60;
const awayReportAfter = 60;

// Healing potions: the price of one, how many you can carry before any town
// upgrades, and how much of your health one heals (0.5 means half)
const potionPrice = 150;
const maxPotions = 5;
const potionHealing = 0.5;

const maxLogLines = 40;

// ----- Bonuses -----
// Classes, upgrades, skills, milestone perks, relics and trophies are all described
// with the same "bonus" words. A bonus can combine several, like { maxHp: 100, armor: 5 }.
//
// These words work for every class:
//   maxHp        health                         (30 means +30)
//   attack       attack                         (5 means +5)
//   armor        damage blocked per hit         (3 means +3)
//   gold         extra gold earned              (0.5 means +50%)
//   experience   extra experience on death      (0.25 means +25%)
//
// Each class also has words of its own, listed at the top of its file in classes/.
// If you invent a new word, use totalBonus("itsName") in the code where that number matters.

// ----- The classes -----
// Every file in classes/ adds one class to this list.
// To add a class: copy one of those files, change it, add a <script> line for it
// in index.html (above game.js), and give it a tower of its own in towers.js.
const classes = {};

// ----- The town -----
// Things the merchants sell for banked gold. They are kept forever.
// Each class has its own bank and buys its own.
//
// TO ADD ONE: add a line. It needs:
//   id       - a unique name with no spaces (used in the save, so don't rename it later)
//   name     - what the player sees
//   text     - a short description of what ONE level does
//   bonus    - what one level does (each level gives the bonus again)
//   maxLevel - how many times it can be bought
//   cost     - the price of the first level
//   growth   - each level costs this many times more than the last (2 means double)
//
// As well as the bonus words every class understands, the town can use:
//   startGear        power of the weapon you start a run with (armor starts at half)
//   potionSlots      extra potions you can carry              (1 means +1)
//   potionPower      extra potion healing                     (0.1 means +10% of your health)
//   dropChance       extra chance a monster drops an item     (0.02 means +2%)
//   autoEquip        1 = stronger equipment is equipped for you
//   favouriteGear    1 = you may pick a favourite kind of weapon
//   favouriteUpgrade 1 = you may pick a favourite upgrade
const townUpgrades = [
  { id: "autoEquip", name: "Squire", text: "Stronger equipment you find is equipped for you.", bonus: { autoEquip: 1 }, maxLevel: 1, cost: 2000, growth: 1 },
  { id: "quartermaster", name: "Quartermaster", text: "Pick a favourite kind of weapon (or shield, for the Warden). You start every run with it, and your Squire only equips that kind.", bonus: { favouriteGear: 1 }, maxLevel: 1, cost: 5000, growth: 1 },
  { id: "tactician", name: "Tactician", text: "Pick a favourite upgrade. Upgrade areas give it to you straight away, with no waiting, until it reaches its top level.", bonus: { favouriteUpgrade: 1 }, maxLevel: 1, cost: 5000, growth: 1 },
  { id: "armory", name: "Armory", text: "Start every run with +2 weapon power and +1 armor.", bonus: { startGear: 2 }, maxLevel: 10, cost: 1000, growth: 2 },
  { id: "trainingGrounds", name: "Training Grounds", text: "+5% experience.", bonus: { experience: 0.05 }, maxLevel: 10, cost: 500, growth: 2 },
  { id: "treasureMaps", name: "Treasure Maps", text: "+5% gold.", bonus: { gold: 0.05 }, maxLevel: 10, cost: 500, growth: 2 },
  { id: "luckyCharm", name: "Lucky Charm", text: "+2% chance that a monster drops equipment.", bonus: { dropChance: 0.02 }, maxLevel: 5, cost: 1500, growth: 2 },
  { id: "potionBelt", name: "Potion Belt", text: "Carry 1 more healing potion.", bonus: { potionSlots: 1 }, maxLevel: 5, cost: 800, growth: 2 },
  { id: "alchemist", name: "Alchemist", text: "Healing potions heal 10% more of your health.", bonus: { potionPower: 0.1 }, maxLevel: 4, cost: 800, growth: 2 }
];

// ----- Relics every class can find -----
// Every boss you kill gives one random relic. Relics are lost when you die.
// You can get the same relic more than once, and the bonuses stack.
// Each class also has relics of its own, in its file.
//
// TO ADD A RELIC: add a line. It needs:
//   id    - a unique name with no spaces (used in the save, so don't rename it later)
//   name  - what the player sees
//   text  - a short description
//   bonus - what it does
const relics = [
  { id: "trollHeart", name: "Troll Heart", text: "+40 health", bonus: { maxHp: 40 } },
  { id: "whetstone", name: "Whetstone of Ruin", text: "+8 attack", bonus: { attack: 8 } },
  { id: "dragonscale", name: "Dragonscale", text: "+4 armor", bonus: { armor: 4 } },
  { id: "goldenIdol", name: "Golden Idol", text: "+30% gold", bonus: { gold: 0.3 } },
  { id: "tomeOfTheFallen", name: "Tome of the Fallen", text: "+20% experience", bonus: { experience: 0.2 } }
];
