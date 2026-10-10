// =====================================================================
//  The Warden - a spear, and a shield that decides how you fight
// =====================================================================
// The three shields are three different ways to play:
//   Spiked Shield - throws every attack back at the enemy. The enemy kills itself.
//   Tower Shield  - blocks attacks and steadies the spear arm. The spear does the killing.
//   Bladed Shield - is thrown every turn, and hits as hard as you are armored.
//
// Bonus words only the Warden uses:
//   reflect      spiked: enemy attack thrown back          (0.1 means +10%)
//   shieldPower  all shield damage, reflected or thrown    (0.1 means +10% stronger)
//   blockChance  tower: chance to block an attack          (0.05 means +5%)
//   spearPower   tower: extra spear damage                 (0.1 means +10%)
//   throwPower   bladed: extra armor in every throw        (1 means one more time your armor)
//   vengeance    share of each hit you take that is added
//                to your next spear thrust                 (0.05 means +5%)
//   spite        extra vengeance against bosses and rare
//                monsters                                  (0.1 means +10%)
//
// and the words of its keystones (floor 51; see "Keystones" in data.js):
//   spikedThrust      spiked: share of a reflection every spear thrust sets off
//   stunningBlock     tower: 1 = a block stuns the enemy for a turn
//   maim              bladed: share of the enemy's attack every throw cuts away
//   instantVengeance  1 = vengeance is paid back at once, ignoring armor
//
// Words a perk can MULTIPLY (see "multiply" in data.js):
//   reflect    everything a spiked shield throws back
//   spear      every spear thrust behind a tower shield
//   throw      every throw of a bladed shield
//   vengeance  the share of each hit that is paid back
//
// The four ways to build a Warden:
//   Thornguard (spiked shield) - the enemy kills itself on your shield.
//   Sentinel   (tower shield)  - blocks, and a spear that hits far harder.
//   Discus     (bladed shield) - armor is your attack: the shield is thrown every turn.
//   Avenger    (any shield)    - vengeance: every hit you take is paid back with the next
//                                thrust. The harder the enemy hits, the harder you do.
//
// See classes/barbarian.js for what each list is for.

