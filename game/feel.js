// =====================================================================
//  game/feel.js - How it looks and feels: animations, announcements, tabs that open as you go, settings.
// =====================================================================

// ----- Animations -----
// The game's rules know nothing about animations. Instead we note the numbers
// before a second is played, play it, and animate whatever changed.
// The movements themselves are described in style.css (look for "Animations").

// A hit this big, as a share of the target's full health, gets a bigger number and a jolt
const bigHitShare = 0.3;

// Every animation there is. They are the class names in style.css under "Animations".
const animationNames = ["lunge-right", "lunge-left", "shake", "shake-late", "appear", "death", "jolt", "pop", "dying", "banner-show"];

// Plays one of the CSS animations on something on the page.
// Something can only play one at a time, so any earlier one is cleared first.
// Reading offsetWidth in between makes the browser start the new one afresh.
function animate(id, animationName) {
  let element = document.getElementById(id);

  for (let name of animationNames) {
    element.classList.remove(name);
  }
  void element.offsetWidth;
  element.classList.add(animationName);
}

// A number or word that floats up from a fighter and fades.
// kind is "hit", "hurt", "heal" or "word", and can have " big" added.
// late = true makes it wait for the monster's turn.
function floatText(sideId, text, kind, late) {
  let bubble = document.createElement("span");
  bubble.className = "float " + kind;
  if (late) {
    bubble.className = bubble.className + " late";
  }
  bubble.textContent = text;

  // It removes itself once it has finished floating
  bubble.onanimationend = function () {
    bubble.remove();
  };
  document.getElementById(sideId).appendChild(bubble);
}

// A short message that pops up over the fight and fades: a level gained, an item found...
// kind decides its colour: "good", "floor", "bad", or "rarity-0" to "rarity-5" for items.
function toast(text, kind) {
  let box = document.getElementById("toasts");

  // Never more than three at once: the oldest makes room
  if (box.children.length >= 3) {
    box.children[0].remove();
  }

  let note = document.createElement("div");
  note.className = "toast " + kind;
  note.textContent = text;
  note.onanimationend = function () {
    note.remove();
  };
  box.appendChild(note);
}

// ----- Announcements -----
// Three sizes, so that a big moment looks big and a small one stays small:
//   "toast"  - a small note in the corner of the fight: levels, floors, boons
//   "banner" - big words across the fight: a new blacksmith tier, a skill rank, a wall
//   "moment" - a card in the middle of the page that waits for the player: a milestone
//              perk to pick, a new part of the game opening. Only the rare, big ones.
// Every announcement also goes in the log. While time away is being played through,
// toasts and banners are skipped (nobody is watching), and moments wait in a queue.
// The player can turn moments into banners in Settings.
let moments = [];
let momentsOn = true;

// "choices" is optional: a list of { title, note, whenPicked } shown as rows with a button
function announce(size, title, text, choices) {
  say(title + ". " + text);

  if (size === "moment" && momentsOn) {
    // A long stretch away can pile up many; the oldest are already in the log
    if (moments.length < 8) {
      moments.push({ title: title, text: text, choices: choices });
    }
    return;
  }
  if (catchingUp || document.hidden || !animationsOn) {
    return;
  }
  if (size === "toast") {
    toast(title, "good");
  } else {
    showBanner(title, "won long");
  }
}

// Shows the oldest waiting moment, if there is one and none is on screen
function showMoment() {
  let box = document.getElementById("moment");
  if (!box.hidden || moments.length === 0 || catchingUp) {
    return;
  }

  let moment = moments[0];
  document.getElementById("moment-title").textContent = moment.title;
  document.getElementById("moment-text").textContent = moment.text;

  let list = document.getElementById("moment-choices");
  list.innerHTML = "";
  if (moment.choices !== undefined) {
    for (let choice of moment.choices) {
      let row = document.createElement("div");
      row.className = "row";

      let words = document.createElement("div");
      words.className = "row-text";
      let title = document.createElement("p");
      title.className = "row-title";
      title.textContent = choice.title;
      let note = document.createElement("p");
      note.className = "note";
      note.textContent = choice.note;
      words.appendChild(title);
      words.appendChild(note);

      let button = document.createElement("button");
      button.textContent = "Pick";
      button.onclick = function () {
        choice.whenPicked();
        closeMoment();
      };

      row.appendChild(words);
      row.appendChild(button);
      list.appendChild(row);
    }
  }

  // With choices to make, the button means "not now"; without, it just closes
  document.getElementById("moment-close").textContent = moment.choices === undefined ? "Continue" : "Decide later";
  box.hidden = false;
}

