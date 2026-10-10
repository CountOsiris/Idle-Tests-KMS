// =====================================================================
//  The Barbarian - two-handed weapons, lifesteal and rage
// =====================================================================
// Bonus words only the Barbarian uses:
//   lifesteal    health stolen from damage dealt     (0.05 means +5%)
//   rage         extra damage below half health      (0.1 means +10%)
//   bleedStacks  most axe bleed stacks               (2 means +2)
//   critChance   sword critical chance               (0.1 means +10%)
//   parryChance  sword parry chance                  (0.1 means +10%)
//   critPower    sword: extra damage of a critical   (0.1 means +10%)
//   stunChance   club stun chance                    (0.15 means +15%)
//   clubPower    club: extra damage of every hit     (0.04 means +4%)
// and the words of its keystones (floor 51; see "Keystones" in data.js):
//   bleedCarry   axe: share of bleed stacks passed to the next enemy; bleeding stops healing
//   riposte      sword: 1 = every parry strikes back
//   shatter      club: 1 = double damage on an enemy stunned the turn before
//   alwaysRage   1 = Rage at any health
//
// Words a perk can MULTIPLY (see "multiply" in data.js). These are the big ones:
//   bleed      all bleeding damage            (2 means bleeding deals double)
//   swordCrit  the damage of a sword's critical hits
//   club       every hit with a club
//   rage       the bonus damage below half health
//
// The four ways to build a Barbarian:
//   Bleeder   (axe)   - stacks bleeding, which also feeds lifesteal. Long fights and bosses.
//   Duelist   (sword) - critical hits and parries. Burst damage and avoided hits.
//   Crusher   (club)  - heavy hits, broken armor and stuns. Control.
//   Berserker (any)   - rage: far more damage below half health, kept alive by lifesteal.
//
// What each list is for:
//   base       - the numbers the class starts with
//   perLevel   - the health and attack every level adds by itself
//   gearTypes  - the kinds of weapon the class can fight with (picked at the blacksmith)
//   upgrades   - every boss gives one. Lost on death. Each level gives the bonus again.
//                build: "axe" means it is only given while fighting with an axe.
//                (For the Elementalist, build is an element instead.) No build = any weapon.
//   skills     - bought with skill points (one per level). Kept until the class ascends.
//                Each level of a skill gives the bonus again and costs "cost" points.
//                maxLevel is how far it can be raised; 0 means there is no limit.
//   milestones - kept forever. The player picks ONE perk per milestone.
//   relics     - boss drops only this class can find. Lost on death. "build" works as above.

