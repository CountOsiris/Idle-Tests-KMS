// =====================================================================
//  data.js - the numbers and lists that every class shares.
//  This file is loaded first. Then towers.js, then one file per class
//  from classes/, the files in game/, and cloud.js last.
// =====================================================================

// ----- Online saves -----
// The address and the public key of the Supabase project that keeps players' saves.
// Both are meant to be seen by anyone (every visitor's browser needs them), so it is
// fine that they are in this file. Leave them as "" to switch online saves off.
// cloud-setup.sql explains how the project is set up; cloud.js does the work.
const cloudUrl = "https://gjrglfcknfxzwskrjysb.supabase.co";
const cloudKey = "sb_publishable_DWJib5jsURW1dV5Q0vtMqQ_CSa4U0SF";

// ----- The difficulty curve -----
// A normal monster on floor 1 has this much health and attack...
const monsterHealth = 38;
const monsterDamage = 3.8;

// ...and both get multiplied on every floor after that:
//   strength on floor F  =  (1 + monsterGrowth x (F - 1)) to the power of monsterCurve
// monsterGrowth decides how long the whole game takes: raise it and every floor
// becomes a bigger wall, lower it and players climb faster.
//
// THE PACING THESE NUMBERS GIVE (a bot playing a fresh class, measured October 2026):
//   floor 10 in about 20 minutes, 15 in 45 minutes (the first ascension), 20 in 1.5 hours,
//   30 in 2.5 to 4 hours, then the first wall at 35, reached after 4 to 7 hours and
//   broken at 9 to 13. Floors 40 and 45 follow quickly, and the next wall is at 50.
// The first hours must never stall: if you change the numbers, keep it that way.
const monsterGrowth = 0.22;
const monsterCurve = 2;

// THE CLIMB GETS STEEPER. From midFloor up to deepFloor, monsters also get stronger by a
// small fixed percentage every floor (1.05 means 5% more health and attack per floor).
// This is what makes progress slow down, and slow down further, until the next
// milestone gives a jump in power and the climb speeds up again.
// Floors up to midFloor are exactly as the formula above says.
const midFloor = 20;
const midGrowth = 1.05;

// How much stronger a boss is than an ordinary monster of its floor.
// A big number here makes every boss a wall: nothing happens for hours, then several
// floors fall at once. A smaller one lets the floors themselves do the slowing down.
const bossHealth = 2.2;
const bossAttack = 1.3;

// THE DEEP TOWER. Past this floor, monsters also get stronger by a fixed percentage
// every floor (1.03 means 3% more health and attack per floor, on top of the above).
// Without it a run that is going well snowballs: relics, gear and souls pile up faster
// than the monsters grow, and the run never ends. With it there is always a wall
// ahead, and the way through is the next milestone, breakthrough or ascension.
// Floors up to deepFloor are exactly as they were.
const deepFloor = 50;
const deepGrowth = 1.03;

// THE WALLS. An idle game should speed up, hit a wall, and speed up again once the
// wall is broken. These are the walls: from each floor here on, every monster in the
// tower is this many times stronger (1.5 means +50% health and attack), all at once.
// Between two walls the climb is quick; at a wall it stops until the class has grown
// (levels, the blacksmith, fame), and the milestones just past it are the reward.
//
// TO MOVE OR ADD A WALL: change this list. Keep the first one deep enough that nobody
// meets it in their first few hours. They stack: floor 60 is past the first two.
const towerWalls = [
  { floor: 35, strength: 1.5 },
  { floor: 50, strength: 2 },
  { floor: 75, strength: 2 },
  { floor: 100, strength: 2 }
];

// ARMOR AND WARD are a SHARE of every hit, not a fixed number, so they matter just as
// much against a hit of 50,000 as against a hit of 50.
//   - armor is taken off weapon hits. Spells ignore it.
//   - ward is taken off spells. Weapons ignore it.
// Every monster has an "armor" number in towers.js (and a tower or monster can have a
// "ward"). Each point of it blocks armorPerPoint of the hit (0.1 means 10%), so armor 3
// blocks 30%. Nothing blocks more than maxArmorShare (0.6 means 60%).
// Penetration cuts through both, the same way it cuts through resistance.
const armorPerPoint = 0.1;
const maxArmorShare = 0.6;

