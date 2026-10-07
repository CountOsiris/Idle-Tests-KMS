// =====================================================================
//  The Ranger - a bow, forest magic and spirit summons
// =====================================================================
// Bonus words only the Ranger uses:
//   firstStrike  turns the enemy misses at the start of a fight   (1 means +1 turn)
//   aimChance    longbow chance of an aimed shot (double damage)  (0.1 means +10%)
//   spirits      most spirits the spirit bow can summon           (2 means +2)
//   regrowth     health healed per shot by the bloom bow          (0.01 means +1% of your health)
//
// See classes/barbarian.js for what each list is for.

classes.ranger = {
  name: "Ranger",
  icon: "🏹",
  text: "A bow and forest magic. Shoots before the enemy can reach you, and calls spirits to fight.",
  powerStat: "Dexterity",
  base: { maxHp: 80, attack: 10, firstStrike: 1, aimChance: 0.3, spirits: 3, regrowth: 0.05 },

  gearLabel: "Bow",
  gearTypes: { longbow: "Longbow", spirit: "Spirit Bow", bloom: "Bloom Bow" },
  dotLabel: "Spirit damage",

  upgrades: [
    { id: "quickDraw", name: "Quick Draw", text: "+3 attack", bonus: { attack: 3 } },
    { id: "eagleEye", name: "Eagle Eye", text: "Longbow: +5% aimed shot chance", bonus: { aimChance: 0.05 } },
    { id: "packLeader", name: "Pack Leader", text: "Spirit Bow: +1 spirit", bonus: { spirits: 1 } },
    { id: "overgrowth", name: "Overgrowth", text: "Bloom Bow: +1% healing per shot", bonus: { regrowth: 0.01 } }
  ],

  skills: [
    { id: "marksmanship", name: "Marksmanship", text: "+2 attack", bonus: { attack: 2 }, maxLevel: 10, cost: 100 },
    { id: "endurance", name: "Endurance", text: "+15 health", bonus: { maxHp: 15 }, maxLevel: 10, cost: 100 },
    { id: "openingVolley", name: "Opening Volley", text: "The enemy misses 1 more turn at the start of a fight", bonus: { firstStrike: 1 }, maxLevel: 2, cost: 500 },
    { id: "longbowMastery", name: "Longbow Mastery", text: "Longbow: +3% aimed shot chance", bonus: { aimChance: 0.03 }, maxLevel: 5, cost: 300 },
    { id: "spiritMastery", name: "Spirit Mastery", text: "Spirit Bow: +1 spirit", bonus: { spirits: 1 }, maxLevel: 3, cost: 300 },
    { id: "bloomMastery", name: "Bloom Mastery", text: "Bloom Bow: +1% healing per shot", bonus: { regrowth: 0.01 }, maxLevel: 4, cost: 300 }
  ],

  milestones: [
    {
      floor: 5,
      perks: [
        { id: "hardy", name: "Hardy", text: "+30 health", bonus: { maxHp: 30 } },
        { id: "keenEye", name: "Keen Eye", text: "+5 attack", bonus: { attack: 5 } }
      ]
    },
    {
      floor: 10,
      perks: [
        { id: "camouflage", name: "Camouflage", text: "The enemy misses 1 more turn at the start of a fight", bonus: { firstStrike: 1 } },
        { id: "barkSkin", name: "Bark Skin", text: "+3 armor", bonus: { armor: 3 } }
      ]
    },
    {
      floor: 15,
      perks: [
        { id: "marksman", name: "Marksman", text: "Longbow: +10% aimed shot chance", bonus: { aimChance: 0.1 } },
        { id: "beastmaster", name: "Beastmaster", text: "Spirit Bow: +2 spirits", bonus: { spirits: 2 } },
        { id: "druid", name: "Druid", text: "Bloom Bow: +2% healing per shot", bonus: { regrowth: 0.02 } }
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
        { id: "hawksVolley", name: "Hawk's Volley", text: "+15 attack and the enemy misses 1 more turn", bonus: { attack: 15, firstStrike: 1 } },
        { id: "forestGuardian", name: "Forest Guardian", text: "+100 health and +4 armor", bonus: { maxHp: 100, armor: 4 } }
      ]
    },
    {
      floor: 40,
      perks: [
        { id: "deadeye", name: "Deadeye", text: "+25 attack", bonus: { attack: 25 } },
        { id: "wildHeart", name: "Wild Heart", text: "+200 health", bonus: { maxHp: 200 } }
      ]
    },
    {
      floor: 50,
      perks: [
        { id: "stormOfArrows", name: "Storm of Arrows", text: "+30 attack and the enemy misses 1 more turn", bonus: { attack: 30, firstStrike: 1 } },
        { id: "spiritLord", name: "Spirit Lord", text: "+200 health and Spirit Bow: +3 spirits", bonus: { maxHp: 200, spirits: 3 } }
      ]
    }
  ],

  relics: [
    { id: "hawkFeather", name: "Hawk Feather", text: "Longbow: +10% aimed shot chance", bonus: { aimChance: 0.1 } },
    { id: "wolfTotem", name: "Wolf Totem", text: "Spirit Bow: +1 spirit", bonus: { spirits: 1 } },
    { id: "heartwood", name: "Heartwood", text: "Bloom Bow: +2% healing per shot", bonus: { regrowth: 0.02 } }
  ],

  startFight: rangerStartFight,
  attack: rangerAttack,
  whenAttacked: rangerWhenAttacked,
  dotPerStack: rangerDotPerStack,
  statLine: rangerStatLine,
  gearInfo: rangerGearInfo
};

// How many more turns the enemy is still too far away to attack
let rangerFreeTurns = 0;

// Runs at the start of every fight
function rangerStartFight() {
  rangerFreeTurns = totalBonus("firstStrike");
}

function rangerAttack() {
  // The enemy is still out of reach, so it misses this turn
  if (rangerFreeTurns > 0) {
    rangerFreeTurns = rangerFreeTurns - 1;
    monsterStunned = true;
  }

  let damage = playerAttack;

  if (weapon === "longbow" && chance(totalBonus("aimChance"))) {
    damage = damage * 2;
    say("An aimed shot finds a weak spot!");
  }
  hitMonster(damage);

  if (weapon === "spirit") {
    addDotStack(totalBonus("spirits"));
  }

  if (weapon === "bloom") {
    healPlayer(playerMaxHp * totalBonus("regrowth"));
  }

  // Every summoned spirit attacks too
  monsterHp = monsterHp - dotDamage();
}

function rangerWhenAttacked() {
  return false;
}

// The damage of one spirit each turn
function rangerDotPerStack() {
  return Math.max(1, Math.round(playerAttack * 0.25));
}

function rangerStatLine() {
  return "Range: the enemy misses its first " + totalBonus("firstStrike") + " turn(s) of every fight";
}

function rangerGearInfo() {
  if (weapon === "longbow") {
    return "Longbow: " + percent(totalBonus("aimChance")) + " chance of an aimed shot for double damage.";
  }
  if (weapon === "spirit") {
    return "Spirit Bow: every shot summons a spirit that attacks each turn (up to " + totalBonus("spirits") + " spirits).";
  }
  return "Bloom Bow: every shot heals you for " + percent(totalBonus("regrowth")) + " of your health.";
}
