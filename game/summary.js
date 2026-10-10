// =====================================================================
//  game/summary.js - The run summary: what a run's damage and healing were made of,
//  and what ended it. Two lines in the log on death, and a card on the Character tab.
// =====================================================================
//
// The game's rules tell this file what happened (noteDamage, noteHealing, noteTaken);
// nothing here changes a fight. The classes do not need to know about it:
//   - hits are sorted by their damage type as they land (see hitMonster in game/state.js)
//   - whatever a class's turn dealt beyond its hits is its damage over time
//   - everything an ability did counts as "Abilities"

// ----- The run being played (not saved: switching class or reloading starts the count again) -----
let runStats = freshRunStats();

// ----- The last finished run (saved, per class) -----
let lastRun = null;

// Set while abilities are being used, so that what they do is counted as theirs
let abilityPhase = false;

// Set around a heal that is not the class's own, for example "Potions"
let healSource = "";

// How much damage has been sorted by type since the fight last asked (see noteRestOfTurn)
let notedThisPhase = 0;

// The size of the last hit you took
let lastHitTaken = 0;

function freshRunStats() {
  return { seconds: 0, kills: 0, bosses: 0, damage: {}, healing: {}, taken: {} };
}

function addToTally(tally, source, amount) {
  if (amount > 0) {
    tally[source] = (tally[source] || 0) + amount;
  }
}

// The name of a damage type as a source, for example "Slashing"
function sourceName(type) {
  if (type === undefined || damageTypes[type] === undefined) {
    return "Other";
  }
  let name = damageTypes[type];
  return name[0].toUpperCase() + name.slice(1);
}

// A hit has landed (called by the hit functions in game/state.js)
function noteDamage(type, amount) {
  if (abilityPhase) {
    return;
  }
  notedThisPhase = notedThisPhase + amount;
  addToTally(runStats.damage, sourceName(type), amount);
}

// The abilities used this turn dealt this much between them
function noteAbilityDamage(amount) {
  addToTally(runStats.damage, "Abilities", amount);
}

// The class's turn dealt "dealt" in all. Whatever was not a hit was its damage over time.
function noteRestOfTurn(dealt) {
  let rest = dealt - notedThisPhase;
  if (rest > 0) {
    addToTally(runStats.damage, currentClass().dotLabel || "Other", rest);
  }
}

// Health really gained (called by healPlayer in game/state.js)
function noteHealing(amount) {
  let source = healSource;
  if (source === "") {
    source = abilityPhase ? "Abilities" : (currentClass().healLabel || "Your class");
  }
  addToTally(runStats.healing, source, amount);
}

// You were hurt for this much by the monster being fought
function noteTaken(amount) {
  lastHitTaken = amount;
  addToTally(runStats.taken, monsterName, amount);
}

// A tally as a list of { source, amount, share }, biggest first
function tallyRanked(tally) {
  let total = 0;
  for (let source in tally) {
    total = total + tally[source];
  }

  let ranked = [];
  for (let source in tally) {
    ranked.push({ source: source, amount: tally[source], share: tally[source] / total });
  }
  ranked.sort(function (a, b) {
    return b.amount - a.amount;
  });
  return ranked;
}

// The biggest few of a tally in words, for example "Bleeding 54%, Slashing 31%"
function tallyText(tally, howMany) {
  let parts = [];
  for (let entry of tallyRanked(tally).slice(0, howMany)) {
    parts.push(entry.source + " " + Math.round(entry.share * 100) + "%");
  }
  if (parts.length === 0) {
    return "none";
  }
  return parts.join(", ");
}

// "1 boss", "2 bosses"
function countOf(number, one, many) {
  return number + " " + (number === 1 ? one : many);
}

// Runs when you fall, before anything is reset: keeps the run and writes it in the log
function finishRun() {
  let killer = monsterName;
  if (encounterType === "boss") {
    killer = "BOSS " + monsterName;
  }

  let rules = [];
  for (let id of bossRules) {
    rules.push(bossMechanics[id].name);
  }

  lastRun = {
    tower: tower,
    startFloor: runStartFloor,
    floor: floor,
    seconds: runStats.seconds,
    kills: runStats.kills,
    bosses: runStats.bosses,
    killer: killer,
    killerRules: rules,
    fightTurns: fightTurns,
    lastHit: lastHitTaken,
    boons: upgradesHeld(),
    relics: ownedRelics.length,
    damage: runStats.damage,
    healing: runStats.healing,
    taken: runStats.taken
  };

  say("Run summary: floors " + lastRun.startFloor + " to " + lastRun.floor + " in " + timeText(lastRun.seconds) + ", " + countOf(lastRun.kills, "kill", "kills") + ". Your damage: " + tallyText(lastRun.damage, 3) + ". Your healing: " + tallyText(lastRun.healing, 3) + ".");
  say("Killed by " + killer + " on turn " + lastRun.fightTurns + " of the fight; its last hit took " + big(lastRun.lastHit) + " of your " + big(playerMaxHp) + " health."
    + (rules.length > 0 ? " It had: " + rules.join(", ") + "." : ""));

  runStats = freshRunStats();
}

// ----- On the page -----

// The "Last run" card on the Character tab: rebuilt only when another run ends
let lastRunShown = "";

function addPair(box, label, value) {
  let row = document.createElement("div");
  row.className = "pair";
  let left = document.createElement("span");
  left.textContent = label;
  let right = document.createElement("span");
  right.textContent = value;
  row.appendChild(left);
  row.appendChild(right);
  box.appendChild(row);
}

// One part of the card: a small heading, then a line for each source
function addTally(box, heading, tally, howMany) {
  let title = document.createElement("p");
  title.className = "row-title tally-title";
  title.textContent = heading;
  box.appendChild(title);

  let ranked = tallyRanked(tally).slice(0, howMany);
  if (ranked.length === 0) {
    addPair(box, "None", "");
  }
  for (let entry of ranked) {
    addPair(box, entry.source, big(entry.amount) + " (" + Math.round(entry.share * 100) + "%)");
  }
}

function showLastRun() {
  let card = document.getElementById("last-run-card");
  card.hidden = lastRun === null;
  if (lastRun === null) {
    return;
  }

  let key = playerClass + " " + deaths;
  if (key === lastRunShown) {
    return;
  }
  lastRunShown = key;

  let box = document.getElementById("last-run");
  box.innerHTML = "";

  let place = towers[lastRun.tower] === undefined ? "" : " of " + towers[lastRun.tower].name;
  addPair(box, "Climbed", "floors " + lastRun.startFloor + " to " + lastRun.floor + place);
  addPair(box, "Lasted", timeText(lastRun.seconds) + ", " + countOf(lastRun.kills, "kill", "kills") + ", " + countOf(lastRun.bosses, "boss", "bosses"));
  addPair(box, "Held at the end", countOf(lastRun.boons, "boon", "boons") + ", " + countOf(lastRun.relics, "relic", "relics"));
  addPair(box, "Killed by", lastRun.killer + ", on turn " + lastRun.fightTurns + " of the fight");
  if (lastRun.killerRules.length > 0) {
    addPair(box, "It had", lastRun.killerRules.join(", "));
  }
  addPair(box, "Its last hit", big(lastRun.lastHit));

  addTally(box, "Your damage", lastRun.damage, 6);
  addTally(box, "Your healing", lastRun.healing, 6);
  addTally(box, "What hurt you most", lastRun.taken, 3);
}
