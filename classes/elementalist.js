// =====================================================================
//  The Elementalist - fire, ice, lightning and earth
// =====================================================================
// The Elementalist picks an ELEMENT (on the Skills tab) and can change it at any
// time. The element decides how every spell works; the skills make an element
// stronger. The gloves found in the tower are all the same kind and simply add
// their power to every spell, so no pair of gloves can ever clash with a build.
//
//   Fire      - weaker hits that set the enemy burning; the burn stacks up, like bleeding
//   Ice       - a chance of a critical hit for triple damage
//   Lightning - several fast, weak bolts every turn
//   Earth     - gathers stone for a turn, then throws one huge boulder
//
// Bonus words only the Elementalist uses:
//   burnStacks   fire: most burn stacks                         (2 means +2)
//   critChance   ice: critical chance                           (0.1 means +10%)
//   critPower    ice: extra damage of a critical                (0.15 means +15%)
//   extraBolts   lightning: chance of one more bolt             (0.1 means +10%;
//                every full 1 is a bolt for certain)
//   boltPower    lightning: extra damage of each bolt           (0.05 means +5%)
//   crush        earth: extra damage of a boulder               (0.2 means +20%)
//   stunChance   earth: chance a boulder stuns                  (0.1 means +10%)
//
// See classes/barbarian.js for what each list is for.