function closeMoment() {
  moments.shift();
  document.getElementById("moment").hidden = true;
  showMoment();
}

// A milestone, trial or breakthrough has just been reached for the first time
function announceMilestone(milestone) {
  let choices = [];
  for (let perk of milestone.perks) {
    choices.push({
      title: perk.name,
      note: perk.text,
      whenPicked: function () {
        choosePerk(milestone.floor, perk.id);
      }
    });
  }
  announce("moment", "Milestone: floor " + milestone.floor,
    "Pick one perk. It is yours for good, and you can change your pick later on the Milestones tab.", choices);
}

// ----- Tabs that open as you go -----
// A new player sees only the Tower, Character and Settings tabs. The others appear as
// the game reaches them, each with an announcement, so every part of the game arrives
// as something new. It is counted for the whole account: a tab that any class has
// opened stays open for every class. Which tabs are open is saved (unlockedTabs).
//
// TO ADD A TAB: give it a line here. "earned" says when it opens.
const tabUnlocks = [
  { tab: "skills", size: "banner", title: "Skills open", text: "Every level gives a skill point to spend on the Skills tab.",
    earned: function () { return accountMost("level") >= 2; } },
  { tab: "town", size: "banner", title: "The town opens", text: "The blacksmith and the merchants take gold you have banked (Town tab).",
    earned: function () { return accountMost("bank") > 0 || accountMost("forge") > 0; } },
  { tab: "milestones", size: "banner", title: "Milestones open", text: "Reaching new floors unlocks perks that are yours for good (Milestones tab).",
    earned: function () { return accountMost("bestFloor") >= 5; } },
  { tab: "inventory", size: "banner", title: "Inventory opens", text: "Your equipment and the relics bosses leave you are on the Inventory tab.",
    earned: function () { return accountMost("bestFloor") >= 6; } },
  { tab: "ascension", size: "moment", title: "Ascension", text: "Reach floor " + ascendFirstFloor + " to ascend: this class starts again from level 1 and earns fame, which makes every one of your classes stronger for good. See the Ascension tab.",
    earned: function () { return accountMost("bestFloor") >= 10 || totalAscensions() > 0; } },
  { tab: "travel", size: "moment", title: "Other towers", text: "Your classes can now challenge each other's towers. They are harder, but they hold trophies: bonuses that are yours for good. See the Towers tab.",
    earned: function () { return accountMost("bestFloor") >= 20 || totalAscensions() > 0; } }
];

// Tabs that are always open
const openFromTheStart = ["tower", "character", "save"];

let unlockedTabs = [];

// The highest of something across every class on the account
function accountMost(what) {
  let most = 0;
  for (let className in classes) {
    let saved = classSaves[className];
    if (className === playerClass) {
      saved = { level: level, bank: bank, bestFloor: bestFloor, forgeLevels: forgeLevels };
    }
    if (saved === undefined) {
      continue;
    }
    let value = saved[what];
    if (what === "forge") {
      value = saved.forgeLevels === undefined ? 0 : (saved.forgeLevels.weapon || 0) + (saved.forgeLevels.armor || 0);
    }
    if (typeof value === "number" && value > most) {
      most = value;
    }
  }
  return most;
}

function tabIsOpen(name) {
  return openFromTheStart.includes(name) || unlockedTabs.includes(name);
}

// "quietly" is for opening the game: tabs already earned open without a fuss
function checkTabUnlocks(quietly) {
  for (let unlock of tabUnlocks) {
    if (!unlockedTabs.includes(unlock.tab) && unlock.earned()) {
      unlockedTabs.push(unlock.tab);
      if (!quietly) {
        announce(unlock.size, unlock.title, unlock.text);
      }
    }
  }

  for (let name of tabNames) {
    document.getElementById("tab-" + name).hidden = !tabIsOpen(name);
  }
}

