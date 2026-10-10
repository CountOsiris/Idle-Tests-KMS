// =====================================================================
//  game/bosses.js - Boss mechanics: the rules that make a boss fight its own event.
// =====================================================================
//
// A boss in towers.js can list mechanics:  mechanics: ["shield"]
// What each one is called and its numbers are in data.js (bossMechanics); what it
// DOES is here. Bosses below bossMechanicsFloor fight plainly, so the first boss a
// new player meets has no rules to learn.
//
// The mechanics do not reach into the classes. Instead the fight (game/fights.js)
// tells this file how much health the boss lost each time something hurt it
// (bossTakes), and this file puts some back, or passes it to a minion, or hurts
// you for it. So every class, weapon and ability meets them the same way.

// ----- What one boss fight remembers (not saved: a reloaded page starts the fight again) -----
let bossRules = [];        // the ids of the mechanics this boss has, for example ["shield"]
let bossBaseAttack = 0;    // its attack when the fight began (the reflect aura is measured in these)
let shieldUsed = false;    // has its shield phase begun? (it happens once a fight)
let shieldFrom = 0;        // the turn the shield went up; it covers the turns after that one
let minionsCalled = 0;     // how many minions it has called so far
let minionHp = 0;          // the health of the minion standing in front of it (0 means none)
let minionMaxHp = 0;
let bossEnraged = false;
let lastBossEvent = "";    // a word or two for the animation, for example "Shield up"

function bossHas(id) {
  return bossRules.includes(id);
}

// Runs for every monster when it appears. Only a boss deep enough gets its rules.
function startBossMechanics(type, isBoss) {
  bossRules = [];
  bossBaseAttack = monsterAttack;
  shieldUsed = false;
  shieldFrom = 0;
  minionsCalled = 0;
  minionHp = 0;
  minionMaxHp = 0;
  bossEnraged = false;
  lastBossEvent = "";

  if (!isBoss || floor < bossMechanicsFloor || type.mechanics === undefined) {
    return;
  }
  for (let id of type.mechanics) {
    if (bossMechanics[id] !== undefined) {
      bossRules.push(id);
      say(bossMechanics[id].icon + " " + bossMechanics[id].name + ": " + bossMechanicText(id) + ".");
    }
  }
}

// What a mechanic does, in words, written from its numbers in data.js
function bossMechanicText(id) {
  let rule = bossMechanics[id];

  if (id === "shield") {
    return "below " + percent(rule.below) + " health it takes " + percent(rule.blocks) + " less damage for " + rule.turns + " turns";
  }
  if (id === "summons") {
    return "it calls a minion " + rule.at.length + " times, which must die before the boss can be hurt, and adds " + percent(rule.attack) + " to its attack";
  }
  if (id === "enrage") {
    return "after " + rule.afterTurns + " turns its attack is multiplied by " + rule.attack;
  }
  if (id === "reflect") {
    return "hurting it hurts you: over the whole fight, " + rule.attacks + " of its attacks' worth (half for a class that fights from range)";
  }
  if (id === "armorUp") {
    return "its armor blocks " + percent(rule.perTurn) + " more every turn, up to " + percent(rule.most) + ". Spells and bleeding ignore armor";
  }
  return "";
}

// Is this turn's damage shielded? The shield covers the turns AFTER the one it went up in.
function shieldIsUp() {
  return shieldUsed && fightTurns > shieldFrom && fightTurns <= shieldFrom + bossMechanics.shield.turns;
}

// How many more turns the shield will cover (0 if it is down or has not gone up)
function shieldTurnsLeft() {
  if (!shieldUsed) {
    return 0;
  }
  return Math.max(0, shieldFrom + bossMechanics.shield.turns - fightTurns);
}

// Runs at the start of every turn of a fight
function bossStartOfTurn() {
  if (bossRules.length === 0) {
    return;
  }

  if (bossHas("enrage") && !bossEnraged && fightTurns > bossMechanics.enrage.afterTurns) {
    bossEnraged = true;
    monsterAttack = Math.round(monsterAttack * bossMechanics.enrage.attack);
    lastBossEvent = "Enraged";
    say("The " + monsterName + " flies into a rage: its attack is multiplied by " + bossMechanics.enrage.attack + "!");
  }

  if (bossHas("armorUp") && fightTurns > 1) {
    monsterArmor = Math.min(bossMechanics.armorUp.most, monsterArmor + bossMechanics.armorUp.perTurn);
  }
}

