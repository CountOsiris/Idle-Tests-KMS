// =====================================================================
//  The Zealot - a holy crusader: a heavy mace, a shield wall, or a book of prayer
// =====================================================================
// Bonus words only the Zealot uses:
//   devotion     health healed every turn                      (0.01 means +1% of your health)
//   smite        holy mace: extra holy damage per hit          (0.1 means +10% of your attack)
//   judgement    holy mace: extra damage of every third hit    (0.1 means +10%)
//   blockChance  mace and shield: chance to block an attack    (0.05 means +5%)
//   counter      mace and shield: damage of the blow after a
//                block, as a share of your attack              (0.1 means +10%)
//   sacredFlame  holy tome: extra damage from wasted healing   (0.1 means +10%)
//   crusade      extra damage for every turn a fight lasts     (0.01 means +1%)    
//
// Words a perk can MULTIPLY (see "multiply" in data.js):
//   mace           the holy mace's holy damage and its Judgements
//   shieldCounter  the blow that answers a block
//   sacred         the damage of wasted healing with a holy tome
//   crusade        the damage gained for every turn a fight lasts
//
// The four ways to build a Zealot:
//   Justicar (holy mace)       - the big bonk. Holy damage on every hit, and every third
//                                hit is a Judgement that lands far harder.
//   Templar  (mace and shield) - blocks attacks and answers each block with a blow.
//   Priest   (holy tome)       - a caster. Heals twice as much, and any healing that is
//                                not needed burns the enemy instead.
//   Crusader (any weapon)      - grows stronger every turn a fight lasts. Healing keeps
//                                the Zealot standing while the damage climbs.
//
// See classes/barbarian.js for what each list is for.