// YOUR ARMOR is a rating, and the share of each hit it blocks is worked out from it:
//   share blocked  =  maxArmorShare x armor / (armor + armorHalf)
//   armorHalf      =  armorHalfBase + armorHalfPerFloor x the floor you are on
// So armor always helps, every point a little less than the one before, and it never
// quite reaches maxArmorShare. Deeper floors need more armor for the same share:
// on floor 35, 40 armor blocks about 28% and 100 armor about 41%.
const armorHalfBase = 10;
const armorHalfPerFloor = 1;

// ----- Rewards -----
// Gold from a normal monster is this much per floor. Bosses, rare monsters
// and chests multiply it.
const goldPerFloor = 1;
const bossGold = 5;
const rareGold = 3;
const chestGold = 4;

// Dying pays this much experience per floor reached, and going from
// level N to the next costs N times levelCostPerLevel. Levels are bought
// automatically. What a level gives is in each class's file (perLevel),
// plus this many skill points:
const experiencePerFloor = 20;
const levelCostPerLevel = 50;
const skillPointsPerLevel = 1;

// SKILL RANKS. Every skillRankSize levels a skill gains a rank. Each rank makes the
// whole skill skillRankPower stronger (0.5 means +50% of everything it gives), and
// makes every later level cost one more skill point:
//   levels 1 to 10 cost 1 point each, 11 to 20 cost 2, 21 to 30 cost 3...
//   at level 10 the skill is x1.5, at level 20 it is x2, at level 30 it is x2.5...
// So the first ranks of several skills are cheap, and going deep in one is a choice.
const skillRankSize = 10;
const skillRankPower = 0.5;

// ----- Ascension -----
// Fame is the ascension currency. It belongs to the ACCOUNT: every class earns into
// the same fame, and what fame buys makes every class stronger.
// Every floor pays 1 fame the first time a class reaches it since that class last ascended.
// Ascending starts the class again from level 1 and makes every floor pay again.
//
// To ascend, a class must first reach floor ascendFirstFloor. That floor stays the
// same for every ascension, so the first one takes a while and each one after is
// quicker, as fame upgrades make the early floors fly by. When to stop climbing and
// ascend is the player's call: deeper floors still pay fame, but slower and slower.
//
// ascendFloorStep raises the floor needed by that much after every ascension.
// It is 0, which means "never". Set it above 0 only if ascending should get harder.
const ascendFirstFloor = 15;
const ascendFloorStep = 0;

// BOSS FAME: the reliable way to earn fame. From floor fameBossFloor up, every boss
// pays fame EVERY time it is beaten, so there is always fame to be had, even when a
// class is stuck at a wall and no floor is new. Deeper bosses pay more:
//   fame from the boss on floor F  =  bossFame x (F / fameBossFloor) to the power of bossFameCurve
// With the numbers below: floor 15 pays 0.3, floor 30 pays 0.7, floor 50 pays 1.3, floor 100 pays 2.9.
// Raise bossFame for more fame from every boss; raise bossFameCurve to reward depth more.
const fameBossFloor = 15;
const bossFame = 0.3;
const bossFameCurve = 1.2;

// What fame buys. These are kept forever, through every ascension, by every class.
// EVERY ONE IS A STRAIGHT MULTIPLIER that works the same for every class and every
// build, and every level multiplies again (three levels of x1.2 is x1.73).
//
// TO ADD ONE: add a line. It needs:
//   id       - a unique name with no spaces (used in the save)
//   name     - what the player sees
//   text     - a short description of what ONE level does
//   unlockAt - how many ascensions the account needs (all classes added together)
//              before it appears
//   cost     - the price of the first level, in fame
//   growth   - each level costs this many times more than the last (1.45 means +45%)
//   maxLevel - how many times it can be bought. 0 means no limit, ever.
//   multiply - what it multiplies. It can multiply:
//                damage      everything the class deals: weapon hits, spells, reflected
//                            blows, bleeding, burning and poison. Use this, not attack,
//                            for anything meant to help every build.
//                health, armor, experience, gold
//                gear        the power of the weapon and armor
//                attack      the attack number only (some builds barely use it)
//
// CATCHING UP: a class gets the full power of only as many levels of each upgrade as
// it has ascended ITSELF. Levels beyond that work at this share of their power until
// the class catches up (0.25 means a quarter; 1 would mean no catching up at all).
// A class that has ascended once gets level 1 of everything in full, and so on.
const fameCatchUpShare = 0.25;

