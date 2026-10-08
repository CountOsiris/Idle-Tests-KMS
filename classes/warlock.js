// =====================================================================
//  The Warlock - arcane magic, a pure glass cannon
// =====================================================================
// Bonus words only the Warlock uses:
//   critChance   arcane tome critical chance                       (0.1 means +10%)
//   critPower    extra damage of a critical                         (0.5 means +50%)
//   voidRend     void power: the void tome tears away a share of the enemy's
//                health. More power means a bigger share, but never more
//                than maxVoidShare (see voidShare below)              (0.01 means +1 void power)
//   echoChance   rune tome chance to cast twice                     (0.1 means +10%)
//   echoPower    rune tome: extra damage of an echo                 (0.08 means +8%)
//   voidHeal     void tome: health healed by every spell            (0.002 means +0.2% of your health)
//   soulPower    extra damage for every 100 souls held              (0.2 means +20%)
//   soulChance   chance of an extra soul from a kill                (0.1 means +10%)
//
// The four ways to build a Warlock:
//   Arcanist    (arcane tome) - critical hits, and ever bigger ones.
//   Void Caller (void tome)   - tears away a share of the enemy's health. Best against the biggest enemies.
//   Runemaster  (rune tome)   - spells that echo, again and again.
//   Soul Reaper (any tome)    - every kill in a run is a soul, and every soul makes spells stronger.
//                               Weak at the start of a run, frightening at the end of one.
//
// See classes/barbarian.js for what each list is for.

