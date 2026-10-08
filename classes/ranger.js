// =====================================================================
//  The Ranger - an archer, and nothing but an archer
// =====================================================================
// Bonus words only the Ranger uses:
//   firstStrike  turns the enemy misses at the start of a fight   (1 means +1 turn)
//   aimChance    longbow: chance of a critical shot               (0.1 means +10%)
//   aimPower     longbow: extra damage of a critical shot         (0.1 means +10%)
//   heavyShot    longbow: extra damage of every arrow             (0.04 means +4%)
//   quickShot    shortbow: chance of one more arrow               (0.1 means +10%;
//                every full 1 is an arrow for certain)
//   arrowPower   shortbow: extra damage of every arrow            (0.01 means +1%)
//   burnStacks   elemental bow, fire arrows: most burn stacks     (1 means +1)
//   freezeChance elemental bow, frost arrows: chance to freeze    (0.02 means +2%)
//   arcPower     elemental bow, storm arrows: extra damage of
//                the arc of lightning                             (0.04 means +4%)
//
// The three bows are three ways to shoot:
//   Longbow       - SLOW AND HEAVY. One arrow every second turn that hits very hard and can
//                   strike a critical shot. Big hits barely notice armor.
//   Shortbow      - FAST AND LIGHT. Two arrows every turn, and a chance of more. Many
//                   small hits: superb against soft targets, poor against armor.
//   Elemental Bow - SPECIAL ARROWS. Fire, frost or storm arrows, picked on the Skills tab.
//                   Each deals a different kind of damage and does something of its own,
//                   so this bow can be turned to suit the tower you are in.
//
// The Ranger used to have an animal companion. That is being saved for a class of its
// own, the Beast Tamer.
//
// See classes/barbarian.js for what each list is for.

