// =====================================================================
//  game/page-show.js - Showing things on the page, every second: tabs, rows, goals, equipment cards.
// =====================================================================

// ----- Showing things on the page -----
// The page has tabs: Character, Skills, Town and so on. Only one is open at a time.
// style.css shows the page whose name matches body's data-tab.
// THE LAYOUT (style.css, "The layout"): the fight is always at the top of the screen in
// a short form, the open tab's page is under it, and on a phone the groups of tabs are a
// bar along the bottom (tabGroups). "tower" is the Fight tab: the whole fight, the boons
// and the log. A wide screen has no Fight tab: the fight fills the screen, and a tab
// opens as a window over it ("The arena" in style.css; pressTab closes it again).
// Anything waiting to be done is also a button in the fight (waitingThings).
// The width from which the fight and a page stand side by side (the same as in style.css)
const wideScreen = "(min-width: 1000px)";

// ON A PHONE the eleven tabs did not fit on the bar, and the last five were off its edge.
// So a phone's bar holds these groups instead, and the tabs of the open group are a row
// of small buttons at the top of the page. A wide screen shows every tab, as before.
// A group shows once any of its tabs has opened, and has a dot if any of its tabs has.
// TO ADD A TAB: put it in tabNames and in one group here.
const tabGroups = [
  { name: "Fight", icon: "⚔️", tabs: ["tower"] },
  { name: "Hero", icon: "🧍", tabs: ["character", "inventory", "skills"] },
  { name: "Town", icon: "🏘️", tabs: ["town", "travel"] },
  { name: "Grow", icon: "⭐", tabs: ["milestones", "ascension", "legend"] },
  { name: "Friends", icon: "👥", tabs: ["friends"] },
  { name: "Settings", icon: "⚙️", tabs: ["save"] }
];

// The tab each group opened last, so that coming back to a group finds the same page
let groupTabs = {};

function groupOf(name) {
  return tabGroups.find(function (group) { return group.tabs.includes(name); });
}

// Pressing a group: a tab of it with a dot, or else the one it showed last
function showGroup(group) {
  let open = group.tabs.filter(tabIsOpen);
  let waiting = open.find(function (name) { return document.getElementById("tab-" + name).classList.contains("alert"); });
  showTab(waiting || groupTabs[group.name] || open[0]);
}

// Which groups show, which is open and which have a dot, and which tabs are in the row
function showGroups() {
  let current = groupOf(openTab);
  groupTabs[current.name] = openTab;

  for (let group of tabGroups) {
    let button = document.getElementById("group-" + group.name);
    let open = group.tabs.filter(tabIsOpen);
    button.hidden = open.length === 0;
    button.classList.toggle("open", group === current);
    button.classList.toggle("alert", open.some(function (name) { return document.getElementById("tab-" + name).classList.contains("alert"); }));
  }

  // (a group with one tab open has no row: its button says it all)
  let rowShown = current.tabs.filter(tabIsOpen).length > 1;
  for (let name of tabNames) {
    document.getElementById("tab-" + name).classList.toggle("in-group", rowShown && current.tabs.includes(name));
  }
}

const tabNames = ["tower", "character", "inventory", "skills", "town", "travel", "milestones", "ascension", "legend", "friends", "save"];

// ON A WIDE SCREEN THE FIGHT IS THE WHOLE SCREEN, and a tab opens over it as a
// window (style.css, "The arena"). "tower" is then no window at all. Pressing the tab
// of the window that is open closes it, as its ✕ does.
function pressTab(name) {
  if (name === openTab && name !== "tower" && window.matchMedia(wideScreen).matches) {
    name = "tower";
  }
  showTab(name);
}

function showTab(name) {
  if (!tabIsOpen(name)) {
    name = "tower";
  }
  document.body.dataset.tab = name;

  for (let tabName of tabNames) {
    document.getElementById("tab-" + tabName).classList.toggle("open", tabName === name);
  }

  // (the Bestiary is only drawn while its tab is open, so draw it now)
  if (name === "inventory") {
    showBestiary();
  }

  // The tab is remembered, so that reloading the page does not throw you back to the first one
  openTab = name;
  saveSettings();
  showGroups();

  // (a tip's "Show me" button and the outline on its tab depend on the tab on screen)
  showTip();
}

// NOTHING IN THE GAME CHANGES THE TAB BY ITSELF. Only the player does, by pressing a
// tab button. Whatever happens in the tower (a death, a boss, an upgrade, a
// level) shows as a dot on a tab or a pop-up in the fight, and never moves the player
// off the page they are reading. Keep it that way: do not call showTab from game code.
// (A tip's "Show me" button does call it, in closeTip in game/tips.js. That is the
// player's own press on a button that says where it goes.)

// Puts a small dot on a tab when something there needs the player's attention
function markTab(name, needsAttention) {
  document.getElementById("tab-" + name).classList.toggle("alert", needsAttention);
  showGroups();
}

// Adds a line to the top of the combat log
function say(text) {
  // No point keeping thousands of lines while catching up on time away
  if (catchingUp) {
    return;
  }

  logLines.unshift(text);
  if (logLines.length > maxLogLines) {
    logLines.pop();
  }
}

function showLog() {
  let box = document.getElementById("log");
  box.innerHTML = "";

  for (let line of logLines) {
    let row = document.createElement("p");
    row.textContent = line;
    box.appendChild(row);
  }
}

function timeText(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return hours + "h " + minutes + "m";
  }
  if (minutes === 0) {
    return Math.round(seconds) + "s";
  }
  return minutes + "m";
}

function closeAwayReport() {
  document.getElementById("away-report").hidden = true;
}

function showClassButtons() {
  for (let className in classes) {
    let button = document.getElementById("class-" + className);

    // A class still to be opened with legend marks has no button yet
    button.hidden = !classIsOpen(className);

    button.classList.toggle("chosen", className === playerClass);
  }
  showHeroStrip();
}

// The list of upgrades collected this run. It stays on the page under the fight,
// so there is all the time in the world to read it. Rebuilt only when it changes.
let upgradesShown = "";

function showUpgrades() {
  document.getElementById("upgrade-boost").textContent = "+" + percent(upgradeBoost() - 1);

  let key = playerClass + JSON.stringify(upgrades);
  if (key === upgradesShown) {
    return;
  }
  upgradesShown = key;

  let box = document.getElementById("upgrades");
  box.innerHTML = "";

  let held = 0;
  for (let upgrade of currentClass().upgrades) {
    if (upgradeLevel(upgrade.id) === 0) {
      continue;
    }
    held = held + upgradeLevel(upgrade.id);

    let firstWord = Object.keys(upgrade.bonus || upgrade.multiply || {})[0];
    let badge = makeBadge(upgrade.icon || boonIcons[firstWord] || "✦", upgrade.name, upgradeLevel(upgrade.id), upgrade.text + " per level");
    badge.classList.toggle("other-kind", !fitsBuild(upgrade));
    box.appendChild(badge);
  }

  document.getElementById("upgrade-count").textContent = held;
  document.getElementById("upgrades-empty").hidden = held > 0;
}