// (Legacy, Pathfinder, Insight, Endurance and Mastery were sold here before fame was
// shared. They added things instead of multiplying, so they are gone, and the fame
// spent on them was given back: see upgradeSave in game/save.js. Don't reuse their ids.)
const fameUpgrades = [
  { id: "might", name: "Might", text: "Multiplies all the damage you deal by 1.2.", unlockAt: 1, multiply: { damage: 1.2 }, cost: 6, growth: 1.45, maxLevel: 0 },
  { id: "vitality", name: "Vitality", text: "Multiplies your health and armor by 1.2.", unlockAt: 1, multiply: { health: 1.2, armor: 1.2 }, cost: 6, growth: 1.45, maxLevel: 0 },
  { id: "wisdom", name: "Wisdom", text: "Multiplies the experience you earn by 1.2.", unlockAt: 1, multiply: { experience: 1.2 }, cost: 4, growth: 1.45, maxLevel: 0 },
  { id: "fortune", name: "Fortune", text: "Multiplies the gold you earn by 1.15.", unlockAt: 1, multiply: { gold: 1.15 }, cost: 4, growth: 1.45, maxLevel: 0 },
  { id: "scavenger", name: "Craftsmanship", text: "Multiplies the power of your weapon and armor by 1.15.", unlockAt: 2, multiply: { gear: 1.15 }, cost: 8, growth: 1.45, maxLevel: 0 }
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

// ----- Trials -----
// Milestones every class has, at the floors between the class's own ones. They are
// what turns a slow stretch of the tower back into a fast one: each multiplies your
// power, and the player picks which kind.
// TO ADD ONE: add a block with a floor that no class milestone uses.
// (Never change the floor of one that exists: saves remember perks by their floor.)
const trialMilestones = [
  {
    floor: 15,
    perks: [
      { id: "trialPower", name: "Trial of Power", text: "attack x1.4", multiply: { attack: 1.4 } },
      { id: "trialEndurance", name: "Trial of Endurance", text: "health and armor x1.4", multiply: { health: 1.4, armor: 1.4 } },
      { id: "trialBalance", name: "Trial of Balance", text: "attack, health and armor x1.2", multiply: { attack: 1.2, health: 1.2, armor: 1.2 } }
    ]
  },
  {
    floor: 25,
    perks: [
      { id: "trialPower", name: "Trial of Power", text: "attack x1.5", multiply: { attack: 1.5 } },
      { id: "trialEndurance", name: "Trial of Endurance", text: "health and armor x1.5", multiply: { health: 1.5, armor: 1.5 } },
      { id: "trialBalance", name: "Trial of Balance", text: "attack, health and armor x1.25", multiply: { attack: 1.25, health: 1.25, armor: 1.25 } }
    ]
  },
  {
    floor: 40,
    perks: [
      { id: "trialPower", name: "Trial of Power", text: "attack x1.6", multiply: { attack: 1.6 } },
      { id: "trialEndurance", name: "Trial of Endurance", text: "health and armor x1.6", multiply: { health: 1.6, armor: 1.6 } },
      { id: "trialBalance", name: "Trial of Balance", text: "attack, health and armor x1.3", multiply: { attack: 1.3, health: 1.3, armor: 1.3 } }
    ]
  },
  {
    floor: 60,
    perks: [
      { id: "trialPower", name: "Trial of Power", text: "attack x1.8", multiply: { attack: 1.8 } },
      { id: "trialEndurance", name: "Trial of Endurance", text: "health and armor x1.8", multiply: { health: 1.8, armor: 1.8 } },
      { id: "trialBalance", name: "Trial of Balance", text: "attack, health and armor x1.35", multiply: { attack: 1.35, health: 1.35, armor: 1.35 } }
    ]
  },
  {
    floor: 90,
    perks: [
      { id: "trialPower", name: "Trial of Power", text: "attack x2", multiply: { attack: 2 } },
      { id: "trialEndurance", name: "Trial of Endurance", text: "health and armor x2", multiply: { health: 2, armor: 2 } },
      { id: "trialBalance", name: "Trial of Balance", text: "attack, health and armor x1.4", multiply: { attack: 1.4, health: 1.4, armor: 1.4 } }
    ]
  }
];

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

// ----- Sweeping through the easy floors -----
// Once a class is far stronger than the early floors, climbing them again every run is
// wasted time. So a run remembers how far it got WITHOUT SLOWING DOWN: every fight won
// in cruiseTurns turns or fewer. The next run starts on that floor, and you sweep up to
// it at once, with the boons of the bosses you pass. Swept floors pay no gold and no
// experience: the run that first climbed them was paid for them, and paying again on
// every death would turn dying quickly at a wall into the fastest way to grow.
//   - A run that slows down at its very first fight was started too high: the next one
//     starts half as high.
//   - After ascending, and on entering another tower, runs start on floor 1 again.
const cruiseTurns = 2;

// ----- Abilities -----
// Special moves on a cooldown (each class's list is in its file; the rules are in
// game/abilities.js). A class opens one ability slot on each of these floors.
const abilitySlotFloors = [10, 35, 75];

// ----- Boss mechanics -----
// From this floor up, a boss can have a rule of its own that changes how the fight
// goes (the rules themselves are in game/bosses.js). Which boss has which is written
// on the boss in towers.js:  mechanics: ["shield"]
// Bosses below this floor fight plainly, so a new player's first boss has nothing to learn.
const bossMechanicsFloor = 10;

// TO CHANGE A MECHANIC: change its numbers here. The words the player reads are
// written from these numbers, so they never fall out of step.
//   shield   below "below" of its health, once a fight, it takes "blocks" less damage for "turns" turns
//   summons  at each share of its health in "at", it calls a minion with "health" of the
//            boss's health. The minion must die before the boss can be hurt again, and
//            while it stands the boss's attack is "attack" higher (0.3 means +30%).
//   enrage   after "afterTurns" turns, its attack is multiplied by "attack"
//   reflect  hurting it hurts you. Taking off ALL of its health costs you "attacks" of its
//            attacks, spread over the fight; a class that fights from range takes "rangedShare" of that.
//            Armor and damage resistance work on it. (At 3 attacks with no armor against it,
//            killing such a boss in one hit killed the player too: measured, October 2026.)
//   armorUp  its armor blocks "perTurn" more of every weapon hit each turn, up to "most"
const bossMechanics = {
  shield: { name: "Shield phase", icon: "🛡️", below: 0.5, blocks: 0.75, turns: 5 },
  summons: { name: "Summons", icon: "👥", at: [0.66, 0.33], health: 0.1, attack: 0.3 },
  enrage: { name: "Enrage timer", icon: "💢", afterTurns: 20, attack: 2 },
  reflect: { name: "Reflect aura", icon: "🌵", attacks: 2, rangedShare: 0.5 },
  armorUp: { name: "Armor up", icon: "⛓️", perTurn: 0.04, most: 0.8 }
};

// How much of your health comes back after every kill (0.2 means a fifth)
const healOnKill = 0.2;

// ----- The blacksmith -----
// Equipment is never found and never lost. A class has one weapon and one piece of
// armor, and the blacksmith in town improves them for banked gold, one step at a time:
//   Bronze Axe, Bronze Axe +1 ... Bronze Axe +9, then Iron Axe, Iron Axe +1 ...
//
// TO ADD A TIER: add a name to the end of this list. (Past the last tier the number
// just keeps climbing: +10, +11... so there is never a top.)
// The colours are in style.css: rarity-0 is the first tier here, rarity-1 the second...
const gearTiers = ["Bronze", "Iron", "Steel", "Mithril", "Adamant", "Runic"];

// How many steps a tier has before the next one begins (10 means +0 to +9)
const forgeStepsPerTier = 10;

// The first step costs forgeCost gold, and every step after costs forgeCostGrowth
// times more than the last (1.3 means +30%).
const forgeCost = 25;
const forgeCostGrowth = 1.3;

// A weapon's attack. Each tier is forgeTierPower times the one before, and each +1
// inside a tier adds forgePlusPower of the tier's power:
//   attack  =  forgeBasePower x forgeTierPower ^ tier x (1 + forgePlusPower x plus)
// So +1 to +9 are small steps (+6% each), and a new tier is a JUMP: Bronze +9 gives
// 7.7, Iron +0 gives 9.5, and Iron +9 gives 14.6. Armor has half of that.
const forgeBasePower = 5;
const forgeTierPower = 1.9;
const forgePlusPower = 0.06;

// ----- Limits, and what happens past them -----
// Nothing can be bought only a set number of times. But a chance cannot go past
// certain limits, so anything bought beyond a limit "overflows" into something else.

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

// Rare monsters are tougher, but pay more gold
const rareChance = 0.1;

// After this many turns a fight "drags on" and the monster hits harder
// every turn, so that no fight can last forever
const longFightTurns = 30;

// In another class's tower, monsters have this much more health and attack,
// and dying there pays this much more experience (0.5 means +50%)
const awayTowerHealth = 1;
const awayTowerAttack = 0.5;
const awayTowerExperience = 0.5;

// Every boss gives one boon that suits the weapon being used. A boon has NO top level:
// the same one can be given again and again, for as long as the run lasts.

// As well as what it says, every level of every boss upgrade held makes the class
// this much stronger for the rest of the run (0.1 means +10% attack and health each).
// This is what makes a boss kill felt straight away, whatever the upgrade was.
const bossUpgradePower = 0.1;

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
// in index.html (above the game/ files), and give it a tower of its own in towers.js.
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

// PENETRATION cuts through resistance, armor and ward. It never removes them completely:
// what is left of each is divided by (1 + penetration). So 1 (shown as 100%) halves it and
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
//   potionSlots      extra potions you can carry              (1 means +1)
//   potionPower      extra potion healing                     (0.1 means +10% of your health)
//   favouriteUpgrade 1 = you may pick a favourite upgrade
//
// (The Squire, Quartermaster, Weaponsmith, Armory and Lucky Charm were sold here while
// equipment was still found in the tower. They are gone, and what players paid for
// them was given back: see upgradeSave in game/save.js. Don't reuse their ids.)

const townUpgrades = [
  { id: "tactician", name: "Tactician", text: "Pick a favourite boon. Bosses give you that one every time, whenever it suits your weapon.", bonus: { favouriteUpgrade: 1 }, maxLevel: 1, cost: 5000, growth: 1 },
  { id: "whetstone", name: "Whetstone", text: "+10% penetration. Penetration cuts through everything a monster blocks: its armor, its ward, and the damage types it resists.", bonus: { penetration: 0.1 }, maxLevel: 0, cost: 2000, growth: 1.4 },
  { id: "trainingGrounds", name: "Training Grounds", text: "+5% experience.", bonus: { experience: 0.05 }, maxLevel: 0, cost: 500, growth: 1.4 },
  { id: "treasureMaps", name: "Treasure Maps", text: "+5% gold.", bonus: { gold: 0.05 }, maxLevel: 0, cost: 500, growth: 1.4 },
  { id: "potionBelt", name: "Potion Belt", text: "Carry 1 more healing potion.", bonus: { potionSlots: 1 }, maxLevel: 0, cost: 800, growth: 1.6 },
  { id: "alchemist", name: "Alchemist", text: "Healing potions heal 10% more of your health.", bonus: { potionPower: 0.1 }, maxLevel: 0, cost: 800, growth: 1.6 }
];

// ----- Relics every class can find -----
// Every boss you kill gives one random relic that suits your weapon. Relics are lost when you die.
// You can get the same relic more than once, and the bonuses stack.
// Each class also has relics of its own, in its file.
//
// TO ADD A RELIC: add a line. It needs:
//   id    - a unique name with no spaces (used in the save, so don't rename it later)
//   name  - what the player sees
//   text  - a short description
//   bonus - what it does
const relics = [
  { id: "trollHeart", name: "Troll Heart", text: "+10% health", bonus: { healthPercent: 0.1 } },
  { id: "whetstone", name: "Edge of Ruin", text: "+10% attack", bonus: { attackPercent: 0.1 } },
  { id: "dragonscale", name: "Dragonscale", text: "+4 armor", bonus: { armor: 4 } },
  { id: "goldenIdol", name: "Golden Idol", text: "+30% gold", bonus: { gold: 0.3 } },
  { id: "tomeOfTheFallen", name: "Tome of the Fallen", text: "+20% experience", bonus: { experience: 0.2 } }
];
