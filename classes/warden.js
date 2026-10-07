// =====================================================================
//  The Warden - a spear to attack with, and a shield that reflects damage
// =====================================================================
// Bonus words only the Warden uses:
//   reflect      enemy attack thrown back        (0.1 means +10%)
//   burnStacks   most ember shield burn stacks   (2 means +2)
//   freezeChance frost shield freeze chance      (0.1 means +10%)
//   stormChance  storm shield double reflect     (0.1 means +10%)
//
// See classes/barbarian.js for what each list is for.

classes.warden = {
  name: "Warden",
  icon: "🛡️",
  text: "A spear and an elemental shield. Every attack against you is thrown back at the enemy.",
  powerStat: "Strength",
  base: { maxHp: 120, attack: 5, armor: 2, reflect: 0.3, burnStacks: 3, freezeChance: 0.2, stormChance: 0.25 },

  // The Warden's special gear is the shield, which sits in the armor slot.
  // The weapon slot holds a plain spear.
  specialSlot: "armor",
  plainLabel: "Spear",
  gearLabel: "Shield",
  gearTypes: { ember: "Ember Shield", frost: "Frost Shield", storm: "Storm Shield" },
  dotLabel: "Burning",

  upgrades: [
    { id: "thorns", name: "Thorns", text: "+10% reflect", bonus: { reflect: 0.1 } },
    { id: "bulwark", name: "Bulwark", text: "+2 armor", bonus: { armor: 2 } },
    { id: "kindling", name: "Kindling", text: "Ember: +1 burn stack", bonus: { burnStacks: 1 } },
    { id: "deepChill", name: "Deep Chill", text: "Frost: +5% freeze chance", bonus: { freezeChance: 0.05 } },
    { id: "overcharge", name: "Overcharge", text: "Storm: +5% double reflect chance", bonus: { stormChance: 0.05 } }
  ],

  skills: [
    { id: "shieldSlam", name: "Spear Thrust", text: "+2 attack", bonus: { attack: 2 }, maxLevel: 10, cost: 100 },
    { id: "vigor", name: "Vigor", text: "+20 health", bonus: { maxHp: 20 }, maxLevel: 10, cost: 100 },
    { id: "plating", name: "Plating", text: "+1 armor", bonus: { armor: 1 }, maxLevel: 10, cost: 150 },
    { id: "thornmail", name: "Thornmail", text: "+5% reflect", bonus: { reflect: 0.05 }, maxLevel: 6, cost: 200 },
    { id: "emberMastery", name: "Ember Mastery", text: "Ember: +1 burn stack", bonus: { burnStacks: 1 }, maxLevel: 3, cost: 300 },
    { id: "frostMastery", name: "Frost Mastery", text: "Frost: +3% freeze chance", bonus: { freezeChance: 0.03 }, maxLevel: 5, cost: 300 },
    { id: "stormMastery", name: "Storm Mastery", text: "Storm: +4% double reflect chance", bonus: { stormChance: 0.04 }, maxLevel: 5, cost: 300 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "stalwart", name: "Stalwart", text: "+40 health", bonus: { maxHp: 40 } },
        { id: "spikedPlating", name: "Spiked Plating", text: "+10% reflect", bonus: { reflect: 0.1 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "stoneSkin", name: "Stone Skin", text: "+4 armor", bonus: { armor: 4 } },
        { id: "shieldBash", name: "Spearman", text: "+6 attack", bonus: { attack: 6 } }
      ]
    },
    {
      floor: 15,
      perks: [
        { id: "pyre", name: "Pyre", text: "Ember: +2 burn stacks", bonus: { burnStacks: 2 } },
        { id: "permafrost", name: "Permafrost", text: "Frost: +10% freeze chance", bonus: { freezeChance: 0.1 } },
        { id: "thunderhead", name: "Thunderhead", text: "Storm: +15% double reflect chance", bonus: { stormChance: 0.15 } }
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
        { id: "bastion", name: "Bastion", text: "+120 health and +6 armor", bonus: { maxHp: 120, armor: 6 } },
        { id: "retribution", name: "Retribution", text: "+25% reflect and +8 attack", bonus: { reflect: 0.25, attack: 8 } }
      ]
    },
    {
      floor: 40,
      perks: [
        { id: "fortress", name: "Fortress", text: "+250 health", bonus: { maxHp: 250 } },
        { id: "mirrorWall", name: "Mirror Wall", text: "+30% reflect", bonus: { reflect: 0.3 } }
      ]
    },
    {
      floor: 50,
      perks: [
        { id: "unyielding", name: "Unyielding", text: "+200 health and +12 armor", bonus: { maxHp: 200, armor: 12 } },
        { id: "vengeance", name: "Vengeance", text: "+50% reflect and +15 attack", bonus: { reflect: 0.5, attack: 15 } }
      ]
    }
  ],

  relics: [
    { id: "mirrorShard", name: "Mirror Shard", text: "+15% reflect", bonus: { reflect: 0.15 } },
    { id: "everburningCoal", name: "Everburning Coal", text: "Ember: +1 burn stack", bonus: { burnStacks: 1 } },
    { id: "frozenHeart", name: "Frozen Heart", text: "Frost: +5% freeze chance", bonus: { freezeChance: 0.05 } },
    { id: "stormcallersRod", name: "Stormcaller's Rod", text: "Storm: +10% double reflect chance", bonus: { stormChance: 0.1 } }
  ],

  attack: wardenAttack,
  whenAttacked: wardenWhenAttacked,
  dotPerStack: wardenDotPerStack,
  statLine: wardenStatLine,
  gearInfo: wardenGearInfo
};

// The damage thrown back each time the enemy attacks.
// A stronger shield throws back more, and it ignores the enemy's armor.
function reflectDamage() {
  return Math.round(monsterAttack * totalBonus("reflect") + armorPower * fameMultiplier("armor"));
}

function wardenAttack() {
  // A spear thrust, then any burning does its damage
  hitMonster(playerAttack);
  monsterHp = monsterHp - dotDamage();
}

function wardenWhenAttacked() {
  let reflected = reflectDamage();

  if (weapon === "storm" && chance(totalBonus("stormChance"))) {
    reflected = reflected * 2;
    say("Lightning strikes back twice as hard!");
  }
  magicHitMonster(reflected);

  if (weapon === "ember") {
    addDotStack(totalBonus("burnStacks"));
  }

  if (weapon === "frost" && chance(cappedChance("freezeChance"))) {
    monsterStunned = true;
    say("The enemy is frozen and will miss its next turn!");
  }

  // The Warden never dodges, the hit still lands
  return false;
}

function wardenDotPerStack() {
  return Math.max(1, Math.round(totalArmor() * 0.2));
}

function wardenStatLine() {
  return "Reflect: " + percent(totalBonus("reflect")) + " of the enemy's attack + " + big(Math.round(armorPower * fameMultiplier("armor")));
}

function wardenGearInfo() {
  if (weapon === "ember") {
    return "Ember Shield: every attack against you sets the enemy burning more each turn (up to " + totalBonus("burnStacks") + " stacks).";
  }
  if (weapon === "frost") {
    return "Frost Shield: " + percent(cappedChance("freezeChance")) + " chance to freeze an attacker so it misses its next turn.";
  }
  return "Storm Shield: " + percent(totalBonus("stormChance")) + " chance to reflect double damage.";
}
