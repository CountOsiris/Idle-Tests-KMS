// =====================================================================
//  The Ranger - a bow, forest magic and an animal companion
// =====================================================================
// Bonus words only the Ranger uses:
//   firstStrike  turns the enemy misses at the start of a fight   (1 means +1 turn)
//   aimChance    longbow chance of an aimed shot (x2.5 damage)    (0.1 means +10%)
//   spirits      most spirits the spirit bow can summon           (2 means +2)
//   regrowth     health healed per shot by the bloom bow          (0.01 means +1% of your health)
//   bond         damage of your companion                         (0.1 means +10% stronger)
//   guardChance  bear: chance it takes a hit for you              (0.02 means +2%)
//   diveChance   hawk: chance it dives each turn                  (0.02 means +2%)
//
// The Ranger also has a COMPANION, picked on the Skills tab and free to change.
// It fights beside you whichever bow you carry, so every bow goes with every companion.
//
// See classes/barbarian.js for what each list is for.

classes.ranger = {
  name: "Ranger",
  icon: "🏹",
  art: "art/ranger.png",
  text: "A bow, forest magic and an animal companion. Shoots before the enemy can reach you, with a wolf, bear or hawk at your side.",
  perLevel: { maxHp: 8, attack: 2 },
  base: { maxHp: 80, attack: 10, firstStrike: 1, aimChance: 0.35, spirits: 3, regrowth: 0.065, guardChance: 0.2, diveChance: 0.2 },

  // The companions. The player picks one on the Skills tab; "stance" holds the choice.
  stanceLabel: "Companion",
  stances: {
    wolf: { name: "Wolf", text: "Bites every turn for 30% of your attack. The steady damage dealer." },
    bear: { name: "Bear", text: "Has a chance to take a hit for you, and mauls every turn for 10% of your attack. The protector." },
    hawk: { name: "Hawk", text: "Has a chance each turn to dive for 100% of your attack, ignoring armor, and blind the enemy so it misses its turn." }
  },

  gearLabel: "Bow",
  gearTypes: { longbow: "Longbow", spirit: "Spirit Bow", bloom: "Bloom Bow" },
  dotLabel: "Spirit damage",

  upgrades: [
    { id: "quickDraw", name: "Quick Draw", text: "+3 attack", bonus: { attack: 3 } },
    { id: "eagleEye", name: "Eagle Eye", text: "Longbow: +5% aimed shot chance", bonus: { aimChance: 0.05 } },
    { id: "packLeader", name: "Pack Leader", text: "Spirit Bow: +1 spirit", bonus: { spirits: 1 } },
    { id: "overgrowth", name: "Overgrowth", text: "Bloom Bow: +1% healing per shot", bonus: { regrowth: 0.01 } }
  ],

  skills: [
    { id: "marksmanship", name: "Marksmanship", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "endurance", name: "Endurance", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "packTactics", name: "Pack Tactics", text: "Spirits deal +10% damage", bonus: { dotPower: 0.1 }, cost: 1 },
    { id: "openingVolley", name: "Opening Volley", text: "The enemy misses 1 more turn at the start of a fight", bonus: { firstStrike: 1 }, cost: 5 },
    { id: "longbowMastery", name: "Longbow Mastery", text: "Longbow: +3% aimed shot chance", bonus: { aimChance: 0.03 }, cost: 2 },
    { id: "spiritMastery", name: "Spirit Mastery", text: "Spirit Bow: +1 spirit", bonus: { spirits: 1 }, cost: 2 },
    { id: "bloomMastery", name: "Bloom Mastery", text: "Bloom Bow: +1% healing per shot", bonus: { regrowth: 0.01 }, cost: 2 },
    { id: "beastBond", name: "Beast Bond", text: "Your companion deals +10% damage", bonus: { bond: 0.1 }, cost: 1 },
    { id: "bearMastery", name: "Bear Mastery", text: "Bear: +2% chance to take a hit for you", bonus: { guardChance: 0.02 }, cost: 1 },
    { id: "hawkMastery", name: "Hawk Mastery", text: "Hawk: +2% dive chance", bonus: { diveChance: 0.02 }, cost: 1 }
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
        { id: "marksman", name: "Marksman", text: "Longbow: +10% aimed shot chance", bonus: { aimChance: 0.1 } },
        { id: "beastmaster", name: "Beastmaster", text: "Spirit Bow: +2 spirits", bonus: { spirits: 2 } },
        { id: "druid", name: "Druid", text: "Bloom Bow: +2% healing per shot", bonus: { regrowth: 0.02 } }
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
        { id: "spiritLord", name: "Spirit Lord", text: "+100% health and Spirit Bow: +3 spirits", bonus: { healthPercent: 1, spirits: 3 } }
      ]
    }
  ],

  relics: [
    { id: "hawkFeather", name: "Hawk Feather", text: "Longbow: +10% aimed shot chance", bonus: { aimChance: 0.1 } },
    { id: "wolfTotem", name: "Wolf Totem", text: "Spirit Bow: +1 spirit", bonus: { spirits: 1 } },
    { id: "heartwood", name: "Heartwood", text: "Bloom Bow: +2% healing per shot", bonus: { regrowth: 0.02 } }
  ],

  startFight: rangerStartFight,
  attack: rangerAttack,
  whenAttacked: rangerWhenAttacked,
  damageDivider: rangerDamageDivider,
  dotPerStack: rangerDotPerStack,
  statLine: rangerStatLine,
  gearInfo: rangerGearInfo
};