classes.barbarian = {
  name: "Barbarian",
  icon: "⚔️",
  art: "art/barbarian.png",
  text: "Two-handed weapons and lifesteal. Hits hard and heals from the damage dealt.",
  perLevel: { maxHp: 8, attack: 2 },
  base: { maxHp: 80, attack: 8, lifesteal: 0.1, bleedStacks: 4, critChance: 0.2, parryChance: 0.2, stunChance: 0.3 },

  gearLabel: "Weapon",
  gearTypes: { axe: "Axe", sword: "Sword", club: "Club" },
  // The little picture of each kind. To use a drawing instead, add for example
  //   gearArt: { axe: "art/axe.png" }
  gearIcons: { axe: "🪓", sword: "⚔️", club: "🏏" },
  dotLabel: "Bleeding",
  dotType: "affliction",
  healLabel: "Lifesteal",     // what the class's own healing is called in the run summary

  upgrades: [
    { id: "bloodthirst", name: "Bloodthirst", text: "+5% lifesteal", bonus: { lifesteal: 0.05 } },
    { id: "deepWounds", name: "Deep Wounds", text: "Axe: +1 bleed stack", build: "axe", bonus: { bleedStacks: 1 } },
    { id: "precision", name: "Precision", text: "Sword: +5% critical and parry chance", build: "sword", bonus: { critChance: 0.05, parryChance: 0.05 } },
    { id: "heavyBlows", name: "Heavy Blows", text: "Club: +5% stun chance", build: "club", bonus: { stunChance: 0.05 } },
    { id: "fury", name: "Fury", text: "Rage: +15% damage while below half health", bonus: { rage: 0.15 } }
  ],

  // One skill for each build, so there is never a question of where a build's points go
  skills: [
    { id: "might", name: "Power", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "toughness", name: "Toughness", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "rage", name: "Rage", text: "Rage: +5% damage while below half health, and +1% lifesteal", bonus: { rage: 0.05, lifesteal: 0.01 }, cost: 1 },
    { id: "axeMastery", name: "Axe Mastery", text: "Axe: +1 bleed stack and bleeding deals +8% damage", bonus: { bleedStacks: 1, dotPower: 0.08 }, cost: 1 },
    { id: "swordMastery", name: "Sword Mastery", text: "Sword: +1% critical and parry chance, and +2% critical damage", bonus: { critChance: 0.01, parryChance: 0.01, critPower: 0.02 }, cost: 1 },
    { id: "clubMastery", name: "Club Mastery", text: "Club: hits deal +2% damage and +1.5% stun chance", bonus: { clubPower: 0.02, stunChance: 0.015 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "thickSkin", name: "Thick Skin", text: "health x1.1", multiply: { health: 1.1 } },
        { id: "bruteStrength", name: "Brute Strength", text: "attack x1.1", multiply: { attack: 1.1 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "bloodlust", name: "Bloodlust", text: "+5% lifesteal", bonus: { lifesteal: 0.05 } },
        { id: "ironHide", name: "Iron Hide", text: "+3 armor", bonus: { armor: 3 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "butcher", name: "Butcher", text: "Axe: +2 bleed stacks", bonus: { bleedStacks: 2 } },
        { id: "duelist", name: "Duelist", text: "Sword: +10% critical and parry chance", bonus: { critChance: 0.1, parryChance: 0.1 } },
        { id: "skullcracker", name: "Skullcracker", text: "Club: +15% stun chance", bonus: { stunChance: 0.15 } },
        { id: "bloodrager", name: "Bloodrager", text: "Rage: +40% damage while below half health", bonus: { rage: 0.4 } }
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
        { id: "juggernaut", name: "Juggernaut", text: "health x1.5 and +5 armor", bonus: { armor: 5 }, multiply: { health: 1.5 } },
        { id: "berserker", name: "Ravager", text: "+30% attack and +10% lifesteal", bonus: { attackPercent: 0.3, lifesteal: 0.1 } },
        { id: "flayer", name: "Flayer", text: "Axe: bleeding damage x2.5", multiply: { bleed: 2.5 } },
        { id: "swordmaster", name: "Swordmaster", text: "Sword: critical hit damage x1.5", multiply: { swordCrit: 1.5 } },
        { id: "bonebreaker", name: "Bonebreaker", text: "Club: damage of every hit x1.6", multiply: { club: 1.6 } },
        { id: "frenzy", name: "Frenzy", text: "Rage x3: three times the bonus damage while below half health", multiply: { rage: 3 } }
      ]
    },
    // KEYSTONES: each changes a rule of one weapon, and costs something. This milestone is
    // optional: pick one, or none (press the chosen one again to let it go).
    // See "Keystones" in data.js.
    {
      floor: 51,
      keystones: true,
      perks: [
        { id: "festeringWounds", name: "Festering Wounds", keystone: true, text: "Axe: half of an enemy's bleed stacks pass to the next enemy. Bleeding no longer heals you", bonus: { bleedCarry: 0.5 } },
        { id: "riposteStance", name: "Counterstroke", keystone: true, text: "Sword: every parry strikes back with a sword hit. You take 15% more damage", bonus: { riposte: 1 }, multiply: { damageTaken: 1.15 } },
        { id: "shatter", name: "Shatter", keystone: true, text: "Club: your hit on an enemy you stunned the turn before deals double damage. health x0.85", bonus: { shatter: 1 }, multiply: { health: 0.85 } },
        { id: "deathWish", name: "Death Wish", keystone: true, text: "Rage is always on, at any health. You no longer heal after a kill", bonus: { alwaysRage: 1, noKillHeal: 1 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "warlord", name: "Warlord", text: "+50% attack", bonus: { attackPercent: 0.5 } },
        { id: "unbreakable", name: "Unbreakable", text: "health x1.75", multiply: { health: 1.75 } },
        { id: "bloodletter", name: "Bloodletter", text: "Axe: +25% attack, +4 bleed stacks and bleeding deals +50% damage", bonus: { attackPercent: 0.25, bleedStacks: 4, dotPower: 0.5 } },
        { id: "blademaster", name: "Blademaster", text: "Sword: +25% attack, +10% critical and parry chance, +60% critical damage", bonus: { attackPercent: 0.25, critChance: 0.1, parryChance: 0.1, critPower: 0.6 } },
        { id: "earthshaker", name: "Earthshaker", text: "Club: +25% attack, +10% stun chance and hits deal +40% damage", bonus: { attackPercent: 0.25, stunChance: 0.1, clubPower: 0.4 } },
        { id: "bloodrage", name: "Unchained", text: "+25% attack, and Rage: +100% damage while below half health", bonus: { attackPercent: 0.25, rage: 1 } },
        { id: "scarredHide", name: "Scarred Hide", text: "You take 25% less damage", multiply: { damageTaken: 0.75 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "bloodGod", name: "Blood God", text: "+15% lifesteal, and Rage x3 again", bonus: { lifesteal: 0.15 }, multiply: { rage: 3 } },
        { id: "titan", name: "Titan", text: "health x2 and +10 armor", bonus: { armor: 10 }, multiply: { health: 2 } },
        { id: "reaver", name: "Reaver", text: "Axe: bleeding damage x2.5 again", multiply: { bleed: 2.5 } },
        { id: "swordSaint", name: "Sword Saint", text: "Sword: critical hit damage x1.5 again", multiply: { swordCrit: 1.5 } },
        { id: "worldbreaker", name: "Worldbreaker", text: "Club: damage of every hit x1.6 again", multiply: { club: 1.6 } }
      ]
    }
  ],

  // Extra choices at every BREAKTHROUGH (floor 150 and beyond), beside the ones every
  // class has. One for each build: it multiplies that build's own damage again.
  breakthroughs: [
    { id: "deeperWounds", name: "Deeper Wounds", text: "Axe: bleeding damage x1.5", multiply: { bleed: 1.5 } },
    { id: "keenerEdge", name: "Keener Edge", text: "Sword: critical hit damage x1.5", multiply: { swordCrit: 1.5 } },
    { id: "heavierClub", name: "Heavier Club", text: "Club: damage of every hit x1.4", multiply: { club: 1.4 } },
    { id: "redMist", name: "Red Mist", text: "Rage x1.5", multiply: { rage: 1.5 } }
  ],

  // Special moves on a cooldown, put in the slots that open on floors 10, 35 and 75
  // (rules in game/abilities.js). "cooldown" is in turns of fighting. "build" works as
  // for boons. A "bossKiller" starts set to "Bosses only". "use" is what it does, built
  // from the pieces in game/abilities.js (abilityHit, abilitySpell, abilityStun...).
  abilities: [
    { id: "cleave", name: "Cleave", text: "Axe: 2 turns of your damage at once, and 3 more bleed stacks", build: "axe", cooldown: 6,
      use: function () { abilityTurns(2); abilityStacks(3, "bleedStacks"); } },
    { id: "riposte", name: "Riposte", text: "Sword: 3 turns of your damage in one thrust", build: "sword", cooldown: 6,
      use: function () { abilityTurns(3); } },
    { id: "earthshatter", name: "Earthshatter", text: "Club: 2.5 turns of your damage in one blow, and the enemy is stunned", build: "club", cooldown: 7,
      use: function () { abilityTurns(2.5); abilityStun(); } },
    { id: "battleCry", name: "Battle Cry", text: "All your damage +100% for 5 turns", cooldown: 15,
      use: function () { abilityBoost(1, 5); } },
    { id: "execute", name: "Execute", text: "Boss killer: 8 turns of your damage in one blow, doubled against an enemy below half health", cooldown: 30, bossKiller: true,
      use: function () { abilityTurns(monsterHp < monsterMaxHp / 2 ? 16 : 8); } }
  ],

  relics: [
    { id: "vampireFang", name: "Vampire Fang", text: "+8% lifesteal, and you heal for 3% of the damage your turns deal", bonus: { lifesteal: 0.08, leech: 0.03 } },
    { id: "serratedEdge", name: "Serrated Edge", text: "Axe: +1 bleed stack, and all your damage +20% against an enemy below half health", build: "axe", bonus: { bleedStacks: 1, finisher: 0.2 } },
    { id: "duelistsGlove", name: "Duelist's Glove", text: "Sword: +5% critical and parry chance, and a 4% chance to avoid any attack", build: "sword", bonus: { critChance: 0.05, parryChance: 0.05, sidestep: 0.04 } },
    { id: "giantsKnuckle", name: "Giant's Knuckle", text: "Club: +10% stun chance, and all your damage +40% on the first turn of every fight", build: "club", bonus: { stunChance: 0.1, opener: 0.4 } },
    { id: "berserkersTorc", name: "Berserker's Torc", text: "Rage: +25% damage while below half health, and every kill makes all your damage 0.5% stronger for the rest of the run", bonus: { rage: 0.25, killStreak: 0.005 } }
  ],

  // The functions below, which make the class fight its own way
  startFight: barbarianStartFight,
  damageTypes: barbarianDamageTypes,
  attack: barbarianAttack,
  whenAttacked: barbarianWhenAttacked,
  damageDivider: barbarianDamageDivider,
  dotPerStack: barbarianDotPerStack,
  statLine: barbarianStatLine,
  gearInfo: barbarianGearInfo
};

// The damage types this class is dealing right now (for the tower list)
function barbarianDamageTypes() {
  if (weapon === "club") {
    return ["crushing"];
  }
  if (weapon === "axe") {
    return ["slashing", "affliction"];
  }
  return ["slashing"];
}

// A club is heavy: every hit with one is multiplied by this
const clubHit = 1.2;

// ...and breaks this much of the enemy's armor (0.03 means its armor blocks 3% less)
const clubArmorBreak = 0.03;

// Shatter (keystone): did your last hit stun the enemy?
let barbarianStunnedLast = false;

// Runs at the start of every fight
function barbarianStartFight() {
  barbarianStunnedLast = false;

  // Festering Wounds (keystone): part of the last enemy's bleeding passes to this one
  if (weapon === "axe" && totalBonus("bleedCarry") > 0) {
    dotStacks = Math.min(totalBonus("bleedStacks"), Math.floor(lastFightStacks * totalBonus("bleedCarry")));
  }
}

// The class's turn, once per second
function barbarianAttack() {
  let damage = playerAttack;

  // (the Death Wish keystone keeps Rage on at any health)
  if (playerHp < playerMaxHp / 2 || totalBonus("alwaysRage") > 0) {
    damage = damage * (1 + totalBonus("rage") * multiplier("rage"));
  }

  // Critical chance past 100% adds to the critical damage instead
  if (weapon === "sword" && chance(totalBonus("critChance"))) {
    damage = damage * (2 + totalBonus("critPower") + overflow("critChance", 1)) * multiplier("swordCrit");
    say("Critical hit!");
  }

  // Stun chance past its limit makes the club hit harder instead
  if (weapon === "club") {
    damage = damage * (clubHit + totalBonus("clubPower") + overflow("stunChance", maxChance)) * multiplier("club");
    if (barbarianStunnedLast && totalBonus("shatter") > 0) {
      damage = damage * 2;
    }
  }
  barbarianStunnedLast = false;

  // Barbarians heal from the damage they deal
  // Axes and swords slash, a club crushes
  let type = "slashing";
  if (weapon === "club") {
    type = "crushing";
  }
  let dealt = hitMonster(damage, type);
  healPlayer(Math.max(1, dealt * totalBonus("lifesteal")));

  if (weapon === "axe") {
    addDotStack(totalBonus("bleedStacks"));

    // The bleeding feeds lifesteal as well
    let bled = dotDamage();
    monsterHp = monsterHp - bled;
    if (totalBonus("bleedCarry") === 0) {
      healPlayer(bled * totalBonus("lifesteal"));
    }
  }

  if (weapon === "club") {
    monsterArmor = Math.max(0, monsterArmor - clubArmorBreak);
    if (chance(cappedChance("stunChance"))) {
      monsterStunned = true;
      barbarianStunnedLast = true;
      say("You stun the enemy!");
    }
  }
}

// Runs when the monster attacks. Return true if the attack is avoided.
function barbarianWhenAttacked() {
  if (weapon === "sword" && chance(cappedChance("parryChance"))) {
    say("You parry the attack!");
    if (totalBonus("riposte") > 0) {
      hitMonster(playerAttack, "slashing");
    }
    return true;
  }
  return false;
}

// Parry chance past its limit reduces all damage taken instead (it is divided by this)
function barbarianDamageDivider() {
  if (weapon === "sword") {
    return 1 + overflow("parryChance", maxChance);
  }
  return 1;
}

// Damage per turn of one bleed stack
function barbarianDotPerStack() {
  return Math.max(1, Math.round(playerAttack * 0.12 * multiplier("bleed")));
}

// The class's special line in the "You" panel
function barbarianStatLine() {
  return "Lifesteal: " + percent(totalBonus("lifesteal")) + ". Rage: +" + percent(totalBonus("rage") * multiplier("rage")) + " damage while below half health";
}

// The description under the weapon
function barbarianGearInfo() {
  if (weapon === "axe") {
    return "Axe: every hit makes the enemy bleed more each turn (up to " + totalBonus("bleedStacks") + " stacks). The bleeding heals you through lifesteal too.";
  }
  if (weapon === "sword") {
    return "Sword: " + percent(Math.min(1, totalBonus("critChance"))) + " chance of a critical hit for x" + (2 + totalBonus("critPower") + overflow("critChance", 1)).toFixed(1) + " damage and " + percent(cappedChance("parryChance")) + " chance to parry an attack."
      + overflowNote(overflow("parryChance", maxChance), "damage resistance");
  }
  return "Club: hits " + percent(clubHit - 1 + totalBonus("clubPower")) + " harder, breaks " + percent(clubArmorBreak) + " off the enemy's armor every hit and has a " + percent(cappedChance("stunChance")) + " chance to stun."
    + overflowNote(overflow("stunChance", maxChance), "damage");
}