// A skill's text says what ONE level gives ("+3% health and +1.5% attack"). This
// writes what a number of levels give, by multiplying every number in it, except one
// straight after "every" ("for every 10% of your health that is missing" stays 10%).
// So TO ADD A SKILL: write its text for one level, as the others are.
function scaledSkillText(text, times) {
  return text.replace(/(every )?(\d+(?:\.\d+)?)/g, function (whole, every, number) {
    if (every !== undefined) {
      return whole;
    }
    return String(Math.round(Number(number) * times * 100) / 100);
  });
}

// A TEXT FOR ONE WEAPON. A description that begins with the name of one of the class's
// weapons or elements ("Rune Tome: +10% chance to cast twice") only works with that one.
// The page shows that name as a small tag in front of the words (kindTag), and dims the
// whole thing while the class is using another (the class "other-kind" in style.css).
// Nothing more is written about it: the tag and the dimming say it.
// So TO ADD ONE: begin its text with the weapon's or element's name and a colon, as the
// others do. That is also how the balance bot knows which build a perk is for.
function textParts(text) {
  let kinds = buildKinds();
  for (let id in kinds) {
    if (text.startsWith(kinds[id] + ": ")) {
      return { kind: id, name: kinds[id], words: text.slice(kinds[id].length + 2) };
    }
  }
  return { kind: "", name: "", words: text };
}

// Is this text for a weapon or element the class is not using right now?
function forOtherKind(text) {
  let kind = textParts(text).kind;
  return kind !== "" && kind !== kindInHand();
}

// The small tag with a weapon's or element's name
function kindTag(name) {
  let tag = document.createElement("span");
  tag.className = "kind-tag";
  tag.textContent = name;
  return tag;
}

// Fills an element with a text's tag and words, and anything after the words
function writeWithTag(element, text, after) {
  let parts = textParts(text);
  element.replaceChildren(parts.words + (after || ""));
  if (parts.name !== "") {
    element.prepend(kindTag(parts.name));
  }
}

function showSkills() {
  document.getElementById("skill-points").textContent = skillPointsLeft();

  // Resetting is free and can be done at any time. The button is greyed out only
  // when there is nothing to give back.
  document.getElementById("reset-skills-btn").disabled = skillPointsSpent() === 0;

  // The x1 / x10 / Max buttons, and the saved build
  showFavourite("skill-amount-buttons", "skill-amount-" + skillBuyAmount);
  document.getElementById("apply-build-btn").disabled = !hasSavedBuild() || skillPointsLeft() < 1;
  document.getElementById("auto-build-box").checked = autoBuild;
  document.getElementById("auto-build-box").disabled = !hasSavedBuild();

  let recipe = [];
  for (let skill of currentClass().skills) {
    if (savedBuild[skill.id] !== undefined) {
      recipe.push(skill.name + " " + savedBuild[skill.id]);
    }
  }
  if (recipe.length === 0) {
    document.getElementById("saved-build-note").textContent = "No build saved yet. Spend your points how you like, then save.";
  } else {
    document.getElementById("saved-build-note").textContent = "Saved: " + recipe.join(", ") + ". Points are shared out in these proportions.";
  }

  // A class can have something to say at the top of its skills
  let noteBox = document.getElementById("skills-note");
  noteBox.hidden = currentClass().skillsNote === undefined;
  if (currentClass().skillsNote !== undefined) {
    noteBox.textContent = currentClass().skillsNote();
  }

  // The stance picker is hidden for a class without stances
  let stances = currentClass().stances;
  document.getElementById("stance").hidden = stances === undefined;
  if (stances !== undefined) {
    document.getElementById("stance-label").textContent = currentClass().stanceLabel + " · " + stances[stance].name;
    document.getElementById("stance-note").textContent = stances[stance].text;
    showFavourite("stance-buttons", "stance-" + stance);
  }

  for (let skill of currentClass().skills) {
    let cost = skillCostOf(skill);
    let price = cost + " points";
    if (cost === 1) {
      price = "1 point";
    }

    // The rank the skill has, and when the next one comes
    let rank = skillRank(skill.id);
    let nextRankAt = (rank + 1) * skillRankSize;
    let title = skill.name + " · level " + skillLevel(skill.id);
    let rankNote = " Rank " + (rank + 1) + " at level " + nextRankAt + ": the whole skill +" + percent(skillRankPower) + " stronger, and its levels cost 1 point more.";
    if (rank > 0) {
      title = title + " · rank " + rank + " (x" + big(skillRankBoost(skill.id)) + ")";
    }

    // The short line: all it gives now (or what one level gives, before the first).
    // Behind the "?": one level's worth, and the next rank. (Skills have no top level.)
    // (no weapon tag: a skill's name says which weapon it is for. Dimmed while unused.
    // Nor the name of a class's own mechanic when the skill is named after it: "Rage: ...")
    let words = textParts(skill.text).words;
    let mechanic = words.indexOf(": ");
    if (mechanic > 0 && skill.name.includes(words.slice(0, mechanic))) {
      words = words.slice(mechanic + 2);
    }
    let strength = skillLevel(skill.id) * skillRankBoost(skill.id);
    let short = strength > 0 ? scaledSkillText(words, strength) : words + " a level";
    fillRow("skill-" + skill.id, title, short, price, skillPointsLeft() < cost, "Each level: " + words + "." + rankNote);
    document.getElementById("skill-" + skill.id).closest(".row").classList.toggle("other-kind", forOtherKind(skill.text));
  }
}

function showMilestones() {
  // A new breakthrough appears on the list each time one is reached
  if (document.getElementById("milestones").children.length !== allMilestones().length) {
    buildMilestones();
  }

  for (let milestone of allMilestones()) {
    let unlocked = bestFloor >= milestone.floor;

    let title = "Floor " + milestone.floor;
    if (milestone.keystones === true) {
      title = title + " · ★ keystone";
    }
    if (!unlocked) {
      title = title + " · locked";
    } else if (milestone.keystones === true && chosenPerks[milestone.floor] === undefined) {
      title = title + " · pick one, or none";
    } else if (chosenPerks[milestone.floor] === undefined) {
      title = title + " · pick one";
    }
    document.getElementById("milestone-" + milestone.floor).textContent = title;

    for (let perk of milestone.perks) {
      let button = document.getElementById("perk-" + milestone.floor + "-" + perk.id);
      button.disabled = !unlocked;
      button.classList.toggle("other-kind", forOtherKind(perk.text));
      button.classList.toggle("chosen", chosenPerks[milestone.floor] === perk.id);
    }
  }
}

