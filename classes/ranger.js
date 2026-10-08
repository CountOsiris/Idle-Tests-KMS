// =====================================================================
//  The Ranger - a bow, forest magic and an animal companion
// =====================================================================
// Bonus words only the Ranger uses:
//   firstStrike  turns the enemy misses at the start of a fight   (1 means +1 turn)
//   aimChance    longbow: chance of a critical shot               (0.1 means +10%)
//   aimPower     longbow: extra damage of a critical shot         (0.1 means +10%)
//   spiritPower  spirit bow: damage of the spirit bolt that
//                follows every arrow, as a share of your attack   (0.05 means +5%)
//   bloomPower   bloom bow: how much stronger it makes your
//                companion                                        (0.05 means +5%)
//   bond         damage of your companion, with any bow           (0.1 means +10% stronger)
//
// The three bows are three different Rangers:
//   Longbow    - the ARCHER. Arrows hit harder, and can strike a critical shot.
//                Pure weapon damage. Piercing.
//   Spirit Bow - the MYSTIC. Its arrows are forest magic: they pass through armor, and a
//                bolt of spirit follows each one. Nature damage.
//   Bloom Bow  - the BEAST TAMER. Its arrows are weak, but the bow makes your companion
//                far stronger. The companion does the killing.
//
// Every Ranger has a COMPANION that fights beside any bow. Companions are unlocked by
// LEVEL: you start with a hawk, and stronger animals replace it as you grow, all the
// way up to mythical beasts. The list is "companions", further down this file.
// The Bloom Bow is the bow built around the companion.
//
// See classes/barbarian.js for what each list is for.

