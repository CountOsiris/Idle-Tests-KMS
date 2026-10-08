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

// THE DEEP TOWER. Past this floor, monsters also get stronger by a fixed percentage
// every floor (1.03 means 3% more health and attack per floor, on top of the above).
// Without it a run that is going well snowballs: relics, gear and souls pile up faster
// than the monsters grow, and the run never ends. With it there is always a wall
// ahead, and the way through is the next milestone, breakthrough or ascension.
// Floors up to deepFloor are exactly as they were.
const deepFloor = 50;
const deepGrowth = 1.03;

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
// level N to the next costs N times levelCostPerLevel. Levels are bought
// automatically. What a level gives is in each class's file (perLevel),
// plus this many skill points:
const experiencePerFloor = 20;
const levelCostPerLevel = 50;
const skillPointsPerLevel = 1;

// ----- Ascension -----
// Fame is the ascension currency. Each class earns and spends its own.
// Every floor pays 1 fame the first time it is reached since the last ascension.
// Ascending starts the class again from level 1 and makes every floor pay again.
//
// To ascend, a class must first reach floor ascendFirstFloor. That floor stays the
// same for every ascension, so the first one takes a while and each one after is
// quicker, as fame upgrades make the early floors fly by. When to stop climbing and
// ascend is the player's call: deeper floors still pay fame, but slower and slower.
//
// ascendFloorStep raises the floor needed by that much after every ascension.
// It is 0, which means "never". Set it above 0 only if ascending should get harder.
const ascendFirstFloor = 10;
const ascendFloorStep = 0;

// What fame buys. These are kept forever, through every ascension.
// They are locked behind ascensions: nothing can be bought before the first
// ascension, and more upgrades appear the more times a class has ascended.
//
// TO ADD ONE: add a line. It needs:
//   id       - a unique name with no spaces (used in the save)
//   name     - what the player sees
//   text     - a short description of what ONE level does
//   unlockAt - how many times the class must have ascended before it appears
//   cost     - the price of the first level, in fame
//   growth   - each level costs this many times more than the last (1.5 means +50%)
//   maxLevel - how many times it can be bought. 0 means no limit, ever.
//              Nothing here has a limit; keep it that way unless there is a good reason.
// and one of these two:
//   multiply - multiplies something, and every level multiplies again (they compound).
//              It can multiply: attack, health, armor, experience, gold,
//              gear (the power of equipment you find)
//   add      - adds something per level. It can add:
//                startLevels      levels kept when ascending
//                pathfinder       levels of Pathfinder (see maxStartShare below)
//                healOnKill       extra healing after a kill (0.03 means +3% of your health)
//                upgradeCap       extra top levels for the upgrades picked in upgrade areas
//              Give it an addLabel too, which is how the total is described on the page,
//              and addAsPercent: true if the total should be written as a percentage.
const fameUpgrades = [
  { id: "might", name: "Might", text: "Multiplies your attack by 1.2.", unlockAt: 1, multiply: { attack: 1.2 }, cost: 6, growth: 1.45, maxLevel: 0 },
  { id: "vitality", name: "Vitality", text: "Multiplies your health and armor by 1.2.", unlockAt: 1, multiply: { health: 1.2, armor: 1.2 }, cost: 6, growth: 1.45, maxLevel: 0 },
  { id: "wisdom", name: "Wisdom", text: "Multiplies the experience you earn by 1.2.", unlockAt: 1, multiply: { experience: 1.2 }, cost: 4, growth: 1.45, maxLevel: 0 },
  { id: "fortune", name: "Fortune", text: "Multiplies the gold you earn by 1.15.", unlockAt: 1, multiply: { gold: 1.15 }, cost: 4, growth: 1.45, maxLevel: 0 },
  { id: "legacy", name: "Legacy", text: "Start every ascension 2 levels higher.", unlockAt: 2, add: { startLevels: 2 }, addLabel: "starting levels", cost: 6, growth: 1.45, maxLevel: 0 },
  { id: "pathfinder", name: "Pathfinder", text: "Start every run part of the way to your best floor since ascending. Each level closes 15% of the gap to 60%.", unlockAt: 3, add: { pathfinder: 1 }, addLabel: "of the way up", cost: 10, growth: 1.45, maxLevel: 0 },
  { id: "scavenger", name: "Scavenger", text: "Multiplies the power of equipment you find by 1.15.", unlockAt: 5, multiply: { gear: 1.15 }, cost: 8, growth: 1.45, maxLevel: 0 },
  { id: "insight", name: "Insight", text: "+25% penetration. Penetration cuts through what monsters resist, so other towers open up.", unlockAt: 4, add: { penetration: 0.25 }, addLabel: "penetration", addAsPercent: true, cost: 8, growth: 1.45, maxLevel: 0 },
  { id: "endurance", name: "Endurance", text: "Heal 3% more of your health after every kill.", unlockAt: 8, add: { healOnKill: 0.03 }, addLabel: "extra healing per kill", addAsPercent: true, cost: 10, growth: 2, maxLevel: 0 },
  { id: "mastery", name: "Mastery", text: "The upgrades you pick in upgrade areas can go 1 level higher.", unlockAt: 12, add: { upgradeCap: 1 }, addLabel: "upgrade levels", cost: 15, growth: 2, maxLevel: 0 }
];

