// =====================================================================
//  The Assassin - stealth, poison and critical hits
// =====================================================================
// Bonus words only the Assassin uses:
//   dodge        chance to avoid an attack                   (0.05 means +5%)
//   ambush       extra damage on the first hit of a fight    (1 means +100%)
//   poisonStacks most venom dagger poison stacks             (2 means +2)
//   critChance   stiletto critical chance (triple damage)    (0.1 means +10%)
//   critPower    stiletto: extra damage of a critical         (0.1 means +10%)
//   counter      shadow blade: extra damage after a dodge     (0.15 means +15%)
//   vanishChance chance each turn to hide again, so the next
//                hit is another ambush                        (0.02 means +2%)
//
// Words a perk can MULTIPLY (see "multiply" in data.js):
//   poison        all poison damage
//   stilettoCrit  the damage of a stiletto's critical hits
//   counter       the extra damage of the hit after a dodge
//   ambush        the extra damage of an ambush
//
// The four ways to build an Assassin:
//   Poisoner      (venom dagger) - stacks poison that ignores armor. Long fights and bosses.
//   Cutthroat     (stiletto)     - critical hits for triple damage and more.
//   Shadow Dancer (shadow blade) - dodges, then strikes back hard after every dodge.
//   Ambusher      (any blade)    - a huge first hit, and vanishing to do it again.
//
// See classes/barbarian.js for what each list is for.