classes.warlock = {
  name: "Warlock",
  icon: "📖",
  art: "art/warlock.png",
  text: "Master of arcane magic, read from a tome. Fragile, but every spell ignores armor.",
  perLevel: { maxHp: 6, attack: 2.5 },
  base: { maxHp: 60, attack: 12, critChance: 0.25, critPower: 1.5, voidRend: 0.09, echoChance: 0.4, soulPower: 0.2, voidHeal: 0.015 },

  gearLabel: "Tome",
  gearTypes: { arcane: "Arcane Tome", void: "Void Tome", rune: "Rune Tome" },

  upgrades: [
    { id: "arcanePower", name: "Arcane Power", text: "+4 attack", bonus: { attack: 4 } },
    { id: "manaShield", name: "Mana Shield", text: "+15 health", bonus: { maxHp: 15 } },
    { id: "focus", name: "Focus", text: "Arcane Tome: +5% critical chance", bonus: { critChance: 0.05 } },
    { id: "devour", name: "Devour", text: "Void Tome: +2 void power", bonus: { voidRend: 0.02 } },
    { id: "resonance", name: "Resonance", text: "Rune Tome: +5% chance to cast twice", bonus: { echoChance: 0.05 } },
    { id: "soulJar", name: "Soul Jar", text: "+25% chance of an extra soul from a kill", bonus: { soulChance: 0.25 } }
  ],

  skills: [
    { id: "intellect", name: "Intellect", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "warding", name: "Warding", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "criticalFocus", name: "Critical Focus", text: "Arcane Tome: +10% critical damage", bonus: { critPower: 0.1 }, cost: 1 },
    { id: "arcaneMastery", name: "Arcane Mastery", text: "Arcane Tome: +3% critical chance", bonus: { critChance: 0.03 }, cost: 2 },
    { id: "voidMastery", name: "Void Mastery", text: "Void Tome: +1 void power", bonus: { voidRend: 0.01 }, cost: 2 },
    { id: "runeMastery", name: "Rune Mastery", text: "Rune Tome: +3% chance to cast twice", bonus: { echoChance: 0.03 }, cost: 2 },
    { id: "siphon", name: "Siphon", text: "Void Tome: every spell heals 0.2% of your health", bonus: { voidHeal: 0.002 }, cost: 1 },
    { id: "runicPower", name: "Runic Power", text: "Rune Tome: echoes deal +8% damage", bonus: { echoPower: 0.08 }, cost: 1 },
    { id: "harvester", name: "Harvester", text: "+2.5% damage for every 100 souls", bonus: { soulPower: 0.025 }, cost: 1 },
    { id: "reaper", name: "Reaper", text: "+5% chance of an extra soul from a kill", bonus: { soulChance: 0.05 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "ward", name: "Ward", text: "+25 health", bonus: { maxHp: 25 } },
        { id: "surge", name: "Surge", text: "+6 attack", bonus: { attack: 6 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "overload", name: "Overload", text: "+50% critical damage", bonus: { critPower: 0.5 } },
        { id: "shimmer", name: "Shimmer", text: "+3 armor", bonus: { armor: 3 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "archmage", name: "Archmage", text: "Arcane Tome: +10% critical chance", bonus: { critChance: 0.1 } },
        { id: "voidCaller", name: "Void Caller", text: "Void Tome: +4 void power", bonus: { voidRend: 0.04 } },
        { id: "runemaster", name: "Runemaster", text: "Rune Tome: +10% chance to cast twice", bonus: { echoChance: 0.1 } },
        { id: "soulReaper", name: "Soul Reaper", text: "+20% damage for every 100 souls", bonus: { soulPower: 0.2 } }
      ]
    },
    {
      floor: 35,
      perks: [
        { id: "plunderer", name: "Plunderer", text: "+50% gold", bonus: { gold: 0.5 } },
        { id: "veteran", name: "Veteran", text: "+25% experience", bonus: { experience: 0.25 } }
      ]
    },
    {
      floor: 50,
      perks: [
        { id: "cataclysm", name: "Cataclysm", text: "+40% attack and +50% critical damage", bonus: { attackPercent: 0.4, critPower: 0.5 } },
        { id: "lichForm", name: "Lich Form", text: "+50% health and +5 armor", bonus: { healthPercent: 0.5, armor: 5 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "arcaneMight", name: "Arcane Might", text: "+60% attack", bonus: { attackPercent: 0.6 } },
        { id: "arcaneBarrier", name: "Arcane Barrier", text: "+90% health", bonus: { healthPercent: 0.9 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "annihilation", name: "Annihilation", text: "+40% attack and +100% critical damage", bonus: { attackPercent: 0.4, critPower: 1 } },
        { id: "voidLord", name: "Void Lord", text: "+125% health and Void Tome: +6 void power", bonus: { healthPercent: 1.25, voidRend: 0.06 } }
      ]
    }
  ],

  relics: [
    { id: "magesEye", name: "Mage's Eye", text: "Arcane Tome: +8% critical chance", bonus: { critChance: 0.08 } },
    { id: "voidShard", name: "Void Shard", text: "Void Tome: +2 void power", bonus: { voidRend: 0.02 } },
    { id: "echoStone", name: "Echo Stone", text: "Rune Tome: +8% chance to cast twice", bonus: { echoChance: 0.08 } },
    { id: "soulLantern", name: "Soul Lantern", text: "+10% damage for every 100 souls", bonus: { soulPower: 0.1 } }
  ],

  startRun: warlockStartRun,
  whenKill: warlockWhenKill,
  attack: warlockAttack,
  whenAttacked: warlockWhenAttacked,
  dotPerStack: warlockDotPerStack,
  statLine: warlockStatLine,
  gearInfo: warlockGearInfo
};

// A kill in the tower is worth this many souls
const soulsPerKill = 1;
const soulsPerFloorSkipped = 3;   // souls you start with for each floor the Pathfinder skips

// The share of extra damage the souls held are giving
function soulBonus() {
  return runCounter / 100 * totalBonus("soulPower");
}

// Runs when a run starts. Skipped floors still count: you reaped them on the way up.
function warlockStartRun() {
  runCounter = (floor - 1) * soulsPerFloorSkipped;
}

// Runs after every kill. Soul chance: each full 100% is one more soul for certain,
// and what is left over is the chance of another.
function warlockWhenKill() {
  let gained = soulsPerKill + Math.floor(totalBonus("soulChance"));
  if (chance(totalBonus("soulChance") % 1)) {
    gained = gained + 1;
  }
  runCounter = runCounter + gained;
}

// The share of the enemy's full health one void spell tears away. Void power always
// adds to it, but less and less, so it creeps toward maxVoidShare and never reaches it.
const maxVoidShare = 0.25;

function voidShare() {
  let power = totalBonus("voidRend");
  return maxVoidShare * power / (power + maxVoidShare);
}

// One spell. "power" is 1 for a normal cast, and more for a stronger one.
function warlockCast(power) {
  let damage = playerAttack;

  if (weapon === "arcane" && chance(totalBonus("critChance"))) {
    // Critical chance past 100% adds to the critical damage instead
    damage = damage * (1 + totalBonus("critPower") + overflow("critChance", 1));
    say("An arcane critical!");
  }

  // Every soul held makes the spell stronger
  damage = damage * power * (1 + soulBonus());

  // The void tears away a share of the enemy's full health, and can feed you.
  // Souls do NOT strengthen this part: a share of the enemy's health that kept
  // growing would end up killing everything in one hit, on any floor, forever.
  if (weapon === "void") {
    damage = damage + monsterMaxHp * voidShare();
    healPlayer(playerMaxHp * totalBonus("voidHeal"));
  }

  // Spells ignore armor
  magicHitMonster(damage);
}

function warlockAttack() {
  warlockCast(1);

  // Echo: each full 100% of chance is one guaranteed extra cast, and what is
  // left over is the chance of one more
  if (weapon === "rune") {
    let echoes = Math.floor(totalBonus("echoChance"));
    if (chance(totalBonus("echoChance") - echoes)) {
      echoes = echoes + 1;
    }
    if (echoes > 0) {
      say("The spell echoes!");
    }
    for (let i = 0; i < echoes; i++) {
      warlockCast(1 + totalBonus("echoPower"));
    }
  }
}

function warlockWhenAttacked() {
  return false;
}

// The Warlock has no damage over time
function warlockDotPerStack() {
  return 0;
}

function warlockStatLine() {
  return "Souls: " + big(runCounter) + ", making your spells " + percent(soulBonus()) + " stronger. Every kill is a soul; they are lost when you fall.";
}

function warlockGearInfo() {
  if (weapon === "arcane") {
    return "Arcane Tome: " + percent(Math.min(1, totalBonus("critChance"))) + " chance of a critical for +" + percent(totalBonus("critPower") + overflow("critChance", 1)) + " damage.";
  }
  if (weapon === "void") {
    return "Void Tome: every spell also tears away " + percent(voidShare()) + " of the enemy's full health (" + Math.round(totalBonus("voidRend") * 100) + " void power; the share can never pass " + percent(maxVoidShare) + "), and heals " + percent(totalBonus("voidHeal")) + " of yours.";
  }
  return "Rune Tome: " + percent(totalBonus("echoChance")) + " chance to cast twice. Echoes deal +" + percent(totalBonus("echoPower")) + " damage.";
}