// Would a big hit be mostly thrown away this turn? (Boss killers wait for this to pass.)
function bossWouldWasteAHit() {
  return minionHp > 0 || shieldIsUp();
}

// While a minion stands, it attacks beside the boss
function bossAttackFactor() {
  if (minionHp > 0) {
    return 1 + bossMechanics.summons.attack;
  }
  return 1;
}

// Runs each time something has just hurt the monster. "hpBefore" is its health before
// that. The class's hit has already been taken off monsterHp; this decides how much of
// it really counts. It can kill you (the reflect aura), so the fight checks afterwards.
function bossTakes(hpBefore) {
  let dealt = hpBefore - monsterHp;
  if (bossRules.length === 0 || dealt <= 0) {
    return;
  }

  // A minion takes the hit instead. Whatever is left over when it falls is wasted.
  if (minionHp > 0) {
    monsterHp = hpBefore;
    minionHp = minionHp - dealt;
    if (minionHp <= 0) {
      minionHp = 0;
      lastBossEvent = "Minion down";
      say("The minion falls. The " + monsterName + " can be hurt again.");
    }
    return;
  }

  if (shieldIsUp()) {
    let blocked = Math.floor(dealt * bossMechanics.shield.blocks);
    monsterHp = monsterHp + blocked;
    dealt = dealt - blocked;
  }

  if (bossHas("reflect")) {
    // Taking off all of its health costs "attacks" of its attacks, so a tenth costs a tenth of that
    let back = bossBaseAttack * bossMechanics.reflect.attacks * dealt / monsterMaxHp;
    if (currentClass().ranged === true) {
      back = back * bossMechanics.reflect.rangedShare;
    }
    back = Math.max(1, Math.round(back));
    playerHp = playerHp - back;
    noteTaken(back);
    if (playerHp <= 0) {
      say("The " + monsterName + "'s reflect aura finishes you.");
      die();
      return;
    }
  }

  if (monsterHp <= 0) {
    return;
  }

  if (bossHas("shield") && !shieldUsed && monsterHp < monsterMaxHp * bossMechanics.shield.below) {
    shieldUsed = true;
    shieldFrom = fightTurns;
    lastBossEvent = "Shield up";
    say("The " + monsterName + " raises a shield: " + percent(bossMechanics.shield.blocks) + " less damage for " + bossMechanics.shield.turns + " turns.");
  }

  let calls = bossMechanics.summons.at;
  if (bossHas("summons") && minionsCalled < calls.length && monsterHp <= monsterMaxHp * calls[minionsCalled]) {
    minionsCalled = minionsCalled + 1;
    minionMaxHp = Math.max(1, Math.round(monsterMaxHp * bossMechanics.summons.health));
    minionHp = minionMaxHp;
    lastBossEvent = "Minion";
    say("The " + monsterName + " calls a minion to stand in front of it!");
  }
}

// ----- On the page -----

// The rules of the boss being fought, one line each, shown under its description
function bossRulesText() {
  let lines = [];
  for (let id of bossRules) {
    lines.push(bossMechanics[id].icon + " " + bossMechanics[id].name + ": " + bossMechanicText(id) + ".");
  }
  return lines.join(" ");
}

// What its mechanics are doing right now, shown above its health bar
function bossStatusText() {
  let parts = [];

  if (minionHp > 0) {
    parts.push(bossMechanics.summons.icon + " Minion " + big(minionHp) + " / " + big(minionMaxHp));
  }
  if (shieldTurnsLeft() > 0) {
    parts.push(bossMechanics.shield.icon + " Shielded: " + shieldTurnsLeft() + " turns");
  }
  if (bossHas("enrage")) {
    if (bossEnraged) {
      parts.push(bossMechanics.enrage.icon + " Enraged");
    } else {
      parts.push(bossMechanics.enrage.icon + " Enrages in " + (bossMechanics.enrage.afterTurns - fightTurns) + " turns");
    }
  }
  if (bossHas("armorUp")) {
    parts.push(bossMechanics.armorUp.icon + " Armor rising");
  }
  if (bossHas("reflect")) {
    parts.push(bossMechanics.reflect.icon + " Reflecting");
  }
  if (bossHas("shield") && !shieldUsed) {
    parts.push(bossMechanics.shield.icon + " Shield at " + percent(bossMechanics.shield.below));
  }
  if (bossHas("summons") && minionHp <= 0 && minionsCalled < bossMechanics.summons.at.length) {
    parts.push(bossMechanics.summons.icon + " Next minion at " + percent(bossMechanics.summons.at[minionsCalled]));
  }

  return parts.join("  ·  ");
}
