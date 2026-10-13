// =====================================================================
//  game/tips.js - Tips: one short explanation the first time a part of the game is
//  reached, and the Guide, where every tip already seen can be read again.
// =====================================================================
// A tip is NOT an announcement. announce() (game/feel.js) says what just HAPPENED: a
// relic claimed, a tier forged, a perk to pick. A tip says what a part of the game IS,
// once for the whole account. A tip never asks for a choice, never stops the fight and
// never goes in the queue of big moments.
//
// HOW A TIP IS SHOWN. One small card (#tip in index.html) sits above the tab bar, or in
// the bottom corner of a wide screen. It holds one tip and waits to be pressed: nothing
// times out, and the fight goes on behind it. While it shows, the tab it is about has a
// gold outline. "Got it" closes it. "Show me" closes it and opens that tab. Either way
// the tip is seen, for good, and is in the Guide from then on.
//
// THERE IS NO QUEUE. The only thing remembered is which tips have been seen (seenTips).
// The tip to show is worked out fresh: the first one in the list below that is true and
// has not been seen. So the same check can run every second and change nothing.
//
// TO ADD ONE: give it a line in the list below.
//   id     never change it once players have it: it is what the save remembers
//   tab    the tab it is about (a name from tabNames). "Show me" opens that tab, and the
//          Guide files the tip under it.
//   title  a few words
//   text   two short sentences at most, about 30 words. Plain words. A number comes from
//          its constant in data.js, so that the tip never falls out of step with the rule.
//   when   true once the player has reached it.
// A "when" reads the numbers of the class being played, unless it uses accountMost or
// tabIs, which look at the whole account. That is fine: a tip only has to be true ONCE.
// When it is closed its id is saved, and nothing that happens later (ascending, becoming
// a legend, switching class) can bring it back.
// The ORDER of the list is the order tips are shown in when several are waiting, so put
// a new one beside the ones that belong with it. "guide" stays last.
// The pre-upload check (tools/check.js) reads this list: no id twice, a title and a
// text for each, no text too long, and a tip for every tab that opens as you go.