// Highlights the button of the current favourite in one of the pickers
function showFavourite(boxId, favouriteButtonId) {
  for (let button of document.getElementById(boxId).children) {
    if (button.id === favouriteButtonId) {
      button.className = "chosen";
    } else {
      button.className = "";
    }
  }
}

// A text cut after its first sentence: { first: "+10% penetration.", rest: "Penetration cuts..." }
// (so in a list of things to buy, the first sentence should say what it gives)
function firstSentence(text) {
  let end = text.indexOf(". ");
  if (end === -1) {
    return { first: text, rest: "" };
  }
  return { first: text.slice(0, end + 1), rest: text.slice(end + 2) };
}

function showTown() {
  for (let item of townUpgrades) {
    let name = "town-" + item.id;
    let price = big(townCost(item)) + " gold";

    // The first sentence of its text is the short line, and the rest is behind the "?"
    let parts = firstSentence(item.text);

    // The helpers are bought once. Everything else can be bought forever.
    if (townUpgradeIsMaxed(item)) {
      fillRow(name, item.name, parts.first, "Owned", true, parts.rest);
    } else if (item.maxLevel === 1) {
      fillRow(name, item.name, parts.first, price, bank < townCost(item), parts.rest);
    } else {
      fillRow(name, item.name + " · level " + townLevel(item.id), parts.first, price, bank < townCost(item), parts.rest);
    }
  }

  // The Tactician's list only appears once he has been hired. Every boon says what it
  // does, and one that needs another weapon says so: a boss never gives it meanwhile.
  document.getElementById("favourite-upgrade").hidden = totalBonus("favouriteUpgrade") < 1;
  fillRow("favourite-upgrade-", "No favourite", "Every boss gives a boon picked at random from the ones that suit your weapon.", favouriteUpgrade === "" ? "Chosen" : "Choose", favouriteUpgrade === "");
  document.getElementById("favourite-upgrade-").className = favouriteUpgrade === "" ? "chosen" : "";

  let favouriteNote = "Bosses give your favourite every time. Each level of a boon also gives +" + percent(bossUpgradePower) + " attack and health.";
  for (let upgrade of currentClass().upgrades) {
    let chosen = favouriteUpgrade === upgrade.id;
    let parts = textParts(upgrade.text);
    // (a boon for another weapon is dimmed; one thing is worth saying: what happens meanwhile)
    if (!fitsBuild(upgrade) && chosen) {
      favouriteNote = "While you use the " + buildKinds()[kindInHand()] + ", bosses give a random boon in place of " + upgrade.name + ".";
    }
    fillRow("favourite-upgrade-" + upgrade.id, upgrade.name, parts.words + " per level", chosen ? "Chosen" : "Choose", chosen, "", parts.name);
    document.getElementById("favourite-upgrade-" + upgrade.id).className = chosen ? "chosen" : "";
    document.getElementById("favourite-upgrade-" + upgrade.id).closest(".row").classList.toggle("other-kind", !fitsBuild(upgrade));
  }
  document.getElementById("favourite-upgrade-note").textContent = favouriteNote;

  // The one line on the Town tab: which boon is the favourite, and whether it is being given
  let favourite = currentClass().upgrades.find(function (upgrade) { return upgrade.id === favouriteUpgrade; });
  if (favourite === undefined) {
    document.getElementById("favourite-upgrade-name").textContent = "none";
    document.getElementById("favourite-upgrade-now").textContent = "Every boss gives a boon picked at random from the ones that suit your weapon. The Tactician can make it the same one every time.";
  } else {
    document.getElementById("favourite-upgrade-name").textContent = favourite.name;
    document.getElementById("favourite-upgrade-now").textContent = fitsBuild(favourite) ? textParts(favourite.text).words + " per level, from every boss." : favouriteNote;
  }

  showBlacksmith();

  document.getElementById("potions").textContent = potions + " / " + potionLimit();
  document.getElementById("potion-btn").textContent = big(potionCost()) + " gold";
  document.getElementById("potion-btn").disabled = potionRoom() === 0 || bank < potionCost();

  // What this run has drunk takes up room on the belt until the fall (see potionRoom)
  let beltNote = "";
  if (potionsDrunk > 0) {
    let beltTakes = potionLimit() - potionsDrunk;
    beltNote = " " + potionsDrunk + " drunk this run: the belt takes " + (beltTakes > 0 ? "only " + beltTakes : "no more") + " until you fall, and can be filled again after that.";
  }
  document.getElementById("potion-run-note").textContent = beltNote;
  document.getElementById("keep-potions-box").checked = keepPotions;
  document.getElementById("potion-price-note").textContent = "The price rises by " + potionPrice + " gold for every " + potionPriceFloors + " floors of your best since ascending (" + ascensionBest + ").";
}

// What a piece of equipment gives at a step: "+12 attack" or "+6 armor"
function gearStat(slot, step) {
  if (slot === "weapon") {
    return "+" + big(forgePower(slot, step)) + " attack";
  }
  return "+" + big(forgePower(slot, step)) + " armor";
}

// Can the blacksmith's next step for either piece be paid for?
function canAffordForge() {
  return bank >= forgeCostOf("weapon") || bank >= forgeCostOf("armor");
}