classes.ranger = {
  name: "Ranger",
  icon: "🏹",
  art: "art/ranger.png",
  text: "An archer, a forest mystic or a beast tamer, depending on the bow. Shoots before the enemy can reach you, with an animal companion that grows mightier as you level.",
  perLevel: { maxHp: 8, attack: 2 },
  base: { maxHp: 80, attack: 10, firstStrike: 1, aimChance: 0.3, spiritPower: 0.45, bloomPower: 0.4 },

  gearLabel: "Bow",
  gearTypes: { longbow: "Longbow", spirit: "Spirit Bow", bloom: "Bloom Bow" },
  gearIcons: { longbow: "🏹", spirit: "🏹", bloom: "🏹" },

  // The Ranger fights from range: beasts cannot lunge at it, and nothing flies out of reach
  ranged: true,

  upgrades: [
    { id: "quickDraw", name: "Quick Draw", text: "+3 attack", bonus: { attack: 3 } },
    { id: "eagleEye", name: "Eagle Eye", text: "Longbow: +5% critical shot chance", bonus: { aimChance: 0.05 } },
    { id: "packLeader", name: "Moonlit String", text: "Spirit Bow: spirit bolts deal +10% of your attack more", bonus: { spiritPower: 0.1 } },
    { id: "overgrowth", name: "Overgrowth", text: "Bloom Bow: your companion is 10% stronger", bonus: { bloomPower: 0.1 } },
    { id: "feralBond", name: "Feral Bond", text: "Your companion deals +15% damage", bonus: { bond: 0.15 } }
  ],

  // Each bow has one skill, and Beast Bond works for whichever companion you have
  skills: [
    { id: "marksmanship", name: "Marksmanship", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "endurance", name: "Endurance", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "openingVolley", name: "Opening Volley", text: "The enemy misses 1 more turn at the start of a fight", bonus: { firstStrike: 1 }, cost: 5 },
    { id: "longbowMastery", name: "Longbow Mastery", text: "Longbow: +1.5% critical shot chance and critical shots deal +2% damage", bonus: { aimChance: 0.015, aimPower: 0.02 }, cost: 1 },
    { id: "spiritMastery", name: "Spirit Mastery", text: "Spirit Bow: spirit bolts deal +4% of your attack more", bonus: { spiritPower: 0.04 }, cost: 1 },
    { id: "bloomMastery", name: "Bloom Mastery", text: "Bloom Bow: your companion is 5% stronger", bonus: { bloomPower: 0.05 }, cost: 1 },
    { id: "beastBond", name: "Beast Bond", text: "Your companion deals +5% damage, with any bow. Companions grow with your level and a little with your bow, not with your attack", bonus: { bond: 0.05 }, cost: 1 }
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
        { id: "beastmaster", name: "Mystic", text: "Spirit Bow: spirit bolts deal +30% of your attack more", bonus: { spiritPower: 0.3 } },
        { id: "druid", name: "Druid", text: "Bloom Bow: your companion is 40% stronger", bonus: { bloomPower: 0.4 } },
        { id: "beastTamer", name: "Beast Tamer", text: "Your companion deals +50% damage, with any bow", bonus: { bond: 0.5 } }
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
        { id: "forestGuardian", name: "Forest Guardian", text: "+50% health and +4 armor", bonus: { healthPercent: 0.5, armor: 4 } },
        { id: "beastlord", name: "Beastlord", text: "Your companion deals +100% damage, and +20% health", bonus: { bond: 1, healthPercent: 0.2 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "deadeye", name: "Deadeye", text: "+50% attack", bonus: { attackPercent: 0.5 } },
        { id: "wildHeart", name: "Wild Heart", text: "+100% health", bonus: { healthPercent: 1 } },
        { id: "apexPredator", name: "Apex Predator", text: "Your companion deals +150% damage", bonus: { bond: 1.5 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "stormOfArrows", name: "Storm of Arrows", text: "+60% attack and the enemy misses 1 more turn", bonus: { attackPercent: 0.6, firstStrike: 1 } },
        { id: "spiritLord", name: "Spirit Lord", text: "+100% health and Spirit Bow: spirit bolts deal +60% of your attack more", bonus: { healthPercent: 1, spiritPower: 0.6 } },
        { id: "lordOfTheWild", name: "Lord of the Wild", text: "Your companion deals +200% damage, and +50% health", bonus: { bond: 2, healthPercent: 0.5 } }
      ]
    }
  ],

  relics: [
    { id: "hawkFeather", name: "Hawk Feather", text: "Longbow: +10% critical shot chance", bonus: { aimChance: 0.1 } },
    { id: "wolfTotem", name: "Spirit Totem", text: "Spirit Bow: spirit bolts deal +15% of your attack more", bonus: { spiritPower: 0.15 } },
    { id: "heartwood", name: "Heartwood", text: "Bloom Bow: your companion is 20% stronger", bonus: { bloomPower: 0.2 } },
    { id: "alphaFang", name: "Alpha Fang", text: "Your companion deals +25% damage", bonus: { bond: 0.25 } }
  ],

  startFight: rangerStartFight,
  damageTypes: rangerDamageTypes,
  attack: rangerAttack,
  whenAttacked: rangerWhenAttacked,
  skillsNote: rangerSkillsNote,
  dotPerStack: rangerDotPerStack,
  statLine: rangerStatLine,
  gearInfo: rangerGearInfo
};

// The damage types this class is dealing right now (for the tower list).
// Ordinary arrows pierce; the spirit bow's are nature, and so is the companion.
function rangerDamageTypes() {
  if (weapon === "spirit") {
    return ["nature"];
  }
  return ["piercing", "nature"];
}

// The numbers behind the bows. Change these to retune them.
const longbowHit = 1.1;         // a longbow arrow hits for this many times your attack
const longbowCrit = 2.5;        // and a critical shot multiplies that by this
const bloomHit = 0.8;           // a bloom bow arrow hits for this share of your attack

// How many more turns the enemy is still too far away to attack
let rangerFreeTurns = 0;

