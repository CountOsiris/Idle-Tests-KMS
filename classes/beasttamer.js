// =====================================================================
//  The Beast Tamer - a staff, and an animal that does the fighting
// =====================================================================
// The eighth class. It is opened with legend marks (see legendUnlocks in data.js and
// "unlock" below), so a player meets it late.
//
// The Beast Tamer's "weapon" is its COMPANION, picked at the blacksmith like any other
// class's weapon. The tamer only taps the enemy with a staff; the animal does the rest.
//   Wolf Pack - MANY SMALL BITES. Three wolves bite every turn, and each bite in a turn
//               lands harder than the one before it.
//   Bear      - ONE HEAVY BLOW, AND A GUARD. A maul that can stun, and the bear stands
//               in front of you: you take less damage.
//   Hawk      - CRITICAL DIVES. One strike with a high chance of a critical hit, and it
//               harries the enemy so that some of its attacks miss.
//
// Bonus words only the Beast Tamer uses:
//   bond         extra companion damage for every 10% of your
//                health that is missing                        (0.05 means +5%)
//   packSize     wolf pack: more wolves                        (1 means +1 wolf)
//   bitePower    wolf pack: extra damage of every bite         (0.03 means +3% of attack)
//   packTactics  wolf pack: how much harder each bite in a
//                turn lands than the one before                (0.1 means +10%)
//   maulPower    bear: extra damage of the maul                (0.05 means +5% of attack)
//   stunChance   bear: chance the maul stuns                   (0.1 means +10%)
//   guard        bear: share of every hit the bear takes       (0.05 means +5%)
//   critChance   hawk: chance of a critical dive               (0.1 means +10%)
//   critPower    hawk: extra damage of a critical dive         (0.1 means +10%)
//   harry        hawk: chance the enemy's attack misses        (0.05 means +5%)
// and the words of its keystones (floor 51; see "Keystones" in data.js):
//   alpha        wolf pack: 1 = one great wolf with the whole pack's bite in one
//   bodyguard    bear: extra share of every hit the bear takes
//   blindingDive hawk: chance a critical dive makes the enemy miss its next turn
//
// Words a perk can MULTIPLY (see "multiply" in data.js):
//   wolf      every wolf bite
//   bear      every maul
//   hawkCrit  the damage of a hawk's critical dives
//   bond      the extra damage Bond gives
//
// See classes/barbarian.js for what each list is for.