// How many more turns the enemy is still too far away to attack
let rangerFreeTurns = 0;

// Runs at the start of every fight
function rangerStartFight() {
  rangerFreeTurns = Math.min(maxFreeTurns, totalBonus("firstStrike"));
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

  // Aim chance past 100% adds to the aimed shot's damage instead
  if (weapon === "longbow" && chance(totalBonus("aimChance"))) {
    damage = damage * (2.5 + overflow("aimChance", 1));
    say("An aimed shot finds a weak spot!");
  }
  hitMonster(damage);

  if (weapon === "spirit") {
    addDotStack(totalBonus("spirits"));
  }

  // The bloom bow heals you, and its thorns hurt the enemy by as much, ignoring armor
  if (weapon === "bloom") {
    healPlayer(playerMaxHp * totalBonus("regrowth"));
    magicHitMonster(playerMaxHp * totalBonus("regrowth"));
  }

  // Every summoned spirit attacks too
  monsterHp = monsterHp - dotDamage();

  companionAttack();
}

// The numbers behind the companions. Change these to retune them.
const wolfBite = 0.3;       // the wolf bites for this share of your attack every turn
const bearMaul = 0.1;       // the bear mauls for this share of your attack every turn
const hawkDive = 1;         // a hawk's dive hits for this many times your attack

// The companion's part of your turn
function companionAttack() {
  let power = 1 + totalBonus("bond");

  if (stance === "wolf") {
    hitMonster(playerAttack * wolfBite * power);
  }

  if (stance === "bear") {
    hitMonster(playerAttack * bearMaul * power);
  }

  // Dive chance past its limit makes the dive hit harder instead
  if (stance === "hawk" && chance(cappedChance("diveChance"))) {
    magicHitMonster(playerAttack * (hawkDive + overflow("diveChance", maxChance)) * power);
    monsterStunned = true;
    say("Your hawk dives at the enemy's eyes!");
  }
}

function rangerWhenAttacked() {
  if (stance === "bear" && chance(cappedChance("guardChance"))) {
    say("Your bear takes the blow for you!");
    return true;
  }
  return false;
}

// Guard chance past its limit reduces all damage taken instead (it is divided by this)
function rangerDamageDivider() {
  if (stance === "bear") {
    return 1 + overflow("guardChance", maxChance);
  }
  return 1;
}

// What the companion is doing, for the "You" panel
function companionLine() {
  let power = 1 + totalBonus("bond");

  if (stance === "wolf") {
    return " Wolf: bites every turn for " + percent(wolfBite * power) + " of your attack.";
  }
  if (stance === "bear") {
    return " Bear: " + percent(cappedChance("guardChance")) + " chance to take a hit for you, and mauls for " + percent(bearMaul * power) + " of your attack."
      + overflowNote(overflow("guardChance", maxChance), "damage resistance");
  }
  return " Hawk: " + percent(cappedChance("diveChance")) + " chance each turn to dive for " + percent((hawkDive + overflow("diveChance", maxChance)) * power) + " of your attack and blind the enemy.";
}

// The damage of one spirit each turn
function rangerDotPerStack() {
  return Math.max(1, Math.round(playerAttack * 0.25));
}

function rangerStatLine() {
  return "Range: the enemy misses its first " + Math.min(maxFreeTurns, totalBonus("firstStrike")) + " turn(s) of every fight."
    + overflowNote(overflow("firstStrike", maxFreeTurns) * extraOpeningDamage, "damage on those turns")
    + companionLine();
}

function rangerGearInfo() {
  if (weapon === "longbow") {
    return "Longbow: " + percent(totalBonus("aimChance")) + " chance of an aimed shot for 2.5 times the damage.";
  }
  if (weapon === "spirit") {
    return "Spirit Bow: every shot summons a spirit that attacks each turn (up to " + totalBonus("spirits") + " spirits).";
  }
  return "Bloom Bow: every shot heals you for " + percent(totalBonus("regrowth")) + " of your health, and its thorns deal the same amount as damage. Health makes this bow stronger.";
}
