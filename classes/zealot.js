// =====================================================================
//  The Zealot - a holy crusader, played with a mace or as a caster
// =====================================================================
// Bonus words only the Zealot uses:
//   devotion     health healed every turn                      (0.01 means +1% of your health)
//   smite        holy mace: extra holy damage per hit          (0.1 means +10% of your attack)
//   blockChance  mace and shield: chance to block an attack    (0.05 means +5%)
//
// See classes/barbarian.js for what each list is for.

classes.zealot = {
  name: "Zealot",
  icon: "🔨",
  text: "A holy crusader. Heals every turn, and fights with a mace, a shield or holy magic.",
  perLevel: { maxHp: 10, attack: 2 },
  base: { maxHp: 100, attack: 7, armor: 1, devotion: 0.03, smite: 0.3, blockChance: 0.25 },

  gearLabel: "Holy weapon",
  gearTypes: { mace: "Holy Mace", shield: "Mace and Shield", tome: "Holy Tome" },

  upgrades: [
    { id: "fervor", name: "Fervor", text: "+3 attack", bonus: { attack: 3 } },
    { id: "blessedArmor", name: "Blessed Armor", text: "+2 armor", bonus: { armor: 2 } },
    { id: "prayer", name: "Prayer", text: "+1% healing every turn", bonus: { devotion: 0.01 } },
    { id: "holyFire", name: "Holy Fire", text: "Holy Mace: +10% holy damage", bonus: { smite: 0.1 } },
    { id: "aegis", name: "Aegis", text: "Mace and Shield: +5% block chance", bonus: { blockChance: 0.05 } }
  ],

  skills: [
    { id: "zeal", name: "Zeal", text: "+3% attack", bonus: { attackPercent: 0.03 }, cost: 1 },
    { id: "faithful", name: "Faithful", text: "+3% health", bonus: { healthPercent: 0.03 }, cost: 1 },
    { id: "radiance", name: "Radiance", text: "Holy Mace: +10% holy damage", bonus: { smite: 0.1 }, cost: 1 },
    { id: "armorOfFaith", name: "Armor of Faith", text: "+2 armor", bonus: { armor: 2 }, cost: 1 },
    { id: "piety", name: "Piety", text: "+0.5% healing every turn", bonus: { devotion: 0.005 }, cost: 2 },
    { id: "shieldMastery", name: "Shield Mastery", text: "Mace and Shield: +3% block chance", bonus: { blockChance: 0.03 }, cost: 2 }
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
        { id: "crusader", name: "Crusader", text: "Holy Mace: +20% holy damage", bonus: { smite: 0.2 } },
        { id: "templar", name: "Templar", text: "Mace and Shield: +10% block chance", bonus: { blockChance: 0.1 } },
        { id: "priest", name: "Priest", text: "+2% healing every turn", bonus: { devotion: 0.02 } }
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
        { id: "saint", name: "Saint", text: "+50% health and +2% healing every turn", bonus: { healthPercent: 0.5, devotion: 0.02 } }
      ]
    },
    {
      floor: 75,
      perks: [
        { id: "holyWrath", name: "Holy Wrath", text: "+44% attack", bonus: { attackPercent: 0.44 } },
        { id: "divineHealth", name: "Divine Health", text: "+110% health", bonus: { healthPercent: 1.1 } }
      ]
    },
    {
      floor: 100,
      perks: [
        { id: "handOfGod", name: "Hand of God", text: "+60% attack and Holy Mace: +40% holy damage", bonus: { attackPercent: 0.6, smite: 0.4 } },
        { id: "martyr", name: "Martyr", text: "+150% health and +2% healing every turn", bonus: { healthPercent: 1.5, devotion: 0.02 } }
      ]
    }
  ],

  relics: [
    { id: "holyChalice", name: "Holy Chalice", text: "+1% healing every turn", bonus: { devotion: 0.01 } },
    { id: "sunSigil", name: "Sun Sigil", text: "Holy Mace: +15% holy damage", bonus: { smite: 0.15 } },
    { id: "saintsBuckler", name: "Saint's Buckler", text: "Mace and Shield: +6% block chance", bonus: { blockChance: 0.06 } }
  ],

  attack: zealotAttack,
  whenAttacked: zealotWhenAttacked,
  damageDivider: zealotDamageDivider,
  dotPerStack: zealotDotPerStack,
  statLine: zealotStatLine,
  gearInfo: zealotGearInfo
};

// How much the Zealot heals every turn. The Holy Tome doubles it.
function zealotHealing() {
  if (weapon === "tome") {
    return totalBonus("devotion") * 2;
  }
  return totalBonus("devotion");
}

function zealotAttack() {
  healPlayer(playerMaxHp * zealotHealing());

  if (weapon === "tome") {
    // Holy magic ignores armor
    magicHitMonster(playerAttack);
  } else {
    hitMonster(playerAttack);
  }

  // The mace adds holy damage that ignores armor
  if (weapon === "mace") {
    magicHitMonster(playerAttack * totalBonus("smite"));
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
    say("You block the attack!");
    return true;
  }
  return false;
}

// The Zealot has no damage over time
function zealotDotPerStack() {
  return 0;
}

function zealotStatLine() {
  return "Devotion: heals " + percent(zealotHealing()) + " of your health every turn";
}

function zealotGearInfo() {
  if (weapon === "mace") {
    return "Holy Mace: every hit adds " + percent(totalBonus("smite")) + " of your attack as holy damage that ignores armor.";
  }
  if (weapon === "shield") {
    return "Mace and Shield: " + percent(cappedChance("blockChance")) + " chance to block an attack."
      + overflowNote(overflow("blockChance", maxChance), "damage resistance");
  }
  return "Holy Tome: your attacks ignore armor and your healing is doubled.";
}
