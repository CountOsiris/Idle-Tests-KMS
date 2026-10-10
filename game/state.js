// =====================================================================
//  game/state.js - Everything the game remembers: one class's progress, the account, and the
//  numbers worked out as it goes. Also small helpers and damage types.
// =====================================================================
//
//  The game's rules are split over the files in game/, loaded in this order
//  (see the script tags in index.html):
//    state, bonuses, equipment, abilities, bosses, summary, skills, save,
//    page-build, page-show, fights, feel, start
//  They all share one set of names, as if they were one long file, so the order
//  matters only for start.js, which must be last. Lists you are likely to edit
//  live elsewhere:
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

// The kind of weapon picked at the blacksmith. It is taken up at the start of the
// next run, so "weapon" (what is being used now) only changes after a fall.
let nextWeapon = "";

// How many steps the blacksmith has improved each piece of equipment,
// for example { weapon: 12, armor: 4 }. Step 12 is the second tier at +2.
let forgeLevels = { weapon: 0, armor: 0 };

// What the equipment gives right now. Worked out from forgeLevels (see recalcStats).
let weaponPower = 0;
let armorPower = 0;

let upgrades = {};
let skillLevels = {};
let chosenPerks = {};
let ownedRelics = [];

// What has been bought in town, for example { whetstone: 3, tactician: 1 },
// and the favourite upgrade picked with the Tactician ("" means none)
let townLevels = {};
let favouriteUpgrade = "";
let potions = 0;

// Which tower the class is climbing, which one it enters after its next death,
// and the best floor it has reached in each, for example { barbarian: 12, warden: 4 }
let tower = "";
let nextTower = "";
let towerBest = {};

// Ascension: how many times the class has ascended, and the best floor it has reached
// since the last one (floors above it pay fame).
let ascensions = 0;
let ascensionBest = 1;

// How long the current ascension has lasted, in seconds of play, and how the last one
// went. Shown on the page so the player can judge when it is time to ascend again.
let ascensionSeconds = 0;
let ascensionFame = 0;

// Sweeping (see data.js): the floor this run started on, whether every fight so far was
// quick, and the deepest floor reached while they were
let runStartFloor = 1;
let cruising = true;
let cruiseFloor = 1;
let lastAscensionFame = 0;
let lastAscensionSeconds = 0;

// The ids of the trophies this class has won in other towers (see towers.js)
let trophies = [];

// How many runs in a row have ended without a new best floor (see stuckAfterRuns in data.js)
let runsSinceBest = 0;

// ----- The account -----
// Fame, and what it has bought, belong to the ACCOUNT: every class earns into the
// same fame and every class is made stronger by the same fame upgrades,
// for example { might: 3, vitality: 2 }. Everything else is kept per class.
let fame = 0;
let fameLevels = {};

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
let monsterArmor = 0;       // the share of every weapon hit it blocks (0.3 means 30%)
let monsterWard = 0;        // the same, against spells
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

// What the fight before this one ended with, for keystones that carry something over:
// its damage-over-time stacks, how many turns it lasted, and (kept through a fall)
// what the class's run counter stood at
let lastFightStacks = 0;
let lastFightTurns = 0;
let lastRunCounter = 0;

// For working out progress made while the game was closed or in the background
let lastTick = Date.now();
let catchingUp = false;
let deaths = 0;

// All the experience earned since the page was opened. The "experience" number above
// is only what is left in the level bar, so it cannot say how much was earned.
let experienceEarned = 0;

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
let missedHits = 0;

// Does the monster being fought fly, and does it strike first?
let monsterFlying = false;
let monsterLunges = false;

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
// and penetration cuts it down.
function resistNow() {
  let resist = resistAmount;
  if (isAway()) {
    resist = resist + (floor - 1) * awayResistPerFloor;
  }
  resist = Math.min(maxResist, resist);
  return resist / (1 + penetration());
}

// Penetration cuts through resistance, armor and ward (see data.js). It comes from the town.
function penetration() {
  let total = totalBonus("penetration") + fameAdd("penetration");

  // A class can add its own (the Ranger's crossbow)
  if (currentClass().penetration !== undefined) {
    total = total + currentClass().penetration();
  }
  return total;
}

// What a hit of this type is multiplied by against the monster being fought
function typeMultiplier(type) {
  if (type === undefined) {
    return 1;
  }
  // (the Exploit technique makes a hit on a weakness worth more)
  if (listHasType(monsterWeak, type)) {
    boostedHits = boostedHits + 1;
    return 1 + weakAmount + totalBonus("exploit");
  }
  if (listHasType(monsterResist, type)) {
    resistedHits = resistedHits + 1;
    return 1 - resistNow();
  }
  return 1;
}

// Every kind of hit below, and damage over time, is multiplied by multiplier("damage").
// That is what makes the Might fame upgrade work for every class and every build,
// whether the damage comes from a weapon, a spell, a reflected blow or a bleed.

// Armor and ward block a share of the hit (see data.js). Penetration cuts through them.
function armorNow() {
  return monsterArmor / (1 + penetration());
}

function wardNow() {
  return monsterWard / (1 + penetration());
}

// A normal hit: the monster's armor blocks a share of it.
// "type" is the damage type, for example "slashing".
// "armorShare" can be left out. It is how much of the armor counts against this hit:
// 1 is all of it, 0.5 is half (for a hit that pierces armor).
function hitMonster(damage, type, armorShare) {
  if (armorShare === undefined) {
    armorShare = 1;
  }

  // A weapon swing can miss a flying monster. Arrows and spells cannot.
  if (monsterFlying && currentClass().ranged !== true && chance(flyingMissChance)) {
    missedHits = missedHits + 1;
    return 0;
  }

  damage = Math.max(1, Math.round(damage * multiplier("damage") * abilityDamageBoost() * typeMultiplier(type) * (1 - armorNow() * armorShare)));
  monsterHp = monsterHp - damage;
  noteDamage(type, damage);
  return damage;
}

// A spell ignores armor, but the monster's WARD blocks a share of it instead.
// Ward is to a caster what armor is to a fighter.
function spellHitMonster(damage, type) {
  damage = Math.max(1, Math.round(damage * multiplier("damage") * abilityDamageBoost() * typeMultiplier(type) * (1 - wardNow())));
  monsterHp = monsterHp - damage;
  noteDamage(type, damage);
  return damage;
}

// A hit that nothing is taken off: not armor, not ward. For damage that is not
// a weapon swing or a spell (a reflected blow, thorns, a thrown shield).
function magicHitMonster(damage, type) {
  damage = Math.max(1, Math.round(damage * multiplier("damage") * abilityDamageBoost() * typeMultiplier(type)));
  monsterHp = monsterHp - damage;
  noteDamage(type, damage);
  return damage;
}

// (What was really gained is counted for the run summary: see game/summary.js)
function healPlayer(amount) {
  let before = playerHp;
  playerHp = Math.min(playerMaxHp, playerHp + Math.round(amount));
  noteHealing(playerHp - before);
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
  return Math.round(dotStacks * currentClass().dotPerStack() * (1 + totalBonus("dotPower")) * multiplier("damage") * abilityDamageBoost() * typeMultiplier(currentClass().dotType));
}