// ----- Settings -----
// Settings belong to the device, not to the save: they are kept under their own
// name in the browser, and a save code does not carry them.
const settingsName = "lloegrys-idle-settings";
let animationsOn = true;
let openTab = "tower";      // the tab that was open last time
let seenVersion = "";       // the newest version whose Updates entry this device has opened
let settingsLoaded = false;

function loadSettings() {
  let saved = localStorage.getItem(settingsName);

  if (saved !== null) {
    try {
      let settings = JSON.parse(saved);
      animationsOn = settings.animationsOn !== false;
      momentsOn = settings.momentsOn !== false;
      if (tabNames.includes(settings.openTab)) {
        openTab = settings.openTab;
      }
      if (typeof settings.seenVersion === "string") {
        seenVersion = settings.seenVersion;
      }
    } catch (error) {
      animationsOn = true;
    }
  }

  settingsLoaded = true;
  showTab(openTab);
  showSettings();
}

function saveSettings() {
  // Not before they have been read, or the first showTab would overwrite them
  if (settingsLoaded) {
    localStorage.setItem(settingsName, JSON.stringify({ animationsOn: animationsOn, momentsOn: momentsOn, openTab: openTab, seenVersion: seenVersion }));
  }
}

function setMoments(on) {
  momentsOn = on;
  saveSettings();
  showSettings();
}

function setAnimations(on) {
  animationsOn = on;
  saveSettings();
  showSettings();
}

function showSettings() {
  document.getElementById("animations-box").checked = animationsOn;
  document.getElementById("moments-box").checked = momentsOn;

  // style.css switches every animation off when the body has "no-motion"
  document.body.classList.toggle("no-motion", !animationsOn);

  // A dot on the Updates button until the newest entry has been opened
  document.getElementById("updates-btn").classList.toggle("alert", seenVersion !== gameVersion);
}

// ----- The Updates window -----
// What changed in each version, newest first, from the gameUpdates list in updates.js.
function openUpdates() {
  document.getElementById("updates-version").textContent = gameVersion;

  let box = document.getElementById("updates-list");
  box.innerHTML = "";
  for (let update of gameUpdates) {
    let title = document.createElement("p");
    title.className = "row-title";
    title.textContent = update.version + " · " + update.title;
    box.appendChild(title);

    let list = document.createElement("ul");
    list.className = "note update-changes";
    for (let change of update.changes) {
      let line = document.createElement("li");
      line.textContent = change;
      list.appendChild(line);
    }
    box.appendChild(list);
  }

  document.getElementById("updates").hidden = false;
  seenVersion = gameVersion;
  saveSettings();
  showSettings();
}

function closeUpdates() {
  document.getElementById("updates").hidden = true;
}

// Big words that fade in across the whole fight and out again.
// kind is "died" (blood red) or "won" (gold).
function showBanner(text, kind) {
  let banner = document.getElementById("banner");
  banner.textContent = text;
  banner.className = "banner " + kind;
  animate("banner", "banner-show");
}

// Shows a fighter's picture: its pixel art if it has some, otherwise its emoji.
// A class, monster or boss gets pixel art by adding  art: "art/its-file.png"  to its entry.
function drawPicture(id, icon, art) {
  let element = document.getElementById(id);

  if (art === undefined || art === "") {
    element.dataset.art = "";
    element.classList.remove("has-art");
    element.textContent = icon;
    return;
  }

  // Only swap the image when it is a different one, or it would flicker every second
  if (element.dataset.art !== art) {
    let image = document.createElement("img");
    image.src = art;
    image.alt = "";

    // Small drawings (true pixel art, up to 96 pixels tall) are kept sharp when
    // shown bigger. Large detailed pictures are scaled smoothly instead.
    image.onload = function () {
      image.classList.toggle("sharp", image.naturalHeight <= 96);
    };

    element.textContent = "";
    element.appendChild(image);
    element.dataset.art = art;
    element.classList.add("has-art");
  }
}

