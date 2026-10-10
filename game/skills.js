// =====================================================================
//  game/skills.js - Skills, saved builds, milestone choices, towers, and stats and levelling.
// =====================================================================

// ----- Skills -----
// Every level gives skill points, and skills are bought with them.
// Skills last until the class ascends, and can be reset for free to try another build.
function skillLevel(id) {
  if (skillLevels[id] === undefined) {
    return 0;
  }
  return skillLevels[id];
}

// All the skill points the class has earned: some for every level after the first
function skillPointsEarned() {
  return (level - 1) * skillPointsPerLevel;
}

// RANKS. Every skillRankSize levels (10) a skill gains a RANK. A rank does two things:
//   - the whole skill becomes stronger: +skillRankPower (50%) of everything it gives,
//     for every rank it has. That is the reward for going deep.
//   - every level after it costs one more skill point. That is why spreading points
//     over several skills is worth it: the first levels of each are the cheap ones.
// The numbers are in data.js.
function skillRank(id) {
  return Math.floor(skillLevel(id) / skillRankSize);
}

// How many times stronger its ranks make a skill (1 with no rank, 1.5 with one...)
function skillRankBoost(id) {
  return 1 + skillRankPower * skillRank(id);
}

// The price of the NEXT level of a skill, in skill points
function skillCostOf(skill) {
  return skill.cost * (1 + skillRank(skill.id));
}

// All the points that have gone into a skill so far
function skillPointsIn(skill) {
  let spent = 0;

  for (let i = 0; i < skillLevel(skill.id); i++) {
    spent = spent + skill.cost * (1 + Math.floor(i / skillRankSize));
  }

  return spent;
}

function skillPointsSpent() {
  let spent = 0;

  for (let skill of currentClass().skills) {
    spent = spent + skillPointsIn(skill);
  }

  return spent;
}

function skillPointsLeft() {
  return skillPointsEarned() - skillPointsSpent();
}

// How many levels one click on a skill buys: 1, 10, or 0 for "as many as you can afford".
// Not saved: it goes back to 1 when the page is opened again.
let skillBuyAmount = 1;

function setSkillBuyAmount(amount) {
  skillBuyAmount = amount;
  updateScreen();
}

function buySkill(skill) {
  let bought = 0;
  let rankBefore = skillRank(skill.id);

  while (skillPointsLeft() >= skillCostOf(skill) && (skillBuyAmount === 0 || bought < skillBuyAmount)) {
    skillLevels[skill.id] = skillLevel(skill.id) + 1;
    bought = bought + 1;
  }

  if (bought > 0) {
    recalcStats();
    if (skillRank(skill.id) > rankBefore) {
      announce("banner", skill.name + ": rank " + skillRank(skill.id), "The whole skill is now x" + big(skillRankBoost(skill.id)) + ", and its next levels cost " + skillCostOf(skill) + " points.");
    }
    updateScreen();
  }
}

// ----- Saved builds -----
// A saved build is a remembered skill layout. It is used as a RECIPE, not a shopping
// list: "12 Might, 6 Rage" means "two points of Might for every one of Rage". So it
// can be followed with 20 points or with 2,000, and never runs out.

function hasSavedBuild() {
  return Object.keys(savedBuild).length > 0;
}

// Remembers the skills as they are right now
function saveBuild() {
  savedBuild = {};
  for (let skill of currentClass().skills) {
    if (skillLevel(skill.id) > 0) {
      savedBuild[skill.id] = skillLevel(skill.id);
    }
  }
  updateScreen();
}

// Spends every point it can, following the saved build. Each point goes to the
// skill that is furthest behind its share of the recipe.
function spendOnSavedBuild() {
  let spent = false;

  while (true) {
    let pick = null;
    let pickNeed = 0;

    for (let skill of currentClass().skills) {
      let wanted = savedBuild[skill.id];
      if (wanted === undefined || skillCostOf(skill) > skillPointsLeft()) {
        continue;
      }

      // A skill at level 0 that the recipe wants 12 of is needed more than
      // one at level 5 that the recipe wants 6 of
      let need = wanted / (skillLevel(skill.id) + 1);
      if (need > pickNeed) {
        pick = skill;
        pickNeed = need;
      }
    }

    if (pick === null) {
      break;
    }
    skillLevels[pick.id] = skillLevel(pick.id) + 1;
    spent = true;
  }

  if (spent) {
    recalcStats();
  }
}

function applySavedBuild() {
  spendOnSavedBuild();
  updateScreen();
}

function setAutoBuild(on) {
  autoBuild = on;
  if (autoBuild) {
    spendOnSavedBuild();
  }
  updateScreen();
}

// Changes the fighting style (the Elementalist's element). It is free and can be done at any time.
function chooseStance(id) {
  stance = id;
  recalcStats();
  updateScreen();
}

// Gives every skill point back
function resetSkills() {
  skillLevels = {};
  recalcStats();
  updateScreen();
}

