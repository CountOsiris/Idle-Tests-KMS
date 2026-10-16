// =====================================================================
//  game/companion.js - The Second Climber: one other class climbs its tower while you
//  play, and the strip of heroes above the fight.
// =====================================================================
// A legend unlock, and a late one (see legendUnlocks in data.js). Once it is bought the
// player picks one other class to "climb beside" the one being played. That class is
// played by the game itself, out of sight, exactly as it was left: its own tower, its
// weapon, its skills and perks. Everything it earns is its own, and its fame goes to the
// account like anyone's.
//
// HOW IT IS PLAYED. Only one class can be "the class being played" at a time: the game's
// numbers (floor, health, the monster...) are single variables. So the second climber
// takes turns in batches. Every turn the player's class takes is owed to it, and when
// companionBatch turns are owed, and the player's class is between two rooms (so that no
// fight is cut in half), the game puts the player's class away, takes the other one out,
// plays the turns it is owed, and puts everything back.
// While that happens "backgroundClimb" is true: nothing is written to the log and
// nothing pops up. A milestone it reaches waits, unpicked, until you play that class.

// The class climbing beside the one being played ("" means nobody). Saved with the account.
let companionClass = "";

// Turns the second climber is owed
let companionOwed = 0;

// True while the second climber's turns are being played
let backgroundClimb = false;

function secondClimberOpen() {
  return legendBonus("secondClimber") >= 1;
}

// Is there a second climber, and can it climb?
function companionReady() {
  return secondClimberOpen() && companionClass !== "" && companionClass !== playerClass
    && classes[companionClass] !== undefined && classIsOpen(companionClass);
}

// The player's class has taken a turn (called from step in game/fights.js)
function noteCompanionTurn() {
  if (!backgroundClimb && companionReady()) {
    companionOwed = companionOwed + 1;
  }
}

// The player's class is between two rooms (called from nextRoom in game/fights.js)
function playCompanionIfDue() {
  if (backgroundClimb || !companionReady() || companionOwed < companionBatch) {
    return;
  }
  playCompanion(companionOwed);
  companionOwed = 0;
}

function playCompanion(turns) {
  let mine = playerClass;

  // What belongs to the visit of the class being played, and is not part of a class's
  // save. (Its fight IS part of its save, cooldowns and all: unpackClass puts back the
  // room it has just won, and nextRoom then starts the next one.)
  let kept = {
    deaths: deaths, experienceEarned: experienceEarned, catchingUp: catchingUp, skillsWereReset: skillsWereReset
  };

  classSaves[mine] = packClass();
  playerClass = companionClass;
  unpackClass(classSaves[playerClass]);
  backgroundClimb = true;
  catchingUp = true;

  // The second climber starts a new room, with everything ready, each time it takes its
  // turns, as it always has: the fight its save holds is the one its last turns ended
  // in, and it is only gone on with when the player takes that class up (switchClass).
  resetAbilitiesForRun();
  startEncounter();
  for (let i = 0; i < turns; i++) {
    step();
  }
  classSaves[playerClass] = packClass();

  playerClass = mine;
  unpackClass(classSaves[mine]);
  backgroundClimb = false;
  deaths = kept.deaths;
  experienceEarned = kept.experienceEarned;
  catchingUp = kept.catchingUp;
  skillsWereReset = kept.skillsWereReset;
}

// The player picked who climbs beside them ("" for nobody)
function chooseCompanion(className) {
  companionClass = className;
  companionOwed = 0;
  updateScreen();
  saveGame();
}

// ----- The strip of heroes above the fight -----
// One button a class: press one to play it. The one climbing beside you is marked.
let companionListShown = "";

function showHeroStrip() {
  for (let className in classes) {
    let button = document.getElementById("class-" + className);
    let saved = className === playerClass ? { floor: floor, level: level } : (classSaves[className] || {});
    let label = saved.floor === undefined ? "Not played yet" : "Floor " + saved.floor + " \u00b7 level " + saved.level;
    let note = button.querySelector(".hero-note");
    if (note.textContent !== label) {
      note.textContent = label;
    }
    button.classList.toggle("climbing", companionReady() && className === companionClass);
    button.title = className === playerClass ? "The class you are playing"
      : (companionReady() && className === companionClass ? "Climbing beside you. Press to play it: the " + currentClass().name + " will climb in its place." : "Press to play the " + classes[className].name);
  }

  // Who climbs beside you: only once the unlock is bought
  let line = document.getElementById("companion-line");
  line.hidden = !secondClimberOpen();
  if (line.hidden) {
    return;
  }
  let others = Object.keys(classes).filter(function (name) { return name !== playerClass && classIsOpen(name); });
  let key = playerClass + "/" + others.join(",") + "/" + companionClass;
  if (key !== companionListShown) {
    companionListShown = key;
    let pick = document.getElementById("companion-pick");
    pick.innerHTML = "";
    for (let name of [""].concat(others)) {
      let option = document.createElement("option");
      option.value = name;
      option.textContent = name === "" ? "nobody" : classes[name].name;
      pick.appendChild(option);
    }
    pick.value = others.includes(companionClass) ? companionClass : "";
  }
  let note = "";
  if (companionReady()) {
    let saved = classSaves[companionClass] || {};
    note = "on floor " + (saved.floor || 1) + " of " + towers[saved.tower || companionClass].name + ", best " + (saved.bestFloor || 1) + ". It takes its turns a minute at a time.";
  }
  document.getElementById("companion-note").textContent = note;
}
