// =====================================================================
//  The Elementalist - water, fire, lightning and earth
// =====================================================================
// Bonus words only the Elementalist uses:
//   tideHeal     water: health healed per spell                 (0.01 means +1% of your health)
//   burnStacks   fire: most burn stacks                         (2 means +2)
//   critChance   lightning: critical chance (triple damage)     (0.1 means +10%)
//   stunChance   earth: stun chance                             (0.1 means +10%)
//   crush        earth: extra damage                            (0.1 means +10%)
//
// See classes/barbarian.js for what each list is for.

classes.elementalist = {
  name: "Elementalist",
  icon: "🧤",
  text: "Commands the four elements. Each pair of elemental gloves changes how you fight, and every spell ignores armor.",
  powerStat: "Intelligence",
  base: { maxHp: 70, attack: 9, tideHeal: 0.06, burnStacks: 4, critChance: 0.3, stunChance: 0.2, crush: 0.25 },

  gearLabel: "Gloves",
  gearTypes: { water: "Water Gloves", fire: "Fire Gloves", lightning: "Lightning Gloves", earth: "Earth Gloves" },
  dotLabel: "Burning",

  upgrades: [
    { id: "elementalPower", name: "Elemental Power", text: "+3 attack", bonus: { attack: 3 } },
    { id: "tidalFlow", name: "Tidal Flow", text: "Water: +1% healing per spell", bonus: { tideHeal: 0.01 } },
    { id: "wildfire", name: "Wildfire", text: "Fire: +1 burn stack", bonus: { burnStacks: 1 } },
    { id: "conduction", name: "Conduction", text: "Lightning: +5% critical chance", bonus: { critChance: 0.05 } },
    { id: "tremor", name: "Tremor", text: "Earth: +5% stun chance", bonus: { stunChance: 0.05 } }
  ],

  skills: [
    { id: "attunement", name: "Attunement", text: "+2 attack", bonus: { attack: 2 }, maxLevel: 10, cost: 100 },
    { id: "vitality", name: "Vitality", text: "+12 health", bonus: { maxHp: 12 }, maxLevel: 10, cost: 100 },
    { id: "waterMastery", name: "Water Mastery", text: "Water: +1% healing per spell", bonus: { tideHeal: 0.01 }, maxLevel: 4, cost: 300 },
    { id: "fireMastery", name: "Fire Mastery", text: "Fire: +1 burn stack", bonus: { burnStacks: 1 }, maxLevel: 3, cost: 300 },
    { id: "lightningMastery", name: "Lightning Mastery", text: "Lightning: +3% critical chance", bonus: { critChance: 0.03 }, maxLevel: 5, cost: 300 },
    { id: "earthMastery", name: "Earth Mastery", text: "Earth: +3% stun chance and +5% damage", bonus: { stunChance: 0.03, crush: 0.05 }, maxLevel: 5, cost: 300 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "stoneWard", name: "Stone Ward", text: "+30 health", bonus: { maxHp: 30 } },
        { id: "spellpower", name: "Spellpower", text: "+5 attack", bonus: { attack: 5 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "mistVeil", name: "Mist Veil", text: "+3 armor", bonus: { armor: 3 } },
        { id: "channeling", name: "Channeling", text: "+6 attack", bonus: { attack: 6 } }
      ]
    },
    {
      floor: 15,
      perks: [
        { id: "tidecaller", name: "Tidecaller", text: "Water: +3% healing per spell", bonus: { tideHeal: 0.03 } },
        { id: "pyromancer", name: "Pyromancer", text: "Fire: +2 burn stacks", bonus: { burnStacks: 2 } },
        { id: "stormcaller", name: "Stormcaller", text: "Lightning: +10% critical chance", bonus: { critChance: 0.1 } },
        { id: "geomancer", name: "Geomancer", text: "Earth: +10% stun chance", bonus: { stunChance: 0.1 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "plunderer", name: "Plunderer", text: "+50% gold", bonus: { gold: 0.5 } },
        { id: "veteran", name: "Veteran", text: "+25% experience", bonus: { experience: 0.25 } }
      ]
    },
    {
      floor: 30,
      perks: [
        { id: "avatarOfStorms", name: "Avatar of Storms", text: "+18 attack", bonus: { attack: 18 } },
        { id: "avatarOfStone", name: "Avatar of Stone", text: "+110 health and +5 armor", bonus: { maxHp: 110, armor: 5 } }
      ]
    },
    {
      floor: 40,
      perks: [
        { id: "elementalFury", name: "Elemental Fury", text: "+25 attack", bonus: { attack: 25 } },
        { id: "elementalShield", name: "Elemental Shield", text: "+200 health", bonus: { maxHp: 200 } }
      ]
    },
    {
      floor: 50,
      perks: [
        { id: "masterOfElements", name: "Master of Elements", text: "+35 attack", bonus: { attack: 35 } },
        { id: "avatarOfTides", name: "Avatar of Tides", text: "+300 health and +6 armor", bonus: { maxHp: 300, armor: 6 } }
      ]
    }
  ],

  relics: [
    { id: "seaPearl", name: "Sea Pearl", text: "Water: +2% healing per spell", bonus: { tideHeal: 0.02 } },
    { id: "emberCore", name: "Ember Core", text: "Fire: +1 burn stack", bonus: { burnStacks: 1 } },
    { id: "stormCrystal", name: "Storm Crystal", text: "Lightning: +8% critical chance", bonus: { critChance: 0.08 } },
    { id: "geode", name: "Geode", text: "Earth: +8% stun chance", bonus: { stunChance: 0.08 } }
  ],

  attack: elementalistAttack,
  whenAttacked: elementalistWhenAttacked,
  dotPerStack: elementalistDotPerStack,
  statLine: elementalistStatLine,
  gearInfo: elementalistGearInfo
};

function elementalistAttack() {
  let damage = playerAttack;

  if (weapon === "lightning" && chance(totalBonus("critChance"))) {
    damage = damage * 3;
    say("A lightning critical!");
  }

  if (weapon === "earth") {
    damage = damage * (1 + totalBonus("crush"));
    if (chance(cappedChance("stunChance"))) {
      monsterStunned = true;
      say("The ground shakes and stuns the enemy!");
    }
  }

  // Spells ignore armor
  magicHitMonster(damage);

  if (weapon === "water") {
    healPlayer(playerMaxHp * totalBonus("tideHeal"));
  }

  if (weapon === "fire") {
    addDotStack(totalBonus("burnStacks"));
  }
  monsterHp = monsterHp - dotDamage();
}

function elementalistWhenAttacked() {
  return false;
}

// Damage per turn of one burn stack
function elementalistDotPerStack() {
  return Math.max(1, Math.round(playerAttack * 0.15));
}

function elementalistStatLine() {
  return "Attunement: your spells ignore armor";
}

function elementalistGearInfo() {
  if (weapon === "water") {
    return "Water Gloves: every spell heals you for " + percent(totalBonus("tideHeal")) + " of your health.";
  }
  if (weapon === "fire") {
    return "Fire Gloves: every spell sets the enemy burning more each turn (up to " + totalBonus("burnStacks") + " stacks).";
  }
  if (weapon === "lightning") {
    return "Lightning Gloves: " + percent(totalBonus("critChance")) + " chance to deal triple damage.";
  }
  return "Earth Gloves: +" + percent(totalBonus("crush")) + " damage and a " + percent(cappedChance("stunChance")) + " chance to stun.";
}