// ----- Milestones -----
// Reaching a floor for the first time unlocks its perks forever
// (A keystone milestone is optional: pressing the keystone that is chosen lets it go.)
function choosePerk(milestoneFloor, perkId) {
  if (bestFloor >= milestoneFloor) {
    let optional = allMilestones().some(function (milestone) {
      return milestone.floor === milestoneFloor && milestone.keystones === true;
    });
    if (optional && chosenPerks[milestoneFloor] === perkId) {
      delete chosenPerks[milestoneFloor];
    } else {
      chosenPerks[milestoneFloor] = perkId;
    }
    recalcStats();
    updateScreen();
  }
}

function resetPerks() {
  chosenPerks = {};
  recalcStats();
  updateScreen();
}

// ----- Towers -----
// A class is "away" when it climbs a tower that is not its own
function isAway() {
  return tower !== playerClass;
}

// The tower is not entered straight away: it is where the next run starts, after you fall
function chooseTower(towerName) {
  nextTower = towerName;
  updateScreen();
}

// How the damage the class is dealing RIGHT NOW (its weapon or element) does against a
// tower's monsters and bosses: the share of it that is resisted, and the share that
// hits a weakness
function towerMatch(towerName) {
  let types = currentClass().damageTypes();
  let place = towers[towerName];
  let all = place.monsters.concat(place.bosses);
  let weak = 0;
  let resisted = 0;

  for (let monster of all) {
    for (let type of types) {
      if (listHasType(monster.weak || [], type)) {
        weak = weak + 1;
      } else if (listHasType(monster.resist || [], type)) {
        resisted = resisted + 1;
      }
    }
  }

  let chances = all.length * types.length;
  return { weak: weak / chances, resisted: resisted / chances };
}

// The next trophy this class has not won in a tower (null if it has them all, or at home)
function nextTrophy(towerName) {
  if (towerName === playerClass) {
    return null;
  }
  for (let trophy of towers[towerName].trophies) {
    if (!trophies.includes(trophy.id)) {
      return trophy;
    }
  }
  return null;
}

// THE SUGGESTED CHALLENGE: of the towers that still have a trophy for this class, the
// one its damage does best in (most weaknesses hit, least resisted). Between two that
// suit it equally, the one whose next trophy is on the lower floor.
// Gives back { tower, trophy }, or null when every trophy is won.
function suggestedChallenge() {
  let best = null;
  let bestScore = 0;

  for (let towerName in towers) {
    let trophy = nextTrophy(towerName);
    if (trophy === null) {
      continue;
    }
    let match = towerMatch(towerName);
    let score = match.weak - match.resisted - trophy.floor / 10000;
    if (best === null || score > bestScore) {
      best = { tower: towerName, trophy: trophy };
      bestScore = score;
    }
  }
  return best;
}

// Has the class stopped making progress at home, with a challenge worth trying instead?
function isStuck() {
  return runsSinceBest >= stuckAfterRuns && !isAway() && tabIsOpen("travel") && suggestedChallenge() !== null;
}

// Runs every time a new floor is reached
function checkTowerProgress() {
  if (towerBest[tower] === undefined || floor > towerBest[tower]) {
    towerBest[tower] = floor;
  }

  // Trophies can only be won away from home
  if (!isAway()) {
    return;
  }

  for (let trophy of towers[tower].trophies) {
    if (floor >= trophy.floor && !trophies.includes(trophy.id)) {
      trophies.push(trophy.id);
      recalcStats();
      announce("banner", "Trophy won: " + trophy.name, trophy.text + ", for good.");
    }
  }
}

// ----- Stats and levelling -----
// Health and attack are built up in three steps:
//   1. the flat numbers: the class's base, what its levels give, equipment, perks, relics...
//   2. times the percentages from skills (attackPercent and healthPercent)
//   3. times the fame upgrades, and the boost from boss upgrades held this run
function recalcStats() {
  let levelsGained = level - 1;

  // What the blacksmith's work is worth right now
  weaponPower = forgePower("weapon", forgeLevel("weapon"));
  armorPower = forgePower("armor", forgeLevel("armor"));

  let health = totalBonus("maxHp") + levelsGained * currentClass().perLevel.maxHp;
  let attack = totalBonus("attack") + levelsGained * currentClass().perLevel.attack + weaponPower;

  playerMaxHp = Math.round(health * (1 + totalBonus("healthPercent")) * multiplier("health") * upgradeBoost());
  playerAttack = Math.round(attack * (1 + totalBonus("attackPercent")) * multiplier("attack") * upgradeBoost());

  if (playerHp > playerMaxHp) {
    playerHp = playerMaxHp;
  }
}

function levelCost() {
  return level * levelCostPerLevel;
}

// Levels are bought automatically as soon as there is enough experience.
// Each one makes the class stronger by itself and gives skill points.
function levelUpWhilePossible() {
  let gained = 0;

  while (experience >= levelCost()) {
    experience = experience - levelCost();
    level = level + 1;
    gained = gained + 1;
  }

  if (gained > 0) {
    recalcStats();
    say("You reach level " + level + "!");

    // New skill points are spent straight away if the player asked for that
    if (autoBuild && hasSavedBuild()) {
      spendOnSavedBuild();
    }
  }
}