function showBlacksmith() {
  for (let slot of ["weapon", "armor"]) {
    let step = forgeLevel(slot);
    let note = gearStat(slot, step) + ". Next: " + gearName(slot, step + 1) + ", " + gearStat(slot, step + 1) + ".";

    fillRow("forge-" + slot, slotLabel(slot) + " · " + gearName(slot, step), note, big(forgeCostOf(slot)) + " gold", bank < forgeCostOf(slot));
    document.getElementById("forge-" + slot + "-title").className = "row-title rarity-" + Math.min(5, tierOfStep(step));
  }

  document.getElementById("forge-all").disabled = !canAffordForge();

  // The boss weapon: only with the legend unlock, and only for a class with a choice
  document.getElementById("boss-weapon-picker").hidden = totalBonus("secondWeapon") < 1 || Object.keys(buildKinds()).length < 2;
  showFavourite("boss-weapon-buttons", "boss-weapon-" + bossWeapon);

  // Named weapons: one button each, and one for none. Made again only when another is won.
  let named = namedWeaponsWon();
  let namedBox = document.getElementById("named-buttons");
  document.getElementById("named-picker").hidden = named.length === 0;
  if (namedBox.dataset.shown !== playerClass + named.length) {
    namedBox.dataset.shown = playerClass + named.length;
    namedBox.innerHTML = "";
    addFavouriteButton(namedBox, "named-", "None", function () {
      wieldNamedWeapon("");
    });
    for (let trophy of named) {
      addFavouriteButton(namedBox, "named-" + trophy.id, trophy.weapon, function () {
        wieldNamedWeapon(trophy.id);
      });
    }
  }
  showFavourite("named-buttons", "named-" + namedWeapon);
  if (wieldedTrophy() === null) {
    document.getElementById("named-note").textContent = "You are fighting with your forged weapon. A named weapon keeps the blacksmith's work, and only the one you wield gives its power.";
  } else {
    document.getElementById("named-note").textContent = wieldedTrophy().text + ". Only the named weapon you wield gives its power.";
  }

  // A class with stances picks its element here (and on the Skills tab): it changes at once
  if (currentClass().stances !== undefined) {
    document.getElementById("weapon-picker").hidden = false;
    showFavourite("weapon-buttons", "weapon-" + stance);
    document.getElementById("weapon-picker-note").textContent = currentClass().stances[stance].text + " Damage: " + typeNames(currentClass().damageTypes()) + ". Picking another changes it at once.";
    return;
  }

  // A class with only one kind of gear has nothing to pick between
  document.getElementById("weapon-picker").hidden = Object.keys(currentClass().gearTypes).length < 2;
  showFavourite("weapon-buttons", "weapon-" + nextWeapon);

  // What the picked kind does. The class's own description is written for the gear
  // being used, so this borrows it by pretending for a moment to use the picked one.
  let using = weapon;
  weapon = nextWeapon;
  let effect = textParts(currentClass().gearInfo()).words + " Damage: " + typeNames(currentClass().damageTypes()) + ".";
  weapon = using;

  let types = currentClass().gearTypes;
  if (nextWeapon === weapon) {
    document.getElementById("weapon-picker-note").textContent = effect + " Picking another kind changes it after your next fall, and the blacksmith's work carries over.";
  } else {
    document.getElementById("weapon-picker-note").textContent = effect + " You are still fighting with the " + types[weapon] + ": the change is made after your next fall.";
  }
}

// A sentence for the tower list: how well the damage this class is dealing RIGHT NOW
// (with the gear and stance it has) does against the monsters of a tower
function towerMatchup(towerName) {
  let types = currentClass().damageTypes();
  let place = towers[towerName];
  let match = towerMatch(towerName);
  let note = "Against your " + typeNames(types) + " damage: " + percent(match.resisted) + " of it is resisted here and " + percent(match.weak) + " hits a weakness.";
  if (place.ward !== undefined) {
    note = note + " Its monsters are warded against spells.";
  }
  if (place.lunge === true) {
    note = note + " Its beasts strike first, unless you fight from range.";
  }
  return note;
}

function showTowers() {
  // The suggested challenge, in a line above the list and marked on its row
  let idea = suggestedChallenge();
  let ideaBox = document.getElementById("tower-suggestion");
  ideaBox.hidden = idea === null;
  if (idea !== null) {
    let match = towerMatch(idea.tower);
    ideaBox.textContent = (isStuck() ? "Floor " + bestFloor + " is holding at home. " : "") + "Suggested challenge: " + towers[idea.tower].name
      + ". Your damage does best there (" + percent(match.weak) + " hits a weakness, " + percent(match.resisted) + " is resisted), and floor "
      + idea.trophy.floor + " wins " + idea.trophy.name + ": " + idea.trophy.text + ".";
  }

  for (let towerName in towers) {
    let place = towers[towerName];
    let name = "tower-" + towerName;

    let title = place.icon + " " + place.name + " · " + classes[towerName].name + "'s tower";
    if (towerName === playerClass) {
      title = place.icon + " " + place.name + " · your home tower";
    }
    if (idea !== null && idea.tower === towerName) {
      title = title + " · suggested";
    }

    let best = 0;
    if (towerBest[towerName] !== undefined) {
      best = towerBest[towerName];
    }
    // One line each (style.css keeps the line breaks). A short row: the place, how your
    // damage does there, and the next trophy. The rule and every trophy are behind
    // "All trophies" (game/tidy.js), or the tab was a wall of text.
    let open = towersOpen[towerName] === true;
    // (what the place is like is behind the row's "?")
    let text = "Your best floor here: " + best + ".";
    let about = place.text;
    let more = document.getElementById(name + "-more");
    more.hidden = towerName === playerClass;

    if (towerName === playerClass) {
      about = about + " Your home tower: no rule against you, and its trophies are for the other classes to win.";
    } else {
      let won = place.trophies.filter(function (trophy) { return trophies.includes(trophy.id); }).length;
      let next = place.trophies.find(function (trophy) { return !trophies.includes(trophy.id); });
      more.textContent = open ? "Hide the trophies" : "All trophies (" + won + " of " + place.trophies.length + " won)";
      if (!open) {
        text = text + "\n" + (next === undefined ? "Every trophy here is won." : "Next trophy · floor " + next.floor + " · " + next.name + ": " + next.text);
      } else {
        text = text + " " + towerMatchup(towerName);
        if (place.awayRule !== undefined) {
          text = text + "\nRule for challengers · " + place.awayRule.name + ": " + place.awayRule.text + ".";
        }
        for (let trophy of place.trophies) {
          let mark = trophies.includes(trophy.id) ? "✓ won" : "floor " + trophy.floor;
          text = text + "\n" + mark + " · " + trophy.name + ": " + trophy.text;
        }
      }
    }

    let button = document.getElementById(name);
    button.className = "";

    if (towerName === tower && towerName === nextTower) {
      fillRow(name, title, text, "You are here", true, about);
      button.className = "chosen";
    } else if (towerName === nextTower) {
      fillRow(name, title, text, "Entering after you fall", true, about);
      button.className = "chosen";
    } else if (towerName === tower) {
      fillRow(name, title, text, "Stay here", false, about);
    } else {
      fillRow(name, title, text, "Enter next run", false, about);
    }
  }
}

// What a fame upgrade has added up to so far, for example "x1.95 attack"
function fameEffectText(item) {
  let parts = [];

  if (item.multiply !== undefined) {
    for (let stat in item.multiply) {
      // Small multipliers keep two decimals (x1.25); huge ones use the short form
      let times = Math.pow(item.multiply[stat], fameLevelInEffect(item.id));
      if (times < 1000) {
        parts.push("x" + Math.round(times * 100) / 100 + " " + stat);
      } else {
        parts.push("x" + big(times) + " " + stat);
      }
    }
  }
  if (item.add !== undefined) {
    for (let stat in item.add) {
      // Shares like 0.1 are written as 10%
      let amount = item.add[stat] * fameLevel(item.id);
      if (item.addAsPercent) {
        parts.push(percent(amount) + " " + item.addLabel);
      } else {
        parts.push("+" + amount + " " + item.addLabel);
      }
    }
  }

  return parts.join(", ");
}

