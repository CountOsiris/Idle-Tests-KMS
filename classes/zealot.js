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
    { id: "zeal", name: "Zeal", text: "+3% attack", bonus: { attackPercent: 0.03 }, maxLevel: 0, cost: 1 },
    { id: "faithful", name: "Faithful", text: "+3% health", bonus: { healthPercent: 0.03 }, maxLevel: 0, cost: 1 },
    { id: "radiance", name: "Radiance", text: "Holy Mace: +10% holy damage", bonus: { smite: 0.1 }, maxLevel: 20, cost: 1 },
    { id: "armorOfFaith", name: "Armor of Faith", text: "+2 armor", bonus: { armor: 2 }, maxLevel: 10, cost: 1 },
    { id: "piety", name: "Piety", text: "+0.5% healing every turn", bonus: { devotion: 0.005 }, maxLevel: 6, cost: 2 },
    { id: "shieldMastery", name: "Shield Mastery", text: "Mace and Shield: +3% block chance", bonus: { blockChance: 0.03 }, maxLevel: 5, cost: 2 }
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
      floor: 15,
      perks: [
        { id: "crusader", name: "Crusader", text: "Holy Mace: +20% holy damage", bonus: { smite: 0.2 } },
        { id: "templar", name: "Templar", text: "Mace and Shield: +10% block chance", bonus: { blockChance: 0.1 } },
        { id: "priest", name: "Priest", text: "+2% healing every turn", bonus: { devotion: 0.02 } }
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
        { id: "avenger", name: "Avenger", text: "+15 attack and +30% holy damage", bonus: { attack: 15, smite: 0.3 } },
        { id: "saint", name: "Saint", text: "+100 health and +2% healing every turn", bonus: { maxHp: 100, devotion: 0.02 } }
      ]
    },
    {
      floor: 40,
      perks: [
        { id: "holyWrath", name: "Holy Wrath", text: "+22 attack", bonus: { attack: 22 } },
        { id: "divineHealth", name: "Divine Health", text: "+220 health", bonus: { maxHp: 220 } }
      ]
    },
    {
      floor: 50,
      perks: [
        { id: "handOfGod", name: "Hand of God", text: "+30 attack and Holy Mace: +40% holy damage", bonus: { attack: 30, smite: 0.4 } },
        { id: "martyr", name: "Martyr", text: "+300 health and +2% healing every turn", bonus: { maxHp: 300, devotion: 0.02 } }
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
    return "Mace and Shield: " + percent(cappedChance("blockChance")) + " chance to block an attack.";
  }
  return "Holy Tome: your attacks ignore armor and your healing is doubled.";
}
