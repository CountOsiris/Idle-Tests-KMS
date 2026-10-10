// =====================================================================
//  tools/check.js - the pre-upload check. NOT part of the game.
//  Loaded after the game by tools/check.sh, with an old save already in place.
//  It checks that the save came through, then plays every class for a while and
//  checks the page and the content lists for mistakes. See tools/README.md.
// =====================================================================

clearInterval(timer);
window.confirm = function () { return true; };

let out = [];
let failures = 0;

function check(label, ok) {
  if (!ok) {
    failures++;
  }
  out.push((ok ? "ok    " : "FAIL  ") + label);
}

try {
  let before = window.savedBefore;

  // 1. The old save came through
  check("the save loaded without a problem", saveProblem === "");
  if (before !== undefined && before.classSaves[playerClass] !== undefined) {
    let old = before.classSaves[playerClass];
    check(playerClass + " kept its level (" + level + ", was " + old.level + ")", level >= old.level);
    check(playerClass + " kept its best floor (" + bestFloor + ", was " + old.bestFloor + ")", bestFloor >= old.bestFloor);
    check(playerClass + " kept its milestone perks", Object.keys(chosenPerks).length >= Object.keys(old.chosenPerks || {}).length);
  }
  check("fame is a number (" + big(fame) + ")", typeof fame === "number" && !isNaN(fame));

  // 1b. A class that needs legend marks cannot be played before they are spent
  let lockedClasses = Object.keys(classes).filter(function (name) { return classes[name].unlock !== undefined; });
  let lockProblems = [];
  for (let name of lockedClasses) {
    let playingBefore = playerClass;
    switchClass(name);
    if (playerClass !== playingBefore || !document.getElementById("class-" + name).hidden) {
      lockProblems.push(classes[name].name + " can be played without being opened");
    }
    if (!legendUnlocks.some(function (item) { return item.id === classes[name].unlock; })) {
      lockProblems.push(classes[name].name + " has no entry in legendUnlocks");
    }
    legendLevels[classes[name].unlock] = 1;
  }
  showClassButtons();
  check("locked classes (" + lockedClasses.length + ") stay locked until opened" + (lockProblems.length === 0 ? "" : ": " + lockProblems.join("; ")), lockedClasses.length === 1 && lockProblems.length === 0);

  // 2. Every class plays, and every tab draws
  for (let className in classes) {
    if (className !== playerClass) {
      switchClass(className);
    }
    for (let i = 0; i < 3000; i++) {
      step();
      if (i % 300 === 0) {
        updateScreen();
      }
    }
    // Every tab's page really shows (a tab with no rule in style.css stays blank)
    let tabsBefore = unlockedTabs;
    unlockedTabs = tabNames;
    for (let name of tabNames) {
      showTab(name);
      if (name !== "tower" && document.getElementById("page-" + name).offsetHeight === 0) {
        failures++;
        out.push("FAIL  the " + name + " tab opens to a blank page");
      }
    }
    unlockedTabs = tabsBefore;
    updateScreen();
    check(className + " plays (floor " + floor + ", attack " + big(playerAttack) + ", health " + big(playerMaxHp) + ")",
      playerAttack > 0 && playerMaxHp > 0 && !isNaN(playerHp) && skillPointsLeft() >= 0);
  }

  // 3. Every ability of every class works, with the weapon (or element) it is for
  for (let className in classes) {
    if (className !== playerClass) {
      switchClass(className);
    }
    let broken = [];
    for (let ability of classAbilities()) {
      try {
        if (ability.build !== undefined && currentClass().gearTypes[ability.build] !== undefined) {
          weapon = ability.build;
        }
        if (ability.build !== undefined && currentClass().stances !== undefined && currentClass().stances[ability.build] !== undefined) {
          stance = ability.build;
        }
        recalcStats();
        // Bosses live on every fifth floor
        let floorBefore = floor;
        floor = Math.max(5, Math.floor(floor / 5) * 5);
        encounterType = "boss";
        spawnMonster(true);
        floor = floorBefore;
        let before = monsterHp;
        let hpBefore = playerHp = Math.round(playerMaxHp / 2);
        ability.use();
        let didSomething = monsterHp < before || playerHp > hpBefore || guardTurns > 0 || boostTurns > 0 || monsterStunned || dotStacks > 0
          || (className === "assassin" && assassinAmbushReady);
        if (!didSomething || isNaN(monsterHp) || isNaN(playerHp)) {
          broken.push(ability.name + " did nothing");
        }
        resetAbilitiesForRun();
        dotStacks = 0;
        monsterStunned = false;
      } catch (error) {
        broken.push(ability.name + ": " + error.message);
      }
    }
    check(className + " abilities (" + classAbilities().length + "): " + (broken.length === 0 ? "all work" : broken.join("; ")), broken.length === 0);
    startEncounter();
  }

  // 3b. Boss mechanics: every one a boss lists exists, and each does what it says
  let unknownMechanics = [];
  for (let towerName in towers) {
    for (let boss of towers[towerName].bosses) {
      for (let id of boss.mechanics || []) {
        if (bossMechanics[id] === undefined || bossMechanicText(id) === "") {
          unknownMechanics.push(boss.name + ": " + id);
        }
      }
    }
  }
  check("boss mechanics in towers.js all exist" + (unknownMechanics.length === 0 ? "" : ": " + unknownMechanics.join(", ")), unknownMechanics.length === 0);

  // A made-up boss with 1000 health, to try each mechanic on its own
  function tryBoss(id) {
    startBossMechanics({}, false);
    bossRules = [id];
    monsterMaxHp = 1000;
    monsterHp = 1000;
    monsterAttack = 100;
    bossBaseAttack = 100;
    fightTurns = 3;
    recalcStats();
    playerHp = playerMaxHp;
  }

  tryBoss("shield");
  monsterHp = 400;
  bossTakes(600);
  let shieldWentUp = shieldUsed && monsterHp === 400;
  fightTurns = 4;
  monsterHp = 300;
  bossTakes(400);
  check("shield phase: goes up below half health, then blocks " + percent(bossMechanics.shield.blocks) + " (100 damage left " + monsterHp + " of 400)",
    shieldWentUp && monsterHp === 400 - Math.ceil(100 * (1 - bossMechanics.shield.blocks)));
  fightTurns = 4 + bossMechanics.shield.turns;
  monsterHp = 200;
  bossTakes(300);
  check("shield phase: ends after " + bossMechanics.shield.turns + " turns", monsterHp === 200);

  tryBoss("summons");
  monsterHp = 600;
  bossTakes(700);
  let minionCame = minionHp === 1000 * bossMechanics.summons.health;
  monsterHp = 100;
  bossTakes(600);
  check("summons: a minion comes at " + percent(bossMechanics.summons.at[0]) + " health and takes the next hit", minionCame && monsterHp === 600 && minionHp === 0);

  tryBoss("enrage");
  fightTurns = bossMechanics.enrage.afterTurns;
  bossStartOfTurn();
  let calmInTime = monsterAttack === 100;
  fightTurns = bossMechanics.enrage.afterTurns + 1;
  bossStartOfTurn();
  bossStartOfTurn();
  check("enrage timer: attack x" + bossMechanics.enrage.attack + " once, after turn " + bossMechanics.enrage.afterTurns, calmInTime && monsterAttack === 100 * bossMechanics.enrage.attack);

  tryBoss("reflect");
  playerMaxHp = 100000;
  playerHp = 100000;
  monsterHp = 500;
  bossTakes(1000);
  let costOfHalf = 100 * bossMechanics.reflect.attacks / 2 * (currentClass().ranged === true ? bossMechanics.reflect.rangedShare : 1)
    * (1 - armorShareBlocked()) / damageDivider() * multiplier("damageTaken");
  check("reflect aura: taking off half its health costs half of " + bossMechanics.reflect.attacks + " attacks, less your armor (" + (100000 - playerHp) + " of 100 attack)",
    100000 - playerHp === Math.max(1, Math.round(costOfHalf)) && 100000 - playerHp <= 100 * bossMechanics.reflect.attacks / 2);
  playerHp = 100000;
  monsterHp = -50000;
  bossTakes(500);
  check("reflect aura: a blow far bigger than its health only throws back what it had left", 100000 - playerHp === Math.max(1, Math.round(costOfHalf)));
  recalcStats();
  playerHp = playerMaxHp;

  tryBoss("armorUp");
  monsterArmor = 0.1;
  bossStartOfTurn();
  check("armor up: +" + percent(bossMechanics.armorUp.perTurn) + " armor a turn", Math.abs(monsterArmor - 0.1 - bossMechanics.armorUp.perTurn) < 0.0001);
  startEncounter();

  // 3c. The run summary: a run's damage adds up, and falling keeps it and shows the card
  runStats = freshRunStats();
  let deathsAtStart = deaths;
  for (let i = 0; i < 20000 && deaths === deathsAtStart; i++) {
    step();
  }
  let ended = lastRun;
  let summaryProblems = [];
  if (deaths === deathsAtStart || ended === null) {
    summaryProblems.push("no run ended in 20000 seconds");
  } else {
    if (tallyRanked(ended.damage).length === 0 || tallyRanked(ended.taken).length === 0) {
      summaryProblems.push("a finished run has no damage dealt or taken");
    }
    // (a run that starts too high can end in its first fight, with no kills at all)
    if (ended.killer === "" || !(ended.lastHit > 0) || typeof ended.kills !== "number") {
      summaryProblems.push("killer, last hit or kills missing");
    }
    for (let source in ended.damage) {
      if (isNaN(ended.damage[source]) || source === "undefined") {
        summaryProblems.push("bad damage source " + source);
      }
    }
    showTab("character");
    updateScreen();
    if (document.getElementById("last-run-card").hidden || document.getElementById("last-run").children.length < 8) {
      summaryProblems.push("the Last run card is not shown");
    }
    if (!logLines.some(function (line) { return line.startsWith("Run summary:"); }) || !logLines.some(function (line) { return line.startsWith("Killed by"); })) {
      summaryProblems.push("the two log lines are missing");
    }
  }
  check("run summary: " + (summaryProblems.length === 0 ? "killed by " + ended.killer + "; damage " + tallyText(ended.damage, 3) + "; healing " + tallyText(ended.healing, 2) : summaryProblems.join("; ")), summaryProblems.length === 0);

  // 3d. Things that were once wrong, so that they stay right
  let levelAway = level;
  closeAwayReport();
  playTimeAway(1800);
  playTimeAway(1800);
  let awayWords = document.getElementById("away-text").textContent;
  check("time away: two absences make one report of 1h 0m, with the experience really earned: " + awayWords,
    awayWords.includes("away for 1h 0m") && !awayWords.includes("earned -") && (level === levelAway || awayWords.includes("(level " + levelAway + " to " + level + ")")));
  closeAwayReport();

  check("under a minute is written in seconds (" + timeText(45) + ")", timeText(45) === "45s" && timeText(125) === "2m");

  // A venomous hit: with poison 0.3, armor works on the other 70% only
  startBossMechanics({}, false);
  guardTurns = 0;
  monsterAttack = 1000;
  monsterEnrageStep = 0;
  monsterPoison = 0.3;
  let dodgeless = currentClass().whenAttacked;
  let undivided = currentClass().damageDivider;
  currentClass().whenAttacked = function () { return false; };
  currentClass().damageDivider = undefined;
  playerMaxHp = 1000000;
  playerHp = 1000000;
  let blockedShare = armorShareBlocked();
  monsterAttacks();
  let venomTook = 1000000 - playerHp;
  let venomShould = (Math.round(700 * (1 - blockedShare)) + 300) * multiplier("damageTaken");
  currentClass().whenAttacked = dodgeless;
  currentClass().damageDivider = undivided;
  monsterPoison = 0;
  check("poison 0.3 is 30% OF the attack, not 30% on top (took " + venomTook + " of 1000, armor blocks " + percent(blockedShare) + ")", Math.abs(venomTook - venomShould) <= 1);
  recalcStats();
  playerHp = playerMaxHp;

  // A boss killer left to itself waits out a shield; pressing it does not
  let killer = classAbilities().find(function (ability) { return ability.bossKiller === true; });
  if (killer !== undefined) {
    let slotsBefore = abilitySlots;
    abilitySlots = [killer.id];
    resetAbilitiesForRun();
    encounterType = "boss";
    tryBoss("shield");
    shieldUsed = true;
    shieldFrom = 2;
    useAbilities();
    let waited = monsterHp === 1000;
    abilityPressed[killer.id] = true;
    useAbilities();
    check(killer.name + " waits while the boss is shielded, unless its button is pressed", waited && monsterHp < 1000);
    abilitySlots = slotsBefore;
    resetAbilitiesForRun();
  }
  startEncounter();

  // 3e. Keystones: every class has one per weapon at floor 50, and the shared ones do what they say
  let keystoneProblems = [];
  for (let className in classes) {
    let c = classes[className];
    let builds = c.stances !== undefined ? Object.keys(c.stances).map(function (id) { return c.stances[id].name; }) : Object.values(c.gearTypes);
    let at50 = c.milestones.find(function (m) { return m.floor === 51; }).perks.filter(function (p) { return p.keystone === true; });
    for (let build of builds) {
      if (!at50.some(function (p) { return p.text.startsWith(build + ":"); })) {
        keystoneProblems.push(c.name + " has no floor 51 keystone for the " + build);
      }
    }
  }
  check("keystones: one per weapon or element at floor 51" + (keystoneProblems.length === 0 ? "" : ": " + keystoneProblems.join("; ")), keystoneProblems.length === 0);

  let perksBefore = chosenPerks;
  let bestBefore = bestFloor;
  bestFloor = 101;
  function onlyPerk(floorOfIt, id) {
    chosenPerks = {};
    chosenPerks[floorOfIt] = id;
    ownedRelics = [];
    recalcStats();
    playerHp = playerMaxHp;
    runStats = freshRunStats();
    startBossMechanics({}, false);
    guardTurns = 0;
  }

  onlyPerk(76, "bloodPrice");
  let boostAtStart = runDamageBoost();
  encounterType = "monster";
  monsterIsRare = false;
  playerHp = 1;
  monsterHp = 0;
  victory();
  check("Blood Price: a kill heals nothing and adds " + percent(0.02) + " damage (boost x" + runDamageBoost() + ")", playerHp === 1 && boostAtStart === 1 && Math.abs(runDamageBoost() - 1.02) < 0.0001);
  runStats.kills = 500;
  check("Blood Price stops at +" + percent(keystoneRunLimit), runDamageBoost() === 1 + keystoneRunLimit);

  onlyPerk(76, "secondWind");
  let deathsThen = deaths;
  let avoiding = currentClass().whenAttacked;
  currentClass().whenAttacked = function () { return false; };
  monsterAttack = playerMaxHp * 1000;
  monsterPoison = 0;
  monsterEnrageStep = 0;
  monsterAttacks();
  let livedOnce = deaths === deathsThen && playerHp === Math.round(playerMaxHp / 2);
  monsterAttack = playerMaxHp * 1000;
  monsterAttacks();
  currentClass().whenAttacked = avoiding;
  check("Second Wind: the first killing blow of a run leaves you on half health, the second kills", livedOnce && deaths === deathsThen + 1);

  onlyPerk(101, "quickHands");
  let anyAbility = classAbilities().find(function (ability) { return fitsBuild(ability) && ability.bossKiller !== true; });
  if (anyAbility !== undefined) {
    let slotsThen = abilitySlots;
    abilitySlots = [anyAbility.id];
    resetAbilitiesForRun();
    abilityPressed[anyAbility.id] = true;
    encounterType = "monster";
    monsterMaxHp = 1000000;
    monsterHp = 1000000;
    useAbilities();
    check("Quick Hands: " + anyAbility.name + " waits " + abilityCooldowns[anyAbility.id] + " turns instead of " + anyAbility.cooldown, abilityCooldowns[anyAbility.id] === Math.ceil(anyAbility.cooldown / 2));
    abilitySlots = slotsThen;
    resetAbilitiesForRun();
  }

  onlyPerk(101, "ironSkin");
  let withIronSkin = armorShareBlocked();
  chosenPerks = {};
  let withoutIronSkin = armorShareBlocked();
  check("Iron Skin: armor blocks up to " + percent(maxArmorShare + 0.2) + " (" + percent(withIronSkin) + " here, against " + percent(withoutIronSkin) + ")",
    Math.abs(withIronSkin / withoutIronSkin - (maxArmorShare + 0.2) / maxArmorShare) < 0.0001);

  chosenPerks = perksBefore;
  bestFloor = bestBefore;
  recalcStats();
  playerHp = playerMaxHp;
  runStats = freshRunStats();
  startEncounter();

  // 3f. Challenging a tower: every tower has a rule and six tiers, and the rules bite
  let towerProblems = [];
  let trophyIds = {};
  for (let towerName in towers) {
    let place = towers[towerName];
    if (place.awayRule === undefined || !place.awayRule.name || !place.awayRule.text || Object.keys(place.awayRule.bonus).length === 0) {
      towerProblems.push(place.name + " has no rule for challengers");
    }
    if (place.trophies.map(function (t) { return t.floor; }).join(",") !== "10,20,30,50,75,100") {
      towerProblems.push(place.name + " does not have tiers at 10, 20, 30, 50, 75 and 100");
    }
    for (let trophy of place.trophies) {
      if (trophyIds[trophy.id] !== undefined) {
        towerProblems.push("trophy id " + trophy.id + " is used twice");
      }
      trophyIds[trophy.id] = true;
    }
  }
  check("towers: a rule and six tiers each" + (towerProblems.length === 0 ? "" : ": " + towerProblems.join("; ")), towerProblems.length === 0);

  let homeTower = tower;
  let awayOne = Object.keys(towers).find(function (name) { return name !== playerClass && towers[name].awayRule.bonus.drain !== undefined; })
    || Object.keys(towers).find(function (name) { return name !== playerClass && towers[name].awayRule.bonus.noPotions !== undefined; });
  tower = playerClass;
  let ruleAtHome = totalBonus("drain") + totalBonus("noPotions") + totalBonus("enrageAll") + totalBonus("lostOpening") + totalBonus("ambushed");
  tower = awayOne;
  let ruleWord = Object.keys(towers[awayOne].awayRule.bonus)[0];
  check("a tower's rule counts for a challenger (" + towers[awayOne].awayRule.name + ") and never at home", ruleAtHome === 0 && totalBonus(ruleWord) === towers[awayOne].awayRule.bonus[ruleWord]);
  if (ruleWord === "drain") {
    recalcStats();
    playerHp = playerMaxHp;
    floor = 1;
    room = 1;
    encounterType = "monster";
    spawnMonster(false);
    monsterAttack = 0;
    monsterStunned = true;
    monsterMaxHp = 1e12;
    monsterHp = 1e12;
    let hpThen = playerHp;
    let realAttack = currentClass().attack;
    currentClass().attack = function () {};
    fightMonster();
    currentClass().attack = realAttack;
    check("the drain rule takes " + percent(towers[awayOne].awayRule.bonus.drain) + " of your health a turn", hpThen - playerHp === Math.round(playerMaxHp * towers[awayOne].awayRule.bonus.drain));
  }
  tower = homeTower;
  recalcStats();
  playerHp = playerMaxHp;
  showTab("travel");
  updateScreen();
  check("the Towers tab lists the tiers", document.getElementById("towers").textContent.includes("Rule for challengers") && document.getElementById("towers").textContent.includes("floor 100"));
  startEncounter();

  // 3f2. Stuck at a wall: the suggestion is a tower with a trophy left, and the best match
  let idea = suggestedChallenge();
  let ideaProblems = [];
  if (idea === null || idea.tower === playerClass || trophies.includes(idea.trophy.id)) {
    ideaProblems.push("no suggestion, or one that cannot be won");
  } else {
    let ideaScore = towerMatch(idea.tower).weak - towerMatch(idea.tower).resisted;
    for (let towerName in towers) {
      let other = towerMatch(towerName);
      if (towerName !== playerClass && nextTrophy(towerName) !== null && other.weak - other.resisted > ideaScore + 0.02) {
        ideaProblems.push(towers[towerName].name + " suits the class better than the suggestion");
      }
    }
    let runsBefore = runsSinceBest;
    let tabsBefore = unlockedTabs;
    unlockedTabs = unlockedTabs.concat(["travel"]);
    runsSinceBest = stuckAfterRuns;
    let stuckGoal = nextGoals().some(function (goal) { return goal.includes(towers[idea.tower].name); });
    runsSinceBest = 0;
    let calmGoal = nextGoals().some(function (goal) { return goal.includes("is holding"); });
    if (!stuckGoal || calmGoal) {
      ideaProblems.push("the goal line does not follow being stuck");
    }
    runsSinceBest = runsBefore;
    unlockedTabs = tabsBefore;
    if (document.getElementById("tower-suggestion").hidden || !document.getElementById("tower-suggestion").textContent.includes(towers[idea.tower].name)) {
      ideaProblems.push("the Towers tab does not show it");
    }
  }
  check("suggested challenge: " + (ideaProblems.length === 0 ? towers[idea.tower].name + ", for " + idea.trophy.name : ideaProblems.join("; ")), ideaProblems.length === 0);

  // 3f3. Relics: every shared one does something, and they come from the right places
  let relicProblems = [];
  let knownWords = ["secondWind", "brace", "leech", "bossSlayer", "opener", "finisher", "quickHands", "exploit", "prayer", "sidestep", "killStreak"];
  for (let relic of relics) {
    for (let word in relic.bonus) {
      if (!knownWords.includes(word)) {
        relicProblems.push(relic.name + " uses a word that is not a relic's: " + word);
      }
    }
  }
  ownedRelics = [];
  floor = 20;
  room = roomsPerFloor;
  encounterType = "boss";
  monsterIsRare = false;
  spawnMonster(true);
  monsterHp = 0;
  victory();
  let afterPlainBoss = ownedRelics.length;
  floor = 25;
  room = roomsPerFloor;
  encounterType = "boss";
  spawnMonster(true);
  monsterHp = 0;
  victory();
  if (afterPlainBoss !== 0 || ownedRelics.length !== 1) {
    relicProblems.push("a floor 20 boss gave " + afterPlainBoss + " relics and a floor 25 boss " + (ownedRelics.length - afterPlainBoss));
  }
  ownedRelics = ["phoenixFeather", "phoenixFeather"];
  recalcStats();
  runStats = freshRunStats();
  let deathsWas = deaths;
  let evading = currentClass().whenAttacked;
  currentClass().whenAttacked = function () { return false; };
  for (let i = 0; i < 2; i++) {
    monsterAttack = playerMaxHp * 1000;
    monsterPoison = 0;
    guardTurns = 0;
    monsterAttacks();
  }
  if (deaths !== deathsWas) {
    relicProblems.push("two Phoenix Feathers did not save two lives");
  }
  monsterAttack = playerMaxHp * 1000;
  monsterAttacks();
  currentClass().whenAttacked = evading;
  if (deaths !== deathsWas + 1) {
    relicProblems.push("a third killing blow did not kill");
  }
  check("relics: " + relics.length + " shared ones, from 25th-floor bosses only" + (relicProblems.length === 0 ? "" : ": " + relicProblems.join("; ")), relicProblems.length === 0);
  ownedRelics = [];
  recalcStats();
  playerHp = playerMaxHp;
  runStats = freshRunStats();
  startEncounter();

  // 3g. The rewards ladder: with every trophy won, the abilities work and the techniques bite
  let trophiesBefore = trophies;
  trophies = Object.keys(trophyIds);
  recalcStats();
  playerHp = playerMaxHp;
  let ladderProblems = [];
  for (let towerName in towers) {
    let kinds = towers[towerName].trophies.map(function (t) {
      return t.ability !== undefined ? "ability" : (t.bonus !== undefined && t.bonus.relicSlots !== undefined ? "slot" : "other");
    });
    if (kinds[3] !== "ability" || kinds[4] !== "slot") {
      ladderProblems.push(towers[towerName].name + " does not teach an ability at 50 and give a relic slot at 75");
    }
  }
  let taught = classAbilities().filter(function (a) { return a.id.startsWith("tower"); });
  for (let ability of taught) {
    floor = 10;
    encounterType = "boss";
    spawnMonster(true);
    let hpWas = monsterHp;
    playerHp = Math.round(playerMaxHp / 2);
    let mineWas = playerHp;
    ability.use();
    if (!(monsterHp < hpWas || playerHp > mineWas || guardTurns > 0 || boostTurns > 0 || monsterStunned)) {
      ladderProblems.push(ability.name + " did nothing");
    }
    resetAbilitiesForRun();
    monsterStunned = false;
  }
  check("the ladder: " + taught.length + " abilities taught by trophies" + (ladderProblems.length === 0 ? ", all work" : ": " + ladderProblems.join("; ")), taught.length === Object.keys(towers).length && ladderProblems.length === 0);

  ownedRelics = ["bloodstone", "prism", "rosary", "smokeVial", "bloodstone", "bloodstone", "bloodstone", "bloodstone"];
  let slotsWon = totalBonus("relicSlots");
  die();
  check("relic slots: " + slotsWon + " won, " + ownedRelics.length + " relics kept through a fall", slotsWon === Object.keys(towers).length && ownedRelics.length === slotsWon);

  encounterType = "monster";
  spawnMonster(false);
  monsterAttack = 100;
  monsterMaxHp = 1000000;
  monsterHp = 1000000;
  let dodging = currentClass().whenAttacked;
  currentClass().whenAttacked = function () { return false; };
  let landed = 0;
  let thrownBack = 0;
  for (let i = 0; i < 400; i++) {
    playerHp = playerMaxHp;
    let before = monsterHp;
    let mine = playerHp;
    monsterAttack = 100;
    monsterAttacks();
    if (playerHp < mine) {
      landed = landed + 1;
      thrownBack = thrownBack + (before - monsterHp);
    }
  }
  currentClass().whenAttacked = dodging;
  check("techniques: Sidestep avoids some attacks (" + (400 - landed) + " of 400) and Brace throws the rest back", landed < 400 && landed > 320 && thrownBack > 0);

  trophies = trophiesBefore;
  ownedRelics = [];
  recalcStats();
  playerHp = playerMaxHp;
  runStats = freshRunStats();
  startEncounter();

  // 3h. Legend: becoming one pays the right marks, starts the class over, and keeps what it should
  let fameThen = fame;
  let marksThen = legendMarks;
  trophies = ["raidersShield"];
  bestFloor = 144;
  chosenPerks = { 5: currentClass().milestones[0].perks[0].id };
  level = 50;
  becomeLegend();
  check("legend: floor 144 pays 12 marks and starts the class over (best floor " + bestFloor + ", level " + level + ")",
    legendMarks === marksThen + 12 && bestFloor === 1 && floor === 1 && level === 1 && Object.keys(chosenPerks).length === 0 && legends >= 1);
  check("legend: fame and trophies are kept", fame === fameThen && trophies.length === 1);
  becomeLegend();
  check("legend: a class below floor " + legendFloor + " cannot become one", legendMarks === marksThen + 12);

  let slotsAtStart = openAbilitySlots();
  legendMarks = 1000;
  for (let item of legendUnlocks) {
    while (!legendUnlockIsMaxed(item)) {
      buyLegendUnlock(item);
    }
  }
  ascensionBest = ascendFirstFloor;
  ascend();
  check("legend unlocks: an ability slot from floor 1, " + (level - 1) + " starting levels, " + potions + " free potions, " + totalBonus("relicSlots") + " relic slots",
    openAbilitySlots() === slotsAtStart + 1 && level === 1 + totalBonus("startLevels") && totalBonus("startLevels") === 30 && potions === 2 && totalBonus("relicSlots") === 3);
  floor = 5;
  room = roomsPerFloor;
  encounterType = "boss";
  monsterIsRare = false;
  spawnMonster(true);
  let boonsThen = upgradesHeld();
  monsterHp = 0;
  victory();
  check("legend unlocks: a boss leaves two boons", upgradesHeld() === boonsThen + 2);
  showTab("legend");
  updateScreen();
  check("the Legend tab opens and lists what marks buy", document.body.dataset.tab === "legend" && document.getElementById("legend-unlocks").children.length === legendUnlocks.length);
  legendMarks = marksThen;
  legendLevels = {};
  for (let name of lockedClasses) {
    legendLevels[classes[name].unlock] = 1;
  }
  trophies = [];
  recalcStats();
  startEncounter();

  // A newer tab taking over stops this one from saving
  let markBefore = localStorage.getItem(saveName);
  window.dispatchEvent(new StorageEvent("storage", { key: tabMarkName, newValue: "a newer tab" }));
  level = level + 1;
  saveGame();
  check("a newer tab stops this one: notice shown and nothing saved", otherTabOpen && !document.getElementById("other-tab").hidden && localStorage.getItem(saveName) === markBefore);
  level = level - 1;
  otherTabOpen = false;
  document.getElementById("other-tab").hidden = true;

  // 4. The content lists: no name used twice in a class, no old wording
  for (let className in classes) {
    let c = classes[className];
    let names = {};
    let lists = [c.skills, c.upgrades, c.relics, c.breakthroughs || [], c.abilities || []];
    for (let milestone of c.milestones) {
      lists.push(milestone.perks);
    }
    let problems = [];
    for (let list of lists) {
      for (let thing of list) {
        if (names[thing.name] !== undefined) {
          problems.push("\"" + thing.name + "\" is used twice");
        }
        names[thing.name] = true;
        if (thing.text === undefined || thing.text === "") {
          problems.push("\"" + thing.name + "\" has no description");
        }
      }
    }
    check(className + " content: " + (problems.length === 0 ? "no problems" : problems.join("; ")), problems.length === 0);
  }

  // 5. The Updates window: its newest entry is for this version, and it opens
  check("updates.js starts with this version (" + gameVersion + ")", gameUpdates[0].version === gameVersion);
  let updateProblems = [];
  for (let update of gameUpdates) {
    if (!update.title || !Array.isArray(update.changes) || update.changes.length === 0) {
      updateProblems.push(update.version + " has no title or no changes");
    }
  }
  openUpdates();
  if (document.getElementById("updates").hidden || document.getElementById("updates-list").children.length !== gameUpdates.length * 2) {
    updateProblems.push("the window did not show every entry");
  }
  closeUpdates();
  check("the Updates window: " + (updateProblems.length === 0 ? "no problems" : updateProblems.join("; ")), updateProblems.length === 0);

  // 6. Saving gives the current version
  saveGame();
  let again = JSON.parse(localStorage.getItem(saveName));
  check("saved as version " + again.version + " (the game is at " + saveVersion + ")", again.version === saveVersion);
} catch (error) {
  failures++;
  out.push("FAIL  the check itself broke: " + error.stack);
}

if (window.pageErrors !== undefined) {
  failures++;
  out.push("FAIL  errors on the page: " + window.pageErrors);
}
out.push(failures === 0 ? "ALL GOOD" : failures + " PROBLEM(S)");

let pre = document.createElement("pre");
pre.id = "test-out";
pre.textContent = out.join("\n");
document.body.appendChild(pre);
