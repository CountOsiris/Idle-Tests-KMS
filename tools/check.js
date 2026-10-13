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

  // 1-tips. A save from before tips existed (every save in tools/saves/ is one) must not be
  // buried in them: what it has reached is marked seen without a word, and the one tip
  // on the page is the one that says where the Guide is. (The game has shown the page
  // once by now, which is the one checkTips this needs.)
  if (before !== undefined && !Array.isArray(before.seenTips)) {
    let stillWaiting = tips.filter(function (tip) { return tip.id !== "guide" && tip.when() && !seenTips.includes(tip.id); });
    check("tips: an old save is shown one tip, the Guide's (showing: " + (shownTip === null ? "none" : shownTip.id) + "), and the " + seenTips.length + " it has reached are seen already"
      + (stillWaiting.length === 0 ? "" : "; STILL WAITING: " + stillWaiting.map(function (tip) { return tip.id; }).join(", ")),
      shownTip !== null && shownTip.id === "guide" && !seenTips.includes("guide") && seenTips.includes("start") && stillWaiting.length === 0
      && !document.getElementById("tip").hidden && document.getElementById("tip-title").textContent === shownTip.title && !tipsAreNew);
  }

  // 1a. The week's modifier: each one is well formed, they take turns, and they apply.
  // The rest of the check then runs with none, so that its numbers do not depend on the date.
  let weekProblems = [];
  let weekIds = {};
  for (let i = 0; i < weeklyModifiers.length; i++) {
    let week = weeklyModifiers[i];
    weekOverride = i;
    if (!week.id || !week.name || !week.text || weekIds[week.id] !== undefined || (week.bonus === undefined && week.multiply === undefined)) {
      weekProblems.push("entry " + i + " is not well formed");
    }
    weekIds[week.id] = true;
    if (weeklyModifier() !== week) {
      weekProblems.push(week.name + " is not the modifier of week " + i);
    }
    for (let word in week.bonus || {}) {
      if (weeklyBonus(word) !== week.bonus[word] || totalBonus(word) < week.bonus[word]) {
        weekProblems.push(week.name + ": " + word + " is not added");
      }
    }
    for (let word in week.multiply || {}) {
      weekOverride = "none";
      let without = multiplier(word);
      weekOverride = i;
      if (Math.abs(multiplier(word) / without - week.multiply[word]) > 0.0001) {
        weekProblems.push(week.name + ": " + word + " is not multiplied");
      }
    }
    recalcStats();
    updateScreen();
    if (!document.getElementById("week-note").textContent.includes(week.name)) {
      weekProblems.push(week.name + " is not shown above the fight");
    }
  }
  weekOverride = weeklyModifiers.length;
  if (weeklyModifier() !== weeklyModifiers[0]) {
    weekProblems.push("the list does not come round again");
  }
  weekOverride = null;
  let today = weeklyModifier();
  check("the week's modifier: " + weeklyModifiers.length + " take turns (today: " + (today === null ? "none" : today.name + ", changes in " + weekEndsIn()) + ")" + (weekProblems.length === 0 ? "" : ": " + weekProblems.join("; ")), weekProblems.length === 0 && today !== null);
  weekOverride = "none";
  recalcStats();

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

  // A probe on every death for the rest of the check: every run must start at least
  // floorsBackAfterFalling floors below the one the last run ended on (players reported
  // runs that started higher, and later that falling looked like coming back on the spot)
  let higherStarts = [];
  let realDie = die;
  die = function () {
    let fellOn = floor;
    realDie();
    if (floor > Math.max(1, fellOn - floorsBackAfterFalling)) {
      higherStarts.push(playerClass + " fell on " + fellOn + " and started on " + floor);
    }
  };

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
  playerMaxHp = 100;
  playerHp = 100;
  monsterHp = 0;
  bossTakes(1000);
  check("reflect aura: one blow never throws back more than " + percent(bossMechanics.reflect.mostOfHealth) + " of your health (took " + (100 - playerHp) + " of 100)", 100 - playerHp === Math.round(100 * bossMechanics.reflect.mostOfHealth));
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
  let boostAtStart = runDamageBoost() - fervourBonus();
  encounterType = "monster";
  monsterIsRare = false;
  playerHp = 1;
  monsterHp = 0;
  victory();
  check("Blood Price: a kill heals nothing and adds " + percent(0.02) + " damage (boost x" + runDamageBoost() + ")", playerHp === 1 && boostAtStart === 1 && Math.abs(runDamageBoost() - fervourBonus() - 1.02) < 0.0001);
  runStats.kills = 500;
  check("Blood Price stops at +" + percent(keystoneRunLimit), Math.abs(runDamageBoost() - fervourBonus() - 1 - keystoneRunLimit) < 0.0001);

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
  for (let towerName in towers) {
    towersOpen[towerName] = true;
  }
  updateScreen();
  check("the Towers tab lists the tiers, once a tower's trophies are opened", document.getElementById("towers").textContent.includes("Rule for challengers") && document.getElementById("towers").textContent.includes("floor 100"));
  towersOpen = {};
  updateScreen();
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

  // 3f4. Named weapons: only the one wielded gives its power, and it names the gear
  let trophiesWere = trophies;
  let allNamed = [];
  for (let towerName in towers) {
    let last = towers[towerName].trophies[5];
    if (last.weapon === undefined) {
      towerProblems.push(towers[towerName].name + " has no named weapon at floor 100");
    }
    allNamed.push(last);
  }
  trophies = allNamed.map(function (t) { return t.id; });
  namedWeapon = "";
  let noneWielded = totalBonus("bossSlayer") + totalBonus("opener") + totalBonus("armorLimit") + totalBonus("finisher");
  wieldNamedWeapon("throneOfSkulls");
  let oneWielded = totalBonus("bossSlayer") > 0 && totalBonus("opener") === 0;
  let namedGear = gearName(specialSlot(), 0).includes("Warlord's Wrath");
  showTab("town");
  updateScreen();
  check("named weapons: " + allNamed.length + " in the game, none works until wielded, one works at a time, and it names the gear (" + gearName(specialSlot(), 12) + ")",
    allNamed.every(function (t) { return t.weapon !== undefined; }) && noneWielded === 0 && oneWielded && namedGear && !document.getElementById("named-picker").hidden && document.getElementById("named-buttons").children.length === allNamed.length + 1);
  namedWeapon = "";
  trophies = trophiesWere;
  recalcStats();

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

  // 3g2. The table of what is kept and lost says what the game really does
  let tableProblems = [];
  let said = {};
  for (let line of resetTable) {
    said[line.what] = line;
  }
  bestFloor = 144;
  level = 40;
  experience = 10;
  bank = 500;
  gold = 77;
  forgeLevels = { weapon: 3, armor: 3 };
  townLevels = { tactician: 1, whetstone: 2 };
  skillLevels = {};
  skillLevels[currentClass().skills[0].id] = 3;
  chosenPerks = { 5: currentClass().milestones[0].perks[0].id };
  upgrades = {};
  upgrades[currentClass().upgrades[0].id] = 2;
  abilityUses = { anything: 150 };
  realDie();
  let afterFall = { "Boons": upgradesHeld() === 0 ? "lost" : "kept", "Gold in the bank": bank >= 577 ? "kept" : "lost", "Level and experience": level >= 40 ? "kept" : "lost",
    "The blacksmith's work": forgeLevels.weapon === 3 ? "kept" : "lost", "Perks and keystones picked": Object.keys(chosenPerks).length === 1 ? "kept" : "lost" };
  ascensionBest = ascendFirstFloor;
  ascend();
  let afterAscend = { "Gold in the bank": bank === 0 ? "lost" : "kept", "Level and experience": level < 40 ? "lost" : "kept", "The blacksmith's work": forgeLevels.weapon === 0 ? "lost" : "kept",
    "Town upgrades with levels": townLevels.whetstone === undefined ? "lost" : "kept", "Town helpers": townLevels.tactician === 1 ? "kept" : "lost",
    "Best floors, and milestones reached": bestFloor === 144 ? "kept" : "lost", "Perks and keystones picked": Object.keys(chosenPerks).length === 1 ? "kept" : "lost", "Ability ranks": abilityUses.anything === 150 ? "kept" : "lost" };
  let fameHeld = fame;
  becomeLegend();
  let afterLegend = { "Best floors, and milestones reached": bestFloor === 1 ? "lost" : "kept", "Perks and keystones picked": Object.keys(chosenPerks).length === 0 ? "lost" : "kept",
    "Town helpers": townLevels.tactician === 1 ? "kept" : "lost", "Ability ranks": abilityUses.anything === 150 ? "kept" : "lost", "Fame and fame upgrades": fame === fameHeld ? "kept" : "lost" };
  for (let pair of [["fall", afterFall], ["ascend", afterAscend], ["legend", afterLegend]]) {
    for (let what in pair[1]) {
      if (said[what] === undefined || !said[what][pair[0]].startsWith(pair[1][what])) {
        tableProblems.push(what + " is " + pair[1][what] + " on " + pair[0] + ", but the table says " + (said[what] === undefined ? "nothing" : said[what][pair[0]]));
      }
    }
  }
  showTab("ascension");
  let tableCard = document.getElementById("reset-table").closest(".card");
  let tableFolded = tableCard.classList.contains("folded");
  tableCard.classList.remove("folded");
  if (document.getElementById("reset-table").rows.length !== resetTable.length + 1 || document.getElementById("reset-table").offsetHeight === 0) {
    tableProblems.push("the table is not on the Ascension tab");
  }
  tableCard.classList.toggle("folded", tableFolded);
  check("the kept-and-lost table agrees with what falling, ascending and becoming a legend really do" + (tableProblems.length === 0 ? "" : ": " + tableProblems.join("; ")), tableProblems.length === 0);
  townLevels = {};
  abilityUses = {};
  legendMarks = 0;
  legends = 0;
  recalcStats();
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
  // The boss weapon: drawn for a boss, put away after, and never what gets saved
  let kinds = Object.keys(buildKinds());
  if (kinds.length > 1) {
    let main = kindInHand();
    let other = kinds.find(function (kind) { return kind !== main; });
    chooseBossWeapon(other);
    floor = 5;
    room = roomsPerFloor;
    startEncounter();
    let drawn = encounterType === "boss" && kindInHand() === other;
    let saved = packClass();
    let savedMain = (currentClass().stances !== undefined ? saved.stance : saved.weapon) === main;
    monsterHp = 0;
    victory();
    check("boss weapon: the " + buildKinds()[other] + " is drawn for a boss, the " + buildKinds()[main] + " is what is saved, and it comes back after", drawn && savedMain && kindInHand() === main && swappedFrom === "");
    chooseBossWeapon("");
  }
  check("the Legend tab opens and lists what marks buy", document.body.dataset.tab === "legend" && document.getElementById("legend-unlocks").children.length === legendUnlocks.length);
  legendMarks = marksThen;
  legendLevels = {};
  for (let name of lockedClasses) {
    legendLevels[classes[name].unlock] = 1;
  }
  trophies = [];
  recalcStats();
  startEncounter();

  // 3i. Ability ranks and double speed
  check("ability ranks come at 100, 300 and 700 uses", ranksFromUses(99) === 0 && ranksFromUses(100) === 1 && ranksFromUses(299) === 1 && ranksFromUses(300) === 2 && ranksFromUses(700) === 3);
  let ranked = classAbilities().find(function (ability) { return fitsBuild(ability); });
  if (ranked !== undefined) {
    let usesBefore = abilityUses;
    let slotsWere = abilitySlots;
    abilityUses = {};
    abilityUses[ranked.id] = 99;
    abilitySlots = [ranked.id];
    resetAbilitiesForRun();
    encounterType = "monster";
    monsterMaxHp = 1e12;
    monsterHp = 1e12;
    recentDamage = 1000;
    abilityPressed[ranked.id] = true;
    useAbilities();
    abilityInUse = ranked;
    let hpWas = monsterHp;
    abilityTurns(1);
    abilityInUse = null;
    check(ranked.name + " reaches rank 1 on its 100th use, and then does 10% more", abilityRank(ranked.id) === 1 && hpWas - monsterHp === 1100);
    abilityUses = usesBefore;
    abilitySlots = slotsWere;
    resetAbilitiesForRun();
    recentDamage = 0;
  }
  // Double speed: the clock itself ticks twice a second, and every tick is a turn that is shown
  let wasFast = watchFast;
  showTab("tower");
  setWatchFast(true);
  clearInterval(timer);
  let fastLength = turnLength();
  let chipShown = document.body.classList.contains("fast") && document.getElementById("speed-chip").offsetHeight > 0;
  let shownTurns = 0;
  let realAnimatedStep = animatedStep;
  animatedStep = function () { shownTurns = shownTurns + 1; };
  lastTick = Date.now() - fastLength;
  tick();
  let fastShown = shownTurns;
  setWatchFast(false);
  clearInterval(timer);
  shownTurns = 0;
  lastTick = Date.now() - 1000;
  tick();
  animatedStep = realAnimatedStep;
  let slowLength = turnLength();
  check("double speed: a turn takes " + fastLength + " thousandths of a second with it on and " + slowLength + " with it off, each tick shows one turn, and \"x2 speed\" is on the page" + (document.hidden ? " (the test page is hidden, so it stays at normal speed)" : ""),
    slowLength === 1000 && fastShown === 1 && shownTurns === 1 && !document.body.classList.contains("fast")
    && (document.hidden ? fastLength === 1000 : (fastLength === 1000 / watchSpeedFast && chipShown)));
  watchFast = wasFast;
  saveSettings();
  showSettings();
  document.body.classList.remove("fast");
  startEncounter();

  // 3i2. The Void Tome's tear is a share of the enemy's health that nothing makes bigger
  if (classes.warlock !== undefined) {
    let playing = playerClass;
    switchClass("warlock");
    let tomeWas = weapon;
    let fameWas = fameLevels;
    weapon = "void";
    fameLevels = { might: 60 };
    ascensions = 60;
    recalcStats();
    floor = 300;
    encounterType = "monster";
    spawnMonster(false);
    monsterWard = 0;
    let hpWas = monsterHp;
    let attackWas = playerAttack;
    playerAttack = 0;
    warlockCast(1);
    let tornShare = (hpWas - monsterHp) / monsterMaxHp;
    playerAttack = attackWas;
    check("Void Tome: one spell tears away " + percent(voidShare()) + " of the enemy's health, however much fame the account has (" + percent(tornShare) + " at Might 60)", Math.abs(tornShare - voidShare()) < 0.01 && tornShare <= maxVoidShare);
    weapon = tomeWas;
    fameLevels = fameWas;
    ascensions = 0;
    floor = 1;
    recalcStats();
    startEncounter();
    switchClass(playing);
  }

  // 3i3. Nothing piles up without limit: relic copies, cooldown cuts, armor
  ownedRelics = [];
  for (let i = 0; i < 400; i++) {
    gainRelic();
  }
  let mostHeld = 0;
  for (let relic of allRelics()) {
    mostHeld = Math.max(mostHeld, ownedRelics.filter(function (id) { return id === relic.id; }).length);
  }
  let anyAbilityNow = classAbilities().find(function (ability) { return fitsBuild(ability); });
  abilitySlots = [anyAbilityNow.id];
  resetAbilitiesForRun();
  abilityPressed[anyAbilityNow.id] = true;
  encounterType = "monster";
  monsterMaxHp = 1e12;
  monsterHp = 1e12;
  useAbilities();
  forgeLevels = { weapon: 0, armor: 400 };
  recalcStats();
  check("limits: at most " + relicMostCopies + " of one relic (" + ownedRelics.length + " held after 400 finds), cooldowns never cut by more than " + percent(mostCooldownCut) + " (" + anyAbilityNow.name + " " + abilityCooldowns[anyAbilityNow.id] + " of " + anyAbilityNow.cooldown + "), armor never past " + percent(mostArmorShare) + " (" + percent(armorShareBlocked()) + ")",
    mostHeld === relicMostCopies && abilityCooldowns[anyAbilityNow.id] >= Math.ceil(anyAbilityNow.cooldown * (1 - mostCooldownCut)) && armorShareBlocked() <= mostArmorShare);
  ownedRelics = [];
  abilitySlots = [];
  forgeLevels = { weapon: 0, armor: 0 };
  resetAbilitiesForRun();
  recalcStats();
  startEncounter();

  // 3i4. Context numbers: the two bars under the fight, and falls to the next level
  floor = 1;
  recalcStats();
  recentDamage = ordinaryMonster().hp / 4;
  updateScreen();
  let damageWords = document.getElementById("pressure-damage").textContent;
  let dangerWords = document.getElementById("pressure-danger").textContent;
  recentDamage = ordinaryMonster().hp * 3;
  updateScreen();
  let oneTurn = document.getElementById("pressure-damage").textContent;
  check("pressure: a quarter of a monster's health a turn reads as 4 turns a kill, and three times its health as one turn (" + damageWords + " / " + dangerWords + ")",
    damageWords.includes("25%") && damageWords.includes("4 turns") && oneTurn.includes("one turn") && dangerWords.includes("%") && document.getElementById("pressure-damage-bar").style.width === "100%");
  recentDamage = 0;
  experience = 0;
  let fallWords = document.getElementById("level-falls").textContent;
  check("the level card says what a fall pays (" + fallWords + ")", fallWords.includes(big(deathPayout())) && fallWords.includes("level " + (level + 1)));

  // 3i5. Time away: the limit is shown, and the Night Watch raises it
  let limitBefore = awayLimit();
  townLevels.nightWatch = 1;
  showTab("save");
  updateScreen();
  let limitWords = document.getElementById("away-limit-note").textContent;
  closeAwayReport();
  playTimeAway(20 * 3600);
  let longAway = document.getElementById("away-text").textContent;
  closeAwayReport();
  delete townLevels.nightWatch;
  check("time away: " + timeText(limitBefore) + " count, and " + timeText(limitBefore + 8 * 3600) + " with the Night Watch (" + limitWords + ")",
    limitBefore === maxAwaySeconds && limitWords.includes("16h 0m") && longAway.includes("only 16h 0m counts"));
  recalcStats();
  startEncounter();

  // 3i6. Potions: the price follows the best floor, and the belt can keep itself full
  let bestWas = ascensionBest;
  ascensionBest = 9;
  let cheap = potionCost();
  ascensionBest = 25;
  let dear = potionCost();
  potions = 0;
  gold = 0;
  bank = dear * 3 + 5;
  keepPotions = true;
  realDie();
  let stocked = potions;
  let bankLeft = bank;
  keepPotions = false;
  potions = 0;
  bank = dear * 3;
  realDie();
  check("potions: " + cheap + " gold below floor 10 and " + dear + " at floor 25; a full bank buys " + stocked + " on a fall with the box ticked and " + potions + " without",
    cheap === potionPrice && dear === potionPrice * 3 && stocked === 3 && bankLeft === 5 && potions === 0);
  ascensionBest = bestWas;
  bank = 0;
  startEncounter();

  // 3i7. The strip a phone shows follows the fight
  floor = 7;
  room = 1;
  encounterType = "monster";
  spawnMonster(false);
  playerHp = Math.round(playerMaxHp / 2);
  monsterHp = Math.round(monsterMaxHp / 4);
  updateScreen();
  check("the phone strip shows the floor and both health bars (" + document.getElementById("mini-floor").textContent + ", " + document.getElementById("mini-monster").textContent + ")",
    document.getElementById("mini-floor").textContent === "Floor 7" && document.getElementById("mini-monster").textContent === monsterName
    && Math.abs(parseFloat(document.getElementById("mini-player-bar").style.width) - 50) < 1 && Math.abs(parseFloat(document.getElementById("mini-monster-bar").style.width) - 25) < 1);
  playerHp = playerMaxHp;

  // 3i8. The bestiary: kills are counted by kind, ranks pay gold, and the card shows them
  let bestiaryWas = bestiary;
  bestiary = {};
  floor = 3;
  room = 1;
  encounterType = "monster";
  spawnMonster(false);
  let kind = monsterKind;
  monsterIsRare = true;
  monsterName = "Rare " + kind;
  let goldWas = gold;
  monsterHp = 0;
  victory();
  let plainGold = gold - goldWas;
  let countedOnce = killsOf(kind) === 1 && bestiary["Rare " + kind] === undefined;
  bestiary[kind] = bestiaryRanks[1];
  let rankNow = bestiaryRank(kind);
  showTab("inventory");
  updateScreen();
  let cells = document.querySelectorAll("#bestiary .bestiary-cell").length;
  let unknownCells = document.querySelectorAll("#bestiary .bestiary-cell.unknown").length;
  let totalKinds = 0;
  for (let towerName in towers) {
    totalKinds = totalKinds + towers[towerName].monsters.length + towers[towerName].bosses.length;
  }
  check("bestiary: a rare " + kind + " counts as a " + kind + ", " + bestiaryRanks[1] + " killed is rank " + rankNow + " (+" + percent(bestiaryGold * rankNow) + " gold), and the card shows " + cells + " kinds with " + unknownCells + " still unknown",
    countedOnce && plainGold > 0 && rankNow === 2 && cells === totalKinds && unknownCells === totalKinds - 1 && document.getElementById("bestiary-count").textContent === "1 / " + totalKinds);
  bestiary = bestiaryWas;
  startEncounter();

  // 3i9. Past attackEaseFloor a monster's attack grows more slowly than its health
  let sameEarly = attackGrowth(longFights.fromFloor) === towerGrowth(longFights.fromFloor) && healthGrowth(longFights.fromFloor) === towerGrowth(longFights.fromFloor)
    && Math.abs(healthGrowth(longFights.fullFloor) / towerGrowth(longFights.fullFloor) - longFights.health) < 0.001 && Math.abs(attackGrowth(longFights.fullFloor) / towerGrowth(longFights.fullFloor) - longFights.attack) < 0.001;
  let easedAt100 = healthGrowth(100) / attackGrowth(100);
  let easedAt200 = healthGrowth(200) / attackGrowth(200);
  let floorBeforeEase = floor;
  floor = 100;
  room = 1;
  encounterType = "monster";
  spawnMonster(false);
  let hitToHealth = monsterAttack / monsterMaxHp * (monsterIsRare ? 2 / 1.25 : 1);
  let ordinaryHit = monsterDamage / monsterHealth;
  check("monster curve: as it was up to floor " + longFights.fromFloor + "; by floor " + longFights.fullFloor + " x" + longFights.health + " health and x" + longFights.attack + " attack; then attack grows more slowly (a hit is " + easedAt100.toFixed(1) + " times smaller against health on floor 100, " + easedAt200.toFixed(0) + " times on floor 200)",
    sameEarly && easedAt100 > 5 && easedAt200 > easedAt100 && attackGrowth(101) > attackGrowth(100) && hitToHealth < ordinaryHit / 3);
  floor = floorBeforeEase;
  startEncounter();

  // 3i10. A class with stances picks its element on the Blacksmith tab, as others pick a weapon
  let classBeforeElements = playerClass;
  classSaves[playerClass] = packClass();
  playerClass = "elementalist";
  unpackClass(classSaves.elementalist);
  buildClassScreen();
  recalcStats();
  showTab("town");
  updateScreen();
  let elementButtons = document.querySelectorAll("#weapon-buttons button").length;
  document.getElementById("weapon-earth").click();
  let pickedEarth = stance === "earth" && !document.getElementById("weapon-picker").hidden
    && document.getElementById("weapon-picker-note").textContent.includes(classes.elementalist.stances.earth.text);
  document.getElementById("weapon-fire").click();
  check("the Elementalist picks its element on the Blacksmith tab: " + elementButtons + " buttons, and pressing Earth then Fire changes it at once", elementButtons === 4 && pickedEarth && stance === "fire");
  classSaves.elementalist = packClass();
  playerClass = classBeforeElements;
  unpackClass(classSaves[playerClass]);
  buildClassScreen();
  recalcStats();
  startEncounter();

  // 3i11. What builds up over a run: every class counts its kills the same way, the
  // Warlock's souls included, and nothing a class owns makes them worth more
  let countWas = runCounter;
  let fervours = [];
  let uneven = [];
  let classBeforeFervour = playerClass;
  classSaves[playerClass] = packClass();
  for (let className in classes) {
    playerClass = className;
    unpackClass(classSaves[className]);
    recalcStats();
    runCounter = 700;
    fervours.push(classes[className].fervour);
    if (classes[className].fervour === undefined || Math.abs(fervourBonus() - 3 * runDamagePer100) > 0.0001) {
      uneven.push(className);
    }
  }
  playerClass = classBeforeFervour;
  unpackClass(classSaves[playerClass]);
  recalcStats();
  runCounter = 0;
  floor = 3;
  room = 1;
  encounterType = "monster";
  spawnMonster(false);
  monsterHp = 0;
  victory();
  let countedKill = runCounter === 1;
  runCounter = 100;
  let fullAt100 = Math.abs(fervourBonus() - runDamagePer100) < 0.0001;
  check("the kills of a run: one kill counts 1, 100 give +" + percent(runDamagePer100) + " damage, 700 count as 300 for every class alike (" + fervours.join(", ") + ")",
    countedKill && fullAt100 && uneven.length === 0);
  runCounter = countWas;
  startEncounter();

  // 3i12. A wounding hit adds a third of the stack limit, and never passes the limit
  let stacksWas = dotStacks;
  dotStacks = 0;
  addHitStacks(9);
  let afterOne = dotStacks;
  addHitStacks(9);
  addHitStacks(9);
  addHitStacks(9);
  let afterFour = dotStacks;
  dotStacks = 0;
  addHitStacks(2);
  check("bleed and poison: with a limit of 9 one hit adds " + afterOne + " stacks and four hits stop at " + afterFour + "; with a limit of 2 a hit adds " + dotStacks, afterOne === 4 && afterFour === 9 && dotStacks === 1);
  dotStacks = stacksWas;

  // 3i13. Tidy: a heading folds its card and the choice is saved; explanations wait
  // behind "?"; a tower's row is short until its trophies are asked for
  showTab("travel");
  updateScreen();
  let towersCard = document.getElementById("towers").closest(".card");
  let towersHelp = towersCard.querySelector(".card-help");
  let helpHidden = towersHelp !== null && towersHelp.offsetHeight === 0;
  towersCard.querySelector(".help-button").click();
  let helpShown = towersHelp !== null && towersHelp.offsetHeight > 0;
  towersCard.querySelector(".help-button").click();
  let heightOpen = towersCard.offsetHeight;
  towersCard.querySelector("h2").click();
  let foldedNow = towersCard.offsetHeight < heightOpen / 3 && JSON.parse(localStorage.getItem(settingsName)).foldedCards.includes(towersCard.dataset.card);
  towersCard.querySelector("h2").click();
  let unfolded = towersCard.offsetHeight === heightOpen && !JSON.parse(localStorage.getItem(settingsName)).foldedCards.includes(towersCard.dataset.card);
  let awayTower = Object.keys(towers).find(function (name) { return name !== playerClass; });
  let shortRow = document.getElementById("tower-" + awayTower + "-note").textContent.split(String.fromCharCode(10)).length;
  document.getElementById("tower-" + awayTower + "-more").click();
  let longRow = document.getElementById("tower-" + awayTower + "-note").textContent.split(String.fromCharCode(10)).length;
  document.getElementById("tower-" + awayTower + "-more").click();
  check("tidy: an explanation is hidden until \"?\" is pressed, a heading folds its card and that is saved, and a tower's row is " + shortRow + " lines until \"All trophies\" makes it " + longRow,
    helpHidden && helpShown && foldedNow && unfolded && shortRow === 2 && longRow >= 2 + towers[awayTower].trophies.length
    && document.getElementById("stage").closest(".card").dataset.card === undefined);

  // 3i14. The fight keeps one height through monsters, bosses, rest rooms and chests, so
  // the page does not move under the pointer
  showTab("skills");
  let fightCard = document.getElementById("stage").closest(".card");
  let fightHeights = {};
  let roomKinds = {};
  let boonsWere = upgrades;
  for (let i = 0; i < 400; i++) {
    step();
    upgrades = boonsWere;
    updateScreen();
    fightHeights[fightCard.offsetHeight] = true;
    roomKinds[encounterType] = true;
  }
  check("the fight box kept one height (" + Object.keys(fightHeights).join(", ") + " pixels) through 400 turns of " + Object.keys(roomKinds).join(", ") + " rooms, and the page does not adjust its own scroll",
    Object.keys(fightHeights).length === 1 && fightCard.offsetHeight > 150 && Object.keys(roomKinds).length >= 2 && getComputedStyle(document.documentElement).overflowAnchor === "none");

  // 3i15. Phoenix Feather saves the hero once a run and says so; every build has one
  // legendary relic, which only a fought relic boss can give, and which is lost on a fall
  let relicsWere = ownedRelics;
  let windsWere = runStats.secondWinds;
  let chosenWere = chosenPerks;
  chosenPerks = {};
  ownedRelics = ["phoenixFeather"];
  runStats.secondWinds = 0;
  recalcStats();
  let windsAllowed = totalBonus("secondWind");
  playerHp = 0;
  let saved = survivesDeath();
  let savedOnce = saved && playerHp === Math.round(playerMaxHp / 2) && logLines[0].includes("Phoenix Feather");
  for (let i = 1; i < windsAllowed; i++) {
    survivesDeath();
  }
  playerHp = 0;
  let notAgain = !survivesDeath();
  check("Phoenix Feather: a killing blow leaves you on half health, the log names it, and it stops working once it is used up", savedOnce && notAgain);

  let withoutOne = [];
  for (let className in classes) {
    let c = classes[className];
    for (let kind in (c.stances || c.gearTypes)) {
      if (c.relics.filter(function (relic) { return relic.legendary === true && relic.build === kind; }).length !== 1) {
        withoutOne.push(className + "/" + kind);
      }
    }
  }
  ownedRelics = [];
  runStats.secondWinds = 0;
  recalcStats();
  let plainHealth = playerMaxHp;
  for (let i = 0; i < 50; i++) {
    gainRelic();
  }
  let noneByChance = !ownedRelics.some(function (id) { return allRelics().find(function (relic) { return relic.id === id; }).legendary === true; });
  ownedRelics = [];
  recalcStats();
  let realChance = chance;
  chance = function () { return true; };
  maybeGainLegendaryRelic();
  maybeGainLegendaryRelic();
  chance = realChance;
  let legend = legendaryRelic();
  let heldOnce = legend !== undefined && ownedRelics.length === 1 && ownedRelics[0] === legend.id && Math.abs(playerMaxHp - plainHealth * legend.multiply.health) <= 2;
  check("legendary relics: every weapon and element has one (" + (withoutOne.length === 0 ? "all" : "missing: " + withoutOne.join(", ")) + "), an ordinary relic drop never gives one, a relic boss gives " + (legend === undefined ? "none" : legend.name) + " once, and it multiplies health by " + (legend === undefined ? "?" : legend.multiply.health),
    withoutOne.length === 0 && noneByChance && heldOnce);
  ownedRelics = relicsWere;
  runStats.secondWinds = windsWere;
  chosenPerks = chosenWere;
  recalcStats();
  playerHp = playerMaxHp;
  closeMoment();

  // 3i16. The layout: the fight is on screen on every tab, above the page; the tabs are a
  // bar along the bottom; and the Fight tab shows the whole fight with the boons and the log
  let layoutProblems = [];
  let bar = document.querySelector(".tabs");
  for (let name of tabNames) {
    if (!tabIsOpen(name)) {
      continue;
    }
    showTab(name);
    updateScreen();
    let fight = document.querySelector(".fight-card").getBoundingClientRect();
    if (fight.height < 100) {
      layoutProblems.push("no fight on the " + name + " tab");
    }
    let page = document.getElementById("page-" + name);
    if (page !== null && (page.offsetHeight === 0 || page.getBoundingClientRect().top < fight.bottom - 1)) {
      layoutProblems.push("the " + name + " page is not under the fight");
    }
    let button = document.getElementById("tab-" + name);
    if (button.offsetHeight === 0 || !button.dataset.icon) {
      layoutProblems.push("the " + name + " tab has no button with a picture");
    }
  }
  if (getComputedStyle(bar).position !== "fixed" || Math.abs(bar.getBoundingClientRect().bottom - window.innerHeight) > 1) {
    layoutProblems.push("the tabs are not a bar along the bottom");
  }
  showTab("skills");
  let shortFight = document.querySelector(".fight-card").offsetHeight;
  let logHidden = document.getElementById("log").offsetHeight === 0 && document.getElementById("goals").offsetHeight === 0;
  showTab("tower");
  updateScreen();
  let wholeFight = document.querySelector(".fight-card").offsetHeight;
  let logShown = document.getElementById("log").offsetHeight > 0 && document.getElementById("pressure").offsetHeight > 0;
  if (!(logHidden && logShown && wholeFight > shortFight + 100)) {
    layoutProblems.push("the Fight tab does not open the whole fight (" + shortFight + " pixels short, " + wholeFight + " whole)");
  }
  check("layout: the fight is on top of every tab's page, the tabs are a bar along the bottom, and the Fight tab opens the whole fight" + (layoutProblems.length === 0 ? "" : ": " + layoutProblems.join("; ")), layoutProblems.length === 0);
  showTab("character");

  // 3i17. The Second Climber: locked without the legend unlock; with it, another class
  // takes its turns out of sight and the class being played is left exactly as it was
  let marksWere = legendLevels;
  let companionWas = companionClass;
  let other = Object.keys(classes).find(function (name) { return name !== playerClass && classIsOpen(name); });
  legendLevels = {};
  companionClass = other;
  companionOwed = 0;
  step();
  let lockedOwesNothing = !companionReady() && companionOwed === 0 && document.getElementById("companion-line").hidden;

  legendLevels = Object.assign({}, marksWere, { secondClimber: 1 });
  updateScreen();
  let lineShown = !document.getElementById("companion-line").hidden && document.getElementById("companion-pick").value === other;
  // (the turns are taken between two rooms, so no fight is under way: see playCompanionIfDue)
  let sorted = function (value) {
    return JSON.stringify(value, function (key, inner) {
      if (inner !== null && typeof inner === "object" && !Array.isArray(inner)) {
        let ordered = {};
        for (let name of Object.keys(inner).sort()) { ordered[name] = inner[name]; }
        return ordered;
      }
      return inner;
    });
  };
  classSaves[playerClass] = packClass();
  unpackClass(classSaves[playerClass]);
  let mineBefore = sorted(packClass());
  let turnsBefore = (classSaves[other] || { runStats: { seconds: 0 } }).runStats.seconds || 0;
  let logBefore = logLines.length + "/" + logLines[0];
  let deathsBeforeClimb = deaths;
  let momentsBefore = moments.length;
  playCompanion(300);
  let untouched = sorted(packClass()) === mineBefore && playerClass !== other
    && logLines.length + "/" + logLines[0] === logBefore && deaths === deathsBeforeClimb && moments.length === momentsBefore && !backgroundClimb && !catchingUp;
  let climbed = classSaves[other].runStats !== undefined && (classSaves[other].deaths === undefined) && classSaves[other].floor >= 1
    && JSON.stringify(classSaves[other]) !== "{}" && (classSaves[other].experience > 0 || classSaves[other].level > 1 || classSaves[other].floor > 1 || classSaves[other].gold > 0 || classSaves[other].bank > 0);

  // A minute of turns is owed, and paid between two rooms
  companionOwed = 0;
  for (let i = 0; i < companionBatch; i++) {
    noteCompanionTurn();
  }
  let owedAMinute = companionOwed === companionBatch;
  let levelBefore = JSON.stringify(classSaves[other]);
  playCompanionIfDue();
  let paid = companionOwed === 0 && JSON.stringify(classSaves[other]) !== levelBefore;

  // Playing the class that climbs beside you swaps the two
  let first = playerClass;
  switchClass(other);
  let swapped = playerClass === other && companionClass === first;
  switchClass(first);
  let swappedBack = playerClass === first && companionClass === other;
  saveGame();
  let savedChoice = JSON.parse(localStorage.getItem(saveName)).companionClass === other;
  showTab("skills");
  updateScreen();
  let stripShown = document.getElementById("class-" + other).offsetHeight > 0 && document.getElementById("class-" + other).classList.contains("climbing")
    && document.getElementById("class-" + other).getBoundingClientRect().top < document.querySelector(".fight-card").getBoundingClientRect().top;
  check("the Second Climber: nothing happens without the unlock; with it the " + classes[other].name + " takes 300 turns out of sight and the " + currentClass().name + " is left exactly as it was; a minute of turns is owed and paid between rooms; playing it swaps the two; the heroes are above the fight on every tab",
    lockedOwesNothing && lineShown && untouched && climbed && owedAMinute && paid && swapped && swappedBack && savedChoice && stripShown);
  legendLevels = marksWere;
  companionClass = companionWas;
  companionOwed = 0;
  logLines = [];
  startEncounter();
  updateScreen();

  // 3i18. The clock: an ordinary fight drags on after fightClock.turns turns and a boss
  // after fightClock.bossTurns, and from then the monster's attack grows every turn
  let attackAfter = function (isBoss, turns) {
    floor = 20;
    room = isBoss ? roomsPerFloor : 1;
    encounterType = isBoss ? "boss" : "monster";
    spawnMonster(isBoss);
    monsterMaxHp = 1e15;
    monsterHp = 1e15;
    monsterEnrageStep = 0;
    let start = monsterAttack;
    let realAttack = currentClass().attack;
    let realAttacks = monsterAttacks;
    let realBossTurn = bossStartOfTurn;
    currentClass().attack = function () {};
    monsterAttacks = function () {};
    bossStartOfTurn = function () {};
    let slots = abilitySlots;
    abilitySlots = [];
    for (let i = 0; i < turns; i++) {
      fightMonster();
    }
    abilitySlots = slots;
    currentClass().attack = realAttack;
    monsterAttacks = realAttacks;
    bossStartOfTurn = realBossTurn;
    return monsterAttack / start;
  };
  let calmOrdinary = attackAfter(false, fightClock.turns - 1);
  let draggingOrdinary = attackAfter(false, fightClock.turns + 1);
  let calmBoss = attackAfter(true, fightClock.bossTurns - 1);
  let draggingBoss = attackAfter(true, fightClock.bossTurns + 1);
  check("the clock: an ordinary monster's attack is unchanged after " + (fightClock.turns - 1) + " turns and x" + draggingOrdinary.toFixed(2) + " after " + (fightClock.turns + 1) + "; a boss's is unchanged after " + (fightClock.bossTurns - 1) + " and x" + draggingBoss.toFixed(2) + " after " + (fightClock.bossTurns + 1),
    calmOrdinary === 1 && calmBoss === 1 && draggingOrdinary > 1.5 && draggingBoss > 1.5 && fightClock.bossTurns > fightClock.turns);
  floor = 3;
  room = 1;
  startEncounter();

  // 3j. Starting floors, and the Tactician's list
  cruiseFloor = 40;
  runStartFloor = 1;
  floor = 12;
  realDie();
  check("a run starts at least " + floorsBackAfterFalling + " floors below where the last one fell (fell on 12 with a sweep of 40 remembered: started on " + floor + "; " + (deaths - 0) + " deaths watched, " + higherStarts.length + " started too high)", floor === 12 - floorsBackAfterFalling && higherStarts.length === 0);

  townLevels.tactician = 1;
  let otherBoon = currentClass().upgrades.find(function (u) { return u.build !== undefined && !fitsBuild(u); });
  if (otherBoon !== undefined) {
    favouriteUpgrade = otherBoon.id;
    showTab("town");
    updateScreen();
    let rowNote = document.getElementById("favourite-upgrade-" + otherBoon.id + "-note").textContent;
    let topNote = document.getElementById("favourite-upgrade-note").textContent;
    check("the Tactician's list says what each boon does, and that " + otherBoon.name + " is not given with this weapon",
      rowNote.includes(otherBoon.text) && rowNote.includes("NOT GIVEN RIGHT NOW") && topNote.includes(otherBoon.name) && !document.getElementById("favourite-upgrade").hidden);

    // On the Town tab it is one line with a Change button; the list is a window of its own
    let lineNow = document.getElementById("favourite-upgrade-now").textContent;
    let windowShut = document.getElementById("favourite-window").hidden;
    document.querySelector("#favourite-upgrade button").click();
    let windowOpen = !document.getElementById("favourite-window").hidden && document.getElementById("favourite-upgrade-rows").offsetHeight > 0;
    let fitting = currentClass().upgrades.find(function (u) { return fitsBuild(u); });
    document.getElementById("favourite-upgrade-" + fitting.id).click();
    check("the favourite boon is one line in town (" + document.getElementById("favourite-upgrade-name").textContent + "), and its list opens in a window that closes when one is picked",
      windowShut && windowOpen && document.getElementById("favourite-window").hidden && favouriteUpgrade === fitting.id && lineNow.includes(otherBoon.name)
      && document.getElementById("favourite-upgrade-name").textContent === fitting.name && document.getElementById("favourite-upgrade").offsetHeight < 140);
    favouriteUpgrade = "";
  }
  delete townLevels.tactician;
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

  // 4b. No milestone perk is simply a worse copy of another on the same milestone: every
  // number it gives, the other gives as well, as big or bigger. Such a perk is never the
  // right pick, for a weapon the other one works with. (Soul Eater once gave attack x1.5
  // and health x1.3 beside Arcane Supremacy's attack x1.4.)
  let scopeOf = function (c, perk) {
    let kinds = c.stances !== undefined ? c.stances : c.gearTypes;
    for (let kind in kinds) {
      let name = c.stances !== undefined ? c.stances[kind].name : c.gearTypes[kind];
      if (perk.text.startsWith(name + ":")) {
        return kind;
      }
    }
    return "";
  };
  let numbersOf = function (perk) {
    let numbers = {};
    for (let key in (perk.bonus || {})) { numbers["+" + key] = perk.bonus[key]; }
    for (let key in (perk.multiply || {})) { numbers["x" + key] = key === "damageTaken" ? 1 / perk.multiply[key] : perk.multiply[key]; }
    return numbers;
  };
  let worseCopies = [];
  for (let className in classes) {
    let c = classes[className];
    for (let milestone of c.milestones.concat(trialMilestones)) {
      if (milestone.keystones === true) {
        continue;
      }
      for (let lesser of milestone.perks) {
        for (let better of milestone.perks) {
          if (lesser === better) {
            continue;
          }
          let lesserScope = scopeOf(c, lesser);
          let betterScope = scopeOf(c, better);
          if (lesserScope !== "" && betterScope !== "" && lesserScope !== betterScope) {
            continue;
          }
          let mine = numbersOf(lesser);
          let theirs = numbersOf(better);
          let covered = Object.keys(mine).length > 0 && Object.keys(mine).every(function (key) { return theirs[key] !== undefined && theirs[key] >= mine[key]; });
          let more = Object.keys(theirs).some(function (key) { return mine[key] === undefined || theirs[key] > mine[key]; });
          if (covered && more) {
            worseCopies.push(c.name + " floor " + milestone.floor + ": " + lesser.name + " is a worse " + better.name);
          }
        }
      }
    }
  }
  worseCopies = worseCopies.filter(function (line, index) { return worseCopies.indexOf(line) === index; });
  check("milestone perks: " + (worseCopies.length === 0 ? "none is a worse copy of another on its milestone" : worseCopies.join("; ")), worseCopies.length === 0);

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
  seenVersion = "";
  showSettings();
  showTab("save");
  let settingsButton = document.getElementById("updates-btn-settings");
  if (settingsButton.offsetHeight === 0 || !settingsButton.classList.contains("chosen") || document.getElementById("settings-version").textContent !== gameVersion) {
    updateProblems.push("the Settings tab has no lit Updates button with the version beside it");
  }
  settingsButton.click();
  if (document.getElementById("updates").hidden || settingsButton.classList.contains("chosen")) {
    updateProblems.push("the Settings button did not open the window");
  }
  let closeX = document.querySelector("#updates .window-close");
  if (closeX === null || closeX.offsetHeight === 0 || closeX.getBoundingClientRect().top > 200) {
    updateProblems.push("the Updates window has no X at its top");
  } else {
    closeX.click();
    if (!document.getElementById("updates").hidden) {
      updateProblems.push("the X did not close the Updates window");
    }
  }
  closeUpdates();
  openUpdates();
  if (document.getElementById("updates").hidden || document.getElementById("updates-list").children.length !== gameUpdates.length * 2) {
    updateProblems.push("the window did not show every entry");
  }
  closeUpdates();
  check("the Updates window: " + (updateProblems.length === 0 ? "no problems" : updateProblems.join("; ")), updateProblems.length === 0);

  // 5b. Tips (game/tips.js). First the list itself.
  let tipProblems = [];
  let tipIds = {};
  for (let tip of tips) {
    if (!tip.id || tipIds[tip.id] !== undefined) {
      tipProblems.push("the id \"" + tip.id + "\" is missing or used twice");
    }
    tipIds[tip.id] = true;
    if (!tip.title || !tip.text || typeof tip.when !== "function" || !tabNames.includes(tip.tab)) {
      tipProblems.push(tip.id + " has no title, no text, no \"when\" or a tab that does not exist");
      continue;
    }
    let sentences = tip.text.split(/[.!?]+(?:\s|$)/).filter(function (part) { return part.trim() !== ""; }).length;
    let words = tip.text.trim().split(/\s+/).length;
    if (sentences > 2 || words > 30) {
      tipProblems.push(tip.id + " is too long (" + sentences + " sentences, " + words + " words)");
    }
  }
  if (tips[tips.length - 1].id !== "guide") {
    tipProblems.push("\"guide\" is not the last tip");
  }

  // A tab that opens as you go no longer announces itself: its tip is its explanation
  let tipTabsWere = unlockedTabs;
  for (let unlock of tabUnlocks) {
    unlockedTabs = [];
    let trueBefore = tips.filter(function (tip) { return tip.tab === unlock.tab && tip.when(); });
    unlockedTabs = [unlock.tab];
    let turnsTrue = tips.some(function (tip) { return tip.tab === unlock.tab && tip.when() && !trueBefore.includes(tip); });
    if (!turnsTrue) {
      tipProblems.push("the " + unlock.tab + " tab has no tip that shows when it opens");
    }
    if (unlock.title !== undefined || unlock.text !== undefined) {
      tipProblems.push("the " + unlock.tab + " tab still has an announcement of its own");
    }
  }
  unlockedTabs = tipTabsWere;
  check("tips: " + tips.length + " in the list, each with its own id, a title, at most 2 sentences and 30 words, and one for each of the " + tabUnlocks.length + " tabs that open"
    + (tipProblems.length === 0 ? "" : ": " + tipProblems.join("; ")), tipProblems.length === 0);

  // A tab that has not opened yet is not on the bar at all, and one that has is.
  // (For a while style.css showed every tab from the first minute.)
  // (the buttons are hidden by hand here, as checkTabUnlocks does it: on these saves
  // every tab has been earned, and it would open them all again)
  for (let name of tabNames) {
    document.getElementById("tab-" + name).hidden = name !== "tower" && name !== "skills";
  }
  let closedTabs = tabNames.filter(function (name) { return document.getElementById("tab-" + name).hidden && document.getElementById("tab-" + name).offsetWidth > 0; });
  let barShowsOpen = document.getElementById("tab-skills").offsetWidth > 0 && document.getElementById("tab-tower").offsetWidth > 0;
  checkTabUnlocks();
  check("tabs: one that has not opened is not on the bar, and one that has is" + (closedTabs.length === 0 ? "" : "; ON THE BAR UNOPENED: " + closedTabs.join(", ")),
    closedTabs.length === 0 && barShowsOpen);

  // Then how they behave. Everything they touch is put back afterwards.
  saveGame();
  let tipsBefore = { seen: seenTips, on: tipsOn, best: bestFloor, tabs: unlockedTabs, moments: moments, tab: document.body.dataset.tab, save: localStorage.getItem(saveName) };
  let tipBox = document.getElementById("tip");
  let allTipIds = tips.map(function (tip) { return tip.id; });
  let tipPicture = function () {
    return JSON.stringify(seenTips) + "|" + (shownTip === null ? "none" : shownTip.id) + "|" + tipBox.outerHTML + "|" + document.body.className
      + "|" + document.querySelector(".tabs").innerHTML + "|" + moments.length + "|" + logLines.length;
  };
  // (as if every tip but these had been seen, and no big moment were waiting)
  let waitFor = function (ids) {
    seenTips = allTipIds.filter(function (id) { return !ids.includes(id); });
    shownTip = null;
    tipRestUntil = 0;
    checkTips();
  };
  moments = [];
  document.getElementById("moment").hidden = true;
  tipsOn = true;
  unlockedTabs = tabNames;
  showTab("tower");

  // A new player: no save in the browser at all
  localStorage.removeItem(saveName);
  seenTips = [];
  shownTip = null;
  tipRestUntil = 0;
  oldSaveFilled = false;
  loadGame();
  checkTips();
  let newPlayer = !tipsAreNew && shownTip !== null && shownTip.id === "start" && seenTips.length === 0 && !tipBox.hidden
    && document.getElementById("tip-title").textContent === tips[0].title && document.getElementById("tip-text").textContent === tips[0].text
    && document.getElementById("tip-go").hidden && document.body.classList.contains("tip-showing");
  check("tips: a new player is shown the first tip (\"" + tips[0].title + "\"), with nothing marked seen", newPlayer);

  let pictureBefore = tipPicture();
  checkTips();
  let sameWithTip = tipPicture() === pictureBefore;
  waitFor([]);
  pictureBefore = tipPicture();
  checkTips();
  check("tips: checking twice in a row changes nothing the second time, with a tip showing and with none", sameWithTip && shownTip === null && tipBox.hidden && tipPicture() === pictureBefore);

  // Closing is for good: becoming a legend puts the best floor back to 1, and a tip that
  // was keyed on reaching a floor would come round again
  bestFloor = Math.max(bestFloor, 10);
  waitFor(["bars", "guide"]);
  let barsShown = shownTip !== null && shownTip.id === "bars";
  closeTip(false);
  let restsAfter = shownTip === null && tipBox.hidden && !document.body.classList.contains("tip-showing");
  closeTip(false);
  let seenOnce = seenTips.filter(function (id) { return id === "bars"; }).length === 1;
  let keptInSave = JSON.parse(localStorage.getItem(saveName)).seenTips.includes("bars");
  bestFloor = 1;
  tipRestUntil = 0;
  checkTips();
  let nextIsGuide = shownTip !== null && shownTip.id === "guide";
  bestFloor = Math.max(bestFloor, 10);
  checkTips();
  check("tips: closing one marks it seen once and saves it, the next waits " + tipRest + " seconds, and the closed one never shows again, even with the best floor back at 1",
    barsShown && restsAfter && seenOnce && keptInSave && nextIsGuide && shownTip.id === "guide");

  // "Show me" is only there when there is somewhere to go, and it is the player's press
  waitFor(["skills"]);
  let pointsAtSkills = shownTip !== null && shownTip.id === "skills" && !document.getElementById("tip-go").hidden && document.getElementById("tab-skills").classList.contains("fresh");
  showTab("skills");
  let nowhereToGo = document.getElementById("tip-go").hidden && !document.getElementById("tab-skills").classList.contains("fresh") && !tipBox.hidden;
  showTab("tower");
  document.getElementById("tip-go").click();
  let wentThere = document.body.dataset.tab === "skills" && seenTips.includes("skills") && tipBox.hidden && document.querySelector(".tabs .fresh") === null;
  showTab("tower");
  waitFor(["skills"]);
  document.getElementById("tip-close").click();
  let stayedPut = document.body.dataset.tab === "tower" && seenTips.includes("skills") && tipBox.hidden;
  check("tips: \"Show me\" opens the tab the tip is about and is hidden on that tab; \"Got it\" leaves the player where they are", pointsAtSkills && nowhereToGo && wentThere && stayedPut);

  // A tip waits behind a big moment and behind time away, and stays out of the queue
  waitFor(["bars"]);
  moments.push({ title: "A moment", text: "For the check." });
  updateScreen();
  let hiddenByMoment = tipBox.hidden && !document.getElementById("moment").hidden && moments.length === 1 && shownTip !== null;
  closeMoment();
  updateScreen();
  let backAfterMoment = !tipBox.hidden && moments.length === 0;
  catchingUp = true;
  showTip();
  let hiddenWhileAway = tipBox.hidden;
  catchingUp = false;
  waitFor(["bars"]);
  shownTip = null;
  backgroundClimb = true;
  checkTips();
  let quietInBackground = shownTip === null;
  backgroundClimb = false;
  check("tips: a tip is hidden while a big moment is open or time away is played, never joins the moments, and nothing is looked for during the Second Climber's turns",
    hiddenByMoment && backAfterMoment && hiddenWhileAway && quietInBackground);

  // Switched off in Settings: nothing shows, and what is reached goes to the Guide
  tipsOn = false;
  seenTips = [];
  shownTip = null;
  checkTips();
  let offIsQuiet = shownTip === null && tipBox.hidden && seenTips.includes("start") && document.getElementById("tips-box") !== null;
  tipsOn = true;

  // The Guide lists what has been seen, under its tab, and nothing that has not
  seenTips = ["skills", "start", "fall"];
  document.getElementById("guide-btn").click();
  let guideList = document.getElementById("guide-list");
  let guideWords = guideList.textContent;
  let guideOpens = !document.getElementById("guide").hidden && guideList.querySelectorAll(".guide-tab").length === 3 && guideList.querySelectorAll(".row-title").length === 3
    && guideList.querySelector(".guide-tab").textContent === document.getElementById("tab-tower").textContent
    && guideWords.includes(tips[0].text) && !guideWords.includes("Keystones") && document.getElementById("guide-count").textContent.includes("3 of " + tips.length)
    && document.getElementById("guide-btn").offsetHeight > 0;
  document.querySelector("#guide .window-close").click();
  check("tips: switched off, nothing shows and what is reached is marked seen; the Guide lists the seen tips under their tabs and no others, and its X closes it",
    offIsQuiet && guideOpens && document.getElementById("guide").hidden);

  // The seen list is part of the save, and a save without one is an old save
  seenTips = ["start", "fall"];
  saveGame();
  seenTips = [];
  loadGame();
  let cameBack = JSON.stringify(seenTips) === "[\"start\",\"fall\"]" && !tipsAreNew;
  let oldSave = JSON.parse(localStorage.getItem(saveName));
  oldSave.seenTips = "start";
  localStorage.setItem(saveName, JSON.stringify(oldSave));
  seenTips = [];
  shownTip = null;
  tipRestUntil = 0;
  loadGame();
  let countsAsOld = tipsAreNew;
  checkTips();
  check("tips: the seen list survives a save and a load, and a save without a list is filled in quietly and shown the Guide's tip",
    cameBack && countsAsOld && !tipsAreNew && shownTip !== null && shownTip.id === "guide" && seenTips.includes("start") && !seenTips.includes("guide"));

  seenTips = tipsBefore.seen;
  shownTip = null;
  tipRestUntil = 0;
  tipsOn = tipsBefore.on;
  bestFloor = tipsBefore.best;
  unlockedTabs = tipsBefore.tabs;
  moments = tipsBefore.moments;
  localStorage.setItem(saveName, tipsBefore.save);
  loadGame();
  showTab(tipsBefore.tab);
  updateScreen();

  // 6. Saving gives the current version
  saveGame();
  let again = JSON.parse(localStorage.getItem(saveName));
  check("saved as version " + again.version + " (the game is at " + saveVersion + ")", again.version === saveVersion);
} catch (error) {
  failures++;
  out.push("FAIL  the check itself broke: " + error.stack);
}