// For example "34 fame in 1h 12m (28.3 an hour)"
function fameRateText(fameEarned, seconds) {
  if (seconds < 60) {
    return big(fameEarned) + " fame so far";
  }
  return big(fameEarned) + " fame in " + timeText(seconds) + " (" + big(fameEarned / (seconds / 3600)) + " an hour)";
}

// A sentence to help decide when to ascend. Fame per hour falls the longer an
// ascension lasts; once it drops below the last ascension's, starting again is
// usually the faster way to earn fame.
function ascendAdvice() {
  if (!canAscend()) {
    return "";
  }
  if (ascensions === 0) {
    return "Your first ascension: the fame it pays buys upgrades that make every class's next climb faster.";
  }
  if (ascensionSeconds < 600 || lastAscensionSeconds < 600) {
    return "";
  }

  let now = ascensionFame / (ascensionSeconds / 3600);
  let last = lastAscensionFame / (lastAscensionSeconds / 3600);
  if (now < last * 0.9) {
    return "Fame is coming in slower than in your last ascension (" + big(now) + " an hour, against " + big(last) + "). Ascending now is probably faster.";
  }
  return "Fame is still coming in about as fast as in your last ascension (" + big(now) + " an hour, against " + big(last) + "), so pushing on is fine.";
}

function showAscension() {
  document.getElementById("fame-owned").textContent = big(fame);
  document.getElementById("this-ascension").textContent = fameRateText(ascensionFame, ascensionSeconds);
  if (ascensions === 0) {
    document.getElementById("last-ascension").textContent = "none yet";
  } else {
    document.getElementById("last-ascension").textContent = fameRateText(lastAscensionFame, lastAscensionSeconds);
  }
  document.getElementById("ascensions").textContent = ascensions;
  document.getElementById("account-ascensions").textContent = totalAscensions();
  document.getElementById("ascension-best").textContent = ascensionBest;
  document.getElementById("catch-up-count").textContent = ascensions;
  document.getElementById("catch-up-share").textContent = percent(fameCatchUpShare);
  document.getElementById("ascend-floor").textContent = ascendFloorNeeded();

  document.getElementById("ascend-advice").textContent = ascendAdvice();

  let button = document.getElementById("ascend-btn");
  if (canAscend()) {
    button.textContent = "Ascend";
    button.disabled = false;
  } else {
    button.textContent = "Ascend (reach floor " + ascendFloorNeeded() + " first)";
    button.disabled = true;
  }

  for (let item of fameUpgrades) {
    let name = "fame-" + item.id;

    // A locked upgrade shows only when it will appear
    if (!fameUpgradeIsUnlocked(item)) {
      let when = "Unlocks after " + item.unlockAt + " ascensions, counting every class.";
      if (item.unlockAt === 1) {
        when = "Unlocks after your first ascension, with any class.";
      }
      fillRow(name, item.name, when, "Locked", true);
      continue;
    }

    let title = item.name + " · level " + fameLevel(item.id);
    let note = fameLevel(item.id) > 0 ? "For this class: " + fameEffectText(item) : "Not bought yet";
    let more = item.text;

    // Levels this class has not caught up with yet
    let waiting = fameLevel(item.id) - fameLevelsAtFull(item.id);
    if (waiting > 0) {
      note = note + " (" + waiting + " levels at " + percent(fameCatchUpShare) + ")";
      more = more + " " + fameLevelsAtFull(item.id) + " levels at full power, " + waiting + " at " + percent(fameCatchUpShare) + " until this class ascends more.";
    }

    if (fameUpgradeIsMaxed(item)) {
      fillRow(name, title, note, "Max", true, more);
    } else {
      fillRow(name, title, note, big(fameCost(item)) + " fame", fame < fameCost(item), more);
    }
  }
}

// ----- What to do next -----
// A short list under the tower that tells the player what needs their attention
// and what they are working toward. At most three lines, most urgent first.

// Is there an unlocked milestone with no perk picked yet?
function hasPerkToPick() {
  // (a keystone milestone is optional, so it never nags)
  for (let milestone of allMilestones()) {
    if (bestFloor >= milestone.floor && chosenPerks[milestone.floor] === undefined && milestone.keystones !== true) {
      return true;
    }
  }
  return false;
}

function canBuyFameUpgrade() {
  for (let item of fameUpgrades) {
    if (fameUpgradeIsUnlocked(item) && !fameUpgradeIsMaxed(item) && fame >= fameCost(item)) {
      return true;
    }
  }
  return false;
}

function nextGoals() {
  let goals = [];

  // Stuck at a wall comes first: it is the one line that says what to do differently
  if (isStuck()) {
    let idea = suggestedChallenge();
    goals.push("Floor " + bestFloor + " is holding. Challenge " + towers[idea.tower].name + ": floor " + idea.trophy.floor + " there wins " + idea.trophy.name + " (Towers).");
  }

  // (things waiting to be used are buttons, not lines: see waitingThings)

  // Things to aim for
  if (!canAscend()) {
    goals.push("Reach floor " + ascendFloorNeeded() + " to ascend. Best since your last ascension: " + ascensionBest + ".");
  }
  for (let milestone of allMilestones()) {
    if (bestFloor < milestone.floor) {
      goals.push("Reach floor " + milestone.floor + " to unlock a " + (milestone.keystones === true ? "keystone." : "milestone perk."));
      break;
    }
  }
  if (isAway()) {
    for (let trophy of towers[tower].trophies) {
      if (!trophies.includes(trophy.id)) {
        goals.push("Reach floor " + trophy.floor + " here to win a trophy: " + trophy.name + ".");
        break;
      }
    }
  }

  return goals.slice(0, 3);
}

// THINGS WAITING TO BE DONE. Each one that is true puts a dot on its tab, and a button
// in the fight that opens that tab, so nothing has to be hunted for tab by tab.
// TO ADD ONE: give it a line. "tab" is the tab it is done on, "words" what the button
// says, and "when" is true while it is waiting.
// (Friends sets friendsWaiting itself, in friends.js, after each answer from the server.)
let friendsWaiting = false;

