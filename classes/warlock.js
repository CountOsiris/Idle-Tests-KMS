// =====================================================================
//  The Warlock - arcane magic, a pure glass cannon
// =====================================================================
// Bonus words only the Warlock uses:
//   critChance   arcane tome critical chance                       (0.1 means +10%)
//   critPower    extra damage of a critical                         (0.5 means +50%)
//   voidRend     void tome damage, as a share of the enemy's health  (0.01 means +1%)
//   echoChance   rune tome chance to cast twice                     (0.1 means +10%)
//
// See classes/barbarian.js for what each list is for.

classes.warlock = {
  name: "Warlock",
  icon: "📖",
  art: "art/warlock.png",
  text: "Master of arcane magic, read from a tome. Fragile, but every spell ignores armor.",
  perLevel: { maxHp: 6, attack: 2.5 },
  base: { maxHp: 60, attack: 12, critChance: 0.25, critPower: 1.5, voidRend: 0.06, echoChance: 0.4 },

  gearLabel: "Tome",
  gearTypes: { arcane: "Arcane Tome", void: "Void Tome", rune: "Rune Tome" },

  upgrades: [
    { id: "arcanePower", name: "Arcane Power", text: "+4 attack", bonus: { attack: 4 } },
    { id: "manaShield", name: "Mana Shield", text: "+15 health", bonus: { maxHp: 15 } },
    { id: "focus", name: "Focus", text: "Arcane Tome: +5% critical chance", bonus: { critChance: 0.05 } },
    { id: "devour", name: "Devour", text: "Void Tome: +1% of the enemy's health per hit", bonus: { voidRend: 0.01 } },
    { id: "resonance", name: "Resonance", text: "Rune Tome: +5% chance to cast twice", bonus: { echoChance: 0.05 } }
  ],

  skills: [
    { id: "intellect", name: "Intellect", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "warding", name: "Warding", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "criticalFocus", name: "Critical Focus", text: "Arcane Tome: +10% critical damage", bonus: { critPower: 0.1 }, cost: 1 },
    { id: "arcaneMastery", name: "Arcane Mastery", text: "Arcane Tome: +3% critical chance", bonus: { critChance: 0.03 }, cost: 2 },
    { id: "voidMastery", name: "Void Mastery", text: "Void Tome: +0.5% of the enemy's health per hit", bonus: { voidRend: 0.005 }, cost: 2 },
    { id: "runeMastery", name: "Rune Mastery", text: "Rune Tome: +3% chance to cast twice", bonus: { echoChance: 0.03 }, cost: 2 }
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
        { id: "voidCaller", name: "Void Caller", text: "Void Tome: +2% of the enemy's health per hit", bonus: { voidRend: 0.02 } },
        { id: "runemaster", name: "Runemaster", text: "Rune Tome: +10% chance to cast twice", bonus: { echoChance: 0.1 } }
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
        { id: "voidLord", name: "Void Lord", text: "+125% health and Void Tome: +2% of the enemy's health per hit", bonus: { healthPercent: 1.25, voidRend: 0.02 } }
      ]
    }
  ],

  relics: [
    { id: "magesEye", name: "Mage's Eye", text: "Arcane Tome: +8% critical chance", bonus: { critChance: 0.08 } },
    { id: "voidShard", name: "Void Shard", text: "Void Tome: +1% of the enemy's health per hit", bonus: { voidRend: 0.01 } },
    { id: "echoStone", name: "Echo Stone", text: "Rune Tome: +8% chance to cast twice", bonus: { echoChance: 0.08 } }
  ],

  attack: warlockAttack,
  whenAttacked: warlockWhenAttacked,
  dotPerStack: warlockDotPerStack,
  statLine: warlockStatLine,
  gearInfo: warlockGearInfo
};

// One spell
function warlockCast() {
  let damage = playerAttack;

  if (weapon === "arcane" && chance(totalBonus("critChance"))) {
    // Critical chance past 100% adds to the critical damage instead
    damage = damage * (1 + totalBonus("critPower") + overflow("critChance", 1));
    say("An arcane critical!");
  }

  // The void tears away a share of the enemy's full health
  if (weapon === "void") {
    damage = damage + monsterMaxHp * totalBonus("voidRend");
  }

  // Spells ignore armor
  magicHitMonster(damage);
}

function warlockAttack() {
  warlockCast();

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
      warlockCast();
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
  return "Arcane: your spells ignore armor";
}

function warlockGearInfo() {
  if (weapon === "arcane") {
    return "Arcane Tome: " + percent(totalBonus("critChance")) + " chance of a critical for +" + percent(totalBonus("critPower")) + " damage.";
  }
  if (weapon === "void") {
    return "Void Tome: every spell also tears away " + percent(totalBonus("voidRend")) + " of the enemy's full health.";
  }
  return "Rune Tome: " + percent(totalBonus("echoChance")) + " chance to cast twice.";
}