// Runs at the start of every fight
function rangerStartFight() {
  rangerFreeTurns = Math.min(maxFreeTurns, totalBonus("firstStrike"));

  // Has a new companion been unlocked since the last fight?
  let companion = currentCompanion();
  if (rangerCompanionSeen !== "" && rangerCompanionSeen !== companion.id) {
    say("A new companion joins you: the " + companion.name + "!");
  }
  rangerCompanionSeen = companion.id;
}

function rangerAttack() {
  let damage = playerAttack;

  // The enemy is still out of reach, so it misses this turn.
  // Free turns bought past the limit make these opening shots stronger instead.
  if (rangerFreeTurns > 0) {
    rangerFreeTurns = rangerFreeTurns - 1;
    monsterStunned = true;
    damage = damage * (1 + overflow("firstStrike", maxFreeTurns) * extraOpeningDamage);
  }

  // Longbow: a heavier arrow, and a chance of a critical shot.
  // Critical chance past 100% adds to the critical damage instead.
  if (weapon === "longbow") {
    damage = damage * longbowHit;
    if (chance(totalBonus("aimChance"))) {
      damage = damage * (longbowCrit + totalBonus("aimPower") + overflow("aimChance", 1));
      say("A critical shot!");
    }
    hitMonster(damage, "piercing");
  }

  // Spirit bow: the arrow is forest magic and passes through armor,
  // and a bolt of spirit follows it
  if (weapon === "spirit") {
    magicHitMonster(damage, "nature");
    magicHitMonster(damage * totalBonus("spiritPower"), "nature");
  }

  // Bloom bow: a light arrow. Its strength is in the companion (see companionStrength).
  if (weapon === "bloom") {
    hitMonster(damage * bloomHit, "piercing");
  }

  companionAttack();
}

// =====================================================================
//  Companions
// =====================================================================
// One companion fights beside the Ranger: always the best one unlocked so far.
// They are unlocked by LEVEL, so every ascension you earn them again from the hawk up.
//
// TO ADD ONE: add a line, anywhere in the list. It needs:
//   id     - a unique name with no spaces
//   name   - what the player sees
//   icon   - its little picture. To use a drawing instead, add  art: "art/wolf.png"
//   level  - the level that unlocks it
//   power  - the share of the companion's strength it hits for every turn.
//            Bigger is simply stronger: 0.5 is half, 1 is all of it, 2 is double.
//   text   - a few words about it
// Later, a companion can also be given a "bonus" (like a relic's) for rare stats.
const companions = [
  { id: "hawk", name: "Hawk", icon: "🦅", level: 1, power: 0.5, text: "Quick talons." },
  { id: "wolf", name: "Wolf", icon: "🐺", level: 10, power: 0.54, text: "A loyal hunter." },
  { id: "boar", name: "Boar", icon: "🐗", level: 25, power: 0.58, text: "All tusk and temper." },
  { id: "bear", name: "Bear", icon: "🐻", level: 45, power: 0.62, text: "Slow to anger, hard to stop." },
  { id: "sabertooth", name: "Sabertooth", icon: "🐯", level: 70, power: 0.66, text: "A cat from an older age." },
  { id: "direBear", name: "Dire Bear", icon: "🐻‍❄️", level: 100, power: 0.7, text: "The bear's bigger, meaner cousin." },
  // Mythical beasts
  { id: "griffin", name: "Griffin", icon: "🦁", level: 140, power: 0.75, text: "Mythical: half eagle, half lion." },
  { id: "unicorn", name: "Unicorn", icon: "🦄", level: 190, power: 0.81, text: "Mythical: its horn pierces anything." },
  { id: "wyvern", name: "Wyvern", icon: "🐲", level: 250, power: 0.88, text: "Mythical: a dragon's lesser kin." },
  { id: "phoenix", name: "Phoenix", icon: "🔥", level: 330, power: 0.96, text: "Mythical: reborn from its own ashes." },
  { id: "dragon", name: "Dragon", icon: "🐉", level: 430, power: 1.05, text: "Mythical: the oldest hunter of all." }
];