// 7. Online saves, against a pretend server. A refresh once trapped the game in a loop:
// the closing page sent its save, the new page saw a revision it did not know, took the
// online save and reloaded, and the reload sent a save as it closed.
// 8. Every picture named in the game is really there (a wrong file name only shows as a
// broken image in the middle of a fight)
function pictureLoads(path) {
  return new Promise(function (resolve) {
    let image = new Image();
    image.onload = function () { resolve(image.naturalWidth > 0); };
    image.onerror = function () { resolve(false); };
    image.src = path;
  });
}

async function checkPictures() {
  let missing = [];
  let without = [];
  let count = 0;

  for (let towerName in towers) {
    for (let type of towers[towerName].monsters.concat(towers[towerName].bosses)) {
      if (type.art === undefined) {
        without.push(type.name);
      } else {
        count = count + 1;
        if (!(await pictureLoads(type.art))) {
          missing.push(type.name + " (" + type.art + ")");
        }
      }
    }
  }
  for (let className in classes) {
    if (classes[className].art === undefined) {
      without.push(classes[className].name);
    } else if (!(await pictureLoads(classes[className].art))) {
      missing.push(classes[className].name + " (" + classes[className].art + ")");
    }
  }

  check("pictures: " + count + " monsters and bosses and " + Object.keys(classes).length + " classes, every file there"
    + (missing.length === 0 ? "" : "; MISSING: " + missing.join(", ")) + (without.length === 0 ? "" : "; WITHOUT ONE: " + without.join(", ")),
    missing.length === 0 && without.length === 0);
}