classes.zealot = {
  name: "Zealot",
  icon: "🔨",
  art: "art/zealot.png",
  text: "A holy crusader. Heals every turn, grows stronger the longer a fight lasts, and fights with a heavy mace, a shield or holy magic.",
  perLevel: { maxHp: 10, attack: 2 },
  base: { maxHp: 100, attack: 7, armor: 1, devotion: 0.03, smite: 0.15, judgement: 0.6, blockChance: 0.25, counter: 0.6, crusade: 0.01 },

  gearLabel: "Holy weapon",
  healLabel: "Devotion",      // what the class's own healing is called in the run summary
  gearTypes: { mace: "Holy Mace", shield: "Mace and Shield", tome: "Holy Tome" },
  gearIcons: { mace: "🔨", shield: "🛡️", tome: "📖" },

  upgrades: [
    { id: "fervor", name: "Fervor", text: "+5% attack", bonus: { attackPercent: 0.05 } },
    { id: "blessedArmor", name: "Blessed Armor", text: "+2 armor", bonus: { armor: 2 } },
    { id: "prayer", name: "Prayer", text: "Devotion: +1% of your health healed every turn", bonus: { devotion: 0.01 } },
    { id: "holyFire", name: "Holy Fire", text: "Holy Mace: hits add +10% more of their damage as holy damage", build: "mace", bonus: { smite: 0.1 } },
    { id: "aegis", name: "Aegis", text: "Mace and Shield: +5% block chance", build: "shield", bonus: { blockChance: 0.05 } },
    { id: "litany", name: "Litany", text: "Holy Tome: healing you do not need burns the enemy for +15% more", build: "tome", bonus: { sacredFlame: 0.15 } },
    { id: "battleHymn", name: "Battle Hymn", text: "Crusade: +2% damage for every turn a fight lasts", bonus: { crusade: 0.02 } }
  ],

  // Power, Toughness, one skill for each weapon, and ONE class skill that helps every
  // weapon (Crusade). A second class skill, Piety (id "piety"), was removed in October
  // 2026: don't reuse that id. Devotion still grows through boons, relics and perks.
  skills: [
    { id: "zeal", name: "Power", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "faithful", name: "Toughness", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "radiance", name: "Mace Mastery", text: "Holy Mace: hits add +2.5% more of their damage as holy damage, and Judgement (every third hit) deals +5% more", bonus: { smite: 0.025, judgement: 0.05 }, cost: 1 },
    { id: "shieldMastery", name: "Shield Mastery", text: "Mace and Shield: +1.5% block chance, and the strike back after a block hits for +4% of your attack more", bonus: { blockChance: 0.015, counter: 0.04 }, cost: 1 },
    { id: "holyLight", name: "Tome Mastery", text: "Holy Tome: healing you do not need burns the enemy for +10% more", bonus: { sacredFlame: 0.1 }, cost: 1 },
    { id: "holyWar", name: "Crusade", text: "Crusade: +1.5% damage for every turn a fight lasts", bonus: { crusade: 0.015 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "blessing", name: "Blessing", text: "health x1.1", multiply: { health: 1.1 } },
        { id: "righteousMight", name: "Righteous Strength", text: "attack x1.1", multiply: { attack: 1.1 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "consecration", name: "Consecration", text: "Devotion: +1% of your health healed every turn", bonus: { devotion: 0.01 } },
        { id: "holyPlate", name: "Holy Plate", text: "+3 armor", bonus: { armor: 3 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "crusader", name: "Justicar", text: "Holy Mace: hits add +20% more of their damage as holy damage, and Judgement (every third hit) deals +50% more", bonus: { smite: 0.2, judgement: 0.5 } },
        { id: "templar", name: "Templar", text: "Mace and Shield: +10% block chance, and the strike back after a block hits for +30% of your attack more", bonus: { blockChance: 0.1, counter: 0.3 } },
        { id: "priest", name: "Priest", text: "Holy Tome: healing you do not need burns the enemy for +50% more. Devotion: +1% of your health healed every turn", bonus: { devotion: 0.01, sacredFlame: 0.5 } },
        { id: "holyWarrior", name: "Crusader", text: "Crusade: +5% damage for every turn a fight lasts", bonus: { crusade: 0.05 } }
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
        { id: "avenger", name: "Hammer of Light", text: "Holy Mace: holy damage and Judgement damage x2, and +15% attack", bonus: { attackPercent: 0.15 }, multiply: { mace: 2 } },
        { id: "saint", name: "Saint", text: "health x1.5, and Devotion: +2% of your health healed every turn", bonus: { devotion: 0.02 }, multiply: { health: 1.5 } },
        { id: "bulwarkOfFaith", name: "Bulwark of Faith", text: "Mace and Shield: strike back damage x2, and +10% block chance", bonus: { blockChance: 0.1 }, multiply: { shieldCounter: 2 } },
        { id: "hierophant", name: "Hierophant", text: "Holy Tome: the burn from healing you do not need x2.5. Devotion: +1% of your health healed every turn", bonus: { devotion: 0.01 }, multiply: { sacred: 2.5 } },
        { id: "zealous", name: "Zealous", text: "Crusade x3: three times the damage for every turn a fight lasts", multiply: { crusade: 3 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "holyWrath", name: "Holy Wrath", text: "+44% attack", bonus: { attackPercent: 0.44 } },
        { id: "divineHealth", name: "Divine Health", text: "health x1.75", multiply: { health: 1.75 } },
        { id: "inquisitor", name: "Inquisitor", text: "Holy Mace: +25% attack, hits add +40% more of their damage as holy damage, and Judgement (every third hit) deals +80% more", bonus: { attackPercent: 0.25, smite: 0.4, judgement: 0.8 } },
        { id: "shieldOfTheFaithful", name: "Shield of the Faithful", text: "Mace and Shield: +25% attack, +10% block chance, and the strike back after a block hits for +70% of your attack more", bonus: { attackPercent: 0.25, blockChance: 0.1, counter: 0.7 } },
        { id: "lightbringer", name: "Lightbringer", text: "Holy Tome: +25% attack, and healing you do not need burns the enemy for +120% more", bonus: { attackPercent: 0.25, sacredFlame: 1.2 } },
        { id: "crusadeEternal", name: "Eternal Crusade", text: "+25% attack, and Crusade: +6% damage for every turn a fight lasts", bonus: { attackPercent: 0.25, crusade: 0.06 } },
        { id: "divineShield", name: "Divine Favor", text: "You take 25% less damage", multiply: { damageTaken: 0.75 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "handOfGod", name: "Hand of God", text: "Holy Mace: holy damage and Judgement damage x2 again, and +20% attack", bonus: { attackPercent: 0.2 }, multiply: { mace: 2 } },
        { id: "martyr", name: "Martyr", text: "health x2, and Devotion: +2% of your health healed every turn", bonus: { devotion: 0.02 }, multiply: { health: 2 } },
        { id: "aegisOfHeaven", name: "Aegis of Heaven", text: "Mace and Shield: strike back damage x2 again, and +10% block chance", bonus: { blockChance: 0.1 }, multiply: { shieldCounter: 2 } },
        { id: "voiceOfGod", name: "Voice of God", text: "Holy Tome: the burn from healing you do not need x2.5 again. Devotion: +2% of your health healed every turn", bonus: { devotion: 0.02 }, multiply: { sacred: 2.5 } },
        { id: "lastCrusade", name: "Last Crusade", text: "Crusade x3 again", multiply: { crusade: 3 } }
      ]
    }
  ],

  // Extra choices at every BREAKTHROUGH (floor 150 and beyond), beside the ones every
  // class has. One for each build: it multiplies that build's own damage again.
  breakthroughs: [
    { id: "brighterLight", name: "Brighter Light", text: "Holy Mace: holy damage and Judgement damage x1.5", multiply: { mace: 1.5 } },
    { id: "swifterAnswer", name: "Swifter Answer", text: "Mace and Shield: strike back damage x1.5", multiply: { shieldCounter: 1.5 } },
    { id: "hotterFaith", name: "Hotter Faith", text: "Holy Tome: the burn from healing you do not need x1.5", multiply: { sacred: 1.5 } },
    { id: "longerCrusade", name: "Longer Crusade", text: "Crusade x1.5", multiply: { crusade: 1.5 } }
  ],

  // Special moves on a cooldown, put in the slots that open on floors 10, 35 and 75
  // (rules in game/abilities.js). "cooldown" is in turns of fighting. "build" works as
  // for boons. A "bossKiller" starts set to "Bosses only". "use" is what it does, built
  // from the pieces in game/abilities.js (abilityHit, abilitySpell, abilityStun...).
  abilities: [
    { id: "judgementDay", name: "Judgement Day", text: "Holy Mace: 3.5 turns of your damage in one holy blow", build: "mace", cooldown: 7,
      use: function () { abilityTurns(3.5); } },
    { id: "shieldSlam", name: "Shield Slam", text: "Mace and Shield: 2.5 turns of your damage in one bash, and the enemy is stunned", build: "shield", cooldown: 7,
      use: function () { abilityTurns(2.5); abilityStun(); } },
    { id: "holyLight", name: "Holy Light", text: "Holy Tome: heal 25% of your health and 2 turns of your damage; the healing you do not need burns the enemy too", build: "tome", cooldown: 6,
      use: function () { abilityTurns(2); let spare = abilityHeal(0.25); if (spare > 0) { abilityPure(spare * (1 + totalBonus("sacredFlame")) * multiplier("sacred"), "holy"); } } },
    { id: "righteousFury", name: "Righteous Fury", text: "All your damage +100% for 5 turns", cooldown: 15,
      use: function () { abilityBoost(1, 5); } },
    { id: "wrathOfGod", name: "Wrath of God", text: "Boss killer: 10 turns of your damage in one holy blow", cooldown: 30, bossKiller: true,
      use: function () { abilityTurns(10); } }
  ],

  relics: [
    { id: "holyChalice", name: "Holy Chalice", text: "Devotion: +1% of your health healed every turn", bonus: { devotion: 0.01 } },
    { id: "sunSigil", name: "Sun Sigil", text: "Holy Mace: hits add +15% more of their damage as holy damage", build: "mace", bonus: { smite: 0.15 } },
    { id: "saintsBuckler", name: "Saint's Buckler", text: "Mace and Shield: +6% block chance", build: "shield", bonus: { blockChance: 0.06 } },
    { id: "psalter", name: "Psalter", text: "Holy Tome: healing you do not need burns the enemy for +25% more", build: "tome", bonus: { sacredFlame: 0.25 } },
    { id: "warBanner", name: "War Banner", text: "Crusade: +3% damage for every turn a fight lasts", bonus: { crusade: 0.03 } }
  ],

  startFight: zealotStartFight,
  damageTypes: zealotDamageTypes,
  attack: zealotAttack,
  whenAttacked: zealotWhenAttacked,
  damageDivider: zealotDamageDivider,
  dotPerStack: zealotDotPerStack,
  statLine: zealotStatLine,
  gearInfo: zealotGearInfo
};

// The damage types this class is dealing right now (for the tower list)
function zealotDamageTypes() {
  if (weapon === "tome") {
    return ["holy"];
  }
  if (weapon === "mace") {
    return ["crushing", "holy"];
  }
  return ["crushing"];
}

// The numbers behind the weapons. Change these to retune them.
const tomeHit = 1.15;       // a holy tome spell hits for this many times your attack
const judgementEvery = 3;   // with the holy mace, every hit of this number is a Judgement

// Holy Mace: how many hits have landed in this fight
let zealotHits = 0;

// Runs at the start of every fight
function zealotStartFight() {
  zealotHits = 0;
}

// How much the Zealot heals every turn, as a share of full health. The Holy Tome doubles it.
// Devotion always adds to it, but less and less, so it creeps toward maxHealing and
// never reaches it. Without that, enough devotion would make the Zealot impossible to kill.
const maxHealing = 0.2;

function zealotHealing() {
  let devotion = totalBonus("devotion");
  let healing = maxHealing * devotion / (devotion + maxHealing);

  if (weapon === "tome") {
    return healing * 2;
  }
  return healing;
}

// Crusade: all damage grows with every turn the fight has lasted
function zealotCrusade() {
  return 1 + (fightTurns - 1) * totalBonus("crusade") * multiplier("crusade");
}

function zealotAttack() {
  // The turn begins with a prayer. Healing that is not needed is wasted,
  // unless a holy tome is held: then it burns the enemy instead.
  let healing = Math.round(playerMaxHp * zealotHealing());
  let wasted = Math.max(0, playerHp + healing - playerMaxHp);
  healPlayer(healing);

  let damage = playerAttack * zealotCrusade();

  if (weapon === "tome") {
    // Holy magic ignores armor
    spellHitMonster(damage * tomeHit, "holy");
    if (wasted > 0) {
      spellHitMonster(wasted * (1 + totalBonus("sacredFlame")) * multiplier("sacred") * zealotCrusade(), "holy");
    }
  }

  if (weapon === "shield") {
    hitMonster(damage, "crushing");
  }

  if (weapon === "mace") {
    // Every third hit is a Judgement
    zealotHits = zealotHits + 1;
    if (zealotHits % judgementEvery === 0) {
      damage = damage * (1 + totalBonus("judgement") * multiplier("mace"));
      say("Judgement falls!");
    }
    hitMonster(damage, "crushing");

    // The mace adds holy damage that ignores armor
    spellHitMonster(damage * totalBonus("smite") * multiplier("mace"), "holy");
  }
}

// Block chance past its limit reduces all damage taken instead (it is divided by this)
function zealotDamageDivider() {
  if (weapon === "shield") {
    return 1 + overflow("blockChance", maxChance);
  }
  return 1;
}

function zealotWhenAttacked() {
  if (weapon === "shield" && chance(cappedChance("blockChance"))) {
    // A block is answered with a blow of the mace
    say("You block the attack and strike back!");
    hitMonster(playerAttack * totalBonus("counter") * multiplier("shieldCounter") * zealotCrusade(), "crushing");
    return true;
  }
  return false;
}

// The Zealot has no damage over time
function zealotDotPerStack() {
  return 0;
}

function zealotStatLine() {
  return "Devotion: heals " + percent(zealotHealing()) + " of your health every turn. Crusade: +" + percent(totalBonus("crusade")) + " damage for every turn a fight lasts";
}

function zealotGearInfo() {
  if (weapon === "mace") {
    return "Holy Mace: every hit adds " + percent(totalBonus("smite")) + " of its damage as holy damage that ignores armor, and every third hit is a Judgement for +" + percent(totalBonus("judgement")) + " damage.";
  }
  if (weapon === "shield") {
    return "Mace and Shield: " + percent(cappedChance("blockChance")) + " chance to block an attack and strike back for " + percent(totalBonus("counter")) + " of your attack."
      + overflowNote(overflow("blockChance", maxChance), "damage resistance");
  }
  return "Holy Tome: your spells hit " + percent(tomeHit - 1) + " harder and ignore armor, your healing is doubled, and healing you do not need burns the enemy instead (+" + percent(totalBonus("sacredFlame")) + ").";
}
