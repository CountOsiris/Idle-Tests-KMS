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
  gearTypes: { mace: "Holy Mace", shield: "Mace and Shield", tome: "Holy Tome" },
  gearIcons: { mace: "🔨", shield: "🛡️", tome: "📖" },

  upgrades: [
    { id: "fervor", name: "Fervor", text: "+3 attack", bonus: { attack: 3 } },
    { id: "blessedArmor", name: "Blessed Armor", text: "+2 armor", bonus: { armor: 2 } },
    { id: "prayer", name: "Prayer", text: "+1% healing every turn", bonus: { devotion: 0.01 } },
    { id: "holyFire", name: "Holy Fire", text: "Holy Mace: +10% holy damage", bonus: { smite: 0.1 } },
    { id: "aegis", name: "Aegis", text: "Mace and Shield: +5% block chance", bonus: { blockChance: 0.05 } },
    { id: "battleHymn", name: "Battle Hymn", text: "+2% damage for every turn a fight lasts", bonus: { crusade: 0.02 } }
  ],

  skills: [
    { id: "zeal", name: "Zeal", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "faithful", name: "Faithful", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "radiance", name: "Radiance", text: "Holy Mace: +5% holy damage", bonus: { smite: 0.05 }, cost: 1 },
    { id: "armorOfFaith", name: "Armor of Faith", text: "+2 armor", bonus: { armor: 2 }, cost: 1 },
    { id: "piety", name: "Piety", text: "+0.5% healing every turn", bonus: { devotion: 0.005 }, cost: 1 },
    { id: "shieldMastery", name: "Shield Mastery", text: "Mace and Shield: +3% block chance", bonus: { blockChance: 0.03 }, cost: 1 },
    { id: "judgement", name: "Judgement", text: "Holy Mace: every third hit deals +10% more", bonus: { judgement: 0.1 }, cost: 1 },
    { id: "retribution", name: "Retribution", text: "Mace and Shield: the blow after a block deals +8% of your attack more", bonus: { counter: 0.08 }, cost: 1 },
    { id: "holyLight", name: "Holy Light", text: "Holy Tome: wasted healing burns for +10% more", bonus: { sacredFlame: 0.1 }, cost: 1 },
    { id: "holyWar", name: "Holy War", text: "+1% damage for every turn a fight lasts", bonus: { crusade: 0.01 }, cost: 1 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "blessing", name: "Blessing", text: "+35 health", bonus: { maxHp: 35 } },
        { id: "righteousMight", name: "Righteous Might", text: "+5 attack", bonus: { attack: 5 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "consecration", name: "Consecration", text: "+1% healing every turn", bonus: { devotion: 0.01 } },
        { id: "holyPlate", name: "Holy Plate", text: "+3 armor", bonus: { armor: 3 } }
      ]
    },
    {
      floor: 20,
      perks: [
        { id: "crusader", name: "Justicar", text: "Holy Mace: +20% holy damage and every third hit deals +50% more", bonus: { smite: 0.2, judgement: 0.5 } },
        { id: "templar", name: "Templar", text: "Mace and Shield: +10% block chance and the blow after a block deals +30% of your attack more", bonus: { blockChance: 0.1, counter: 0.3 } },
        { id: "priest", name: "Priest", text: "+1% healing every turn and Holy Tome: wasted healing burns for +50% more", bonus: { devotion: 0.01, sacredFlame: 0.5 } },
        { id: "holyWarrior", name: "Crusader", text: "+5% damage for every turn a fight lasts", bonus: { crusade: 0.05 } }
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
        { id: "avenger", name: "Avenger", text: "+30% attack and +30% holy damage", bonus: { attackPercent: 0.3, smite: 0.3 } },
        { id: "saint", name: "Saint", text: "+50% health and +2% healing every turn", bonus: { healthPercent: 0.5, devotion: 0.02 } },
        { id: "bulwarkOfFaith", name: "Bulwark of Faith", text: "Mace and Shield: +15% attack, +8% block chance, and the blow after a block deals +40% of your attack more", bonus: { attackPercent: 0.15, blockChance: 0.08, counter: 0.4 } },
        { id: "hierophant", name: "Hierophant", text: "Holy Tome: +15% attack, more healing every turn and wasted healing burns for +80% more", bonus: { attackPercent: 0.15, devotion: 0.01, sacredFlame: 0.8 } },
        { id: "zealous", name: "Zealous", text: "+15% attack and +4% damage for every turn a fight lasts", bonus: { attackPercent: 0.15, crusade: 0.04 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "holyWrath", name: "Holy Wrath", text: "+44% attack", bonus: { attackPercent: 0.44 } },
        { id: "divineHealth", name: "Divine Health", text: "+110% health", bonus: { healthPercent: 1.1 } },
        { id: "inquisitor", name: "Inquisitor", text: "Holy Mace: +25% attack, +40% holy damage and every third hit deals +80% more", bonus: { attackPercent: 0.25, smite: 0.4, judgement: 0.8 } },
        { id: "shieldOfTheFaithful", name: "Shield of the Faithful", text: "Mace and Shield: +25% attack, +10% block chance, and the blow after a block deals +70% of your attack more", bonus: { attackPercent: 0.25, blockChance: 0.1, counter: 0.7 } },
        { id: "lightbringer", name: "Lightbringer", text: "Holy Tome: +25% attack and wasted healing burns for +120% more", bonus: { attackPercent: 0.25, sacredFlame: 1.2 } },
        { id: "crusadeEternal", name: "Eternal Crusade", text: "+25% attack and +6% damage for every turn a fight lasts", bonus: { attackPercent: 0.25, crusade: 0.06 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "handOfGod", name: "Hand of God", text: "+60% attack and Holy Mace: +40% holy damage", bonus: { attackPercent: 0.6, smite: 0.4 } },
        { id: "martyr", name: "Martyr", text: "+150% health and +2% healing every turn", bonus: { healthPercent: 1.5, devotion: 0.02 } },
        { id: "aegisOfHeaven", name: "Aegis of Heaven", text: "Mace and Shield: +35% attack, +12% block chance, and the blow after a block deals +110% of your attack more", bonus: { attackPercent: 0.35, blockChance: 0.12, counter: 1.1 } },
        { id: "voiceOfGod", name: "Voice of God", text: "Holy Tome: +35% attack, more healing every turn and wasted healing burns for +200% more", bonus: { attackPercent: 0.35, devotion: 0.02, sacredFlame: 2 } },
        { id: "lastCrusade", name: "Last Crusade", text: "+35% attack and +10% damage for every turn a fight lasts", bonus: { attackPercent: 0.35, crusade: 0.1 } }
      ]
    }
  ],

  relics: [
    { id: "holyChalice", name: "Holy Chalice", text: "+1% healing every turn", bonus: { devotion: 0.01 } },
    { id: "sunSigil", name: "Sun Sigil", text: "Holy Mace: +15% holy damage", bonus: { smite: 0.15 } },
    { id: "saintsBuckler", name: "Saint's Buckler", text: "Mace and Shield: +6% block chance", bonus: { blockChance: 0.06 } },
    { id: "psalter", name: "Psalter", text: "Holy Tome: wasted healing burns for +25% more", bonus: { sacredFlame: 0.25 } },
    { id: "warBanner", name: "War Banner", text: "+3% damage for every turn a fight lasts", bonus: { crusade: 0.03 } }
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
  return 1 + (fightTurns - 1) * totalBonus("crusade");
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
      spellHitMonster(wasted * (1 + totalBonus("sacredFlame")) * zealotCrusade(), "holy");
    }
  }

  if (weapon === "shield") {
    hitMonster(damage, "crushing");
  }

  if (weapon === "mace") {
    // Every third hit is a Judgement
    zealotHits = zealotHits + 1;
    if (zealotHits % judgementEvery === 0) {
      damage = damage * (1 + totalBonus("judgement"));
      say("Judgement falls!");
    }
    hitMonster(damage, "crushing");

    // The mace adds holy damage that ignores armor
    spellHitMonster(damage * totalBonus("smite"), "holy");
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
    hitMonster(playerAttack * totalBonus("counter") * zealotCrusade(), "crushing");
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