// A companion has its OWN strength. It grows with your level and with Beast Bond,
// and a little with the power of your bow, but NOT with your attack: a beast tamer
// does not have to build attack as well.
// (Whatever multiplies attack from outside a run, like the Might fame upgrade,
// multiplies the companion too, so ascending makes it stronger like everything else.)
const companionBase = 20;       // a companion's strength at level 1
const companionPerLevel = 2;    // and what every level adds to it
const companionBowShare = 0.5;  // how much of your bow's power it gains (0.5 means half)

// The last companion that was announced, so that a new one can be greeted
let rangerCompanionSeen = "";

// The best companion unlocked at your level
function currentCompanion() {
  let best = companions[0];
  for (let companion of companions) {
    if (level >= companion.level && companion.power >= best.power) {
      best = companion;
    }
  }
  return best;
}

// The next companion to unlock, or null if every one is unlocked
function nextCompanion() {
  let next = null;
  for (let companion of companions) {
    if (level < companion.level && (next === null || companion.level < next.level)) {
      next = companion;
    }
  }
  return next;
}

function companionStrength() {
  let strength = companionBase + (level - 1) * companionPerLevel + weaponPower * companionBowShare;
  strength = strength * (1 + totalBonus("bond")) * multiplier("attack");

  // The bloom bow is the beast tamer's bow: it makes the companion stronger still
  if (weapon === "bloom") {
    strength = strength * (1 + totalBonus("bloomPower"));
  }
  return strength;
}

// What the companion hits for every turn
function companionDamage() {
  return Math.round(companionStrength() * currentCompanion().power);
}

// The companion's part of your turn
function companionAttack() {
  hitMonster(companionDamage(), "nature");
}

function rangerWhenAttacked() {
  return false;
}

// What the companion is doing, for the "You" panel
function companionLine() {
  let companion = currentCompanion();
  let line = " Companion: " + companion.icon + " " + companion.name + ", hitting for " + big(companionDamage()) + " every turn.";

  let next = nextCompanion();
  if (next !== null) {
    line = line + " Next: " + next.name + " at level " + next.level + ".";
  }
  return line;
}

// The list of companions, for the top of the Skills tab
function rangerSkillsNote() {
  let parts = [];
  let current = currentCompanion();

  for (let companion of companions) {
    if (companion.id === current.id) {
      parts.push(companion.icon + " " + companion.name + " (with you now)");
    } else if (level >= companion.level) {
      parts.push(companion.icon + " " + companion.name);
    } else {
      parts.push(companion.name + " at level " + companion.level);
    }
  }
  return "Companions, weakest to mightiest: " + parts.join(" · ") + ". The best one you have unlocked fights beside you. Levels are lost when you ascend, so you earn them again each time.";
}

// The Ranger has no damage over time
function rangerDotPerStack() {
  return 0;
}

function rangerStatLine() {
  return "Range: the enemy misses its first " + Math.min(maxFreeTurns, totalBonus("firstStrike")) + " turn(s) of every fight."
    + overflowNote(overflow("firstStrike", maxFreeTurns) * extraOpeningDamage, "damage on those turns")
    + companionLine();
}

function rangerGearInfo() {
  if (weapon === "longbow") {
    return "Longbow: arrows hit " + percent(longbowHit - 1) + " harder, with a " + percent(Math.min(1, totalBonus("aimChance"))) + " chance of a critical shot for x" + (longbowCrit + totalBonus("aimPower") + overflow("aimChance", 1)).toFixed(1) + " damage. The archer's bow.";
  }
  if (weapon === "spirit") {
    return "Spirit Bow: arrows are forest magic and ignore armor, and a spirit bolt follows each one for " + percent(totalBonus("spiritPower")) + " of your attack. The mystic's bow.";
  }
  return "Bloom Bow: arrows hit for only " + percent(bloomHit) + " of your attack, but your companion is " + percent(totalBonus("bloomPower")) + " stronger. The beast tamer's bow.";
}