const tips = [
  // ----- The first minutes -----
  { id: "start", tab: "tower", title: "Your hero fights by itself",
    text: "One turn a second, room after room, floor after floor. Your part is to make it stronger.",
    when: function () { return true; } },

  { id: "fall", tab: "character", title: "Falling pays",
    text: "A fall pays experience and banks the gold you carried. The next run starts lower down.",
    when: function () { return deaths > 0 || accountMost("level") >= 2 || accountMost("bank") > 0; } },

  { id: "skills", tab: "skills", title: "Skills",
    text: "Every level gives a skill point to spend on the Skills tab. Resetting them is free, so try things.",
    when: tabIs("skills") },

  { id: "town", tab: "town", title: "The town",
    text: "Banked gold buys a better weapon and armor at the blacksmith. You keep them when you fall.",
    when: tabIs("town") },

  { id: "bars", tab: "tower", title: "The two bars under the fight",
    text: "They show how hard you hit the monsters of this floor, and how hard they hit you. A full \"Their damage\" bar is one hit that kills you.",
    when: function () { return accountMost("bestFloor") >= 3; } },

  { id: "potions", tab: "town", title: "Healing potions",
    text: "Drunk by themselves at low health, no more in a run than the belt holds. Tick \"Keep the belt full\" to buy them again after every fall.",
    when: function () { return tabIsOpen("town") && accountMost("bestFloor") >= 4; } },

  // ----- Floors 5 and 6 -----
  { id: "perks", tab: "milestones", title: "Perks",
    text: "Reach a milestone floor and pick one perk. You keep it through ascensions, and can change the pick at any time on the Perks tab.",
    when: tabIs("milestones") },

  { id: "boons", tab: "tower", title: "Bosses and boons",
    text: "Every fifth floor ends with a boss. Beating it gives a boon, which lasts until you fall.",
    when: function () { return accountMost("bestFloor") >= 5; } },

  { id: "items", tab: "inventory", title: "Items",
    text: "Your equipment, your relics and the bestiary are on the Items tab. A kind of monster you have killed often drops more gold.",
    when: tabIs("inventory") },

  // (the one tip that cannot be known from a save: it is true only while it happens,
  // on the same turn that fightMonster in game/fights.js starts the clock)
  { id: "drag", tab: "tower", title: "A fight that drags on",
    text: "From turn " + fightClock.turns + " of a fight (turn " + fightClock.bossTurns + " against a boss) the monster hits " + percent(fightClock.growth - 1) + " harder every turn. More damage ends fights sooner, more health does not.",
    when: function () {
      if (encounterType === "boss") {
        return fightTurns >= fightClock.bossTurns;
      }
      return encounterType === "monster" && fightTurns >= fightClock.turns;
    } },

  { id: "sweep", tab: "tower", title: "Sweeping",
    text: "A new run sweeps through the floors this class already clears without slowing down. You still get the boons of the bosses you pass.",
    when: function () { return runStartFloor > 1; } },

  { id: "heroes", tab: "tower", title: "Other heroes",
    text: "The buttons above the fight switch to another class. Each one keeps its own level, gold and floor.",
    when: function () { return accountMost("level") >= 6; } },

  // ----- Floors 10 to 25 -----
  { id: "abilities", tab: "skills", title: "Abilities",
    text: "An ability in a slot is used by itself when it is ready. On the Skills tab you can keep it for bosses, or for your own press.",
    when: function () { return accountMost("bestFloor") >= abilitySlotFloors[0]; } },

  { id: "bossRules", tab: "tower", title: "Bosses with rules",
    text: "From floor " + bossMechanicsFloor + " a boss can have a rule of its own, such as a shield or an enrage. It is written under the fight.",
    when: function () { return accountMost("bestFloor") >= bossMechanicsFloor; } },

  { id: "ascension", tab: "ascension", title: "Ascending",
    text: "Reach floor " + ascendFirstFloor + " to ascend. This class starts again from level 1 and every floor pays fame again, which buys upgrades for every class.",
    when: tabIs("ascension") },

  { id: "away", tab: "save", title: "Time away",
    text: "The tower is climbed while the game is closed, at first for up to " + (maxAwaySeconds / 3600) + " hours. The Settings tab shows how much time away counts now.",
    when: function () { return awayTotals !== null || accountMost("bestFloor") >= 12; } },

  { id: "canAscend", tab: "ascension", title: "What ascending costs",
    text: "Level, skills, bank and the blacksmith's work start over. Perks, fame and what fame bought are kept, and the Ascend tab has the full list.",
    when: function () { return canAscend() || totalAscensions() > 0; } },

  { id: "saveSafe", tab: "save", title: "Keep your save safe",
    text: "The Settings tab can keep your save online, or hand it to you as a code. Do one of them before you clear your browser.",
    when: function () { return accountMost("bestFloor") >= ascendFirstFloor; } },

  { id: "week", tab: "tower", title: "This week's rule",
    text: "Every week one rule changes in every tower. It is written under the tower's name.",
    when: function () { return weeklyModifier() !== null && accountMost("bestFloor") >= ascendFirstFloor; } },

  { id: "towers", tab: "travel", title: "Other towers",
    text: "Another class's tower has stronger monsters, pays more experience and holds six trophies, kept for good. A class enters it after its next fall.",
    when: tabIs("travel") },

  { id: "relics", tab: "inventory", title: "Relics",
    text: "A relic changes how the run plays, and lasts until you fall. The boss of every " + relicBossEvery + "th floor carries one, and now and then a rare monster does.",
    when: function () { return ownedRelics.length > 0 || accountMost("bestFloor") >= relicBossEvery; } },

  // ----- The long climb -----
  { id: "walls", tab: "travel", title: "Walls",
    text: "At floors " + wallFloorsText() + " every monster becomes much stronger. Perks, the blacksmith, ascending and trophies from other towers are the way through.",
    when: function () { return accountMost("bestFloor") >= towerWalls[0].floor; } },

  { id: "stuck", tab: "travel", title: "Stuck on a floor",
    text: "The Towers tab suggests which tower to challenge next. Its trophy makes this class stronger for good.",
    when: function () { return isStuck(); } },

  { id: "keystones", tab: "milestones", title: "Keystones",
    text: "A keystone changes a rule of how you fight, and costs something. Taking one is your choice, and you can let it go again.",
    when: function () { return keystoneReached(); } },

  { id: "legend", tab: "legend", title: "Legend",
    text: "A class that reaches floor " + legendFloor + " can become a legend and climb the whole tower again. It is paid legend marks, which open new things for every class.",
    when: tabIs("legend") },

  { id: "secondWeapon", tab: "town", title: "Second weapon",
    text: "Pick a second weapon at the blacksmith. It is drawn when a boss appears and put away when it falls.",
    when: function () { return legendLevel("secondWeapon") > 0; } },

  { id: "secondClimber", tab: "tower", title: "The Second Climber",
    text: "Pick another class in the line above the fight. It climbs its own tower by itself while you play.",
    when: function () { return legendLevel("secondClimber") > 0; } },

  // ----- Always last: it waits until nothing else does -----
  { id: "guide", tab: "save", title: "Tips and the Guide",
    text: "A short tip like this one appears when you reach something new. Every tip you have seen is kept in the Guide, under the game's name.",
    when: function () { return seenTips.length >= guideAfter || oldSaveFilled; } }
];