const waitingThings = [
  { tab: "travel", words: function () { return "Stuck? Challenge a tower"; }, when: isStuck },
  { tab: "skills", words: function () { return skillPointsLeft() + (skillPointsLeft() === 1 ? " skill point" : " skill points"); }, when: function () { return skillPointsLeft() > 0; } },
  { tab: "skills", words: function () { return "Empty ability slot"; }, when: hasEmptyAbilitySlot },
  { tab: "milestones", words: function () { return "Pick a perk"; }, when: hasPerkToPick },
  { tab: "legend", words: function () { return "Become a legend"; }, when: canBecomeLegend },
  { tab: "legend", words: function () { return "Legend unlock"; }, when: canBuyLegendUnlock },
  { tab: "ascension", words: function () { return "Ascend"; }, when: canAscend },
  { tab: "ascension", words: function () { return "Fame upgrade"; }, when: canBuyFameUpgrade },
  { tab: "town", words: function () { return "Blacksmith"; }, when: canAffordForge },
  { tab: "friends", words: function () { return "Friends"; }, when: function () { return friendsWaiting; } }
];

// The buttons in the fight, and the dots on the tabs
function showWaiting() {
  let bar = document.getElementById("ready");
  let waiting = waitingThings.filter(function (thing) { return tabIsOpen(thing.tab) && thing.when(); });

  for (let name of tabNames) {
    markTab(name, waiting.some(function (thing) { return thing.tab === name; }));
  }

  // (not redrawn when nothing has changed: a button being pressed must not vanish under the finger)
  let shown = waiting.filter(function (thing) { return thing.tab !== openTab; });
  let words = shown.map(function (thing) { return thing.tab + ":" + thing.words(); }).join("|");
  if (bar.dataset.words === words) {
    return;
  }
  bar.dataset.words = words;
  bar.replaceChildren();
  for (let thing of shown) {
    let button = document.createElement("button");
    button.className = "ready-button";
    button.dataset.icon = document.getElementById("tab-" + thing.tab).dataset.icon;
    button.textContent = thing.words();
    button.onclick = function () {
      showTab(thing.tab);
      showWaiting();
    };
    bar.append(button);
  }
  bar.hidden = shown.length === 0;
}

function showGoals() {
  let box = document.getElementById("goals");
  box.innerHTML = "";

  for (let goal of nextGoals()) {
    let row = document.createElement("p");
    row.textContent = goal;
    box.appendChild(row);
  }

  showWaiting();
}

// HOW THE CLASS STANDS AGAINST THE FLOOR: two bars under the fight.
//   Your damage:  what your turns have been dealing, as a share of an ordinary
//                 monster's health here. A full bar kills in one turn.
//   Their damage: one of its hits, after your armor, as a share of your health.
//                 A full bar is a single hit that kills.
// (An ordinary monster is one whose own numbers are all 1: see ordinaryMonster.)
function showPressure() {
  let ordinary = ordinaryMonster();

  let dealt = damagePerTurn() / ordinary.hp;
  let turns = Math.max(1, Math.ceil(1 / dealt));
  document.getElementById("pressure-damage-bar").style.width = Math.min(100, dealt * 100) + "%";
  document.getElementById("pressure-damage").textContent = dealt >= 1
    ? "kills an ordinary monster here in one turn"
    : percent(dealt) + " of an ordinary monster's health a turn (about " + turns + " turns a kill)";

  let hit = ordinary.attack * (1 - armorShareBlocked()) / damageDivider() * multiplier("damageTaken") / playerMaxHp;
  let hits = Math.max(1, Math.ceil(1 / hit));
  document.getElementById("pressure-danger-bar").style.width = Math.min(100, hit * 100) + "%";
  document.getElementById("pressure-danger").textContent = hit >= 1
    ? "one ordinary hit here kills you"
    : "an ordinary hit takes " + percent(hit) + " of your health (" + hits + " to kill you)";
}

// The relic list is rebuilt only when the relics held change
let relicsShown = "";

function showRelics() {
  let key = playerClass + ownedRelics.join(",") + totalBonus("relicSlots") + "/" + (runStats.secondWinds || 0);
  if (key === relicsShown) {
    return;
  }
  relicsShown = key;

  let box = document.getElementById("relics");
  box.innerHTML = "";
  document.getElementById("relic-count").textContent = ownedRelics.length;
  let slots = totalBonus("relicSlots");
  document.getElementById("relic-slots-note").textContent = slots === 0
    ? "Floor 75 of another class's tower wins a relic slot: a relic you keep when you fall."
    : "You have " + countOf(slots, "relic slot", "relic slots") + ": the first " + countOf(slots, "relic", "relics") + " you claim in a run " + (slots === 1 ? "is" : "are") + " kept when you fall.";
  document.getElementById("relics-empty").hidden = ownedRelics.length > 0;

  // One card for each different relic, saying how many of it are held
  for (let relic of allRelics()) {
    let held = 0;
    for (let id of ownedRelics) {
      if (id === relic.id) {
        held = held + 1;
      }
    }
    if (held === 0) {
      continue;
    }

    let card = document.createElement("div");
    card.className = "item";

    let icon = document.createElement("div");
    icon.className = "item-icon";
    if (relic.icon !== undefined) {
      icon.textContent = relic.icon;
    } else {
      icon.textContent = "💎";
    }
    card.appendChild(icon);

    let text = document.createElement("div");
    text.className = "item-text";

    let label = document.createElement("p");
    label.className = "item-slot";
    label.textContent = relic.legendary === true ? "Legendary relic" : "Relic";
    card.classList.toggle("legendary", relic.legendary === true);
    text.appendChild(label);

    let name = document.createElement("p");
    name.className = "row-title";
    name.textContent = relic.name;
    if (held > 1) {
      let count = document.createElement("span");
      count.className = "item-count";
      count.textContent = "  x" + held;
      name.appendChild(count);
    }
    text.appendChild(name);

    let effect = document.createElement("p");
    effect.className = "item-stats";
    let after = "";
    if (relic.id === "phoenixFeather" && (runStats.secondWinds || 0) >= totalBonus("secondWind")) {
      after = " (used up for this run)";
    }
    if (held > 1) {
      after = " (each)";
    }
    writeWithTag(effect, relic.text, after);
    card.classList.toggle("other-kind", forOtherKind(relic.text));
    text.appendChild(effect);

    card.appendChild(text);
    box.appendChild(card);
  }

  showRunRelics();
}

// A BADGE: a square with a picture, a name under it, and a number in its corner (a
// boon's level, or how many of a relic are held). What it does shows when the badge is
// pointed at, or tapped on a phone (style.css, ".badge"), so the box stays a row of
// pictures instead of a page of sentences.
function makeBadge(icon, name, count, text) {
  let parts = textParts(text);
  let badge = document.createElement("div");
  badge.className = "badge";
  badge.tabIndex = 0;
  badge.dataset.tip = name + (parts.name === "" ? "" : " · " + parts.name) + "\n" + parts.words;
  let picture = document.createElement("span");
  picture.className = "badge-icon";
  picture.textContent = icon;
  let label = document.createElement("span");
  label.className = "badge-name";
  label.textContent = name;
  badge.append(picture, label);
  if (count > 1) {
    let number = document.createElement("span");
    number.className = "badge-count";
    number.textContent = count;
    badge.append(number);
  }
  return badge;
}

