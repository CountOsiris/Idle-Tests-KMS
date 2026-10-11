// =====================================================================
//  game/fights.js - Building each room, and what happens in it: fights, death, victory, one second of play.
// =====================================================================

// ----- Building each room -----
function pickMonsterType(isBoss) {
  if (isBoss) {
    // Bosses come in order: floor 5 is the first, floor 10 the second...
    let bosses = towers[tower].bosses;
    return bosses[(floor / 5 - 1) % bosses.length];
  }

  let choices = [];
  for (let type of towers[tower].monsters) {
    if (type.minFloor <= floor) {
      choices.push(type);
    }
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

// A monster only lists the traits it has, so a missing one counts as 0
function traitOf(type, trait) {
  if (type[trait] === undefined) {
    return 0;
  }
  return type[trait];
}

// How many times stronger than floor 1 the monsters of a floor are (see data.js)
function towerGrowth(onFloor) {
  let growth = Math.pow(1 + monsterGrowth * (onFloor - 1), monsterCurve);

  // The climb gets steeper between midFloor and deepFloor
  if (onFloor > midFloor) {
    growth = growth * Math.pow(midGrowth, Math.min(onFloor, deepFloor) - midFloor);
  }

  // The deep tower: every floor past deepFloor multiplies it again
  if (onFloor > deepFloor) {
    growth = growth * Math.pow(deepGrowth, onFloor - deepFloor);
  }

  // The walls: every one at or below this floor multiplies it once more
  for (let wall of towerWalls) {
    if (onFloor >= wall.floor) {
      growth = growth * wall.strength;
    }
  }
  return growth;
}

// How far "longFights" (data.js) counts on a floor: 0 below its first floor, 1 from its last
function longFightShare(onFloor) {
  return Math.max(0, Math.min(1, (onFloor - longFights.fromFloor) / (longFights.fullFloor - longFights.fromFloor)));
}

// How many times stronger than floor 1 a monster's HEALTH is on a floor
function healthGrowth(onFloor) {
  return towerGrowth(onFloor) * (1 + (longFights.health - 1) * longFightShare(onFloor));
}

// How many times stronger than floor 1 a monster's ATTACK is on a floor. The curve is
// the same as its health's up to attackEaseFloor, and slower past it (see data.js for why).
function attackGrowth(onFloor) {
  let curve = towerGrowth(onFloor);
  if (onFloor > attackEaseFloor) {
    let formula = Math.pow((1 + monsterGrowth * (onFloor - 1)) / (1 + monsterGrowth * (attackEaseFloor - 1)), monsterCurve);
    curve = towerGrowth(attackEaseFloor) * formula * Math.pow(deepAttackGrowth, onFloor - attackEaseFloor);
  }
  return curve * (1 + (longFights.attack - 1) * longFightShare(onFloor));
}

// An ordinary monster of the floor being climbed: the health and attack of one whose
// own numbers are all 1, in this tower (stronger away from home). For the page, which
// uses it to say how the class stands against the floor.
function ordinaryMonster() {
  let ordinary = { hp: monsterHealth * healthGrowth(floor), attack: monsterDamage * attackGrowth(floor) };

  if (isAway()) {
    ordinary.hp = ordinary.hp * (1 + awayTowerHealth);
    ordinary.attack = ordinary.attack * (1 + awayTowerAttack);
  }
  return ordinary;
}

// What falling right now would pay in experience
function deathPayout() {
  // Experience is for the floors this run actually climbed: the ones swept through at
  // the start were climbed by an earlier run, which was paid for them already
  let payout = (floor - runStartFloor + 1) * experiencePerFloor * (1 + totalBonus("experience")) * multiplier("experience");
  if (isAway()) {
    payout = payout * (1 + awayTowerExperience);
  }
  return Math.round(payout);
}

function spawnMonster(isBoss) {
  let type = pickMonsterType(isBoss);

  // (the Second Weapon legend unlock: a boss is fought with the boss weapon)
  if (isBoss) {
    drawBossWeapon();
  }

  monsterName = type.name;
  monsterKind = type.name;
  monsterText = type.text;
  let growth = healthGrowth(floor);
  monsterMaxHp = Math.round(monsterHealth * growth * type.hp);
  monsterAttack = Math.round(monsterDamage * attackGrowth(floor) * type.attack);
  monsterArmor = Math.min(maxArmorShare, armorPerPoint * type.armor);

  // Ward works like armor. A monster can have its own, or it uses its tower's.
  // A tower with none written has no ward at all.
  let ward = 0;
  if (type.ward !== undefined) {
    ward = type.ward;
  } else if (towers[tower].ward !== undefined) {
    ward = towers[tower].ward;
  }
  monsterWard = Math.min(maxArmorShare, armorPerPoint * ward);
  monsterGold = type.gold;
  monsterPoison = traitOf(type, "poison");
  monsterRegen = traitOf(type, "regen");

  // What it is weak to and resists (a monster with neither just leaves them out)
  monsterWeak = type.weak || [];
  monsterResist = type.resist || [];
  monsterFlying = type.flying === true;
  monsterLunges = type.lunge === true || towers[tower].lunge === true || totalBonus("ambushed") > 0;

  // Monsters in another class's tower are stronger
  if (isAway()) {
    monsterMaxHp = Math.round(monsterMaxHp * (1 + awayTowerHealth));
    monsterAttack = Math.round(monsterAttack * (1 + awayTowerAttack));
  }

  monsterStunned = false;
  lastFightStacks = dotStacks;
  lastFightTurns = fightTurns;
  dotStacks = 0;
  fightTurns = 0;

  // (a week's modifier can make rare monsters more common: "rareMore")
  monsterIsRare = !isBoss && Math.random() < rareChance + totalBonus("rareMore");

  if (isBoss) {
    monsterMaxHp = Math.round(monsterMaxHp * bossHealth);
    monsterAttack = Math.round(monsterAttack * bossAttack);
    say("BOSS: " + monsterName + " blocks the way!");
  } else if (monsterIsRare) {
    monsterName = "Rare " + monsterName;
    monsterMaxHp = monsterMaxHp * 2;
    monsterAttack = Math.round(monsterAttack * 1.25);
    say("A " + monsterName + " appears!");
  } else if ("AEIOU".includes(monsterName[0])) {
    say("An " + monsterName + " appears.");
  } else {
    say("A " + monsterName + " appears.");
  }

  // How much an enraging monster's attack grows each turn (a tower's rule can make
  // every monster enrage: "enrageAll")
  monsterEnrageStep = Math.ceil(monsterAttack * (traitOf(type, "enrage") + totalBonus("enrageAll")));
  monsterHp = monsterMaxHp;

  // A monster uses its tower's picture unless it has one of its own
  monsterIcon = towers[tower].icon;
  if (type.icon !== undefined) {
    monsterIcon = type.icon;
  }

  // Pixel art, if this monster has been given some ("" means it has not)
  monsterArt = "";
  if (type.art !== undefined) {
    monsterArt = type.art;
  }

  startBossMechanics(type, isBoss);

  // Some classes get ready at the start of a fight
  if (currentClass().startFight !== undefined) {
    currentClass().startFight();
  }
}

function startEncounter() {
  roomCount = roomCount + 1;
  sheatheBossWeapon();

  if (room === roomsPerFloor) {
    if (floor % 5 === 0) {
      encounterType = "boss";
    } else {
      encounterType = "monster";
    }
  } else {
    let roll = Math.random();
    if (roll < 0.75) {
      encounterType = "monster";
    } else if (roll < 0.88) {
      encounterType = "rest";
    } else {
      encounterType = "chest";
    }
  }

  monsterIsRare = false;
  if (encounterType === "monster") {
    spawnMonster(false);
  } else if (encounterType === "boss") {
    spawnMonster(true);
  }
}

function nextRoom() {
  let newBest = false;
  room = room + 1;

  if (room > roomsPerFloor) {
    room = 1;
    floor = floor + 1;
    say("You climb to floor " + floor + ".");

    if (floor > bestFloor) {
      bestFloor = floor;
      newBest = true;
      runsSinceBest = 0;
    }

    if (cruising) {
      cruiseFloor = floor;
    }

    // Every floor reached for the first time since the last ascension pays fame
    if (floor > ascensionBest) {
      gainFame((floor - ascensionBest) * multiplier("fame"));
      if (ascensionBest < ascendFloorNeeded() && floor >= ascendFloorNeeded()) {
        announce("banner", "You can ascend", "This class has reached floor " + ascendFloorNeeded() + ". Ascend whenever you like (Ascension tab).");
      }
      ascensionBest = floor;
    }
    checkTowerProgress();
  }

  for (let milestone of allMilestones()) {
    if (newBest && floor === milestone.floor) {
      announceMilestone(milestone);
    }
  }

  // A new ability slot
  if (newBest && abilitySlotFloors.includes(floor) && classAbilities().length > abilitySlots.length) {
    announceAbilitySlot();
  }

  // A wall: from here on, every monster is stronger (see towerWalls in data.js)
  for (let wall of towerWalls) {
    if (newBest && floor === wall.floor) {
      announce("banner", "The tower grows stronger", "From floor " + wall.floor + " on, every monster has x" + wall.strength + " health and attack. Milestones, the blacksmith, ascending and other towers are the way through.");
    }
  }

  // Between two rooms is when the second climber takes the turns it is owed
  playCompanionIfDue();

  startEncounter();
}

// ----- What happens in a room -----
function die() {
  let payout = deathPayout();
  say("You fell on floor " + floor + ", earned " + big(payout) + " experience and banked " + big(gold) + " gold.");
  finishRun();

  deaths = deaths + 1;
  sheatheBossWeapon();
  let fellOn = floor;

  // Stuck at a wall? Say once where to go instead (see "Stuck at a wall" in data.js)
  runsSinceBest = runsSinceBest + 1;
  if (runsSinceBest === stuckAfterRuns && !isAway() && suggestedChallenge() !== null) {
    let idea = suggestedChallenge();
    announce("banner", "Try another tower", "Floor " + bestFloor + " is holding. " + towers[idea.tower].name + " suits your damage best, and floor " + idea.trophy.floor + " there wins " + idea.trophy.name + " (Towers tab).");
  }
  experience = experience + payout;
  experienceEarned = experienceEarned + payout;
  levelUpWhilePossible();
  bank = bank + gold;
  gold = 0;
  let restocked = restockPotions();
  if (restocked > 0) {
    say("You restock " + restocked + " healing " + (restocked === 1 ? "potion" : "potions") + " for " + big(restocked * potionCost()) + " gold.");
  }
  upgrades = {};
  // (relic slots, won in other towers, keep the first relics claimed this run)
  // (a legendary relic is never kept)
  ownedRelics = ownedRelics.filter(function (id) {
    return !allRelics().some(function (relic) { return relic.id === id && relic.legendary === true; });
  }).slice(0, totalBonus("relicSlots"));
  lastRunCounter = runCounter;
  runCounter = 0;   // (set again below, once the floor the run starts on is known)
  room = 1;

  // The next run starts in whichever tower was chosen, from its first floor
  if (nextTower !== tower) {
    tower = nextTower;
    say("You enter " + towers[tower].name + ".");
    runStartFloor = 1;
    cruiseFloor = 1;
  }

  // A run never starts on the floor the last one ended on, or above it, whatever the
  // sweep says (see floorsBackAfterFalling in data.js)
  floor = Math.max(1, Math.min(startFloor(), fellOn - floorsBackAfterFalling));
  runStartFloor = floor;
  cruiseFloor = floor;
  cruising = true;
  if (floor > 1) {
    say("The next run starts on floor " + floor + ": you sweep through floors 1 to " + (floor - 1) + ", which this class clears without slowing down.");
  }

  // The weapon and armor are kept. Only the kind of weapon may change, if another was picked.
  startRunGear();
  resetAbilitiesForRun();

  // Sweeping past bosses does not cost their boons: one for every boss passed, and a
  // relic for every relic boss
  let bossesPassed = Math.floor((floor - 1) / 5);
  for (let i = 0; i < bossesPassed * (1 + totalBonus("extraBoons")); i++) {
    gainBossUpgrade();
  }

  // The Quartermaster (a legend unlock) fills the belt for free
  potions = Math.max(potions, totalBonus("freePotions"));
  let relicBossesPassed = Math.floor((floor - 1) / relicBossEvery);
  for (let i = 0; i < relicBossesPassed; i++) {
    gainRelic();
  }

  // The floors swept through were won on an earlier run, and count as kills of this one
  runCounter = (floor - 1) * runKillsPerFloorSwept;

  // Some classes set something up at the start of a run
  if (currentClass().startRun !== undefined) {
    currentClass().startRun();
  }

  // Nothing carries over from the fight that killed you
  dotStacks = 0;
  fightTurns = 0;
  playerHp = playerMaxHp;
  startEncounter();
}

// Second Wind (a keystone, a trophy, a relic): a blow that would kill you does not, as
// many times a run as the class has of them
function survivesDeath() {
  if ((runStats.secondWinds || 0) < totalBonus("secondWind")) {
    runStats.secondWinds = (runStats.secondWinds || 0) + 1;
    playerHp = Math.round(playerMaxHp / 2);

    // Said aloud, and by name: it used to be one quiet line in the log, and players who
    // held a Phoenix Feather reported that it did nothing
    let left = totalBonus("secondWind") - runStats.secondWinds;
    let source = ownedRelics.includes("phoenixFeather") ? "Phoenix Feather" : "Second Wind";
    say(source + "! The blow that should have killed you does not: you stand on half your health" + (left > 0 ? " (" + left + " more this run)." : " (used up for this run)."));
    if (!catchingUp) {
      toast(source + ": you survive a killing blow", "good");
    }
    return true;
  }
  return false;
}

function victory() {
  // Back to the weapon the class climbs with, so that the boss's boon suits that one
  sheatheBossWeapon();

  let reward = floor * goldPerFloor;
  if (encounterType === "boss") {
    reward = reward * bossGold;
  }
  if (monsterIsRare) {
    reward = reward * rareGold;
  }
  // (a kind of monster the account knows well pays more: see "The bestiary" in data.js)
  reward = Math.round(reward * monsterGold * (1 + totalBonus("gold")) * multiplier("gold") * (1 + bestiaryGold * bestiaryRank(monsterKind)));
  gold = gold + reward;
  countKill(monsterKind);

  // (some keystones give this up: "noKillHeal")
  if (totalBonus("noKillHeal") === 0) {
    healSource = "After a kill";
    healPlayer(playerMaxHp * (healOnKill + fameAdd("healOnKill")));
    healSource = "";
  }

  runStats.kills = runStats.kills + 1;
  if (encounterType === "boss") {
    runStats.bosses = runStats.bosses + 1;
  }

  say("You defeat the " + monsterName + " and earn " + big(reward) + " gold.");

  if (fightTurns > cruiseTurns) {
    cruising = false;
  }
  // Every boss leaves a boon that suits the weapon being used. Relics are rarer: the boss
  // of every 25th floor carries one, and now and then a rare monster does (see data.js).
  if (monsterIsRare && chance(relicRareChance)) {
    gainRelic();
  }
  if (encounterType === "boss") {
    // (the Twice Blessed legend unlock adds a boon: "extraBoons")
    for (let i = 0; i < 1 + totalBonus("extraBoons"); i++) {
      gainBossUpgrade();
    }
    if (floor % relicBossEvery === 0) {
      gainRelic();
      maybeGainLegendaryRelic();
    }

    let earned = bossFameAt(floor);
    if (earned > 0) {
      gainFame(earned);
      say("Word of the boss's fall spreads: +" + big(earned) + " fame.");
    }
  }

  // Some classes gain something from every kill
  // Every kill of a run is counted (see "What builds up over a run" in data.js)
  runCounter = runCounter + 1;
  if (currentClass().whenKill !== undefined) {
    currentClass().whenKill();
  }
  nextRoom();
}

function monsterAttacks() {
  // Enraging monsters hit harder every turn
  monsterAttack = monsterAttack + monsterEnrageStep;

  // A full guard from an ability stops the attack before anything else happens
  if (abilityGuardFactor() === 0) {
    say("The " + monsterName + "'s attack is stopped by your guard.");
    return;
  }

  // The Sidestep technique: a chance to avoid any attack, whatever the class
  if (chance(Math.min(maxChance, totalBonus("sidestep")))) {
    say("You sidestep the attack!");
    return;
  }

  let avoided = currentClass().whenAttacked();

  // An avoided attack does nothing more. A reflected attack still lands, even if the
  // reflection killed the monster: otherwise enough reflect would make a class unkillable.
  if (avoided) {
    return;
  }

  // Your armor blocks a share of the hit (see armorShareBlocked). A venomous monster's
  // poison is the part of its attack that goes straight through: with poison 0.3, armor
  // only works on the other 70%.
  // (a boss's minion attacks beside it: see game/bosses.js)
  let attackNow = monsterAttack * bossAttackFactor();
  let damage = Math.max(1, Math.round(attackNow * (1 - monsterPoison) * (1 - armorShareBlocked())));
  damage = damage + Math.round(attackNow * monsterPoison);
  damage = Math.max(1, Math.round(damage / damageDivider() * multiplier("damageTaken") * abilityGuardFactor()));
  playerHp = playerHp - damage;
  noteTaken(damage);

  // The Brace technique: part of every attack that lands is thrown back
  if (totalBonus("brace") > 0) {
    magicHitMonster(monsterAttack * thrownBackStrength * totalBonus("brace"), "piercing");
  }

  if (playerHp <= 0 && !survivesDeath()) {
    die();
  } else if (potions > 0 && playerHp <= playerMaxHp * 0.3 && totalBonus("noPotions") === 0) {
    potions = potions - 1;
    healSource = "Potions";
    healPlayer(playerMaxHp * (potionHealing + totalBonus("potionPower")));
    healSource = "";
    say("You drink a healing potion!");
  }
}

function fightMonster() {
  fightTurns = fightTurns + 1;

  // A fight that drags on gets more dangerous, so that none can last forever
  if (fightTurns === longFightTurns) {
    say("The fight drags on. The " + monsterName + " grows more dangerous every turn!");
  }
  if (fightTurns >= longFightTurns) {
    monsterAttack = Math.ceil(monsterAttack * 1.1);
  }

  // If you die during this turn, a new run has already started and this fight is over.
  // Every place below that could kill you checks this number afterwards.
  let deathsBefore = deaths;

  bossStartOfTurn();

  // RULES OF A TOWER BEING CHALLENGED (see awayRule in towers.js)
  // "drain": you lose a share of your health every turn
  if (totalBonus("drain") > 0) {
    let drained = Math.max(1, Math.round(playerMaxHp * totalBonus("drain")));
    playerHp = playerHp - drained;
    noteTaken(drained);
    if (playerHp <= 0 && !survivesDeath()) {
      say("The tower drains the last of your strength.");
      die();
      return;
    }
  }
  // "hunted": you begin every fight already hurt
  if (fightTurns === 1 && totalBonus("hunted") > 0) {
    playerHp = Math.min(playerHp, Math.max(1, Math.round(playerMaxHp * (1 - totalBonus("hunted")))));
  }
  // "lostOpening": you do nothing on the first turn of a fight
  let losesTurn = fightTurns === 1 && totalBonus("lostOpening") > 0;
  if (losesTurn) {
    say("You grope for the enemy in the dark and lose your turn.");
  }

  // TECHNIQUES WON IN OTHER TOWERS (see the trophies in towers.js)
  // Prayer: a little healing every turn
  if (totalBonus("prayer") > 0) {
    healSource = "Prayer";
    healPlayer(playerMaxHp * totalBonus("prayer"));
    healSource = "";
  }
  // Keen Eye: an enemy that is not a boss misses its first turn
  let keenEye = fightTurns === 1 && encounterType !== "boss" && totalBonus("headStart") > 0;

  // Each time something hurts the monster, a boss's mechanics get to answer (bossTakes
  // in game/bosses.js): a shield puts health back, a minion takes the hit, an aura
  // hurts you for it.

  // A lunging monster strikes before you can, unless your class fights from range
  if (fightTurns === 1 && monsterLunges && currentClass().ranged !== true && !keenEye) {
    say("The " + monsterName + " lunges at you before you are ready!");
    let hpBeforeLunge = monsterHp;
    monsterAttacks();
    if (deaths !== deathsBefore) {
      return;
    }
    bossTakes(hpBeforeLunge);
    if (deaths !== deathsBefore) {
      return;
    }
    if (monsterHp <= 0) {
      victory();
      return;
    }
  }

  // Abilities come first, then the normal attack
  // (what they do is counted as theirs in the run summary: see game/summary.js)
  let hpBeforeAbilities = monsterHp;
  abilityPhase = true;
  if (!losesTurn) {
    useAbilities();
  }
  abilityPhase = false;
  noteAbilityDamage(hpBeforeAbilities - monsterHp);
  bossTakes(hpBeforeAbilities);
  if (deaths !== deathsBefore) {
    return;
  }
  if (monsterHp <= 0) {
    tickAbilityTimers();
    victory();
    return;
  }

  // What your normal turn does is measured, for abilities that deal "turns of your damage".
  // (Measured before a boss's mechanics answer, so a shield does not shrink your abilities.)
  let hpBeforeTurn = monsterHp;
  notedThisPhase = 0;
  damageNotCounted = 0;
  if (!losesTurn) {
    currentClass().attack();
  }
  let dealtThisTurn = hpBeforeTurn - monsterHp;
  noteRestOfTurn(dealtThisTurn);

  // Bloodthirst: part of what the turn dealt comes back as health (never more than
  // the enemy had left to lose)
  if (totalBonus("leech") > 0 && dealtThisTurn > 0) {
    healSource = "Bloodthirst";
    healPlayer(Math.min(dealtThisTurn, Math.max(0, hpBeforeTurn)) * totalBonus("leech"));
    healSource = "";
  }
  if (keenEye) {
    monsterStunned = true;
  }
  bossTakes(hpBeforeTurn);
  if (deaths !== deathsBefore) {
    return;
  }

  if (monsterHp > 0) {
    if (monsterRegen > 0) {
      monsterHp = Math.min(monsterMaxHp, monsterHp + Math.round(monsterMaxHp * monsterRegen));
    }

    if (monsterStunned) {
      // A stunned, frozen or out-of-reach enemy misses its turn
      monsterStunned = false;
    } else {
      let hpBeforeTheirs = monsterHp;
      monsterAttacks();
      if (deaths !== deathsBefore) {
        return;
      }
      dealtThisTurn = dealtThisTurn + Math.max(0, hpBeforeTheirs - monsterHp);
      bossTakes(hpBeforeTheirs);
      if (deaths !== deathsBefore) {
        return;
      }
    }
  }
  recordTurnDamage(dealtThisTurn - damageNotCounted);

  tickAbilityTimers();

  if (monsterHp <= 0) {
    victory();
  }
}

// One second of the game
function step() {
  noteCompanionTurn();
  ascensionSeconds = ascensionSeconds + 1;
  runStats.seconds = runStats.seconds + 1;

  if (encounterType === "monster" || encounterType === "boss") {
    fightMonster();
  } else if (encounterType === "rest") {
    healSource = "Rest rooms";
    healPlayer(playerMaxHp);
    healSource = "";
    say("You rest and recover all your health.");
    nextRoom();
  } else if (encounterType === "chest") {
    let found = Math.round(floor * goldPerFloor * chestGold * (1 + totalBonus("gold")) * multiplier("gold"));
    gold = gold + found;
    say("You open a chest and find " + big(found) + " gold.");
    nextRoom();
  }
}