classes.elementalist = {
  name: "Elementalist",
  icon: "🧤",
  art: "art/elementalist.png",
  text: "Commands fire, ice, lightning and earth. Pick an element to change how you fight. Every spell ignores armor.",
  perLevel: { maxHp: 7, attack: 2 },
  base: { maxHp: 75, attack: 10, burnStacks: 5, critChance: 0.22, stunChance: 0.2 },

  gearLabel: "Gloves",
  gearTypes: { gloves: "Elemental Gloves" },
  dotLabel: "Burning",
  dotType: "fire",

  // A caster's spells reach a flying monster as easily as any other
  ranged: true,

  // The elements. The player picks one on the Skills tab; "stance" holds the choice.
  stanceLabel: "Element",
  stances: {
    fire: { name: "Fire", text: "Each spell hits for 90% of your attack and adds two burn stacks. Every stack burns for 23% of your attack each turn." },
    ice: { name: "Ice", text: "Each spell has a chance of a critical hit for triple damage." },
    lightning: { name: "Lightning", text: "Two bolts every turn, each for 65% of your attack. Skills add a chance of more bolts." },
    earth: { name: "Earth", text: "Every second turn, one boulder for 400% of your attack, with a chance to stun." }
  },

  upgrades: [
    { id: "elementalPower", name: "Elemental Power", text: "+3 attack", bonus: { attack: 3 } },
    { id: "wildfire", name: "Wildfire", text: "Fire: +1 burn stack", bonus: { burnStacks: 1 } },
    { id: "frostbite", name: "Frostbite", text: "Ice: +5% critical chance", bonus: { critChance: 0.05 } },
    { id: "conduction", name: "Conduction", text: "Lightning: +10% chance of an extra bolt", bonus: { extraBolts: 0.1 } },
    { id: "tremor", name: "Tremor", text: "Earth: +5% stun chance", bonus: { stunChance: 0.05 } }
  ],

  // One skill per element, so there is never a question of where an element's points go
  skills: [
    { id: "attunement", name: "Attunement", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "resilience", name: "Resilience", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "fireMastery", name: "Fire Mastery", text: "Fire: +1 burn stack and burning deals +8% damage", bonus: { burnStacks: 1, dotPower: 0.08 }, cost: 1 },
    { id: "iceMastery", name: "Ice Mastery", text: "Ice: +1.5% critical chance and +5% critical damage", bonus: { critChance: 0.015, critPower: 0.05 }, cost: 1 },
    { id: "lightningMastery", name: "Lightning Mastery", text: "Lightning: +3% chance of an extra bolt and bolts deal +1% damage", bonus: { extraBolts: 0.03, boltPower: 0.01 }, cost: 1 },
    { id: "earthMastery", name: "Earth Mastery", text: "Earth: boulders deal +18% damage and +2% stun chance", bonus: { crush: 0.18, stunChance: 0.02 }, cost: 1 }
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
      floor: 20,
      perks: [
        { id: "pyromancer", name: "Pyromancer", text: "Fire: +2 burn stacks", bonus: { burnStacks: 2 } },
        { id: "cryomancer", name: "Cryomancer", text: "Ice: +10% critical chance", bonus: { critChance: 0.1 } },
        { id: "stormcaller", name: "Stormcaller", text: "Lightning: +25% chance of an extra bolt", bonus: { extraBolts: 0.25 } },
        { id: "geomancer", name: "Geomancer", text: "Earth: +10% stun chance", bonus: { stunChance: 0.1 } }
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
        { id: "avatarOfStorms", name: "Avatar of Storms", text: "+36% attack", bonus: { attackPercent: 0.36 } },
        { id: "avatarOfStone", name: "Avatar of Stone", text: "+55% health and +5 armor", bonus: { healthPercent: 0.55, armor: 5 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "elementalFury", name: "Elemental Fury", text: "+50% attack", bonus: { attackPercent: 0.5 } },
        { id: "elementalShield", name: "Elemental Shield", text: "+100% health", bonus: { healthPercent: 1 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "masterOfElements", name: "Master of Elements", text: "+70% attack", bonus: { attackPercent: 0.7 } },
        { id: "avatarOfTides", name: "Avatar of Tides", text: "+150% health and +6 armor", bonus: { healthPercent: 1.5, armor: 6 } }
      ]
    }
  ],

  relics: [
    { id: "emberCore", name: "Ember Core", text: "Fire: +1 burn stack", bonus: { burnStacks: 1 } },
    { id: "frostShard", name: "Frost Shard", text: "Ice: +8% critical chance", bonus: { critChance: 0.08 } },
    { id: "stormCrystal", name: "Storm Crystal", text: "Lightning: +15% chance of an extra bolt", bonus: { extraBolts: 0.15 } },
    { id: "geode", name: "Geode", text: "Earth: +8% stun chance", bonus: { stunChance: 0.08 } }
  ],

  startFight: elementalistStartFight,
  damageTypes: elementalistDamageTypes,
  attack: elementalistAttack,
  whenAttacked: elementalistWhenAttacked,
  dotPerStack: elementalistDotPerStack,
  statLine: elementalistStatLine,
  gearInfo: elementalistGearInfo
};

// The damage types this class is dealing right now (for the tower list)
function elementalistDamageTypes() {
  return [stance];
}

// The numbers behind each element. Change these to retune them.
const fireHit = 0.9;        // a fire spell hits for this share of your attack
const fireBurn = 0.23;      // and each burn stack burns for this share every turn
const iceCrit = 3;          // an ice critical multiplies the hit by this
const lightningBolts = 2;   // lightning casts this many bolts a turn
const lightningHit = 0.65;  // each for this share of your attack
const earthHit = 4;         // a boulder hits for this many times your attack

// Earth: has the boulder been gathered, ready to throw this turn?
let elementalistCharged = false;

// Runs at the start of every fight
function elementalistStartFight() {
  elementalistCharged = false;
}

function elementalistAttack() {
  // Every spell ignores armor, but the monster's ward is taken off it (spellHitMonster).
  // Many small bolts lose more to ward than one big boulder does.

  if (stance === "fire") {
    spellHitMonster(playerAttack * fireHit, "fire");

    // Fire catches quickly: every spell adds two burn stacks
    addDotStack(totalBonus("burnStacks"));
    addDotStack(totalBonus("burnStacks"));
  }

  if (stance === "ice") {
    let damage = playerAttack;

    // Critical chance past 100% adds to the critical damage instead
    if (chance(totalBonus("critChance"))) {
      damage = damage * (iceCrit + totalBonus("critPower") + overflow("critChance", 1));
      say("An ice shard shatters for a critical hit!");
    }
    spellHitMonster(damage, "ice");
  }

  if (stance === "lightning") {
    // Each full 100% of extra-bolt chance is one bolt for certain,
    // and what is left over is the chance of one more
    let bolts = lightningBolts + Math.floor(totalBonus("extraBolts"));
    if (chance(totalBonus("extraBolts") % 1)) {
      bolts = bolts + 1;
    }

    for (let i = 0; i < bolts; i++) {
      spellHitMonster(playerAttack * (lightningHit + totalBonus("boltPower")), "lightning");
    }
  }

  if (stance === "earth") {
    if (!elementalistCharged) {
      // This turn is spent gathering the boulder
      elementalistCharged = true;
    } else {
      elementalistCharged = false;

      // Stun chance past its limit adds to the boulder's damage instead
      spellHitMonster(playerAttack * (earthHit + totalBonus("crush") + overflow("stunChance", maxChance)), "earth");

      if (chance(cappedChance("stunChance"))) {
        monsterStunned = true;
        say("The boulder stuns the enemy!");
      }
    }
  }

  // Anything already burning keeps burning, whichever element is being used
  monsterHp = monsterHp - dotDamage();
}

function elementalistWhenAttacked() {
  return false;
}

// Damage per turn of one burn stack
function elementalistDotPerStack() {
  return Math.max(1, Math.round(playerAttack * fireBurn));
}

// The special line in the "You" panel: what the chosen element is doing right now
function elementalistStatLine() {
  if (stance === "fire") {
    return "Fire: up to " + totalBonus("burnStacks") + " burn stacks, each burning for " + percent(fireBurn * (1 + totalBonus("dotPower"))) + " of your attack a turn.";
  }
  if (stance === "ice") {
    return "Ice: " + percent(Math.min(1, totalBonus("critChance"))) + " chance of a critical hit for x" + big(iceCrit + totalBonus("critPower") + overflow("critChance", 1)) + " damage.";
  }
  if (stance === "lightning") {
    return "Lightning: " + lightningBolts + " bolts a turn at " + percent(lightningHit + totalBonus("boltPower")) + " of your attack, and " + percent(totalBonus("extraBolts")) + " chance of another.";
  }
  return "Earth: a boulder every second turn for " + percent(earthHit + totalBonus("crush") + overflow("stunChance", maxChance)) + " of your attack, with a " + percent(cappedChance("stunChance")) + " chance to stun.";
}

function elementalistGearInfo() {
  return "Elemental Gloves: their power is added to every spell, whichever element you use.";
}
