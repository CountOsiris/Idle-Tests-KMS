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
//   bodkin       shortbow: share of the enemy's armor its arrows
//                ignore. It can never ignore all of it.           (0.25 means a quarter)
//   huntersMark  extra damage against bosses and rare monsters    (0.04 means +4%)
//   boltPower    crossbow: extra damage of every bolt             (0.1 means +10%)
//   boltPierce   crossbow: penetration its bolts have             (0.1 means +10%)
//
// Words a perk can MULTIPLY (see "multiply" in data.js):
//   longbowCrit  the damage of a longbow's critical shots
//   shortbow     every shortbow arrow
//   crossbow     every crossbow bolt
//
// The three bows are three ways to shoot. Nothing to set up: pick up a bow and it works.
//   Longbow  - SLOW AND HEAVY. One arrow every second turn that hits very hard and can
//              strike a critical shot. The burst weapon.
//   Shortbow - FAST AND LIGHT. Two arrows every turn, and a chance of more. Superb against
//              soft targets. Its skills make arrows ignore part of the enemy's armor.
//   Crossbow - PUNCHES THROUGH. One bolt a turn that ignores armor completely and cuts
//              through what a monster resists. The weapon for other classes' towers.
//
// The Ranger used to have an animal companion. That is being saved for a class of its
// own, the Beast Tamer.
//
// See classes/barbarian.js for what each list is for.

