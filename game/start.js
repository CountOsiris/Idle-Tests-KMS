// =====================================================================
//  game/start.js - Time away, new versions, and starting the game. LOADED LAST.
// =====================================================================

// ----- Time away -----
// Plays through the seconds you missed, very fast, then reports what happened.
// The game was not really running: it works out the time away from the clock.
function playTimeAway(seconds) {
  let counted = Math.min(seconds, maxAwaySeconds);

  let deathsBefore = deaths;
  let experienceBefore = experience;
  let goldBefore = gold + bank;
  let bestFloorBefore = bestFloor;

  catchingUp = true;
  for (let i = 0; i < counted; i++) {
    step();
  }
  catchingUp = false;

  let report = "While you were away for " + timeText(seconds);
  if (seconds > maxAwaySeconds) {
    report = report + " (only " + timeText(maxAwaySeconds) + " counts)";
  }
  report = report + ", your " + currentClass().name + " fell " + (deaths - deathsBefore) + " times";
  report = report + " and earned " + big(experience - experienceBefore) + " experience";
  report = report + " and " + big(gold + bank - goldBefore) + " gold.";
  if (bestFloor > bestFloorBefore) {
    report = report + " New best floor: " + bestFloor + "!";
  }

  document.getElementById("away-text").textContent = report;
  document.getElementById("away-report").hidden = false;
}

// Runs once a second. If more than a second has passed (the game was closed,
// or the browser slowed a hidden tab down), it catches up on what was missed.
function tick() {
  let now = Date.now();
  let seconds = Math.max(1, Math.round((now - lastTick) / 1000));
  lastTick = now;

  if (seconds >= awayReportAfter) {
    playTimeAway(seconds);
  } else {
    for (let i = 0; i < seconds; i++) {
      // Only the last second is animated when several are played at once
      if (i === seconds - 1) {
        animatedStep();
      } else {
        step();
      }
    }
  }

  updateScreen();
  saveGame();
}

// ----- New versions -----
// A game left open in a tab keeps running the version it was opened with, for days if
// nobody reloads it. So every few minutes the page asks the website which version is
// current (the file version.txt), and if it is not this one, shows a notice with a
// Reload button. "gameVersion" is set in index.html, next to the script tags.
// (Opened straight from a folder there is no website to ask, and nothing happens.)
function checkForNewVersion() {
  fetch("version.txt?t=" + Date.now(), { cache: "no-store" })
    .then(function (answer) {
      if (!answer.ok) {
        return "";
      }
      return answer.text();
    })
    .then(function (latest) {
      if (latest.trim() !== "" && latest.trim() !== gameVersion) {
        document.getElementById("new-version").hidden = false;
      }
    })
    .catch(function () {
      // No connection, or not on a website: try again next time
    });
}

function reloadForNewVersion() {
  saveGame();
  location.reload();
}

setInterval(checkForNewVersion, 5 * 60 * 1000);

// ----- Start the game -----
loadGame();
buildClassButtons();
buildRoomPips();
buildTownList();
buildFameList();
buildTowerList();
buildClassScreen();
checkTabUnlocks(true);
showTab("tower");
loadSettings();
showSaveProblem();
startEncounter();
tellAboutSkillReset();
if (fameWasRefunded) {
  say("Ascension has changed: fame and its upgrades are now shared by all your classes. All your fame has been given back to spend again (Ascension).");
}
tick();
let timer = setInterval(tick, 1000);
