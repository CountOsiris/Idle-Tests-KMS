// =====================================================================
//  The Assassin - stealth, poison and critical hits
// =====================================================================
// Bonus words only the Assassin uses:
//   dodge        chance to avoid an attack                   (0.05 means +5%)
//   ambush       extra damage on the first hit of a fight    (1 means +100%)
//   poisonStacks most venom dagger poison stacks             (2 means +2)
//   critChance   stiletto critical chance (triple damage)    (0.1 means +10%)
//
// See classes/barbarian.js for what each list is for.

classes.assassin = {
  name: "Assassin",
  icon: "🗡️",
  art: "art/assassin.png",
  text: "Stealth and poison. Opens every fight with an ambush and slips away from attacks.",
  perLevel: { maxHp: 7, attack: 2 },
  base: { maxHp: 65, attack: 7, dodge: 0.1, ambush: 0.5, poisonStacks: 4, critChance: 0.2 },

  gearLabel: "Blade",
  gearTypes: { venom: "Venom Dagger", stiletto: "Stiletto", shadow: "Shadow Blade" },
  dotLabel: "Poison",

  upgrades: [
    { id: "sharpenedEdge", name: "Sharpened Edge", text: "+3 attack", bonus: { attack: 3 } },
    { id: "smokeBomb", name: "Smoke Bomb", text: "+2% dodge", bonus: { dodge: 0.02 } },
    { id: "backstab", name: "Backstab", text: "+10% ambush damage", bonus: { ambush: 0.1 } },
    { id: "toxicCoating", name: "Toxic Coating", text: "Venom Dagger: +1 poison stack", bonus: { poisonStacks: 1 } },
    { id: "killerInstinct", name: "Killer Instinct", text: "Stiletto: +5% critical chance", bonus: { critChance: 0.05 } }
  ],

  skills: [
    { id: "lethality", name: "Lethality", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "conditioning", name: "Conditioning", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "virulence", name: "Virulence", text: "Poison deals +10% damage", bonus: { dotPower: 0.1 }, cost: 1 },
    { id: "evasion", name: "Evasion", text: "+1% dodge", bonus: { dodge: 0.01 }, cost: 1 },
    { id: "ambushTraining", name: "Ambush Training", text: "+10% ambush damage", bonus: { ambush: 0.1 }, cost: 1 },
    { id: "venomMastery", name: "Venom Mastery", text: "Venom Dagger: +1 poison stack", bonus: { poisonStacks: 1 }, cost: 2 },
    { id: "stilettoMastery", name: "Stiletto Mastery", text: "Stiletto: +3% critical chance", bonus: { critChance: 0.03 }, cost: 2 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "nimble", name: "Nimble", text: "+5% dodge", bonus: { dodge: 0.05 } },
        { id: "cutthroat", name: "Cutthroat", text: "+5 attack", bonus: { attack: 5 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "lurker", name: "Lurker", text: "+25% ambush damage", bonus: { ambush: 0.25 } },
        { id: "leatherWraps", name: "Leather Wraps", text: "+25 health", bonus: { maxHp: 25 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "toxicologist", name: "Toxicologist", text: "Venom Dagger: +2 poison stacks", bonus: { poisonStacks: 2 } },
        { id: "executioner", name: "Executioner", text: "Stiletto: +10% critical chance", bonus: { critChance: 0.1 } },
        { id: "phantom", name: "Phantom", text: "+8% dodge", bonus: { dodge: 0.08 } }
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
        { id: "nightStalker", name: "Night Stalker", text: "+24% attack and +10% dodge", bonus: { attackPercent: 0.24, dodge: 0.1 } },
        { id: "deathMark", name: "Death Mark", text: "+50% ambush damage and +40% health", bonus: { ambush: 0.5, healthPercent: 0.4 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "killer", name: "Killer", text: "+44% attack", bonus: { attackPercent: 0.44 } },
        { id: "survivor", name: "Survivor", text: "+90% health", bonus: { healthPercent: 0.9 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "shadowMaster", name: "Shadow Master", text: "+40% attack and +10% dodge", bonus: { attackPercent: 0.4, dodge: 0.1 } },
        { id: "grimReaper", name: "Grim Reaper", text: "+100% ambush damage and +125% health", bonus: { ambush: 1, healthPercent: 1.25 } }
      ]
    }
  ],

  relics: [
    { id: "shadowCloak", name: "Shadow Cloak", text: "+3% dodge", bonus: { dodge: 0.03 } },
    { id: "viperFang", name: "Viper Fang", text: "Venom Dagger: +1 poison stack", bonus: { poisonStacks: 1 } },
    { id: "assassinsMark", name: "Assassin's Mark", text: "+25% ambush damage", bonus: { ambush: 0.25 } }
  ],

  startFight: assassinStartFight,
  attack: assassinAttack,
  whenAttacked: assassinWhenAttacked,
  damageDivider: assassinDamageDivider,
  dotPerStack: assassinDotPerStack,
  statLine: assassinStatLine,
  gearInfo: assassinGearInfo
};

// Is the next hit the first of the fight?
let assassinAmbushReady = false;

// Shadow Blade: has a dodge set up a stronger next hit?
let assassinCounterReady = false;

// Runs at the start of every fight
function assassinStartFight() {
  assassinAmbushReady = true;
  assassinCounterReady = false;
}

function assassinAttack() {
  let damage = playerAttack;

  if (assassinAmbushReady) {
    damage = damage * (1 + totalBonus("ambush"));
    assassinAmbushReady = false;
    say("You strike from the shadows!");
  }

  if (weapon === "stiletto" && chance(totalBonus("critChance"))) {
    // Critical chance past 100% adds to the critical damage instead
    damage = damage * (3 + overflow("critChance", 1));
    say("A deadly critical hit!");
  }

  if (weapon === "shadow" && assassinCounterReady) {
    damage = damage * 2;
    assassinCounterReady = false;
  }

  hitMonster(damage);

  // Poison ignores armor
  if (weapon === "venom") {
    addDotStack(totalBonus("poisonStacks"));
  }
  monsterHp = monsterHp - dotDamage();
}

function assassinDodgeChance() {
  if (weapon === "shadow") {
    return Math.min(maxChance, totalBonus("dodge") + 0.1);
  }
  return cappedChance("dodge");
}

// Dodge past its limit reduces all damage taken instead (it is divided by this)
function assassinDamageDivider() {
  let dodge = totalBonus("dodge");
  if (weapon === "shadow") {
    dodge = dodge + 0.1;
  }
  return 1 + Math.max(0, dodge - maxChance);
}

function assassinWhenAttacked() {
  if (chance(assassinDodgeChance())) {
    say("You dodge the attack!");
    if (weapon === "shadow") {
      assassinCounterReady = true;
    }
    return true;
  }
  return false;
}

function assassinDotPerStack() {
  return Math.max(1, Math.round(playerAttack * 0.08));
}

function assassinStatLine() {
  return "Dodge: " + percent(assassinDodgeChance()) + ". Ambush: the first hit of a fight deals +" + percent(totalBonus("ambush")) + " damage";
}

function assassinGearInfo() {
  if (weapon === "venom") {
    return "Venom Dagger: every hit poisons the enemy more each turn (up to " + totalBonus("poisonStacks") + " stacks).";
  }
  if (weapon === "stiletto") {
    return "Stiletto: " + percent(totalBonus("critChance")) + " chance to deal triple damage.";
  }
  return "Shadow Blade: +10% dodge, and your next hit after a dodge deals double damage.";
}