classes.ranger = {
  name: "Ranger",
  icon: "🏹",
  art: "art/ranger.png",
  text: "An archer. Shoots before the enemy can reach you, with a heavy longbow, a quick shortbow, or a crossbow that punches through anything.",
  perLevel: { maxHp: 8, attack: 2 },
  base: { maxHp: 80, attack: 10, firstStrike: 1, aimChance: 0.25, quickShot: 0.2, boltPierce: 3 },

  gearLabel: "Bow",
  gearTypes: { longbow: "Longbow", shortbow: "Shortbow", crossbow: "Crossbow" },
  gearIcons: { longbow: "🏹", shortbow: "🏹", crossbow: "🎯" },
  // Bows are not made of bronze: these are the names of their tiers at the blacksmith
  // (see gearTiers in data.js; keep the list the same length as that one)
  gearTiers: ["Ash", "Elm", "Yew", "Ironwood", "Heartwood", "Elderwood"],

  // The Ranger fights from range: beasts cannot lunge at it, and nothing flies out of reach
  ranged: true,

  upgrades: [
    { id: "quickDraw", name: "Quick Draw", text: "+5% attack", bonus: { attackPercent: 0.05 } },
    { id: "eagleEye", name: "Eagle Eye", text: "Longbow: +5% critical shot chance", build: "longbow", bonus: { aimChance: 0.05 } },
    { id: "rapidFire", name: "Rapid Fire", text: "Shortbow: +10% chance of an extra arrow", build: "shortbow", bonus: { quickShot: 0.1 } },
    { id: "heavyBolts", name: "Heavy Bolts", text: "Crossbow: bolts deal +8% damage", build: "crossbow", bonus: { boltPower: 0.08 } },
    { id: "cranequin", name: "Cranequin", text: "Crossbow: bolts gain +25% penetration", build: "crossbow", bonus: { boltPierce: 0.25 } },
    { id: "steadyHand", name: "Steady Hand", text: "Longbow: critical shots deal +15% damage", build: "longbow", bonus: { aimPower: 0.15 } },
    { id: "bodkinPoints", name: "Bodkin Points", text: "Shortbow: +15% armor piercing (arrows ignore more of the enemy's armor)", build: "shortbow", bonus: { bodkin: 0.15 } }
  ],

  // One skill for each bow
  skills: [
    { id: "marksmanship", name: "Power", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "endurance", name: "Toughness", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "huntersMark", name: "Hunter's Mark", text: "Hunter's Mark: +4% damage against bosses and rare monsters", bonus: { huntersMark: 0.04 }, cost: 1 },
    { id: "longbowMastery", name: "Longbow Mastery", text: "Longbow: arrows deal +4% damage and critical shots deal +3% more", bonus: { heavyShot: 0.04, aimPower: 0.03 }, cost: 1 },
    { id: "shortbowMastery", name: "Shortbow Mastery", text: "Shortbow: +3% chance of an extra arrow, arrows deal +1% damage, and +2% armor piercing", bonus: { quickShot: 0.03, arrowPower: 0.01, bodkin: 0.02 }, cost: 1 },
    { id: "crossbowMastery", name: "Crossbow Mastery", text: "Crossbow: bolts deal +3% damage and gain +10% penetration", bonus: { boltPower: 0.03, boltPierce: 0.1 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "hardy", name: "Hardy", text: "health x1.1", multiply: { health: 1.1 } },
        { id: "keenEye", name: "Keen Eye", text: "attack x1.1", multiply: { attack: 1.1 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "camouflage", name: "Camouflage", text: "Range: the enemy misses 1 more turn at the start of a fight", bonus: { firstStrike: 1 } },
        { id: "barkSkin", name: "Bark Skin", text: "+3 armor", bonus: { armor: 3 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "marksman", name: "Marksman", text: "Longbow: +10% critical shot chance and critical shots deal +30% damage", bonus: { aimChance: 0.1, aimPower: 0.3 } },
        { id: "skirmisher", name: "Skirmisher", text: "Shortbow: +25% chance of an extra arrow", bonus: { quickShot: 0.25 } },
        { id: "arbalist", name: "Arbalist", text: "Crossbow: bolts deal +20% damage and gain +50% penetration", bonus: { boltPower: 0.2, boltPierce: 0.5 } }
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
        { id: "hawksVolley", name: "Opening Volley", text: "+30% attack, and Range: the enemy misses 1 more turn at the start of a fight", bonus: { attackPercent: 0.3, firstStrike: 1 } },
        { id: "forestGuardian", name: "Forest Guardian", text: "health x1.5 and +4 armor", bonus: { armor: 4 }, multiply: { health: 1.5 } },
        { id: "longshot", name: "Longshot", text: "Longbow: critical shot damage x1.6, and +10% critical shot chance", bonus: { aimChance: 0.1 }, multiply: { longbowCrit: 1.6 } },
        { id: "volleyer", name: "Volleyer", text: "Shortbow: arrow damage x1.6", multiply: { shortbow: 1.6 } },
        { id: "siegeArcher", name: "Siege Archer", text: "Crossbow: bolt damage x1.6", multiply: { crossbow: 1.6 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "deadeye", name: "Deadeye", text: "+50% attack", bonus: { attackPercent: 0.5 } },
        { id: "wildHeart", name: "Wild Heart", text: "health x1.75", multiply: { health: 1.75 } },
        { id: "eagleOfTheWood", name: "Eagle of the Wood", text: "Longbow: +30% attack, +10% critical shot chance and critical shots deal +100% damage", bonus: { attackPercent: 0.3, aimChance: 0.1, aimPower: 1 } },
        { id: "hailOfArrows", name: "Hail of Arrows", text: "Shortbow: +30% attack and +60% chance of an extra arrow", bonus: { attackPercent: 0.3, quickShot: 0.6 } },
        { id: "ironbreaker", name: "Ironbreaker", text: "Crossbow: +30% attack, bolts deal +45% damage and gain +150% penetration", bonus: { attackPercent: 0.3, boltPower: 0.45, boltPierce: 1.5 } },
        { id: "outOfReach", name: "Out of Reach", text: "You take 25% less damage", multiply: { damageTaken: 0.75 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "stormOfArrows", name: "First Blood", text: "+60% attack, and Range: the enemy misses 1 more turn at the start of a fight", bonus: { attackPercent: 0.6, firstStrike: 1 } },
        { id: "wardenOfTheWood", name: "Keeper of the Wood", text: "health x2 and +6 armor", bonus: { armor: 6 }, multiply: { health: 2 } },
        { id: "oneShot", name: "One Shot", text: "Longbow: critical shot damage x1.6 again", multiply: { longbowCrit: 1.6 } },
        { id: "arrowStorm", name: "Arrow Storm", text: "Shortbow: arrow damage x1.6 again", multiply: { shortbow: 1.6 } },
        { id: "siegeMaster", name: "Siege Master", text: "Crossbow: bolt damage x1.6 again", multiply: { crossbow: 1.6 } }
      ]
    }
  ],

  // Extra choices at every BREAKTHROUGH (floor 150 and beyond), beside the ones every
  // class has. One for each build: it multiplies that build's own damage again.
  breakthroughs: [
    { id: "truerAim", name: "Truer Aim", text: "Longbow: critical shot damage x1.5", multiply: { longbowCrit: 1.5 } },
    { id: "fasterHands", name: "Faster Hands", text: "Shortbow: arrow damage x1.4", multiply: { shortbow: 1.4 } },
    { id: "heavierBolts", name: "Heavier Bolts", text: "Crossbow: bolt damage x1.4", multiply: { crossbow: 1.4 } }
  ],

  // Special moves on a cooldown, put in the slots that open on floors 10, 35 and 75
  // (rules in game/abilities.js). "cooldown" is in turns of fighting. "build" works as
  // for boons. A "bossKiller" starts set to "Bosses only". "use" is what it does, built
  // from the pieces in game/abilities.js (abilityHit, abilitySpell, abilityStun...).
  abilities: [
    { id: "aimedShot", name: "Aimed Shot", text: "Longbow: 3 turns of your damage in one shot", build: "longbow", cooldown: 6,
      use: function () { abilityTurns(3); } },
    { id: "volley", name: "Volley", text: "Shortbow: a volley worth 3 turns of your damage", build: "shortbow", cooldown: 6,
      use: function () { abilityTurns(3); } },
    { id: "piercingBolt", name: "Piercing Bolt", text: "Crossbow: 2.5 turns of your damage in one bolt", build: "crossbow", cooldown: 5,
      use: function () { abilityTurns(2.5); } },
    { id: "fallBack", name: "Fall Back", text: "Step out of reach: no damage taken for 2 turns", cooldown: 14,
      use: function () { abilityGuard(1, 2); } },
    { id: "killingShot", name: "Killing Shot", text: "Boss killer: 10 turns of your damage in one shot", cooldown: 30, bossKiller: true,
      use: function () { abilityTurns(10); } }
  ],

  relics: [
    { id: "hawkFeather", name: "Goose Feather Fletching", text: "Longbow: +10% critical shot chance", build: "longbow", bonus: { aimChance: 0.1 } },
    { id: "yewStave", name: "Yew Stave", text: "Longbow: critical shots deal +30% damage", build: "longbow", bonus: { aimPower: 0.3 } },
    { id: "bodkinQuiver", name: "Bodkin Quiver", text: "Shortbow: +30% armor piercing (arrows ignore more of the enemy's armor)", build: "shortbow", bonus: { bodkin: 0.3 } },
    { id: "windlass", name: "Windlass", text: "Crossbow: bolts gain +100% penetration", build: "crossbow", bonus: { boltPierce: 1 } },
    { id: "fletchersGlove", name: "Fletcher's Glove", text: "Shortbow: +15% chance of an extra arrow", build: "shortbow", bonus: { quickShot: 0.15 } },
    { id: "steelBolts", name: "Steel Bolts", text: "Crossbow: bolts deal +12% damage", build: "crossbow", bonus: { boltPower: 0.12 } }
  ],

  startFight: rangerStartFight,
  damageTypes: rangerDamageTypes,
  attack: rangerAttack,
  whenAttacked: rangerWhenAttacked,
  penetration: rangerPenetration,
  dotPerStack: rangerDotPerStack,
  statLine: rangerStatLine,
  gearInfo: rangerGearInfo
};

// The numbers behind the bows. Change these to retune them.
const longbowHit = 1.9;         // a longbow arrow hits for this many times your attack...
const longbowCrit = 2;          // ...and a critical shot multiplies that by this
const shortbowArrows = 2;       // a shortbow looses this many arrows a turn
const shortbowHit = 0.65;       // each for this share of your attack
const crossbowHit = 1.55;       // a crossbow bolt hits for this many times your attack

// The damage types this class is dealing right now (for the tower list)
function rangerDamageTypes() {
  return ["piercing"];
}

// The penetration the weapon in hand gives (the game adds this to what the town and
// fame give). Only a crossbow has any. 1 halves a monster's resistance.
function rangerPenetration() {
  if (weapon === "crossbow") {
    return totalBonus("boltPierce");
  }
  return 0;
}

// Shortbow: how much of the enemy's armor still counts against an arrow (1 is all of it).
// Bodkin always takes more away, but less and less, so some armor always remains.
function bodkinArmorShare() {
  return 1 / (1 + totalBonus("bodkin"));
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

  // Hunter's Mark: more damage against the things worth hunting
  if (encounterType === "boss" || monsterIsRare) {
    damage = damage * (1 + totalBonus("huntersMark"));
  }

  // LONGBOW: one heavy arrow every second turn. The turn between is spent drawing.
  // Critical chance past 100% adds to the critical damage instead.
  if (weapon === "longbow") {
    if (!rangerDrawn) {
      rangerDrawn = true;
    } else {
      rangerDrawn = false;
      damage = damage * (longbowHit + totalBonus("heavyShot"));
      if (chance(totalBonus("aimChance"))) {
        damage = damage * (longbowCrit + totalBonus("aimPower") + overflow("aimChance", 1)) * multiplier("longbowCrit");
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
      hitMonster(damage * (shortbowHit + totalBonus("arrowPower")) * multiplier("shortbow"), "piercing", bodkinArmorShare());
    }
  }

  // CROSSBOW: one bolt that armor does nothing to
  if (weapon === "crossbow") {
    magicHitMonster(damage * (crossbowHit + totalBonus("boltPower")) * multiplier("crossbow"), "piercing");
  }
}

function rangerWhenAttacked() {
  return false;
}

// The Ranger has no damage over time
function rangerDotPerStack() {
  return 0;
}

function rangerStatLine() {
  return "Range: the enemy misses its first " + Math.min(maxFreeTurns, totalBonus("firstStrike")) + " turn(s) of every fight."
    + overflowNote(overflow("firstStrike", maxFreeTurns) * extraOpeningDamage, "damage on those turns")
    + " Hunter's Mark: +" + percent(totalBonus("huntersMark")) + " damage against bosses and rare monsters.";
}

function rangerGearInfo() {
  if (weapon === "longbow") {
    return "Longbow: slow and heavy. One arrow every second turn for " + percent(longbowHit + totalBonus("heavyShot")) + " of your attack, with a "
      + percent(Math.min(1, totalBonus("aimChance"))) + " chance of a critical shot for x" + (longbowCrit + totalBonus("aimPower") + overflow("aimChance", 1)).toFixed(1) + " damage.";
  }
  if (weapon === "shortbow") {
    return "Shortbow: fast and light. " + shortbowArrows + " arrows every turn for " + percent(shortbowHit + totalBonus("arrowPower")) + " of your attack each, and a "
      + percent(totalBonus("quickShot")) + " chance of another. Armor piercing " + percent(totalBonus("bodkin")) + ": only " + percent(bodkinArmorShare()) + " of the enemy's armor counts against each arrow.";
  }
  return "Crossbow: punches through. One bolt a turn for " + percent(crossbowHit + totalBonus("boltPower")) + " of your attack that ignores armor, and "
    + percent(totalBonus("boltPierce")) + " penetration: what a monster resists is cut to " + percent(1 / (1 + totalBonus("boltPierce") + totalBonus("penetration") + fameAdd("penetration"))) + " of its usual strength.";
}