// ----- Breakthroughs -----
// Each class has its own milestones, in its file, up to floor 100. After those,
// breakthroughs go on forever. The first is at breakthroughFirstFloor, and each one
// after is breakthroughSpacing times further (1.5 means half as far again), so they
// get rarer the deeper a class goes: 150, 225, 350, 500, 750, 1150...
//
// They are the reason to push for a new best floor now and then instead of only
// ascending quickly: each one is a big, permanent reward, kept through every ascension.
const breakthroughFirstFloor = 150;
const breakthroughSpacing = 1.5;

// Every breakthrough offers the same choice, and the player picks one each time.
// (A class adds one more choice for each of its builds: see "breakthroughs" in its file.)
// "multiply" works like the fame upgrades. It can multiply:
//   attack, health, armor, experience, gold, gear, and fame (all fame earned)
//   damageTaken (0.8 means you take 20% less damage)
//   and a class's own build words, like "bleed" or "reflect" (listed in each class file)
//
// MILESTONE PERKS in the class files can use "multiply" in exactly the same way.
// A perk can have a "bonus", a "multiply", or both.
const breakthroughPerks = [
  { id: "conqueror", name: "Conqueror", text: "attack x1.5", multiply: { attack: 1.5 } },
  { id: "colossus", name: "Colossus", text: "health and armor x1.5", multiply: { health: 1.5, armor: 1.5 } },
  { id: "scholar", name: "Scholar", text: "experience x1.5", multiply: { experience: 1.5 } },
  { id: "legend", name: "Legend", text: "fame earned x1.25", multiply: { fame: 1.25 } },
  { id: "bulwark", name: "Bulwark", text: "you take 20% less damage", multiply: { damageTaken: 0.8 } }
];

// Pathfinder starts runs part of the way to your best floor. It can be bought forever:
// every level closes this share of the remaining gap (0.85 means 15% of it is closed)...
const pathfinderFade = 0.85;

// ...to this limit, which it gets ever closer to but never reaches (0.6 means 60% of the way).
// It must stay well below 1, or runs would start right at the wall and end at once.
const maxStartShare = 0.6;

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
  { name: "Epic", chance: 0.025, power: 1.8 },
  { name: "Legendary", chance: 0.004, power: 2.5 },
  { name: "Mythic", chance: 0.001, power: 3.5 }
];

// The lowest rarity a rare monster and a boss can drop.
// 0 is ordinary, 1 is Fine, 2 is Rare, 3 is Epic...
const rareDropRarity = 1;
const bossDropRarity = 2;

// ----- Limits, and what happens past them -----
// Nothing can be bought only a set number of times. But a chance cannot go past
// certain limits, so anything bought beyond a limit "overflows" into something else.

// A monster cannot drop equipment more often than this (0.5 means half the time).
// Drop chance beyond it becomes luck, which makes the better rarities more likely.
// luckStrength says how strongly: bigger means luck matters more.
const maxDropChance = 0.5;
const luckStrength = 5;

// No chance to dodge, parry, block, stun or freeze can go above this (0.6 means 60%),
// or a character could become unkillable. Beyond it, dodge, parry and block reduce
// all damage taken instead, and stun and freeze add damage instead.
// Critical chances stop at 100%, and beyond that add critical damage.
const maxChance = 0.6;

// The Ranger's enemies cannot be kept out of reach for more than this many turns.
// Beyond it, each extra turn bought adds this much damage to the opening shots.
const maxFreeTurns = 3;
const extraOpeningDamage = 0.15;

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
//   maxHp          health                             (30 means +30)
//   attack         attack                             (5 means +5)
//   healthPercent  health, as a percentage            (0.04 means +4%)
//   attackPercent  attack, as a percentage            (0.04 means +4%)
//   dotPower       damage of bleeding, burning,
//                  poison and spirits                 (0.1 means +10%)
//   armor        damage blocked per hit         (3 means +3)
//   armorPercent armor, as a percentage         (0.04 means +4%)
//   gold         extra gold earned              (0.5 means +50%)
//   experience   extra experience on death      (0.25 means +25%)
//
// Each class also has words of its own, listed at the top of its file in classes/.
// If you invent a new word, use totalBonus("itsName") in the code where that number matters.