// The "guide" tip waits until this many tips have been seen, so that a new player has
// something to find in the Guide when it is pointed out
const guideAfter = 4;

// The seconds of quiet between closing one tip and showing the next
const tipRest = 5;

// The tips the account has seen, by id. SAVED, for all classes together (game/save.js).
let seenTips = [];

// True when the save was made before tips existed (set by loadGame). Not saved.
let tipsAreNew = false;

// True once such a save has had its tips marked seen without a word (see checkTips).
// It lets the "guide" tip show even to an old save that had reached almost nothing.
let oldSaveFilled = false;

// Whether tips are shown at all. A setting of this device (game/feel.js).
let tipsOn = true;

// The tip on the card right now, or null. Not saved: after a reload the first waiting
// tip is simply found again.
let shownTip = null;

// No tip is shown before this moment (a time from Date.now())
let tipRestUntil = 0;

// A "when" for a tip about a tab: true once that tab has opened. tabUnlocks in
// game/feel.js stays the one place that says when a tab opens.
function tabIs(name) {
  return function () {
    return tabIsOpen(name);
  };
}

// "35, 50, 75 and 100", from towerWalls in data.js
function wallFloorsText() {
  let words = "";
  for (let i = 0; i < towerWalls.length; i++) {
    if (i > 0) {
      words = words + (i === towerWalls.length - 1 ? " and " : ", ");
    }
    words = words + towerWalls[i].floor;
  }
  return words;
}

// Has any class reached the first keystone milestone? (allMilestones is the list of the
// class being played, and every class has its keystones on the same floors.)
function keystoneReached() {
  for (let milestone of allMilestones()) {
    if (milestone.keystones === true) {
      return accountMost("bestFloor") >= milestone.floor;
    }
  }
  return false;
}

// The first tip in the list that is true and has not been seen, or null
function waitingTip() {
  for (let tip of tips) {
    if (!seenTips.includes(tip.id) && tip.when()) {
      return tip;
    }
  }
  return null;
}

// Marks as seen, without showing them, every tip that is true right now.
// keep: the id of one tip to leave alone (or "").
function seeTipsQuietly(keep) {
  for (let tip of tips) {
    if (tip.id !== keep && !seenTips.includes(tip.id) && tip.when()) {
      seenTips.push(tip.id);
    }
  }
}

