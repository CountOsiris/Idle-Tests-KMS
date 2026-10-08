// =====================================================================
//  The Barbarian - two-handed weapons and lifesteal
// =====================================================================
// Bonus words only the Barbarian uses:
//   lifesteal    health stolen from damage dealt     (0.05 means +5%)
//   rage         extra damage below half health      (0.1 means +10%)
//   bleedStacks  most axe bleed stacks               (2 means +2)
//   critChance   sword critical chance               (0.1 means +10%)
//   parryChance  sword parry chance                  (0.1 means +10%)
//   stunChance   club stun chance                    (0.15 means +15%)
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
  text: "Two-handed weapons and lifesteal. Hits hard and heals from the damage dealt.",
  perLevel: { maxHp: 8, attack: 2 },
  base: { maxHp: 80, attack: 8, lifesteal: 0.1, bleedStacks: 3, critChance: 0.2, parryChance: 0.2, stunChance: 0.25 },

  gearLabel: "Weapon",
  gearTypes: { axe: "Axe", sword: "Sword", club: "Club" },
  dotLabel: "Bleeding",

  upgrades: [
    { id: "bloodthirst", name: "Bloodthirst", text: "+5% lifesteal", bonus: { lifesteal: 0.05 } },
    { id: "deepWounds", name: "Deep Wounds", text: "Axe: +1 bleed stack", bonus: { bleedStacks: 1 } },
    { id: "precision", name: "Precision", text: "Sword: +5% critical and parry chance", bonus: { critChance: 0.05, parryChance: 0.05 } },
    { id: "heavyBlows", name: "Heavy Blows", text: "Club: +5% stun chance", bonus: { stunChance: 0.05 } }
  ],

  skills: [
    { id: "might", name: "Might", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "toughness", name: "Toughness", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "savagery", name: "Savagery", text: "Bleeding deals +10% damage", bonus: { dotPower: 0.1 }, cost: 1 },
    { id: "bloodletting", name: "Bloodletting", text: "+2% lifesteal", bonus: { lifesteal: 0.02 }, cost: 1 },
    { id: "rage", name: "Rage", text: "+10% damage while below half health", bonus: { rage: 0.1 }, cost: 1 },
    { id: "axeMastery", name: "Axe Mastery", text: "Axe: +1 bleed stack", bonus: { bleedStacks: 1 }, cost: 2 },
    { id: "swordMastery", name: "Sword Mastery", text: "Sword: +3% critical and parry chance", bonus: { critChance: 0.03, parryChance: 0.03 }, cost: 2 },
    { id: "clubMastery", name: "Club Mastery", text: "Club: +4% stun chance", bonus: { stunChance: 0.04 }, cost: 2 }
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
      floor: 15,
      perks: [
        { id: "butcher", name: "Butcher", text: "Axe: +2 bleed stacks", bonus: { bleedStacks: 2 } },
        { id: "duelist", name: "Duelist", text: "Sword: +10% critical and parry chance", bonus: { critChance: 0.1, parryChance: 0.1 } },
        { id: "skullcracker", name: "Skullcracker", text: "Club: +15% stun chance", bonus: { stunChance: 0.15 } }
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
        { id: "juggernaut", name: "Juggernaut", text: "+100 health and +5 armor", bonus: { maxHp: 100, armor: 5 } },
        { id: "berserker", name: "Berserker", text: "+15 attack and +10% lifesteal", bonus: { attack: 15, lifesteal: 0.1 } }
      ]
    },
    {
      floor: 40,
      perks: [
        { id: "warlord", name: "Warlord", text: "+25 attack", bonus: { attack: 25 } },
        { id: "unbreakable", name: "Unbreakable", text: "+200 health", bonus: { maxHp: 200 } }
      ]
    },
    {
      floor: 50,
      perks: [
        { id: "bloodGod", name: "Blood God", text: "+15% lifesteal and +20% rage damage", bonus: { lifesteal: 0.15, rage: 0.2 } },
        { id: "titan", name: "Titan", text: "+300 health and +10 armor", bonus: { maxHp: 300, armor: 10 } }
      ]
    }
  ],

  relics: [
    { id: "vampireFang", name: "Vampire Fang", text: "+8% lifesteal", bonus: { lifesteal: 0.08 } },
    { id: "serratedEdge", name: "Serrated Edge", text: "Axe: +1 bleed stack", bonus: { bleedStacks: 1 } },
    { id: "duelistsGlove", name: "Duelist's Glove", text: "Sword: +5% critical and parry chance", bonus: { critChance: 0.05, parryChance: 0.05 } },
    { id: "giantsKnuckle", name: "Giant's Knuckle", text: "Club: +10% stun chance", bonus: { stunChance: 0.1 } }
  ],

  // The functions below, which make the class fight its own way
  attack: barbarianAttack,
  whenAttacked: barbarianWhenAttacked,
  damageDivider: barbarianDamageDivider,
  dotPerStack: barbarianDotPerStack,
  statLine: barbarianStatLine,
  gearInfo: barbarianGearInfo
};

// The class's turn, once per second
function barbarianAttack() {
  let damage = playerAttack;

  if (playerHp < playerMaxHp / 2) {
    damage = damage * (1 + totalBonus("rage"));
  }

  // Critical chance past 100% adds to the critical damage instead
  if (weapon === "sword" && chance(totalBonus("critChance"))) {
    damage = damage * (2 + overflow("critChance", 1));
    say("Critical hit!");
  }

  // Stun chance past its limit makes the club hit harder instead
  if (weapon === "club") {
    damage = damage * (1 + overflow("stunChance", maxChance));
  }

  // Barbarians heal from the damage they deal
  let dealt = hitMonster(damage);
  healPlayer(Math.max(1, dealt * totalBonus("lifesteal")));

  if (weapon === "axe") {
    addDotStack(totalBonus("bleedStacks"));
    monsterHp = monsterHp - dotDamage();
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
  return Math.max(1, Math.round(playerAttack * 0.1));
}

// The class's special line in the "You" panel
function barbarianStatLine() {
  return "Lifesteal: " + percent(totalBonus("lifesteal"));
}

// The description under the weapon
function barbarianGearInfo() {
  if (weapon === "axe") {
    return "Axe: every hit makes the enemy bleed more each turn (up to " + totalBonus("bleedStacks") + " stacks).";
  }
  if (weapon === "sword") {
    return "Sword: " + percent(Math.min(1, totalBonus("critChance"))) + " chance to deal double damage and " + percent(cappedChance("parryChance")) + " chance to parry an attack."
      + overflowNote(overflow("critChance", 1), "critical damage")
      + overflowNote(overflow("parryChance", maxChance), "damage resistance");
  }
  return "Club: every hit breaks 1 enemy armor and has a " + percent(cappedChance("stunChance")) + " chance to stun."
    + overflowNote(overflow("stunChance", maxChance), "damage");
}