classes.ranger = {
  name: "Ranger",
  icon: "🏹",
  art: "art/ranger.png",
  text: "An archer. Shoots before the enemy can reach you, with a heavy longbow, a quick shortbow, or a bow that looses fire, frost and storm.",
  perLevel: { maxHp: 8, attack: 2 },
  base: { maxHp: 80, attack: 10, firstStrike: 1, aimChance: 0.25, quickShot: 0.2, burnStacks: 4, freezeChance: 0.25 },

  // The arrows of the Elemental Bow. The player picks one on the Skills tab; "stance" holds the choice.
  stanceLabel: "Arrows for the Elemental Bow",
  stances: {
    fire: { name: "Fire", text: "Elemental Bow only. Fire damage. Each arrow hits for 80% of your attack and adds two burn stacks, and every stack burns for 18% of your attack each turn." },
    frost: { name: "Frost", text: "Elemental Bow only. Ice damage. Each arrow hits for 150% of your attack and has a chance to freeze the enemy, so it misses its turn." },
    storm: { name: "Storm", text: "Elemental Bow only. Lightning damage. Each arrow hits for 70% of your attack, then lightning arcs from it for 60% more, straight through armor." }
  },

  gearLabel: "Bow",
  gearTypes: { longbow: "Longbow", shortbow: "Shortbow", elemental: "Elemental Bow" },
  gearIcons: { longbow: "🏹", shortbow: "🏹", elemental: "🏹" },
  dotLabel: "Burning",
  dotType: "fire",

  // The Ranger fights from range: beasts cannot lunge at it, and nothing flies out of reach
  ranged: true,

  upgrades: [
    { id: "quickDraw", name: "Quick Draw", text: "+3 attack", bonus: { attack: 3 } },
    { id: "eagleEye", name: "Eagle Eye", text: "Longbow: +5% critical shot chance", bonus: { aimChance: 0.05 } },
    { id: "rapidFire", name: "Rapid Fire", text: "Shortbow: +10% chance of an extra arrow", bonus: { quickShot: 0.1 } },
    { id: "enchantedQuiver", name: "Enchanted Quiver", text: "Elemental Bow: Fire +1 burn stack, Frost +4% freeze chance, Storm +10% arc damage", bonus: { burnStacks: 1, freezeChance: 0.04, arcPower: 0.1 } }
  ],

  // One skill for each bow
  skills: [
    { id: "marksmanship", name: "Marksmanship", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "endurance", name: "Endurance", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "openingVolley", name: "Opening Volley", text: "The enemy misses 1 more turn at the start of a fight", bonus: { firstStrike: 1 }, cost: 5 },
    { id: "longbowMastery", name: "Longbow Mastery", text: "Longbow: arrows deal +4% damage and +0.5% critical shot chance", bonus: { heavyShot: 0.04, aimChance: 0.005 }, cost: 1 },
    { id: "shortbowMastery", name: "Shortbow Mastery", text: "Shortbow: +3% chance of an extra arrow and arrows deal +1% damage", bonus: { quickShot: 0.03, arrowPower: 0.01 }, cost: 1 },
    { id: "elementalMastery", name: "Elemental Mastery", text: "Elemental Bow: Fire +1 burn stack and +5% burn damage, Frost +2% freeze chance, Storm +6% arc damage", bonus: { burnStacks: 1, dotPower: 0.05, freezeChance: 0.02, arcPower: 0.06 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "hardy", name: "Hardy", text: "+30 health", bonus: { maxHp: 30 } },
        { id: "keenEye", name: "Keen Eye", text: "+5 attack", bonus: { attack: 5 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "camouflage", name: "Camouflage", text: "The enemy misses 1 more turn at the start of a fight", bonus: { firstStrike: 1 } },
        { id: "barkSkin", name: "Bark Skin", text: "+3 armor", bonus: { armor: 3 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "marksman", name: "Marksman", text: "Longbow: +10% critical shot chance and critical shots deal +30% damage", bonus: { aimChance: 0.1, aimPower: 0.3 } },
        { id: "skirmisher", name: "Skirmisher", text: "Shortbow: +25% chance of an extra arrow", bonus: { quickShot: 0.25 } },
        { id: "arcaneArcher", name: "Arcane Archer", text: "Elemental Bow: Fire +2 burn stacks, Frost +10% freeze chance, Storm +30% arc damage", bonus: { burnStacks: 2, freezeChance: 0.1, arcPower: 0.3 } }
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
        { id: "hawksVolley", name: "Hawk's Volley", text: "+30% attack and the enemy misses 1 more turn", bonus: { attackPercent: 0.3, firstStrike: 1 } },
        { id: "forestGuardian", name: "Forest Guardian", text: "+50% health and +4 armor", bonus: { healthPercent: 0.5, armor: 4 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "deadeye", name: "Deadeye", text: "+50% attack", bonus: { attackPercent: 0.5 } },
        { id: "wildHeart", name: "Wild Heart", text: "+100% health", bonus: { healthPercent: 1 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "stormOfArrows", name: "Storm of Arrows", text: "+60% attack and the enemy misses 1 more turn", bonus: { attackPercent: 0.6, firstStrike: 1 } },
        { id: "spiritLord", name: "Warden of the Wood", text: "+125% health and +6 armor", bonus: { healthPercent: 1.25, armor: 6 } }
      ]
    }
  ],

  relics: [
    { id: "hawkFeather", name: "Hawk Feather", text: "Longbow: +10% critical shot chance", bonus: { aimChance: 0.1 } },
    { id: "fletchersGlove", name: "Fletcher's Glove", text: "Shortbow: +15% chance of an extra arrow", bonus: { quickShot: 0.15 } },
    { id: "runedArrowhead", name: "Runed Arrowhead", text: "Elemental Bow: Fire +1 burn stack, Frost +5% freeze chance, Storm +15% arc damage", bonus: { burnStacks: 1, freezeChance: 0.05, arcPower: 0.15 } }
  ],

  startFight: rangerStartFight,
  damageTypes: rangerDamageTypes,
  attack: rangerAttack,
  whenAttacked: rangerWhenAttacked,
  dotPerStack: rangerDotPerStack,
  statLine: rangerStatLine,
  gearInfo: rangerGearInfo
};

// The numbers behind the bows. Change these to retune them.
const longbowHit = 1.9;         // a longbow arrow hits for this many times your attack...
const longbowCrit = 2;          // ...and a critical shot multiplies that by this
const shortbowArrows = 2;       // a shortbow looses this many arrows a turn
const shortbowHit = 0.65;       // each for this share of your attack
const fireArrowHit = 0.8;       // elemental bow: a fire arrow hits for this share of your attack
const fireArrowBurn = 0.18;     // and each burn stack burns for this share every turn
const frostArrowHit = 1.5;      // a frost arrow hits for this share of your attack
const stormArrowHit = 0.7;      // a storm arrow hits for this share of your attack
const stormArc = 0.6;           // and the arc of lightning for this share more

// The damage types this class is dealing right now (for the tower list)
function rangerDamageTypes() {
  if (weapon === "elemental") {
    return [rangerArrowType()];
  }
  return ["piercing"];
}

// The damage type of the Elemental Bow's arrows
function rangerArrowType() {
  if (stance === "frost") {
    return "ice";
  }
  if (stance === "storm") {
    return "lightning";
  }
  return "fire";
}

// How many more turns the enemy is still too far away to attack
let rangerFreeTurns = 0;

// Longbow: is the bow drawn, ready to loose this turn?
let rangerDrawn = true;

// Runs at the start of every fight
function rangerStartFight() {
  rangerFreeTurns = Math.min(maxFreeTurns, totalBonus("firstStrike"));

  // An archer walks into a fight with an arrow already on the string
  rangerDrawn = true;
}

function rangerAttack() {
  // The enemy is still out of reach, so it misses this turn.
  // Free turns bought past the limit make these opening shots stronger instead.
  let opening = 1;
  if (rangerFreeTurns > 0) {
    rangerFreeTurns = rangerFreeTurns - 1;
    monsterStunned = true;
    opening = 1 + overflow("firstStrike", maxFreeTurns) * extraOpeningDamage;
  }
  let damage = playerAttack * opening;

  // LONGBOW: one heavy arrow every second turn. The turn between is spent drawing.
  // Critical chance past 100% adds to the critical damage instead.
  if (weapon === "longbow") {
    if (!rangerDrawn) {
      rangerDrawn = true;
    } else {
      rangerDrawn = false;
      damage = damage * (longbowHit + totalBonus("heavyShot"));
      if (chance(totalBonus("aimChance"))) {
        damage = damage * (longbowCrit + totalBonus("aimPower") + overflow("aimChance", 1));
        say("A critical shot!");
      }
      hitMonster(damage, "piercing");
    }
  }

  // SHORTBOW: several light arrows. Each full 100% of quick-shot chance is one more
  // arrow for certain, and what is left over is the chance of another.
  if (weapon === "shortbow") {
    let arrows = shortbowArrows + Math.floor(totalBonus("quickShot"));
    if (chance(totalBonus("quickShot") % 1)) {
      arrows = arrows + 1;
    }
    for (let i = 0; i < arrows; i++) {
      hitMonster(damage * (shortbowHit + totalBonus("arrowPower")), "piercing");
    }
  }

  // ELEMENTAL BOW: what the arrow does depends on the arrows picked on the Skills tab
  if (weapon === "elemental") {
    if (stance === "fire") {
      hitMonster(damage * fireArrowHit, "fire");

      // Fire catches quickly: every arrow adds two burn stacks
      addDotStack(totalBonus("burnStacks"));
      addDotStack(totalBonus("burnStacks"));
    }

    // Freeze chance past its limit makes the arrow hit harder instead
    if (stance === "frost") {
      hitMonster(damage * (frostArrowHit + overflow("freezeChance", maxChance)), "ice");
      if (chance(cappedChance("freezeChance"))) {
        monsterStunned = true;
        say("Your arrow freezes the enemy!");
      }
    }

    // The arc is lightning, not an arrow, so armor does nothing to it
    if (stance === "storm") {
      hitMonster(damage * stormArrowHit, "lightning");
      magicHitMonster(damage * (stormArc + totalBonus("arcPower")), "lightning");
    }
  }

  // Anything already burning keeps burning, whichever bow is in hand
  monsterHp = monsterHp - dotDamage();
}

function rangerWhenAttacked() {
  return false;
}

// Damage per turn of one burn stack
function rangerDotPerStack() {
  return Math.max(1, Math.round(playerAttack * fireArrowBurn));
}

function rangerStatLine() {
  return "Range: the enemy misses its first " + Math.min(maxFreeTurns, totalBonus("firstStrike")) + " turn(s) of every fight."
    + overflowNote(overflow("firstStrike", maxFreeTurns) * extraOpeningDamage, "damage on those turns");
}

function rangerGearInfo() {
  if (weapon === "longbow") {
    return "Longbow: slow and heavy. One arrow every second turn for " + percent(longbowHit + totalBonus("heavyShot")) + " of your attack, with a "
      + percent(Math.min(1, totalBonus("aimChance"))) + " chance of a critical shot for x" + (longbowCrit + totalBonus("aimPower") + overflow("aimChance", 1)).toFixed(1) + " damage. Big hits barely notice armor.";
  }
  if (weapon === "shortbow") {
    return "Shortbow: fast and light. " + shortbowArrows + " arrows every turn for " + percent(shortbowHit + totalBonus("arrowPower")) + " of your attack each, and a "
      + percent(totalBonus("quickShot")) + " chance of another. Armor is taken off every arrow.";
  }
  if (stance === "frost") {
    return "Elemental Bow, frost arrows: " + percent(frostArrowHit + overflow("freezeChance", maxChance)) + " of your attack as ice, with a "
      + percent(cappedChance("freezeChance")) + " chance to freeze the enemy so it misses its turn.";
  }
  if (stance === "storm") {
    return "Elemental Bow, storm arrows: " + percent(stormArrowHit) + " of your attack as lightning, then an arc for " + percent(stormArc + totalBonus("arcPower")) + " more that ignores armor.";
  }
  return "Elemental Bow, fire arrows: " + percent(fireArrowHit) + " of your attack as fire, and two burn stacks (up to " + totalBonus("burnStacks") + "), each burning for "
    + percent(fireArrowBurn * (1 + totalBonus("dotPower"))) + " of your attack each turn.";
}