classes.warden = {
  name: "Warden",
  icon: "🛡️",
  art: "art/warden.png",
  text: "A spear and a shield. The shield you carry decides how you fight: throwing attacks back, blocking them, or being thrown itself.",
  perLevel: { maxHp: 12, attack: 1.5 },
  base: { maxHp: 120, attack: 5, armor: 2, reflect: 0.3, blockChance: 0.25, spearPower: 0.4, vengeance: 0.15 },

  // The Warden's special gear is the shield, which sits in the armor slot.
  // The weapon slot holds a plain spear.
  specialSlot: "armor",
  plainLabel: "Spear",
  gearLabel: "Shield",
  gearTypes: { spiked: "Spiked Shield", tower: "Tower Shield", bladed: "Bladed Shield" },
  gearIcons: { spiked: "🛡️", tower: "🛡️", bladed: "🛡️" },
  plainIcon: "🔱",

  upgrades: [
    { id: "spearhead", name: "Spearhead", text: "+5% attack", bonus: { attackPercent: 0.05 } },
    { id: "bulwark", name: "Reinforced Rim", text: "+2 armor", bonus: { armor: 2 } },
    { id: "thorns", name: "Thorns", text: "Spiked Shield: reflects +10% more of the enemy's attack", build: "spiked", bonus: { reflect: 0.1 } },
    { id: "shieldWall", name: "Shield Wall", text: "Tower Shield: +4% block chance", build: "tower", bonus: { blockChance: 0.04 } },
    { id: "sharpRim", name: "Sharp Rim", text: "Bladed Shield: each throw hits for +0.5 times your armor", build: "bladed", bonus: { throwPower: 0.5 } },
    { id: "oath", name: "Oath", text: "Vengeance: +8% of each hit you take is added to your next spear thrust", bonus: { vengeance: 0.08 } }
  ],

  // One skill for each shield, so there is never a question of where a build's points go.
  // Vengeance has NO skill on purpose: it pays the enemy's hits back through the spear,
  // which made a vengeance skill feel like a second Tower Mastery (and a second
  // Spiked Mastery). It still grows through boons, relics and milestone perks.
  // (A skill with the id "grudge" was here until October 2026. Don't reuse that id.)
  skills: [
    { id: "spearThrust", name: "Power", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "vigor", name: "Toughness", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "plating", name: "Plating", text: "+2 armor", bonus: { armor: 2 }, cost: 1 },
    { id: "thornmail", name: "Spiked Mastery", text: "Spiked Shield: reflects +5% more of the enemy's attack", bonus: { reflect: 0.05 }, cost: 1 },
    { id: "phalanx", name: "Tower Mastery", text: "Tower Shield: +1% block chance and +2.5% spear damage", bonus: { blockChance: 0.01, spearPower: 0.025 }, cost: 1 },
    { id: "discus", name: "Bladed Mastery", text: "Bladed Shield: each throw hits for +0.3 times your armor", bonus: { throwPower: 0.3 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "stalwart", name: "Stalwart", text: "health x1.1", multiply: { health: 1.1 } },
        { id: "spikedPlating", name: "Shield Drill", text: "+10% shield damage (reflected or thrown) and attack x1.05", bonus: { shieldPower: 0.1 }, multiply: { attack: 1.05 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "stoneSkin", name: "Stone Skin", text: "+4 armor", bonus: { armor: 4 } },
        { id: "shieldBash", name: "Spearman", text: "attack x1.15", multiply: { attack: 1.15 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "bramble", name: "Bramble", text: "Spiked Shield: reflects +25% more of the enemy's attack", bonus: { reflect: 0.25 } },
        { id: "sentinel", name: "Sentinel", text: "Tower Shield: +10% block chance", bonus: { blockChance: 0.1 } },
        { id: "sawblade", name: "Sawblade", text: "Bladed Shield: each throw hits for +1 times your armor", bonus: { throwPower: 1 } },
        { id: "avenger", name: "Avenger", text: "Vengeance: +35% of each hit you take is added to your next spear thrust", bonus: { vengeance: 0.35 } }
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
        { id: "bastion", name: "Bastion", text: "health x1.5 and +6 armor", bonus: { armor: 6 }, multiply: { health: 1.5 } },
        { id: "retribution", name: "Retribution", text: "+25% attack and +25% shield damage (reflected or thrown)", bonus: { attackPercent: 0.25, shieldPower: 0.25 } },
        { id: "thornwall", name: "Thornwall", text: "Spiked Shield: reflected damage x2.5", multiply: { reflect: 2.5 } },
        { id: "phalanxCaptain", name: "Phalanx Captain", text: "Tower Shield: spear damage x1.6", multiply: { spear: 1.6 } },
        { id: "razorDisc", name: "Razor Disc", text: "Bladed Shield: thrown shield damage x2", multiply: { throw: 2 } },
        { id: "bloodDebt", name: "Blood Debt", text: "Vengeance x4: four times as much of each hit you take is paid back", multiply: { vengeance: 4 } }
      ]
    },
    // KEYSTONES: each changes a rule of one weapon, and costs something. This milestone is
    // optional: pick one, or none (press the chosen one again to let it go).
    // See "Keystones" in data.js.
    {
      floor: 51,
      keystones: true,
      perks: [
        { id: "barbedWall", name: "Barbed Wall", keystone: true, text: "Spiked Shield: your spear thrust also sets off the shield, for 15% of a reflection. Vengeance is lost", bonus: { spikedThrust: 0.15 }, multiply: { vengeance: 0 } },
        { id: "shieldWall", name: "Stunning Guard", keystone: true, text: "Tower Shield: a block also stuns the enemy for a turn. Spear damage x0.9", bonus: { stunningBlock: 1 }, multiply: { spear: 0.9 } },
        { id: "hamstring", name: "Hamstring", keystone: true, text: "Bladed Shield: every throw cuts the enemy's attack by 3%. Thrown shield damage x0.8", bonus: { maim: 0.03 }, multiply: { throw: 0.8 } },
        { id: "eyeForAnEye", name: "Eye for an Eye", keystone: true, text: "Vengeance: a hit you take is paid back at once, ignoring armor, instead of with your next thrust. health x0.85", bonus: { instantVengeance: 1 }, multiply: { health: 0.85 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "fortress", name: "Fortress", text: "health x1.75", multiply: { health: 1.75 } },
        { id: "mirrorWall", name: "Mirror Wall", text: "+40% attack and +40% shield damage (reflected or thrown)", bonus: { attackPercent: 0.4, shieldPower: 0.4 } },
        { id: "ironBramble", name: "Iron Bramble", text: "Spiked Shield: reflects +60% more of the enemy's attack, and +50% shield damage", bonus: { reflect: 0.6, shieldPower: 0.5 } },
        { id: "spearWall", name: "Spear Wall", text: "Tower Shield: +25% attack, +10% block chance and +50% spear damage", bonus: { attackPercent: 0.25, blockChance: 0.1, spearPower: 0.5 } },
        { id: "whirlingEdge", name: "Whirling Edge", text: "Bladed Shield: +40% shield damage, and each throw hits for +2.5 times your armor", bonus: { shieldPower: 0.4, throwPower: 2.5 } },
        { id: "unforgiving", name: "Unforgiving", text: "Vengeance: +50% of each hit you take is added to your next spear thrust (+50% more against bosses and rare monsters)", bonus: { vengeance: 0.5, spite: 0.5 } },
        { id: "immovable", name: "Immovable", text: "You take 25% less damage", multiply: { damageTaken: 0.75 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "unyielding", name: "Unyielding", text: "health x2 and +12 armor", bonus: { armor: 12 }, multiply: { health: 2 } },
        { id: "vengeance", name: "Wrath", text: "+50% attack and +50% shield damage (reflected or thrown)", bonus: { attackPercent: 0.5, shieldPower: 0.5 } },
        { id: "crownOfThorns", name: "Crown of Thorns", text: "Spiked Shield: reflected damage x2.5 again", multiply: { reflect: 2.5 } },
        { id: "lastLine", name: "Last Line", text: "Tower Shield: spear damage x1.6 again", multiply: { spear: 1.6 } },
        { id: "stormOfSteel", name: "Storm of Steel", text: "Bladed Shield: thrown shield damage x2 again", multiply: { throw: 2 } },
        { id: "reckoning", name: "Reckoning", text: "Vengeance x4 again", multiply: { vengeance: 4 } }
      ]
    }
  ],

  // Extra choices at every BREAKTHROUGH (floor 150 and beyond), beside the ones every
  // class has. One for each build: it multiplies that build's own damage again.
  breakthroughs: [
    { id: "sharperSpikes", name: "Sharper Spikes", text: "Spiked Shield: reflected damage x1.5", multiply: { reflect: 1.5 } },
    { id: "longerSpear", name: "Longer Spear", text: "Tower Shield: spear damage x1.4", multiply: { spear: 1.4 } },
    { id: "heavierDisc", name: "Heavier Disc", text: "Bladed Shield: thrown shield damage x1.5", multiply: { throw: 1.5 } },
    { id: "oldGrudges", name: "Old Grudges", text: "Vengeance x1.5", multiply: { vengeance: 1.5 } }
  ],

  // Special moves on a cooldown, put in the slots that open on floors 10, 35 and 75
  // (rules in game/abilities.js). "cooldown" is in turns of fighting. "build" works as
  // for boons. A "bossKiller" starts set to "Bosses only". "use" is what it does, built
  // from the pieces in game/abilities.js (abilityHit, abilitySpell, abilityStun...).
  abilities: [
    { id: "thornBurst", name: "Thorn Burst", text: "Spiked Shield: 3 turns of your damage thrown back at once", build: "spiked", cooldown: 6,
      use: function () { abilityTurns(3); } },
    { id: "holdTheLine", name: "Hold the Line", text: "Tower Shield: block every attack for 2 turns, and 1.5 turns of your damage in a spear thrust", build: "tower", cooldown: 7,
      use: function () { abilityGuard(1, 2); abilityTurns(1.5); } },
    { id: "ricochet", name: "Ricochet", text: "Bladed Shield: 3 turns of your damage in one throw", build: "bladed", cooldown: 6,
      use: function () { abilityTurns(3); } },
    { id: "brace", name: "Brace", text: "Take 50% less damage for 4 turns", cooldown: 12,
      use: function () { abilityGuard(0.5, 4); } },
    { id: "settleTheScore", name: "Settle the Score", text: "Boss killer: 8 turns of your damage in one thrust, plus twice what vengeance owes", cooldown: 30, bossKiller: true,
      use: function () { abilityTurns(8); abilityPure(wardenOwed * 2, "piercing"); wardenOwed = 0; } }
  ],

  relics: [
    { id: "mirrorShard", name: "Mirror Shard", text: "Spiked Shield: reflects +15% more of the enemy's attack", build: "spiked", bonus: { reflect: 0.15 } },
    { id: "bulwarkCrest", name: "Tower Crest", text: "Tower Shield: +6% block chance", build: "tower", bonus: { blockChance: 0.06 } },
    { id: "razorRim", name: "Razor Rim", text: "Bladed Shield: each throw hits for +0.5 times your armor", build: "bladed", bonus: { throwPower: 0.5 } },
    { id: "grudgeStone", name: "Grudge Stone", text: "Vengeance: +12% of each hit you take is added to your next spear thrust", bonus: { vengeance: 0.12 } }
  ],

  startFight: wardenStartFight,
  damageTypes: wardenDamageTypes,
  attack: wardenAttack,
  whenAttacked: wardenWhenAttacked,
  damageDivider: wardenDamageDivider,
  dotPerStack: wardenDotPerStack,
  statLine: wardenStatLine,
  gearInfo: wardenGearInfo
};

// The damage types this class is dealing right now (for the tower list)
function wardenDamageTypes() {
  if (weapon === "bladed") {
    return ["piercing", "slashing"];
  }
  return ["piercing"];
}

// The numbers behind the shields. Change these to retune them.
const bladedThrow = 2;       // a thrown shield hits for this many times your armor

// Spiked: the damage thrown back each time the enemy attacks.
// A stronger shield throws back more, and it ignores the enemy's armor.
function reflectDamage() {
  let reflected = monsterAttack * totalBonus("reflect") + armorPower * multiplier("armor");
  return Math.round(reflected * (1 + totalBonus("shieldPower")) * multiplier("reflect"));
}

// Bladed: the damage of one throw.
// It is built from your armor, but made bigger by whatever multiplies your ATTACK
// (the Might fame upgrade, the Conqueror breakthrough), not by what multiplies armor.
// Otherwise one fame upgrade, Vitality, would raise both your defence and your damage,
// and this shield would leave every other build behind after a few ascensions.
function throwDamage() {
  let armor = totalArmor() / multiplier("armor") * multiplier("attack");
  return Math.round(armor * (bladedThrow + totalBonus("throwPower")) * (1 + totalBonus("shieldPower")) * multiplier("throw"));
}

// Vengeance: the damage owed to the enemy for the hits taken since the last thrust
let wardenOwed = 0;

// Runs at the start of every fight
function wardenStartFight() {
  wardenOwed = 0;
}

// The share of a hit that is paid back. Bosses and rare monsters earn more of it.
function wardenVengeance() {
  if (encounterType === "boss" || monsterIsRare) {
    return (totalBonus("vengeance") + totalBonus("spite")) * multiplier("vengeance");
  }
  return totalBonus("vengeance") * multiplier("vengeance");
}

function wardenAttack() {
  // The thrust carries everything owed for the hits taken since the last one
  let damage = playerAttack + wardenOwed;
  wardenOwed = 0;

  // Behind a tower shield the spear hits harder
  if (weapon === "tower") {
    damage = damage * (1 + totalBonus("spearPower")) * multiplier("spear");
  }
  hitMonster(damage, "piercing");

  // Barbed Wall (keystone): the thrust sets off the spiked shield as well
  if (weapon === "spiked" && totalBonus("spikedThrust") > 0) {
    magicHitMonster(reflectDamage() * totalBonus("spikedThrust"), "piercing");
  }

  // The bladed shield is thrown after every thrust, and cuts through armor
  if (weapon === "bladed") {
    magicHitMonster(throwDamage(), "slashing");

    // Hamstring (keystone): every throw leaves the enemy a little weaker
    if (totalBonus("maim") > 0) {
      monsterAttack = Math.max(1, Math.round(monsterAttack * (1 - totalBonus("maim"))));
    }
  }
}

function wardenWhenAttacked() {
  if (weapon === "tower" && chance(cappedChance("blockChance"))) {
    say("You block the attack!");
    if (totalBonus("stunningBlock") > 0) {
      monsterStunned = true;
    }
    return true;
  }

  // The spiked shield never avoids a hit. It lands, and is thrown back.
  if (weapon === "spiked") {
    magicHitMonster(reflectDamage(), "piercing");
  }

  // Every hit that lands is remembered, and paid back with the next thrust
  // (or at once, with the Eye for an Eye keystone)
  if (totalBonus("instantVengeance") > 0) {
    magicHitMonster(monsterAttack * wardenVengeance(), "piercing");
  } else {
    wardenOwed = wardenOwed + monsterAttack * wardenVengeance();
  }
  return false;
}

// Block chance past its limit reduces all damage taken instead (it is divided by this)
function wardenDamageDivider() {
  if (weapon === "tower") {
    return 1 + overflow("blockChance", maxChance);
  }
  return 1;
}

// The Warden has no damage over time
function wardenDotPerStack() {
  return 0;
}

function wardenStatLine() {
  return wardenShieldLine() + ". Vengeance: " + percent(totalBonus("vengeance")) + " of every hit you take is added to your next thrust"
    + " (" + percent(totalBonus("vengeance") + totalBonus("spite")) + " against bosses and rare monsters)";
}

function wardenShieldLine() {
  if (weapon === "spiked") {
    return "Reflect: " + percent(totalBonus("reflect")) + " of the enemy's attack + " + big(Math.round(armorPower * multiplier("armor")))
      + ", made " + percent(totalBonus("shieldPower")) + " stronger";
  }
  if (weapon === "tower") {
    return "Block: " + percent(cappedChance("blockChance")) + ". Spear: +" + percent(totalBonus("spearPower")) + " damage";
  }
  return "Shield throw: " + big(throwDamage()) + " damage every turn (your armor, made stronger by anything that multiplies attack)";
}

function wardenGearInfo() {
  if (weapon === "spiked") {
    return "Spiked Shield: " + percent(totalBonus("reflect")) + " of every attack against you is reflected back at the enemy, ignoring its armor.";
  }
  if (weapon === "tower") {
    return "Tower Shield: " + percent(cappedChance("blockChance")) + " chance to block an attack, and your spear deals +" + percent(totalBonus("spearPower")) + " damage."
      + overflowNote(overflow("blockChance", maxChance), "damage resistance");
  }
  return "Bladed Shield: thrown every turn for " + (bladedThrow + totalBonus("throwPower")) + " times your armor, ignoring the enemy's armor.";
}
