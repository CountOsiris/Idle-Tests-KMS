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
//   gearTypes  - the kinds of weapon the class can find in the tower
//   upgrades   - choices in an upgrade area. Lost on death. Each level gives the bonus again.
//   skills     - bought with skill points (one per level). Kept until the class ascends.
//                Each level of a skill gives the bonus again and costs "cost" points.
//                maxLevel is how far it can be raised; 0 means there is no limit.
//   milestones - kept forever. The player picks ONE perk per milestone.
//   relics     - boss drops only this class can find. Lost on death.

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

  upgrades: [
    { id: "bloodthirst", name: "Bloodthirst", text: "+5% lifesteal", bonus: { lifesteal: 0.05 } },
    { id: "deepWounds", name: "Deep Wounds", text: "Axe: +1 bleed stack", bonus: { bleedStacks: 1 } },
    { id: "precision", name: "Precision", text: "Sword: +5% critical and parry chance", bonus: { critChance: 0.05, parryChance: 0.05 } },
    { id: "heavyBlows", name: "Heavy Blows", text: "Club: +5% stun chance", bonus: { stunChance: 0.05 } },
    { id: "fury", name: "Fury", text: "+15% damage while below half health", bonus: { rage: 0.15 } }
  ],

  skills: [
    { id: "might", name: "Might", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "toughness", name: "Toughness", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "savagery", name: "Savagery", text: "Bleeding deals +10% damage", bonus: { dotPower: 0.1 }, cost: 1 },
    { id: "bloodletting", name: "Bloodletting", text: "+2% lifesteal", bonus: { lifesteal: 0.02 }, cost: 1 },
    { id: "rage", name: "Rage", text: "+10% damage while below half health", bonus: { rage: 0.1 }, cost: 1 },
    { id: "axeMastery", name: "Axe Mastery", text: "Axe: +1 bleed stack", bonus: { bleedStacks: 1 }, cost: 2 },
    { id: "swordMastery", name: "Sword Mastery", text: "Sword: +3% critical and parry chance", bonus: { critChance: 0.03, parryChance: 0.03 }, cost: 2 },
    { id: "clubMastery", name: "Club Mastery", text: "Club: +3% stun chance", bonus: { stunChance: 0.03 }, cost: 1 },
    { id: "executioner", name: "Executioner", text: "Sword: +8% critical damage", bonus: { critPower: 0.08 }, cost: 1 },
    { id: "concussion", name: "Concussion", text: "Club: hits deal +4% damage", bonus: { clubPower: 0.04 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "thickSkin", name: "Thick Skin", text: "+30 health", bonus: { maxHp: 30 } },
        { id: "bruteStrength", name: "Brute Strength", text: "+5 attack", bonus: { attack: 5 } }
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
        { id: "bloodrager", name: "Bloodrager", text: "+40% damage while below half health", bonus: { rage: 0.4 } }
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
        { id: "juggernaut", name: "Juggernaut", text: "+50% health and +5 armor", bonus: { healthPercent: 0.5, armor: 5 } },
        { id: "berserker", name: "Berserker", text: "+30% attack and +10% lifesteal", bonus: { attackPercent: 0.3, lifesteal: 0.1 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "warlord", name: "Warlord", text: "+50% attack", bonus: { attackPercent: 0.5 } },
        { id: "unbreakable", name: "Unbreakable", text: "+100% health", bonus: { healthPercent: 1 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "bloodGod", name: "Blood God", text: "+15% lifesteal and +20% rage damage", bonus: { lifesteal: 0.15, rage: 0.2 } },
        { id: "titan", name: "Titan", text: "+150% health and +10 armor", bonus: { healthPercent: 1.5, armor: 10 } }
      ]
    }
  ],

  relics: [
    { id: "vampireFang", name: "Vampire Fang", text: "+8% lifesteal", bonus: { lifesteal: 0.08 } },
    { id: "serratedEdge", name: "Serrated Edge", text: "Axe: +1 bleed stack", bonus: { bleedStacks: 1 } },
    { id: "duelistsGlove", name: "Duelist's Glove", text: "Sword: +5% critical and parry chance", bonus: { critChance: 0.05, parryChance: 0.05 } },
    { id: "giantsKnuckle", name: "Giant's Knuckle", text: "Club: +10% stun chance", bonus: { stunChance: 0.1 } },
    { id: "berserkersTorc", name: "Berserker's Torc", text: "+25% damage while below half health", bonus: { rage: 0.25 } }
  ],

  // The functions below, which make the class fight its own way
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

// The class's turn, once per second
function barbarianAttack() {
  let damage = playerAttack;

  if (playerHp < playerMaxHp / 2) {
    damage = damage * (1 + totalBonus("rage"));
  }

  // Critical chance past 100% adds to the critical damage instead
  if (weapon === "sword" && chance(totalBonus("critChance"))) {
    damage = damage * (2 + totalBonus("critPower") + overflow("critChance", 1));
    say("Critical hit!");
  }

  // Stun chance past its limit makes the club hit harder instead
  if (weapon === "club") {
    damage = damage * (clubHit + totalBonus("clubPower") + overflow("stunChance", maxChance));
  }

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
    healPlayer(bled * totalBonus("lifesteal"));
  }

  if (weapon === "club") {
    if (monsterArmor > 0) {
      monsterArmor = monsterArmor - 1;
    }
    if (chance(cappedChance("stunChance"))) {
      monsterStunned = true;
      say("You stun the enemy!");
    }
  }
}

// Runs when the monster attacks. Return true if the attack is avoided.
function barbarianWhenAttacked() {
  if (weapon === "sword" && chance(cappedChance("parryChance"))) {
    say("You parry the attack!");
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
  return Math.max(1, Math.round(playerAttack * 0.12));
}

// The class's special line in the "You" panel
function barbarianStatLine() {
  return "Lifesteal: " + percent(totalBonus("lifesteal")) + ". Rage: +" + percent(totalBonus("rage")) + " damage while below half health";
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
  return "Club: hits " + percent(clubHit - 1 + totalBonus("clubPower")) + " harder, breaks 1 enemy armor every hit and has a " + percent(cappedChance("stunChance")) + " chance to stun."
    + overflowNote(overflow("stunChance", maxChance), "damage");
}
