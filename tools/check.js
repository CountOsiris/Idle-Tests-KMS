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
    for (let name of tabNames) {
      showTab(name);
    }
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
  let costOfHalf = 100 * bossMechanics.reflect.attacks / 2 * (currentClass().ranged === true ? bossMechanics.reflect.rangedShare : 1);
  check("reflect aura: taking off half its health costs " + costOfHalf + " health", 100000 - playerHp === Math.round(costOfHalf));
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
    if (ended.killer === "" || !(ended.lastHit > 0) || !(ended.kills > 0)) {
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