// The relics again, as badges in the "This run" box under the fight
function showRunRelics() {
  let box = document.getElementById("run-relics");
  box.replaceChildren();
  for (let relic of allRelics()) {
    let held = ownedRelics.filter(function (id) { return id === relic.id; }).length;
    if (held === 0) {
      continue;
    }
    let badge = makeBadge(relic.icon || "💎", relic.name, held, relic.text + (held > 1 ? " (each)" : ""));
    badge.classList.toggle("legendary", relic.legendary === true);
    badge.classList.toggle("other-kind", forOtherKind(relic.text));
    box.append(badge);
  }
  document.getElementById("run-relic-count").textContent = ownedRelics.length > 0 ? ownedRelics.length : "";
  document.getElementById("run-relics-empty").hidden = ownedRelics.length > 0;
}

function updateScreen() {
  checkTabUnlocks();
  showMoment();
  checkTips();
  showClassButtons();
  showUpgrades();
  showSkills();
  showAbilities();
  showAbilityBar();
  showMilestones();
  showRelics();
  showTown();
  showTowers();
  showAscension();
  showLegend();
  showLastRun();
  showBestiary();
  showGoals();
  showLog();

  // The bar across the top
  document.getElementById("header-icon").textContent = currentClass().icon;
  document.getElementById("header-class").textContent = currentClass().name;
  document.getElementById("header-level").textContent = level;
  document.getElementById("header-level-bar").style.width = Math.min(100, experience / levelCost() * 100) + "%";
  document.getElementById("gold").textContent = big(gold);
  document.getElementById("bank").textContent = big(bank);
  document.getElementById("xp").textContent = big(experience);
  document.getElementById("fame").textContent = big(fame);

  // The tower
  document.getElementById("tower-name").textContent = towers[tower].icon + " " + towers[tower].name;

  // Each tower tints the fight with its own colour (the "sky" in towers.js), and can
  // have a picture behind it (its "background")
  let scene = document.querySelector(".fight-card");
  scene.style.setProperty("--sky", towers[tower].sky);
  scene.style.setProperty("--scene-art", towers[tower].background === undefined ? "none" : "url(\"" + towers[tower].background + "\")");
  if (isAway()) {
    let note = "Away from home: monsters have +" + percent(awayTowerHealth) + " health and +" + percent(awayTowerAttack) + " attack, and you earn +" + percent(awayTowerExperience) + " experience.";
    if (towerRule() !== null) {
      note = note + " " + towerRule().name + ": " + towerRule().text + ".";
    }
    document.getElementById("tower-note").textContent = note;
  } else {
    document.getElementById("tower-note").textContent = "Your home tower. " + towers[tower].text;
  }

  showPressure();

  // Settings: how much time away counts, and how to get more
  document.getElementById("away-limit-note").textContent = "The tower is climbed while the game is closed. Up to " + timeText(awayLimit()) + " away count for this class."
    + (totalBonus("awayHours") > 0 ? "" : " The Night Watch in town doubles that.");

  // The level card: what falling now would pay, and how far that goes
  let payout = deathPayout();
  let missing = levelCost() - experience;
  if (payout >= missing) {
    document.getElementById("level-falls").textContent = "Falling now would pay " + big(payout) + " experience: enough for level " + (level + 1) + ".";
  } else {
    document.getElementById("level-falls").textContent = "Falling now would pay " + big(payout) + " experience. About " + Math.ceil(missing / payout) + " falls like that to level " + (level + 1) + ".";
  }

  // The week's modifier, under the tower's note
  document.getElementById("week-note").hidden = weeklyModifier() === null;
  document.getElementById("week-note").textContent = weeklyText();

  document.getElementById("floor").textContent = floor;
  document.getElementById("best-floor").textContent = bestFloor;

  // One dot per room: gold for rooms cleared, bright for the one you are in
  for (let i = 1; i <= roomsPerFloor; i++) {
    let look = "";
    if (i < room) {
      look = "done";
    } else if (i === room) {
      look = "now";
    }
    document.getElementById("pip-" + i).className = look;
  }

  // The Character tab
  document.getElementById("class").textContent = currentClass().name;
  document.getElementById("class-text").textContent = currentClass().text;
  document.getElementById("level").textContent = level;
  document.getElementById("health").textContent = big(playerMaxHp);
  document.getElementById("player-hp").textContent = big(playerHp) + " / " + big(playerMaxHp);
  // The pale "trail" behind each health bar is set to the same width but moves
  // more slowly (see style.css), so you can see how much a hit just took off
  document.getElementById("player-hp-bar").style.width = Math.max(0, playerHp / playerMaxHp * 100) + "%";
  document.getElementById("player-hp-trail").style.width = Math.max(0, playerHp / playerMaxHp * 100) + "%";
  document.getElementById("attack").textContent = big(playerAttack);
  document.getElementById("total-armor").textContent = big(totalArmor());
  document.getElementById("armor-share").textContent = "blocks " + percent(armorShareBlocked()) + " here";
  document.getElementById("class-stat").textContent = currentClass().statLine() + fervourLine();

  // The level panel: progress toward the next level, and what a level gives
  document.getElementById("level-big").textContent = level;
  document.getElementById("level-progress").textContent = big(experience) + " / " + big(levelCost());
  document.getElementById("level-bar").style.width = Math.min(100, experience / levelCost() * 100) + "%";
  document.getElementById("level-gain").textContent = "+" + currentClass().perLevel.attack + " attack, +" + currentClass().perLevel.maxHp + " health and " + skillPointsPerLevel + " skill point";

  // The fight
  let inFight = encounterType === "monster" || encounterType === "boss";

  let title = monsterName;
  let text = monsterText;
  let icon = monsterIcon;
  if (encounterType === "boss") {
    title = "BOSS: " + monsterName;
  }
  if (encounterType === "rest") {
    title = "Rest Area";
    text = "A quiet place to recover.";
    icon = "⛺";
  }
  if (encounterType === "chest") {
    title = "Treasure Chest";
    text = "Gold for the blacksmith.";
    icon = "💰";
  }
  document.getElementById("encounter-title").textContent = title;
  document.getElementById("monster-text").textContent = text;
  document.getElementById("monster-stats").hidden = !inFight;
  document.getElementById("monster-numbers").hidden = !inFight;

  // What the monster is weak to and resists, in words
  let weakNote = "";
  let resistNote = "";
  if (inFight && monsterWeak.length > 0) {
    weakNote = "Weak to " + typeNames(monsterWeak) + " (+" + percent(weakAmount) + ")";
  }
  if (inFight && monsterResist.length > 0) {
    resistNote = "Resists " + typeNames(monsterResist) + " (-" + percent(resistNow()) + ")";
  }
  if (inFight && monsterFlying) {
    if (currentClass().ranged === true) {
      resistNote = resistNote + "  Flying, but you can reach it.";
    } else {
      resistNote = resistNote + "  Flying: your swings miss " + percent(flyingMissChance) + " of the time.";
    }
  }
  if (inFight && monsterLunges && currentClass().ranged !== true) {
    resistNote = resistNote + "  Lunges: it strikes first.";
  }
  // A boss's mechanics: the rules in words, and what they are doing right now
  document.getElementById("boss-rules").hidden = !inFight || bossRules.length === 0;
  document.getElementById("boss-rules").textContent = bossRulesText();
  document.getElementById("boss-status").textContent = inFight ? bossStatusText() : "";
  document.getElementById("monster-hp-bar").classList.toggle("shielded", inFight && shieldTurnsLeft() > 0);

  document.getElementById("monster-weak").textContent = weakNote;
  document.getElementById("monster-resist").textContent = resistNote;

  // Rooms that are not fights have an emoji only, never pixel art
  let art = monsterArt;
  if (!inFight) {
    art = "";
  }
  drawPicture("player-icon", currentClass().icon, currentClass().art);
  document.getElementById("player-name").textContent = currentClass().name;
  drawPicture("monster-icon", icon, art);

  // When either fighter has real art, the fight is drawn taller to make room for it
  let anyArt = currentClass().art !== undefined || art !== "";
  document.getElementById("stage").classList.toggle("with-art", anyArt);

  // Bosses and rare monsters get a coloured glow (see style.css).
  // classList.toggle switches one class on or off and leaves the animation classes alone.
  document.getElementById("monster-icon").classList.toggle("boss", encounterType === "boss");
  document.getElementById("stage").classList.toggle("boss-fight", encounterType === "boss");
  document.getElementById("monster-icon").classList.toggle("rare", inFight && monsterIsRare);

  if (inFight) {
    document.getElementById("monster-hp").textContent = big(Math.max(0, monsterHp)) + " / " + big(monsterMaxHp);
    document.getElementById("monster-hp-bar").style.width = Math.max(0, monsterHp / monsterMaxHp * 100) + "%";
    document.getElementById("monster-hp-trail").style.width = Math.max(0, monsterHp / monsterMaxHp * 100) + "%";
    document.getElementById("monster-attack").textContent = big(monsterAttack);
    document.getElementById("monster-armor").textContent = percent(armorNow());
    document.getElementById("monster-ward").textContent = percent(wardNow());
    document.getElementById("monster-dot").textContent = big(dotDamage());
  }

  // The strip a phone shows above every tab but the fight's own
  document.getElementById("mini-floor").textContent = "Floor " + floor;
  document.getElementById("mini-player").textContent = currentClass().name;
  document.getElementById("mini-player-bar").style.width = Math.max(0, playerHp / playerMaxHp * 100) + "%";
  document.getElementById("mini-monster").textContent = title;
  document.getElementById("mini-monster-bar").style.width = inFight ? Math.max(0, monsterHp / monsterMaxHp * 100) + "%" : "0%";

  // Classes without damage over time have no dotLabel, so that part is hidden
  if (currentClass().dotLabel === undefined) {
    document.getElementById("dot-part").hidden = true;
  } else {
    document.getElementById("dot-part").hidden = false;
    document.getElementById("dot-label").textContent = currentClass().dotLabel;
  }

  showGear();
}

