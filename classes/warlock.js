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
//   (soulPower and soulChance were here until October 2026: see "Souls" below)
//
//
// Words a perk can MULTIPLY (see "multiply" in data.js):
//   arcaneCrit  the extra damage of an arcane tome's critical hits
//   void        every spell cast from a void tome
//   echo        every echo of a rune tome
//
//
// The four ways to build a Warlock:
//   Arcanist    (arcane tome) - critical hits, and ever bigger ones.
//   Void Caller (void tome)   - tears away a share of the health the enemy has left. Best against the biggest enemies.
//   Runemaster  (rune tome)   - spells that echo, again and again.
//   Soul Reaper (any tome)    - plain power for any tome: the perks named for souls.
//
//
// See classes/barbarian.js for what each list is for.

classes.warlock = {
  name: "Warlock",
  icon: "📖",
  art: "art/warlock.png",
  fervour: "Souls",
  text: "Master of arcane magic, read from a tome. Fragile, but every spell ignores armor.",
  perLevel: { maxHp: 6, attack: 2.5 },
  base: { maxHp: 60, attack: 12, critChance: 0.25, critPower: 1.5, voidRend: 0.09, echoChance: 0.4, voidHeal: 0.015 },

  gearLabel: "Tome",

  // A caster's spells reach a flying monster as easily as any other
  ranged: true,
  healLabel: "Void Tome",     // what the class's own healing is called in the run summary
  gearTypes: { arcane: "Arcane Tome", void: "Void Tome", rune: "Rune Tome" },
  gearIcons: { arcane: "📘", void: "📓", rune: "📕" },
  // Tomes are not made of bronze: these are the names of their tiers at the blacksmith
  // (see gearTiers in data.js; keep the list the same length as that one)
  gearTiers: ["Tattered", "Bound", "Gilded", "Runed", "Eldritch", "Forbidden"],

  upgrades: [
    { id: "arcanePower", name: "Arcane Power", text: "+6% attack", bonus: { attackPercent: 0.06 } },
    { id: "manaShield", name: "Mana Shield", text: "+5% health", bonus: { healthPercent: 0.05 } },
    { id: "focus", name: "Focus", text: "Arcane Tome: +5% critical chance", build: "arcane", bonus: { critChance: 0.05 } },
    { id: "devour", name: "Devour", text: "Void Tome: +2 void power (every spell tears away more of the health the enemy has left)", build: "void", bonus: { voidRend: 0.02 } },
    { id: "resonance", name: "Resonance", text: "Rune Tome: +5% chance to cast twice (the second cast is an echo)", build: "rune", bonus: { echoChance: 0.05 } },
    { id: "soulJar", name: "Soul Jar", text: "+4% attack and +4% health", bonus: { attackPercent: 0.04, healthPercent: 0.04 } }
  ],

  // One skill for each build, so there is never a question of where a build's points go
  skills: [
    { id: "intellect", name: "Power", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "warding", name: "Toughness", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "arcaneMastery", name: "Arcane Mastery", text: "Arcane Tome: +1% critical chance and +2.5% critical damage", bonus: { critChance: 0.01, critPower: 0.025 }, cost: 1 },
    { id: "voidMastery", name: "Void Mastery", text: "Void Tome: +0.6 void power, and every spell heals 0.1% more of your health", bonus: { voidRend: 0.006, voidHeal: 0.001 }, cost: 1 },
    { id: "runeMastery", name: "Rune Mastery", text: "Rune Tome: +1% chance to cast twice, and the second cast (the echo) deals +2.5% damage", bonus: { echoChance: 0.01, echoPower: 0.025 }, cost: 1 },
    { id: "harvester", name: "Soul Mastery", text: "+2% attack and +1.5% health", bonus: { attackPercent: 0.02, healthPercent: 0.015 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "ward", name: "Ward", text: "health x1.1", multiply: { health: 1.1 } },
        { id: "surge", name: "Surge", text: "attack x1.1", multiply: { attack: 1.1 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "overload", name: "Overload", text: "Arcane Tome: +50% critical damage", bonus: { critPower: 0.5 } },
        { id: "shimmer", name: "Shimmer", text: "+3 armor", bonus: { armor: 3 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "archmage", name: "Archmage", text: "Arcane Tome: +10% critical chance", bonus: { critChance: 0.1 } },
        { id: "voidCaller", name: "Void Caller", text: "Void Tome: +4 void power", bonus: { voidRend: 0.04 } },
        { id: "runemaster", name: "Runemaster", text: "Rune Tome: +10% chance to cast twice", bonus: { echoChance: 0.1 } },
        { id: "soulReaper", name: "Soul Reaper", text: "+25% attack and +15% health", bonus: { attackPercent: 0.25, healthPercent: 0.15 } }
      ]
    },
    {
      floor: 35,
      perks: [
        { id: "plunderer", name: "Plunderer", text: "gold x2, and the gear the blacksmith makes is 10% stronger", multiply: { gold: 2, gear: 1.1 } },
        { id: "veteran", name: "Veteran", text: "+25% experience", bonus: { experience: 0.25 } }
      ]
    },
    {
      floor: 50,
      perks: [
        { id: "cataclysm", name: "Cataclysm", text: "Arcane Tome: the extra damage of critical hits x1.7, and +10% critical chance", bonus: { critChance: 0.1 }, multiply: { arcaneCrit: 1.7 } },
        { id: "lichForm", name: "Lich Form", text: "health x1.5 and armor x1.4", multiply: { health: 1.5, armor: 1.4 } },
        { id: "hungeringVoid", name: "Hungering Void", text: "Void Tome: spell damage x1.5, and every spell heals 0.5% more of your health", bonus: { voidHeal: 0.005 }, multiply: { void: 1.5 } },
        { id: "runicStorm", name: "Runic Storm", text: "Rune Tome: echo damage x1.6, and +15% chance to cast twice", bonus: { echoChance: 0.15 }, multiply: { echo: 1.6 } },
        { id: "soulCollector", name: "Soul Collector", text: "attack x1.2, and every kill makes all your damage 0.5% stronger for the rest of the run (up to +100%)", bonus: { killStreak: 0.005 }, multiply: { attack: 1.2 } }
      ]
    },
    // KEYSTONES: each changes a rule of one weapon, and costs something. This milestone is
    // optional: pick one, or none (press the chosen one again to let it go).
    // See "Keystones" in data.js.
    {
      floor: 51,
      keystones: true,
      perks: [
        { id: "overchannel", name: "Overchannel", keystone: true, text: "Arcane Tome: every third spell of a fight is a certain critical hit. You take 20% more damage", bonus: { overchannel: 1 }, multiply: { damageTaken: 1.2 } },
        { id: "eventHorizon", name: "Event Horizon", keystone: true, text: "Void Tome: the void tears away twice the share of the health the enemy has left. Spell damage x0.8", bonus: { eventHorizon: 1 }, multiply: { void: 0.8 } },
        { id: "resonance", name: "Harmonics", keystone: true, text: "Rune Tome: every echo in a fight makes the echoes after it 10% stronger. The first cast of each turn deals 25% less", bonus: { resonance: 0.1 } },
        { id: "soulPact", name: "Soul Pact", keystone: true, text: "Souls: you keep a quarter of your souls when you fall. health x0.8", bonus: { soulPact: 0.25 }, multiply: { health: 0.8 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "arcaneMight", name: "Arcane Supremacy", text: "attack x1.3, all your damage +75% against bosses, and your abilities are ready a fifth sooner", bonus: { bossSlayer: 0.75, quickHands: 0.2 }, multiply: { attack: 1.3 } },
        { id: "arcaneBarrier", name: "Arcane Barrier", text: "health x1.6, and once a run a blow that would kill you leaves you alive on half your health", bonus: { secondWind: 1 }, multiply: { health: 1.6 } },
        { id: "spellblade", name: "Spellblade", text: "Arcane Tome: +35% attack, +10% critical chance and +80% critical damage", bonus: { attackPercent: 0.35, critChance: 0.1, critPower: 0.8 } },
        { id: "abyss", name: "Abyss", text: "Void Tome: attack x1.5 and +8 void power", bonus: { voidRend: 0.08 }, multiply: { attack: 1.5 } },
        { id: "glyphmaster", name: "Glyphmaster", text: "Rune Tome: +35% attack, +20% chance to cast twice and echoes deal +50% damage", bonus: { attackPercent: 0.35, echoChance: 0.2, echoPower: 0.5 } },
        { id: "soulEater", name: "Soul Eater", text: "attack x1.3, and you heal for 4% of the damage your turns deal", bonus: { leech: 0.04 }, multiply: { attack: 1.3 } },
        { id: "phaseShift", name: "Phase Shift", text: "You take 25% less damage", multiply: { damageTaken: 0.75 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "annihilation", name: "Annihilation", text: "Arcane Tome: the extra damage of critical hits x1.7 again, +10% critical chance, and attack x1.25", bonus: { critChance: 0.1 }, multiply: { arcaneCrit: 1.7, attack: 1.25 } },
        { id: "voidLord", name: "Void Lord", text: "Void Tome: spell damage x1.4 again, and health x1.5", multiply: { void: 1.4, health: 1.5 } },
        { id: "runeLord", name: "Rune Lord", text: "Rune Tome: echo damage x1.6 again, +20% chance to cast twice, and attack x1.25", bonus: { echoChance: 0.2 }, multiply: { echo: 1.6, attack: 1.25 } },
        { id: "deathsHarvest", name: "Death's Harvest", text: "attack x1.4, and every floor swept through at the start of a run adds 1% to all your damage (up to +100%)", bonus: { momentum: 0.01 }, multiply: { attack: 1.4 } },
        { id: "undying", name: "Undying", text: "health x2, armor x1.5, and you heal 2% of your health every turn of a fight", bonus: { prayer: 0.02 }, multiply: { health: 2, armor: 1.5 } }
      ]
    }
  ],

  // Extra choices at every BREAKTHROUGH (floor 150 and beyond), beside the ones every
  // class has. One for each build: it multiplies that build's own damage again.
  breakthroughs: [
    { id: "purerArcana", name: "Purer Arcana", text: "Arcane Tome: the extra damage of critical hits x1.5", multiply: { arcaneCrit: 1.5 } },
    { id: "deeperVoid", name: "Deeper Void", text: "Void Tome: spell damage x1.4", multiply: { void: 1.4 } },
    { id: "louderEchoes", name: "Louder Echoes", text: "Rune Tome: echo damage x1.5", multiply: { echo: 1.5 } },
    { id: "hungrierSouls", name: "Hungrier Souls", text: "attack x1.3 and health x1.3", multiply: { attack: 1.3, health: 1.3 } }
  ],

  // Special moves on a cooldown, put in the slots that open on floors 10, 35 and 75
  // (rules in game/abilities.js). "cooldown" is in turns of fighting. "build" works as
  // for boons. A "bossKiller" starts set to "Bosses only". "use" is what it does, built
  // from the pieces in game/abilities.js (abilityHit, abilitySpell, abilityStun...).
  abilities: [
    { id: "arcaneSurge", name: "Arcane Surge", text: "Arcane Tome: 3 turns of your damage in one spell", build: "arcane", cooldown: 6,
      use: function () { abilityTurns(3); } },
    { id: "voidRift", name: "Void Rift", text: "Void Tome: 2 turns of your damage, and tears away 6% of the health the enemy has left", build: "void", cooldown: 6,
      use: function () { abilityTurns(2); abilityPure(monsterMaxHp * 0.06, "arcane"); } },
    { id: "runeStorm", name: "Rune Storm", text: "Rune Tome: 3.5 turns of your damage in a storm of runes", build: "rune", cooldown: 7,
      use: function () { abilityTurns(3.5); } },
    { id: "darkPact", name: "Dark Pact", text: "Heal 30% of your health", cooldown: 15,
      use: function () { abilityHeal(0.3); } },
    { id: "doom", name: "Doom", text: "Boss killer: 10 turns of your damage in one spell", cooldown: 30, bossKiller: true,
      use: function () { abilityTurns(10); } }
  ],

  relics: [
    { id: "magesEye", name: "Mage's Eye", text: "Arcane Tome: +8% critical chance, and a hit on a weakness deals 20% more", build: "arcane", bonus: { critChance: 0.08, exploit: 0.2 } },
    { id: "voidShard", name: "Void Shard", text: "Void Tome: +2 void power, and you heal for 3% of the damage your turns deal", build: "void", bonus: { voidRend: 0.02, leech: 0.03 } },
    { id: "echoStone", name: "Echo Stone", text: "Rune Tome: +8% chance to cast twice, and your abilities are ready 15% sooner", build: "rune", bonus: { echoChance: 0.08, quickHands: 0.15 } },
    { id: "soulLantern", name: "Soul Lantern", text: "+10% attack, and every kill makes all your damage 0.5% stronger for the rest of the run", bonus: { attackPercent: 0.1, killStreak: 0.005 } },
    { id: "starChart", name: "Star Chart", legendary: true, text: "Arcane Tome: the extra damage of critical hits x2.5, and health x1.5", build: "arcane", bonus: {}, multiply: { arcaneCrit: 2.5, health: 1.5 } },
    { id: "hungeringDark", name: "The Hungering Dark", legendary: true, text: "Void Tome: spell damage x2.5, and health x1.5", build: "void", bonus: {}, multiply: { void: 2.5, health: 1.5 } },
    { id: "endlessEcho", name: "Endless Echo", legendary: true, text: "Rune Tome: echo damage x2.5, and health x1.5", build: "rune", bonus: {}, multiply: { echo: 2.5, health: 1.5 } }
  ],

  startRun: warlockStartRun,
  startFight: warlockStartFight,
  damageTypes: warlockDamageTypes,
  attack: warlockAttack,
  whenAttacked: warlockWhenAttacked,
  dotPerStack: warlockDotPerStack,
  statLine: warlockStatLine,
  gearInfo: warlockGearInfo
};

// The damage types this class is dealing right now (for the tower list)
function warlockDamageTypes() {
  return ["arcane"];
}

// SOULS. The Warlock calls the kills of a run souls. They are counted, and make it
// stronger, exactly as every class's kills do (see "What builds up over a run" in
// data.js): no more, no less.
// Until October 2026 souls were the Warlock's own multiplier, raised by a skill, a boon,
// five perks and a relic, on top of critical hits and echoes that already multiply each
// other. A player reached floor 143 with souls worth over +1000%, and no other class
// was worth playing. The perks and the skill keep their names and ids, and give plain
// attack and health.

// Runs when a run starts. The Soul Pact keystone keeps a share of the souls the last run
// ended with, if that is more than the floors swept through are worth.
function warlockStartRun() {
  runCounter = Math.max(runCounter, Math.floor(lastRunCounter * totalBonus("soulPact")));
}

// For the keystones: how many spells and how many echoes this fight has seen
let warlockSpells = 0;
let warlockEchoes = 0;

// Runs at the start of every fight
function warlockStartFight() {
  warlockSpells = 0;
  warlockEchoes = 0;
}

// The share of the health the enemy has left one void spell tears away. Void power always
// adds to it, but less and less, so it creeps toward maxVoidShare and never reaches it.
const maxVoidShare = 0.25;

// The most of your health one void spell can heal. Its skill has no top level, and a
// fight now lasts several turns: without a ceiling the Void Caller could not be killed.
const maxVoidHeal = 0.03;

function voidShare() {
  let power = totalBonus("voidRend");
  return maxVoidShare * power / (power + maxVoidShare);
}

// One spell. "power" is 1 for a normal cast, and more for a stronger one.
function warlockCast(power) {
  let damage = playerAttack;

  // Overchannel (keystone): every third spell of the fight is a certain critical
  warlockSpells = warlockSpells + 1;
  let certain = totalBonus("overchannel") > 0 && warlockSpells % 3 === 0;

  if (weapon === "arcane" && (certain || chance(totalBonus("critChance")))) {
    // Critical chance past 100% adds to the critical damage instead
    damage = damage * (1 + (totalBonus("critPower") + overflow("critChance", 1)) * multiplier("arcaneCrit"));
    say("An arcane critical!");
  }

  damage = damage * power;
  if (weapon === "void") {
    damage = damage * multiplier("void");
  }

  // Spells ignore armor, but not ward
  spellHitMonster(damage, "arcane");

  // The void also tears away a share of the health the enemy has left, and can feed you.
  // NOTHING makes this part bigger: not souls, not fame, not a boost from an ability.
  // It is taken straight off the enemy (less its ward), because a share of the enemy's
  // health that grows ends up killing everything in one hit, on any floor, forever.
  // (That happened: it used to go through the spell's damage, fame's Might multiplied
  // it, and a Void Tome reached floor 23,195 without falling. October 2026.)
  // It is a share of the health the enemy has LEFT, so it opens a fight hard and can
  // never finish one: the spell's own damage must. (Until fights were made longer it was
  // a share of FULL health, which kills anything in a fixed number of turns whatever the
  // floor: with fights of several turns a Void Tome reached floor 520 in 100 hours.)
  // (Event Horizon, a keystone: twice the share)
  if (weapon === "void") {
    let torn = Math.max(0, monsterHp) * voidShare();
    if (totalBonus("eventHorizon") > 0) {
      torn = torn * 2;
    }
    torn = Math.round(torn * (1 - wardNow()));
    monsterHp = monsterHp - torn;
    damageNotCounted = damageNotCounted + torn;
    noteDamage("arcane", torn);
    healPlayer(playerMaxHp * Math.min(maxVoidHeal, totalBonus("voidHeal")));
  }
}

function warlockAttack() {
  // (Harmonics, a keystone: a weaker first cast, and echoes that build on each other)
  warlockCast(totalBonus("resonance") > 0 ? 0.75 : 1);

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
      warlockCast((1 + totalBonus("echoPower")) * multiplier("echo") * (1 + totalBonus("resonance") * warlockEchoes));
      warlockEchoes = warlockEchoes + 1;
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
  return "Every spell ignores armor.";
}

function warlockGearInfo() {
  if (weapon === "arcane") {
    return "Arcane Tome: " + percent(Math.min(1, totalBonus("critChance"))) + " chance of a critical hit for +" + percent(totalBonus("critPower") + overflow("critChance", 1)) + " damage.";
  }
  if (weapon === "void") {
    return "Void Tome: every spell also tears away " + percent(voidShare()) + " of the health the enemy has left (" + Math.round(totalBonus("voidRend") * 100) + " void power; the share can never pass " + percent(maxVoidShare) + "), and heals " + percent(totalBonus("voidHeal")) + " of yours.";
  }
  return "Rune Tome: " + percent(totalBonus("echoChance")) + " chance to cast twice. The second cast (the echo) deals +" + percent(totalBonus("echoPower")) + " damage.";
}