async function checkOnlineSaves() {
  let realFetch = window.fetch;
  let realTake = takeCloudSave;
  let server = { revision: 6, save: null };
  let taken = 0;

  window.fetch = function (url, options) {
    let answer = {};
    if (String(url).includes("load_save")) {
      answer = { save: server.save, force: false, revision: server.revision };
    } else if (String(url).includes("store_save")) {
      let body = JSON.parse(options.body);
      if (body.p_revision !== server.revision) {
        answer = { conflict: true, save: server.save, revision: server.revision };
      } else {
        server.revision = server.revision + 1;
        server.save = body.p_save;
        answer = { revision: server.revision };
      }
    }
    return Promise.resolve({ ok: true, json: function () { return Promise.resolve(answer); } });
  };
  takeCloudSave = function () {
    taken = taken + 1;
    return true;
  };

  try {
    let mine = JSON.parse(localStorage.getItem(saveName));
    cloudUser = "tester";
    cloudToken = "token";

    // This browser's own save is online under a revision it never heard back about
    mine.sentBy = cloudDevice;
    server.save = mine;
    cloudRevision = 5;
    await cloudCheckOnStart();
    check("online saves: a refresh does not take back this browser's own save (remembered revision " + cloudRevision + ")", taken === 0 && cloudRevision === 6);

    cloudRevision = 5;
    cloudLastSent = "";
    await cloudUpload();
    await cloudUpload();
    check("online saves: a send that meets this browser's own save learns the revision, and the next one goes through (server at " + server.revision + ")", taken === 0 && server.revision === 7 && cloudRevision === 7);

    // Another device has played since
    let theirs = JSON.parse(localStorage.getItem(saveName));
    theirs.sentBy = "another-device";
    server.save = theirs;
    server.revision = 9;
    await cloudCheckOnStart();
    check("online saves: a save from another device is taken", taken === 1 && cloudRevision === 9);

    // The last defence: a page that has just reloaded for an online save does not do it again
    takeCloudSave = realTake;
    sessionStorage.setItem(reloadMarkName, String(Date.now()));
    check("online saves: a page that has just reloaded for an online save never reloads for one again straight away", takeCloudSave(theirs) === false);
    sessionStorage.removeItem(reloadMarkName);

    // A tab that a newer tab has stopped sends nothing
    otherTabOpen = true;
    let revisionWas = server.revision;
    cloudRevision = server.revision;
    cloudLastSent = "";
    await cloudUpload();
    otherTabOpen = false;
    check("online saves: a stopped tab sends nothing", server.revision === revisionWas);
  } catch (error) {
    failures++;
    out.push("FAIL  the online save check broke: " + error.stack);
  }

  window.fetch = realFetch;
  takeCloudSave = realTake;
  forgetAccount();
}

function finishCheck() {
  if (window.pageErrors !== undefined) {
    failures++;
    out.push("FAIL  errors on the page: " + window.pageErrors);
  }
  out.push(failures === 0 ? "ALL GOOD" : failures + " PROBLEM(S)");

  let pre = document.createElement("pre");
  pre.id = "test-out";
  pre.textContent = out.join("\n");
  document.body.appendChild(pre);
}

checkOnlineSaves().then(checkPictures).then(finishCheck);
