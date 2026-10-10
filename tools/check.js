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

  // 5. Saving gives the current version
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