function animatedStep() {
  // Nothing to animate if nobody is looking, or animations are switched off
  if (document.hidden || !animationsOn) {
    step();
    return;
  }

  // What things look like before this second is played
  let wasFight = encounterType === "monster" || encounterType === "boss";
  let wasBoss = encounterType === "boss";
  let roomBefore = roomCount;
  let deathsBefore = deaths;
  resistedHits = 0;
  boostedHits = 0;
  missedHits = 0;
  let monsterHpBefore = monsterHp;
  let monsterMaxHpBefore = monsterMaxHp;
  let monsterIconBefore = monsterIcon;
  let monsterArtBefore = monsterArt;
  let playerHpBefore = playerHp;
  let floorBefore = floor;
  let levelBefore = level;
  let fameBefore = fame;
  let relicsBefore = ownedRelics.length;
  let trophiesBefore = trophies.length;
  lastUpgrade = null;
  lastAbilityUsed = null;
  lastBossEvent = "";

  step();

  let died = deaths !== deathsBefore;
  let newRoom = roomCount !== roomBefore;
  let playerChange = playerHp - playerHpBefore;

  // Things worth a pop-up message, whatever else happened
  if (level > levelBefore) {
    toast("Level " + level + "!", "good");
    animate("header-level", "pop");
  }
  if (fame > fameBefore) {
    animate("fame", "pop");
  }
  if (trophies.length > trophiesBefore) {
    toast("Trophy won!", "good");
  }

  if (died) {
    animate("stage", "death");
    showBanner("You died", "died");
    toast("Fell on floor " + floorBefore, "bad");
    animate("monster-mover", "appear");
    return;
  }

  if (wasBoss && newRoom) {
    showBanner("Victory", "won");
  }

  if (floor > floorBefore) {
    toast("Floor " + floor, "floor");
    animate("floor", "pop");
  }
  if (ownedRelics.length > relicsBefore) {
    toast("Relic claimed!", "good");
  }

  // A boss's upgrade gets a pop-up too, but it does not need reading in a hurry:
  // it is on the list under the fight for the rest of the run
  if (lastAbilityUsed !== null) {
    floatText("player-side", lastAbilityUsed.name + "!", "word", false);
  }
  if (lastBossEvent !== "") {
    floatText("monster-side", lastBossEvent + "!", "word", false);
  }
  if (lastUpgrade !== null) {
    toast("Boon: " + lastUpgrade.name, "good");
    animate("upgrade-count", "pop");
  }

  if (wasFight) {
    // Your turn: you lunge, and the monster is hit or defeated
    animate("player-mover", "lunge-right");

    if (newRoom) {
      // The defeated monster fades away where it stood, while the next room arrives
      drawPicture("monster-ghost", monsterIconBefore, monsterArtBefore);
      animate("monster-ghost", "dying");
    } else {
      // A regenerating monster can end the turn with more health than it started
      let dealt = monsterHpBefore - monsterHp;

      // The number is coloured when the monster was weak to the hit, or resisted it
      let feel = "";
      if (boostedHits > 0 && resistedHits === 0) {
        feel = " weak";
      } else if (resistedHits > 0 && boostedHits === 0) {
        feel = " resisted";
      }

      if (dealt >= monsterMaxHpBefore * bigHitShare) {
        floatText("monster-side", "-" + big(dealt), "hit big" + feel, false);
        animate("monster-icon", "shake");
        animate("stage", "jolt");
      } else if (dealt > 0) {
        floatText("monster-side", "-" + big(dealt), "hit" + feel, false);
        animate("monster-icon", "shake");
      } else if (dealt < 0) {
        floatText("monster-side", "+" + big(-dealt), "heal", false);
      }
      if (missedHits > 0) {
        floatText("monster-side", "miss", "word", false);
      }

      // The monster's turn, a moment later
      if (playerChange < 0) {
        animate("monster-mover", "lunge-left");
        animate("player-icon", "shake-late");

        if (-playerChange >= playerMaxHp * bigHitShare) {
          floatText("player-side", "-" + big(-playerChange), "hurt big", true);
        } else {
          floatText("player-side", "-" + big(-playerChange), "hurt", true);
        }
      }
    }
  }

  // Healing: lifesteal, a rest area, a potion, or the breather after a kill
  if (playerChange > 0) {
    floatText("player-side", "+" + big(playerChange), "heal", wasFight);
  }

  if (newRoom) {
    animate("monster-mover", "appear");
  }
}