// RUNS EVERY TIME THE PAGE IS SHOWN (updateScreen), and from nowhere else: while the
// second climber takes its turns the game's numbers belong to another class.
// It may run any number of times. With a tip on the card it only redraws the card, and
// with none it looks for one.
function checkTips() {
  if (backgroundClimb) {
    return;
  }

  // A save from before tips has reached a great deal already. Twenty tips in a row would
  // bury the player, so all of it is marked seen without a word. Only "guide" is left:
  // an old player gets ONE tip, which says where the rest can be read.
  if (tipsAreNew) {
    tipsAreNew = false;
    oldSaveFilled = true;
    seeTipsQuietly("guide");
  }

  // Switched off in Settings: nothing is shown, and what is reached goes straight to the Guide
  if (!tipsOn) {
    shownTip = null;
    seeTipsQuietly("");
    showTip();
    return;
  }

  // One thing at a time: never while a big moment is on the page or waiting, never while
  // time away is played through, and not straight after the last tip
  if (shownTip === null && moments.length === 0 && !catchingUp && Date.now() >= tipRestUntil) {
    shownTip = waitingTip();

    // (on a phone the tab bar scrolls sideways, and the tab may be out of sight)
    if (shownTip !== null && tabIsOpen(shownTip.tab)) {
      document.getElementById("tab-" + shownTip.tab).scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  showTip();
}

// Is there somewhere for "Show me" to go? Only to a tab the player can open and is not
// already looking at.
function tipCanGo(tip) {
  return tabIsOpen(tip.tab) && document.body.dataset.tab !== tip.tab;
}

// Draws the card from shownTip. Changes nothing in the game.
function showTip() {
  let box = document.getElementById("tip");
  let hidden = shownTip === null || moments.length > 0 || catchingUp;
  box.hidden = hidden;

  // style.css leaves room under the page for the card, so that it never covers the last row
  document.body.classList.toggle("tip-showing", !hidden);

  for (let name of tabNames) {
    document.getElementById("tab-" + name).classList.toggle("fresh", !hidden && shownTip.tab === name && tipCanGo(shownTip));
  }
  if (hidden) {
    return;
  }

  document.getElementById("tip-title").textContent = shownTip.title;
  document.getElementById("tip-text").textContent = shownTip.text;
  document.getElementById("tip-go").hidden = !tipCanGo(shownTip);
}

// The player pressed one of the card's two buttons. go = true is "Show me".
// Pressed twice, or with no tip showing, it does nothing.
function closeTip(go) {
  if (shownTip === null) {
    return;
  }
  let tip = shownTip;
  shownTip = null;
  if (!seenTips.includes(tip.id)) {
    seenTips.push(tip.id);
  }
  tipRestUntil = Date.now() + tipRest * 1000;

  // (the one place outside the tab buttons that changes the tab. It IS the player's own
  // press, on a button that says where it goes: see the rule in game/page-show.js.)
  if (go && tipCanGo(tip)) {
    showTab(tip.tab);
  }
  updateScreen();
  saveGame();
}

// ----- The Guide window -----
// Every tip the account has seen, under the name of its tab, in the order of the tabs.
// A tip not reached yet is not listed, so the Guide never spoils what is ahead.
// Built fresh each time it is opened.
function openGuide() {
  let box = document.getElementById("guide-list");
  box.innerHTML = "";
  let count = 0;

  for (let name of tabNames) {
    let headed = false;

    for (let tip of tips) {
      if (tip.tab !== name || !seenTips.includes(tip.id)) {
        continue;
      }
      count = count + 1;

      // The heading is the word on the tab's own button: "Fight", "Hero", "Items"...
      if (!headed) {
        let heading = document.createElement("h3");
        heading.className = "guide-tab";
        heading.textContent = document.getElementById("tab-" + name).textContent;
        box.appendChild(heading);
        headed = true;
      }

      let title = document.createElement("p");
      title.className = "row-title";
      title.textContent = tip.title;
      box.appendChild(title);

      let text = document.createElement("p");
      text.className = "note guide-text";
      text.textContent = tip.text;
      box.appendChild(text);
    }
  }

  document.getElementById("guide-count").textContent = count === 0
    ? "Nothing here yet. A tip is kept here once you have seen it."
    : count + " of " + tips.length + " tips. The rest appear as you climb.";
  document.getElementById("guide").hidden = false;
}

function closeGuide() {
  document.getElementById("guide").hidden = true;
}

// The Settings switch
function setTips(on) {
  tipsOn = on;
  saveSettings();
  showSettings();
  updateScreen();
}