// ----- The classes -----
// Every file in classes/ adds one class to this list.
// To add a class: copy one of those files, change it, add a <script> line for it
// in index.html (above game.js), and give it a tower of its own in towers.js.
// ----- Damage types -----
// Every hit has a type. Monsters can be weak to some types and resist others;
// which ones is written on each monster in towers.js, like this:
//   weak: ["crushing", "holy"], resist: ["piercing"]
//
// TO ADD A TYPE: add a line here, then use its name in a class file where the
// class deals its damage (the second thing given to hitMonster or magicHitMonster).
const damageTypes = {
  slashing: "slashing",       // axes, swords, the shadow blade, a thrown bladed shield
  piercing: "piercing",       // bows, spears, daggers, a spiked shield
  crushing: "crushing",       // clubs and maces
  arcane: "arcane",           // the Warlock's tomes
  fire: "fire",               // the Elementalist's four elements
  ice: "ice",
  lightning: "lightning",
  earth: "earth",
  holy: "holy",               // the Zealot's smite, Judgement and holy tome
  nature: "nature",           // spirits, thorns and animal companions
  affliction: "bleed and poison",

  // The groups below can be used on a monster as well, to mean every type in them
  physical: "physical",
  elemental: "elemental"
};

const typeGroups = {
  physical: ["slashing", "piercing", "crushing"],
  elemental: ["fire", "ice", "lightning", "earth"]
};

const weakAmount = 0.25;            // a hit the monster is weak to deals this much more (0.25 means +25%)
const resistAmount = 0.4;           // a hit the monster resists deals this much less (0.4 means -40%)
const awayResistPerFloor = 0.005;   // in another class's tower, resistance grows this much every floor
const maxResist = 0.6;              // but never past this: nothing is ever immune

// PENETRATION cuts through resistance. It never removes it completely: what is left of
// a resistance is divided by (1 + penetration). So 1 (shown as 100%) halves it and
// 3 quarters it. There is always more to gain and no point where it stops working.
// The bonus word is "penetration" (0.1 means +10%).

const flyingMissChance = 0.25;      // a weapon swing misses a flying monster this often

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
//   maxLevel - how many times it can be bought. 1 for the helpers, which are bought once;
//              0 for everything else, which means no limit, ever.
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
//   favouriteLuck    chance a found weapon is the favourite kind (0.1 means +10%)

// Favourite luck past 100% makes the favourite kind stronger instead:
// each extra 100% adds this much power (0.5 means +50%)
const favouritePowerPerLuck = 0.5;

const townUpgrades = [
  { id: "autoEquip", name: "Squire", text: "Equips stronger equipment for you when it is the same kind you are using. Other kinds go in your backpack.", bonus: { autoEquip: 1 }, maxLevel: 1, cost: 2000, growth: 1 },
  { id: "quartermaster", name: "Quartermaster", text: "Pick a favourite kind of weapon (or shield, for the Warden). You start every run with it, and your Squire switches you to it if you are using another kind.", bonus: { favouriteGear: 1 }, maxLevel: 1, cost: 5000, growth: 1 },
  { id: "tactician", name: "Tactician", text: "Pick a favourite upgrade. Upgrade areas give it to you straight away, with no waiting, until it reaches the level limit for upgrade areas.", bonus: { favouriteUpgrade: 1 }, maxLevel: 1, cost: 5000, growth: 1 },
  { id: "weaponsmith", name: "Weaponsmith", text: "+10% chance that a weapon you find is your favourite kind (pick it with the Quartermaster). Past 100% it makes those weapons stronger instead.", bonus: { favouriteLuck: 0.1 }, maxLevel: 0, cost: 3000, growth: 1.4 },
  { id: "whetstone", name: "Whetstone", text: "+10% penetration. Penetration cuts through what monsters resist.", bonus: { penetration: 0.1 }, maxLevel: 0, cost: 2000, growth: 1.4 },
  { id: "armory", name: "Armory", text: "Start every run with +2 weapon power and +1 armor.", bonus: { startGear: 2 }, maxLevel: 0, cost: 1000, growth: 1.4 },
  { id: "trainingGrounds", name: "Training Grounds", text: "+5% experience.", bonus: { experience: 0.05 }, maxLevel: 0, cost: 500, growth: 1.4 },
  { id: "treasureMaps", name: "Treasure Maps", text: "+5% gold.", bonus: { gold: 0.05 }, maxLevel: 0, cost: 500, growth: 1.4 },
  { id: "luckyCharm", name: "Lucky Charm", text: "+4% chance that a monster drops equipment. Past 50% it makes better rarities more likely instead.", bonus: { dropChance: 0.04 }, maxLevel: 0, cost: 1500, growth: 1.4 },
  { id: "potionBelt", name: "Potion Belt", text: "Carry 1 more healing potion.", bonus: { potionSlots: 1 }, maxLevel: 0, cost: 800, growth: 1.6 },
  { id: "alchemist", name: "Alchemist", text: "Healing potions heal 10% more of your health.", bonus: { potionPower: 0.1 }, maxLevel: 0, cost: 800, growth: 1.6 }
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