classes.assassin = {
  name: "Assassin",
  icon: "🗡️",
  art: "art/assassin.png",
  text: "Stealth and poison. Opens every fight with an ambush and slips away from attacks.",
  perLevel: { maxHp: 7, attack: 2 },
  base: { maxHp: 65, attack: 7, dodge: 0.1, ambush: 0.5, poisonStacks: 4, critChance: 0.2, counter: 1.25, vanishChance: 0.05 },

  gearLabel: "Blade",
  gearTypes: { venom: "Venom Dagger", stiletto: "Stiletto", shadow: "Shadow Blade" },
  gearIcons: { venom: "🗡️", stiletto: "🗡️", shadow: "🗡️" },
  dotLabel: "Poison",
  dotType: "affliction",

  upgrades: [
    { id: "sharpenedEdge", name: "Sharpened Edge", text: "+5% attack", bonus: { attackPercent: 0.05 } },
    { id: "smokeBomb", name: "Smoke Bomb", text: "+2% dodge", bonus: { dodge: 0.02 } },
    { id: "backstab", name: "Backstab", text: "Ambush: the first hit of a fight deals +10% more", bonus: { ambush: 0.1 } },
    { id: "toxicCoating", name: "Toxic Coating", text: "Venom Dagger: +1 poison stack", build: "venom", bonus: { poisonStacks: 1 } },
    { id: "killerInstinct", name: "Killer Instinct", text: "Stiletto: +5% critical chance", build: "stiletto", bonus: { critChance: 0.05 } },
    { id: "shadowstep", name: "Shadowstep", text: "Shadow Blade: +15% damage after a dodge", build: "shadow", bonus: { counter: 0.15 } }
  ],

  // One skill for each build, so there is never a question of where a build's points go
  skills: [
    { id: "lethality", name: "Power", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "conditioning", name: "Toughness", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "ambushTraining", name: "Ambush Training", text: "Ambush: the first hit of a fight deals +5% more. Vanish: +0.5% chance each turn to hide and ambush again", bonus: { ambush: 0.05, vanishChance: 0.005 }, cost: 1 },
    { id: "venomMastery", name: "Venom Mastery", text: "Venom Dagger: +1 poison stack and poison deals +8% damage", bonus: { poisonStacks: 1, dotPower: 0.08 }, cost: 1 },
    { id: "stilettoMastery", name: "Stiletto Mastery", text: "Stiletto: +1% critical chance and +2.5% critical damage", bonus: { critChance: 0.01, critPower: 0.025 }, cost: 1 },
    { id: "riposte", name: "Shadow Mastery", text: "Shadow Blade: +0.5% dodge and +8% damage after a dodge", bonus: { dodge: 0.005, counter: 0.08 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "nimble", name: "Nimble", text: "+5% dodge", bonus: { dodge: 0.05 } },
        { id: "cutthroat", name: "Cutthroat", text: "attack x1.1", multiply: { attack: 1.1 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "lurker", name: "Lurker", text: "Ambush: the first hit of a fight deals +25% more", bonus: { ambush: 0.25 } },
        { id: "leatherWraps", name: "Leather Wraps", text: "health x1.15", multiply: { health: 1.15 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "toxicologist", name: "Toxicologist", text: "Venom Dagger: +2 poison stacks", bonus: { poisonStacks: 2 } },
        { id: "executioner", name: "Executioner", text: "Stiletto: +10% critical chance", bonus: { critChance: 0.1 } },
        { id: "phantom", name: "Phantom", text: "Shadow Blade: +40% damage after a dodge, and +5% dodge", bonus: { dodge: 0.05, counter: 0.4 } },
        { id: "stalker", name: "Stalker", text: "Vanish: +8% chance each turn to hide and ambush again", bonus: { vanishChance: 0.08 } }
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
        { id: "nightStalker", name: "Nightwalker", text: "+24% attack and +10% dodge", bonus: { attackPercent: 0.24, dodge: 0.1 } },
        { id: "deathMark", name: "Death Mark", text: "Ambush damage x2, and health x1.4", multiply: { ambush: 2, health: 1.4 } },
        { id: "plaguebringer", name: "Plaguebringer", text: "Venom Dagger: poison damage x3, and attack x1.3", multiply: { poison: 3, attack: 1.3 } },
        { id: "throatCutter", name: "Throat Cutter", text: "Stiletto: critical hit damage x1.6", multiply: { stilettoCrit: 1.6 } },
        { id: "shade", name: "Shade", text: "Shadow Blade: damage of the hit after a dodge x3, +8% dodge, attack x1.5 and health x1.3", bonus: { dodge: 0.08 }, multiply: { counter: 3, attack: 1.5, health: 1.3 } },
        { id: "ironNerves", name: "Iron Nerves", text: "health x1.5 and +5% dodge", bonus: { dodge: 0.05 }, multiply: { health: 1.5 } }
      ]
    },
    // KEYSTONES: each changes a rule of one weapon, and costs something. This milestone is
    // optional: pick one, or none (press the chosen one again to let it go).
    // See "Keystones" in data.js.
    {
      floor: 51,
      keystones: true,
      perks: [
        { id: "neurotoxin", name: "Neurotoxin", keystone: true, text: "Venom Dagger: an enemy carrying every poison stack you can give hits 30% weaker. Ambush damage x0.5", bonus: { neurotoxin: 0.3 }, multiply: { ambush: 0.5 } },
        { id: "coupDeGrace", name: "Coup de Grace", keystone: true, text: "Stiletto: a critical hit on an enemy below 30% health kills it outright (a boss takes double damage instead). health x0.8", bonus: { coupDeGrace: 0.3 }, multiply: { health: 0.8 } },
        { id: "shadowDance", name: "Veil Step", keystone: true, text: "Shadow Blade: every dodge is also a Vanish, so your next hit is an ambush. health x0.9", bonus: { shadowDance: 1 }, multiply: { health: 0.9 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "killer", name: "Killer", text: "+44% attack", bonus: { attackPercent: 0.44 } },
        { id: "survivor", name: "Survivor", text: "health x1.75", multiply: { health: 1.75 } },
        { id: "venomancer", name: "Venomancer", text: "Venom Dagger: +25% attack, +4 poison stacks and poison deals +50% damage", bonus: { attackPercent: 0.25, poisonStacks: 4, dotPower: 0.5 } },
        { id: "heartseeker", name: "Heartseeker", text: "Stiletto: +25% attack, +10% critical chance and +70% critical damage", bonus: { attackPercent: 0.25, critChance: 0.1, critPower: 0.7 } },
        { id: "nightblade", name: "Nightblade", text: "Shadow Blade: +25% attack, +8% dodge and +100% damage after a dodge", bonus: { attackPercent: 0.25, dodge: 0.08, counter: 1 } },
        { id: "ghost", name: "Ghost", text: "+25% attack. Ambush: the first hit of a fight deals +80% more. Vanish: +5% chance each turn to hide and ambush again", bonus: { attackPercent: 0.25, ambush: 0.8, vanishChance: 0.05 } },
        { id: "slippery", name: "Slippery", text: "You take 25% less damage", multiply: { damageTaken: 0.75 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "shadowMaster", name: "Master Assassin", text: "+40% attack and +10% dodge", bonus: { attackPercent: 0.4, dodge: 0.1 } },
        { id: "grimReaper", name: "Grim Reaper", text: "Ambush damage x2 again, and health x1.6", multiply: { ambush: 2, health: 1.6 } },
        { id: "blightlord", name: "Blightlord", text: "Venom Dagger: poison damage x3 again, and attack x1.6", multiply: { poison: 3, attack: 1.6 } },
        { id: "kingslayer", name: "Kingslayer", text: "Stiletto: critical hit damage x1.6 again", multiply: { stilettoCrit: 1.6 } },
        { id: "umbra", name: "Umbra", text: "Shadow Blade: damage of the hit after a dodge x3 again, +8% dodge, attack x1.5 and health x1.5", bonus: { dodge: 0.08 }, multiply: { counter: 3, attack: 1.5, health: 1.5 } },
        { id: "untouchable", name: "Untouchable", text: "health x2 and +10% dodge", bonus: { dodge: 0.1 }, multiply: { health: 2 } }
      ]
    }
  ],

  // Extra choices at every BREAKTHROUGH (floor 150 and beyond), beside the ones every
  // class has. One for each build: it multiplies that build's own damage again.
  breakthroughs: [
    { id: "strongerVenom", name: "Stronger Venom", text: "Venom Dagger: poison damage x1.5", multiply: { poison: 1.5 } },
    { id: "finerPoint", name: "Finer Point", text: "Stiletto: critical hit damage x1.5", multiply: { stilettoCrit: 1.5 } },
    { id: "deeperShadow", name: "Deeper Shadow", text: "Shadow Blade: damage of the hit after a dodge x1.5", multiply: { counter: 1.5 } },
    { id: "perfectAmbush", name: "Perfect Ambush", text: "Ambush damage x1.5", multiply: { ambush: 1.5 } }
  ],

  // Special moves on a cooldown, put in the slots that open on floors 10, 35 and 75
  // (rules in game/abilities.js). "cooldown" is in turns of fighting. "build" works as
  // for boons. A "bossKiller" starts set to "Bosses only". "use" is what it does, built
  // from the pieces in game/abilities.js (abilityHit, abilitySpell, abilityStun...).
  abilities: [
    { id: "envenom", name: "Envenom", text: "Venom Dagger: poison up to its limit at once, and 2 turns of your damage", build: "venom", cooldown: 6,
      use: function () { abilityStacks(totalBonus("poisonStacks"), "poisonStacks"); abilityTurns(2); } },
    { id: "lacerate", name: "Lacerate", text: "Stiletto: 3.5 turns of your damage in one strike", build: "stiletto", cooldown: 7,
      use: function () { abilityTurns(3.5); } },
    { id: "shadowDance", name: "Shadow Dance", text: "Shadow Blade: no damage taken for 2 turns, and 2 turns of your damage", build: "shadow", cooldown: 7,
      use: function () { abilityGuard(1, 2); abilityTurns(2); } },
    { id: "meltAway", name: "Melt Away", text: "Hide: no damage taken for 1 turn, and your next hit is an ambush", cooldown: 8,
      use: function () { abilityGuard(1, 1); assassinAmbushReady = true; } },
    { id: "assassinate", name: "Assassinate", text: "Boss killer: 10 turns of your damage in one strike", cooldown: 30, bossKiller: true,
      use: function () { abilityTurns(10); } }
  ],

  relics: [
    { id: "shadowCloak", name: "Shadow Cloak", text: "+3% dodge, and a 4% chance to avoid any attack", bonus: { dodge: 0.03, sidestep: 0.04 } },
    { id: "viperFang", name: "Viper Fang", text: "Venom Dagger: +1 poison stack, and all your damage +20% against an enemy below half health", build: "venom", bonus: { poisonStacks: 1, finisher: 0.2 } },
    { id: "assassinsMark", name: "Assassin's Mark", text: "Ambush: the first hit of a fight deals +25% more, and all your damage +50% on the first turn of every fight", bonus: { ambush: 0.25, opener: 0.5 } },
    { id: "needlePoint", name: "Needle Point", text: "Stiletto: +8% critical chance, and all your damage +25% against bosses", build: "stiletto", bonus: { critChance: 0.08, bossSlayer: 0.25 } },
    { id: "duskMantle", name: "Dusk Mantle", text: "Shadow Blade: +25% damage after a dodge, and an enemy that is not a boss misses its first turn", build: "shadow", bonus: { counter: 0.25, headStart: 1 } }
  ],

  startFight: assassinStartFight,
  damageTypes: assassinDamageTypes,
  attack: assassinAttack,
  whenAttacked: assassinWhenAttacked,
  damageDivider: assassinDamageDivider,
  dotPerStack: assassinDotPerStack,
  statLine: assassinStatLine,
  gearInfo: assassinGearInfo
};

// The damage types this class is dealing right now (for the tower list)
function assassinDamageTypes() {
  if (weapon === "shadow") {
    return ["slashing"];
  }
  if (weapon === "venom") {
    return ["piercing", "affliction"];
  }
  return ["piercing"];
}

// A stiletto's critical hit multiplies the hit by this. (It was 3 until the balance pass
// of October 2026: the Stiletto kept measuring a quarter faster than the Assassin's
// other two blades.)
const stilettoCritHit = 2.75;

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
    damage = damage * (1 + assassinAmbush());
    assassinAmbushReady = false;
    say("You strike from the shadows!");
  }

  // Coup de Grace (keystone): a critical hit finishes an enemy that is nearly dead
  let finishing = false;

  if (weapon === "stiletto" && chance(totalBonus("critChance"))) {
    // Critical chance past 100% adds to the critical damage instead
    damage = damage * (stilettoCritHit + totalBonus("critPower") + overflow("critChance", 1)) * multiplier("stilettoCrit");
    say("A deadly critical hit!");

    if (totalBonus("coupDeGrace") > 0 && monsterHp < monsterMaxHp * totalBonus("coupDeGrace")) {
      if (encounterType === "boss") {
        damage = damage * 2;
      } else {
        finishing = true;
      }
    }
  }

  if (weapon === "shadow" && assassinCounterReady) {
    damage = damage * (1 + totalBonus("counter") * multiplier("counter"));
    assassinCounterReady = false;
  }

  // Daggers and stilettos pierce, the shadow blade slashes
  let type = "piercing";
  if (weapon === "shadow") {
    type = "slashing";
  }
  hitMonster(damage, type);
  if (finishing && monsterHp > 0) {
    monsterHp = 0;
  }

  // Poison ignores armor
  if (weapon === "venom") {
    addDotStack(totalBonus("poisonStacks"));
  }
  monsterHp = monsterHp - dotDamage();

  // Vanish: slip back into the shadows, so the next hit is an ambush again.
  // Vanish chance past its limit adds to the ambush damage instead (see assassinAmbush).
  if (chance(cappedChance("vanishChance"))) {
    assassinAmbushReady = true;
  }
}

// The extra damage of an ambush
function assassinAmbush() {
  return (totalBonus("ambush") + overflow("vanishChance", maxChance)) * multiplier("ambush");
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
  let divider = 1 + Math.max(0, dodge - maxChance);

  // Neurotoxin (keystone): a fully poisoned enemy hits weaker
  if (weapon === "venom" && totalBonus("neurotoxin") > 0 && dotStacks >= totalBonus("poisonStacks")) {
    divider = divider / (1 - totalBonus("neurotoxin"));
  }
  return divider;
}

function assassinWhenAttacked() {
  if (chance(assassinDodgeChance())) {
    say("You dodge the attack!");
    if (weapon === "shadow") {
      assassinCounterReady = true;

      // Veil Step (keystone): the dodge hides you again
      if (totalBonus("shadowDance") > 0) {
        assassinAmbushReady = true;
      }
    }
    return true;
  }
  return false;
}

function assassinDotPerStack() {
  return Math.max(1, Math.round(playerAttack * 0.1 * multiplier("poison")));
}

function assassinStatLine() {
  return "Dodge: " + percent(assassinDodgeChance()) + ". Ambush: the first hit of a fight deals +" + percent(assassinAmbush()) + " damage. Vanish: " + percent(cappedChance("vanishChance")) + " chance each turn to hide and ambush again";
}

function assassinGearInfo() {
  if (weapon === "venom") {
    return "Venom Dagger: every hit poisons the enemy more each turn (up to " + totalBonus("poisonStacks") + " stacks).";
  }
  if (weapon === "stiletto") {
    return "Stiletto: " + percent(Math.min(1, totalBonus("critChance"))) + " chance of a critical hit for x" + (stilettoCritHit + totalBonus("critPower") + overflow("critChance", 1)).toFixed(1) + " damage.";
  }
  return "Shadow Blade: +10% dodge, and your next hit after a dodge deals +" + percent(totalBonus("counter") * multiplier("counter")) + " damage.";
}