classes.beasttamer = {
  name: "Beast Tamer",
  icon: "🐺",
  text: "Fights beside an animal: a wolf pack that bites many times, a bear that guards you, or a hawk that dives for critical hits.",
  perLevel: { maxHp: 9, attack: 2 },
  base: { maxHp: 85, attack: 9, bond: 0.05, packTactics: 0.1, stunChance: 0.15, guard: 0.25, critChance: 0.3, harry: 0.15 },

  // Bought with legend marks: the id of the entry in legendUnlocks (data.js) that opens it
  unlock: "beastTamer",

  gearLabel: "Companion",
  gearTypes: { wolf: "Wolf Pack", bear: "Bear", hawk: "Hawk" },
  gearIcons: { wolf: "🐺", bear: "🐻", hawk: "🦅" },
  // An animal is not made of bronze: these are the names of its tiers at the blacksmith,
  // who for this class is a trainer (see gearTiers in data.js; keep the list the same length)
  gearTiers: ["Young", "Grown", "Seasoned", "Alpha", "Elder", "Mythic"],

  upgrades: [
    { id: "wildHeart", name: "Wild Heart", text: "+5% attack", bonus: { attackPercent: 0.05 } },
    { id: "thickHide", name: "Thick Hide", text: "+5% health", bonus: { healthPercent: 0.05 } },
    { id: "packLeader", name: "Pack Leader", text: "Wolf Pack: bites deal +4% of your attack more", build: "wolf", bonus: { bitePower: 0.04 } },
    { id: "grizzled", name: "Grizzled", text: "Bear: the maul deals +15% of your attack more", build: "bear", bonus: { maulPower: 0.15 } },
    { id: "keenTalons", name: "Keen Talons", text: "Hawk: +5% critical dive chance", build: "hawk", bonus: { critChance: 0.05 } },
    { id: "kinship", name: "Kinship", text: "Bond: +2% companion damage for every 10% of your health that is missing", bonus: { bond: 0.02 } }
  ],

  // Power, Toughness, one skill for each companion, and Bond for all of them
  skills: [
    { id: "command", name: "Power", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "hardiness", name: "Toughness", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "bond", name: "Bond", text: "Bond: +1% companion damage for every 10% of your health that is missing", bonus: { bond: 0.01 }, cost: 1 },
    { id: "wolfMastery", name: "Wolf Mastery", text: "Wolf Pack: bites deal +1.5% of your attack more, and each bite in a turn lands +1% harder than the one before", bonus: { bitePower: 0.015, packTactics: 0.01 }, cost: 1 },
    { id: "bearMastery", name: "Bear Mastery", text: "Bear: the maul deals +6% of your attack more and +1% stun chance", bonus: { maulPower: 0.06, stunChance: 0.01 }, cost: 1 },
    { id: "hawkMastery", name: "Hawk Mastery", text: "Hawk: +1.5% critical dive chance and +5% critical damage", bonus: { critChance: 0.015, critPower: 0.05 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "weathered", name: "Weathered", text: "health x1.1", multiply: { health: 1.1 } },
        { id: "firmHand", name: "Firm Hand", text: "attack x1.1", multiply: { attack: 1.1 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "hideArmor", name: "Hide Armor", text: "+3 armor", bonus: { armor: 3 } },
        { id: "bloodBond", name: "Blood Bond", text: "Bond: +3% companion damage for every 10% of your health that is missing", bonus: { bond: 0.03 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "fourthWolf", name: "Fourth Wolf", text: "Wolf Pack: one more wolf", bonus: { packSize: 1 } },
        { id: "greatBear", name: "Great Bear", text: "Bear: +10% stun chance and the bear takes +5% more of every hit", bonus: { stunChance: 0.1, guard: 0.05 } },
        { id: "falconer", name: "Falconer", text: "Hawk: +10% critical dive chance", bonus: { critChance: 0.1 } },
        { id: "packmate", name: "Packmate", text: "Bond: +6% companion damage for every 10% of your health that is missing", bonus: { bond: 0.06 } }
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
        { id: "beastlord", name: "Beastlord", text: "+30% attack", bonus: { attackPercent: 0.3 } },
        { id: "oldGrowth", name: "Old Growth", text: "health x1.5 and +5 armor", bonus: { armor: 5 }, multiply: { health: 1.5 } },
        { id: "direPack", name: "Dire Pack", text: "Wolf Pack: bite damage x1.8", multiply: { wolf: 1.8 } },
        { id: "caveBear", name: "Cave Bear", text: "Bear: maul damage x1.8", multiply: { bear: 1.8 } },
        { id: "stormHawk", name: "Storm Hawk", text: "Hawk: critical dive damage x1.8", multiply: { hawkCrit: 1.8 } },
        { id: "oneSoul", name: "One Soul", text: "Bond x3: three times the companion damage for your missing health", multiply: { bond: 3 } }
      ]
    },
    // KEYSTONES: each changes a rule of one companion, and costs something. This milestone is
    // optional: pick one, or none (press the chosen one again to let it go).
    // See "Keystones" in data.js.
    {
      floor: 51,
      keystones: true,
      perks: [
        { id: "alpha", name: "Alpha", keystone: true, text: "Wolf Pack: one great wolf instead of a pack. A single bite with the whole pack's damage, +30%, but no bite lands harder than the one before", bonus: { alpha: 1 } },
        { id: "bodyguard", name: "Bodyguard", keystone: true, text: "Bear: the bear takes 20% more of every hit for you. Maul damage x0.75", bonus: { bodyguard: 0.2 }, multiply: { bear: 0.75 } },
        { id: "blindingDive", name: "Blinding Dive", keystone: true, text: "Hawk: a critical dive has a 50% chance to make the enemy miss its next turn. Critical dive damage x0.8", bonus: { blindingDive: 0.5 }, multiply: { hawkCrit: 0.8 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "apex", name: "Apex", text: "+50% attack", bonus: { attackPercent: 0.5 } },
        { id: "ironwoodHeart", name: "Ironwood Heart", text: "health x1.75", multiply: { health: 1.75 } },
        { id: "wolfKing", name: "Wolf King", text: "Wolf Pack: +25% attack, one more wolf, and bites deal +10% of your attack more", bonus: { attackPercent: 0.25, packSize: 1, bitePower: 0.1 } },
        { id: "ursine", name: "Ursine", text: "Bear: +25% attack, the maul deals +80% of your attack more, and +8% stun chance", bonus: { attackPercent: 0.25, maulPower: 0.8, stunChance: 0.08 } },
        { id: "skyHunter", name: "Sky Hunter", text: "Hawk: +25% attack, +10% critical dive chance and +80% critical damage", bonus: { attackPercent: 0.25, critChance: 0.1, critPower: 0.8 } },
        { id: "kindred", name: "Kindred", text: "+25% attack, and Bond: +10% companion damage for every 10% of your health that is missing", bonus: { attackPercent: 0.25, bond: 0.1 } },
        { id: "wary", name: "Wary", text: "You take 25% less damage", multiply: { damageTaken: 0.75 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "fenrir", name: "Fenrir's Brood", text: "Wolf Pack: bite damage x1.8 again", multiply: { wolf: 1.8 } },
        { id: "ursaMajor", name: "Ursa Major", text: "Bear: maul damage x1.8 again", multiply: { bear: 1.8 } },
        { id: "roc", name: "Roc", text: "Hawk: critical dive damage x1.8 again", multiply: { hawkCrit: 1.8 } },
        { id: "oneHeart", name: "One Heart", text: "Bond x3 again", multiply: { bond: 3 } },
        { id: "ancientOne", name: "Ancient One", text: "health x2 and +8 armor", bonus: { armor: 8 }, multiply: { health: 2 } }
      ]
    }
  ],

  // Extra choices at every BREAKTHROUGH (floor 150 and beyond), beside the ones every
  // class has. One for each build: it multiplies that build's own damage again.
  breakthroughs: [
    { id: "sharperFangs", name: "Sharper Fangs", text: "Wolf Pack: bite damage x1.4", multiply: { wolf: 1.4 } },
    { id: "heavierPaws", name: "Heavier Paws", text: "Bear: maul damage x1.4", multiply: { bear: 1.4 } },
    { id: "higherDives", name: "Higher Dives", text: "Hawk: critical dive damage x1.5", multiply: { hawkCrit: 1.5 } },
    { id: "deeperBond", name: "Deeper Bond", text: "Bond x1.5", multiply: { bond: 1.5 } }
  ],

  // Special moves on a cooldown, put in the slots that open on floors 10, 35 and 75
  // (rules in game/abilities.js). "cooldown" is in turns of fighting. "build" works as
  // for boons. A "bossKiller" starts set to "Bosses only". "use" is what it does, built
  // from the pieces in game/abilities.js (abilityHit, abilitySpell, abilityStun...).
  abilities: [
    { id: "packHunt", name: "Pack Hunt", text: "Wolf Pack: the whole pack at once, for 3 turns of your damage", build: "wolf", cooldown: 6,
      use: function () { abilityTurns(3); } },
    { id: "bearHug", name: "Bear Hug", text: "Bear: 2.5 turns of your damage, and the enemy is held for a turn", build: "bear", cooldown: 7,
      use: function () { abilityTurns(2.5); abilityStun(); } },
    { id: "stoop", name: "Stoop", text: "Hawk: a dive from the clouds for 3 turns of your damage", build: "hawk", cooldown: 6,
      use: function () { abilityTurns(3); } },
    { id: "tendWounds", name: "Tend Wounds", text: "Heal 30% of your health", cooldown: 12,
      use: function () { abilityHeal(0.3); } },
    { id: "stampede", name: "Stampede", text: "Boss killer: every beast in earshot, for 10 turns of your damage", cooldown: 30, bossKiller: true,
      use: function () { abilityTurns(10); } }
  ],

  relics: [
    { id: "wolfsTooth", name: "Wolf's Tooth", text: "Wolf Pack: one more wolf, and all your damage +20% against an enemy below half health", build: "wolf", bonus: { packSize: 1, finisher: 0.2 } },
    { id: "bearClaw", name: "Bear Claw", text: "Bear: +10% stun chance, and 15% of every attack against you is thrown back at the enemy", build: "bear", bonus: { stunChance: 0.1, brace: 0.15 } },
    { id: "hawkHood", name: "Hawk Hood", text: "Hawk: +8% critical dive chance, and all your damage +50% on the first turn of every fight", build: "hawk", bonus: { critChance: 0.08, opener: 0.5 } },
    { id: "tamersWhistle", name: "Tamer's Whistle", text: "Bond: +4% companion damage for every 10% of your health that is missing, and you heal for 3% of the damage your turns deal", bonus: { bond: 0.04, leech: 0.03 } }
  ],

  damageTypes: tamerDamageTypes,
  attack: tamerAttack,
  whenAttacked: tamerWhenAttacked,
  damageDivider: tamerDamageDivider,
  dotPerStack: tamerDotPerStack,
  statLine: tamerStatLine,
  gearInfo: tamerGearInfo
};

// The numbers behind the companions. Change these to retune them.
const tamerStaffHit = 0.2;    // the tamer's own staff hits for this share of your attack
const wolfCount = 3;          // a pack starts with this many wolves
const wolfBite = 0.25;        // each bites for this share of your attack
const bearMaul = 1.25;        // a maul hits for this many times your attack
const hawkDive = 0.92;        // a dive hits for this many times your attack...
const hawkCrit = 2.5;         // ...and a critical dive multiplies that by this
const alphaBonus = 1.3;       // the Alpha keystone's one wolf bites for the whole pack, times this

// The damage types this class is dealing right now (for the tower list)
function tamerDamageTypes() {
  return ["crushing", "nature"];
}

// Bond: the companion fights harder the more hurt you are. This is what its damage is
// multiplied by: every full 10% of health missing adds the bond.
function tamerBond() {
  let tenths = Math.floor((1 - playerHp / playerMaxHp) * 10 + 0.0001);
  return 1 + Math.max(0, tenths) * totalBonus("bond") * multiplier("bond");
}

// How many wolves the pack has
function tamerWolves() {
  return wolfCount + Math.floor(totalBonus("packSize"));
}

// The share of every hit the bear takes for you (never past the limit on chances)
function tamerGuard() {
  return Math.min(maxChance, totalBonus("guard") + totalBonus("bodyguard"));
}

function tamerAttack() {
  // The tamer's own tap with the staff
  hitMonster(playerAttack * tamerStaffHit, "crushing");

  let power = playerAttack * tamerBond();

  // WOLF PACK: every wolf bites, each a little harder than the one before
  if (weapon === "wolf") {
    let bite = power * (wolfBite + totalBonus("bitePower")) * multiplier("wolf");

    if (totalBonus("alpha") > 0) {
      // Alpha (keystone): one great wolf with the whole pack's bite in it
      hitMonster(bite * tamerWolves() * alphaBonus, "nature");
    } else {
      for (let i = 0; i < tamerWolves(); i++) {
        hitMonster(bite * (1 + totalBonus("packTactics") * i), "nature");
      }
    }
  }

  // BEAR: one maul, which can stun. Stun chance past its limit adds to the maul instead.
  if (weapon === "bear") {
    hitMonster(power * (bearMaul + totalBonus("maulPower") + overflow("stunChance", maxChance)) * multiplier("bear"), "nature");
    if (chance(cappedChance("stunChance"))) {
      monsterStunned = true;
      say("The bear knocks the enemy down!");
    }
  }

  // HAWK: one dive from above, where only half of the enemy's armor is in the way.
  // Critical chance past 100% adds to the critical damage instead.
  if (weapon === "hawk") {
    let damage = power * hawkDive;
    if (chance(totalBonus("critChance"))) {
      damage = damage * (hawkCrit + totalBonus("critPower") + overflow("critChance", 1)) * multiplier("hawkCrit");
      say("The hawk strikes true!");

      // Blinding Dive (keystone)
      if (chance(totalBonus("blindingDive"))) {
        monsterStunned = true;
      }
    }
    hitMonster(damage, "nature", 0.5);
  }
}

// Runs when the monster attacks. Return true if the attack is avoided.
function tamerWhenAttacked() {
  if (weapon === "hawk" && chance(cappedChance("harry"))) {
    say("The hawk harries the enemy, and its attack misses!");
    return true;
  }
  return false;
}

// The bear stands in front: what you take is divided by this
function tamerDamageDivider() {
  if (weapon === "bear") {
    return 1 / (1 - tamerGuard());
  }
  return 1;
}

// The Beast Tamer has no damage over time
function tamerDotPerStack() {
  return 0;
}

function tamerStatLine() {
  return "Bond: your companion deals +" + percent(totalBonus("bond") * multiplier("bond")) + " damage for every 10% of your health that is missing (right now x" + big(Math.round(tamerBond() * 100) / 100) + ")";
}

function tamerGearInfo() {
  if (weapon === "wolf") {
    if (totalBonus("alpha") > 0) {
      return "Wolf Pack: one great wolf bites for " + percent((wolfBite + totalBonus("bitePower")) * tamerWolves() * alphaBonus) + " of your attack.";
    }
    return "Wolf Pack: " + tamerWolves() + " wolves bite every turn for " + percent(wolfBite + totalBonus("bitePower")) + " of your attack each, and each bite lands " + percent(totalBonus("packTactics")) + " harder than the one before.";
  }
  if (weapon === "bear") {
    return "Bear: a maul for " + percent(bearMaul + totalBonus("maulPower")) + " of your attack with a " + percent(cappedChance("stunChance")) + " chance to stun, and the bear takes " + percent(tamerGuard()) + " of every hit for you."
      + overflowNote(overflow("stunChance", maxChance), "damage");
  }
  return "Hawk: a dive for " + percent(hawkDive) + " of your attack past half the enemy's armor, with a " + percent(Math.min(1, totalBonus("critChance"))) + " chance of a critical dive for x" + (hawkCrit + totalBonus("critPower") + overflow("critChance", 1)).toFixed(1) + " damage. The enemy's attacks miss " + percent(cappedChance("harry")) + " of the time.";
}