// The two equipment cards are rebuilt only when something about them changes
let gearShown = "";

function showGear() {
  // (the effect texts hold numbers that skills and upgrades change, so they are part of the key)
  let key = playerClass + weapon + stance + namedWeapon + JSON.stringify(forgeLevels) + weaponPower + armorPower + currentClass().gearInfo();
  if (key === gearShown) {
    return;
  }
  gearShown = key;

  let wornBox = document.getElementById("worn");
  wornBox.innerHTML = "";
  wornBox.appendChild(gearCard("weapon"));
  wornBox.appendChild(gearCard("armor"));
}

// ----- Describing equipment: its picture and what it does -----

// The little picture of a piece of equipment. A class can give each kind of its gear
// an icon (gearIcons) or a drawing (gearArt); anything without one gets a plain icon.
function gearIcon(slot) {
  let icons = currentClass().gearIcons;
  if (slot === specialSlot() && icons !== undefined && icons[weapon] !== undefined) {
    return icons[weapon];
  }
  if (slot !== specialSlot() && currentClass().plainIcon !== undefined) {
    return currentClass().plainIcon;
  }
  if (slot === "weapon") {
    return "⚔️";
  }
  return "🥋";
}

function gearArt(slot) {
  let art = currentClass().gearArt;
  if (slot === specialSlot() && art !== undefined && art[weapon] !== undefined) {
    return art[weapon];
  }
  return "";
}

// Builds the card for the equipment in a slot ("weapon" or "armor")
function gearCard(slot) {
  let step = forgeLevel(slot);

  let card = document.createElement("div");
  card.className = "item";

  let icon = document.createElement("div");
  icon.className = "item-icon";
  if (gearArt(slot) !== "") {
    let image = document.createElement("img");
    image.src = gearArt(slot);
    image.alt = "";
    icon.appendChild(image);
  } else {
    icon.textContent = gearIcon(slot);
  }
  card.appendChild(icon);

  let text = document.createElement("div");
  text.className = "item-text";

  let label = document.createElement("p");
  label.className = "item-slot";
  label.textContent = slotLabel(slot);
  text.appendChild(label);

  // The name takes the colour of its tier
  let name = document.createElement("p");
  name.className = "row-title rarity-" + Math.min(5, tierOfStep(step));
  name.textContent = gearName(slot, step);
  text.appendChild(name);

  let stats = document.createElement("p");
  stats.className = "item-stats";
  stats.textContent = gearStat(slot, step);
  text.appendChild(stats);

  // The special gear also says how it makes the class fight
  if (slot === specialSlot()) {
    let effect = document.createElement("p");
    effect.className = "note";
    effect.textContent = textParts(currentClass().gearInfo()).words + " Damage: " + typeNames(currentClass().damageTypes()) + ".";
    text.appendChild(effect);
  }

  card.appendChild(text);
  return card;
}
