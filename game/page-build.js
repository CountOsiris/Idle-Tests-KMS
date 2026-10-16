// =====================================================================
//  game/page-build.js - Building the page: the lists made once from data.js, towers.js and classes/.
// =====================================================================

// ----- Building the page -----
// These make the lists on the page out of the lists in data.js, towers.js and classes/,
// so new perks, upgrades, skills and classes show up without touching index.html.
// The "build" functions make the rows once. The "show" functions further down
// fill in the words and numbers, every second.

// Makes one row of a list: a title and a note on the left, a button on the right.
// The parts get the ids  name + "-title",  name + "-note"  and  name  (the button itself).
function addRow(box, name, whenClicked) {
  let row = document.createElement("div");
  row.className = "row";
  row.id = name + "-row";

  let text = document.createElement("div");
  text.className = "row-text";

  let title = document.createElement("p");
  title.className = "row-title";
  title.id = name + "-title";
  text.appendChild(title);

  let note = document.createElement("p");
  note.className = "note";
  note.id = name + "-note";
  text.appendChild(note);

  let button = document.createElement("button");
  button.id = name;
  button.onclick = whenClicked;

  row.appendChild(text);
  row.appendChild(button);
  box.appendChild(row);
}

// Writes into the three parts of a row made by addRow. "more" is optional: the
// explanation kept behind the row's "?" (see fillNote)
function fillRow(name, title, note, buttonText, buttonOff, more, tag) {
  document.getElementById(name + "-title").textContent = title;
  fillNote(document.getElementById(name + "-note"), note, more || "", tag || "");
  document.getElementById(name).textContent = buttonText;
  document.getElementById(name).disabled = buttonOff;
}

// A ROW SAYS WHAT IT GIVES IN A FEW WORDS, AND KEEPS THE REST BEHIND A "?".
// The short line is always shown: what you get, in numbers ("+18% attack", "x1.2
// damage"). The "?" at its end shows the rest: the rule, the rank, the story. "Always
// show explanations" in Settings shows every one (body.help-always, style.css).
// "tag" is the name of the weapon or element it is for, if any (see textParts).
// (Rewritten only when the words change, so a "?" being pressed stays where it is.)
function fillNote(element, short, more, tag) {
  let key = tag + "|" + short + "|" + more;
  if (element.dataset.words === key) {
    return;
  }
  element.dataset.words = key;
  element.replaceChildren(short);
  if (tag) {
    element.prepend(kindTag(tag));
  }
  if (more === "") {
    return;
  }
  let button = document.createElement("button");
  button.className = "row-help";
  button.textContent = "?";
  button.title = "More about this";
  button.onclick = function () {
    element.classList.toggle("more-open");
  };
  let rest = document.createElement("span");
  rest.className = "row-more";
  rest.textContent = more;
  element.append(" ", button, rest);
}

// Runs once, when the game starts
// The bar of tab groups for a phone (tabGroups in game/page-show.js)
function buildTabGroups() {
  let bar = document.getElementById("groups");
  for (let group of tabGroups) {
    let button = document.createElement("button");
    button.id = "group-" + group.name;
    button.dataset.icon = group.icon;
    button.textContent = group.name;
    button.onclick = function () { showGroup(group); };
    bar.append(button);
  }
}

function buildClassButtons() {
  let box = document.getElementById("class-buttons");

  // A tile for each class: its picture (or its icon, if it has none), its name, and a
  // line for where it stands, which showHeroStrip (game/companion.js) keeps up to date
  for (let className in classes) {
    let button = document.createElement("button");
    button.id = "class-" + className;
    button.className = "hero-tile";

    let face = document.createElement("span");
    face.className = "hero-face";
    if (classes[className].art !== undefined) {
      let picture = document.createElement("img");
      picture.src = classes[className].art;
      picture.alt = "";
      face.append(picture);
    } else {
      face.textContent = classes[className].icon;
    }
    let name = document.createElement("span");
    name.className = "hero-name";
    name.textContent = classes[className].name;
    let note = document.createElement("span");
    note.className = "hero-note";
    button.append(face, name, note);

    button.onclick = function () {
      switchClass(className);
    };
    box.appendChild(button);
  }
}

// One dot for every room on a floor, shown under the floor number
function buildRoomPips() {
  let box = document.getElementById("room-pips");

  for (let i = 1; i <= roomsPerFloor; i++) {
    let pip = document.createElement("span");
    pip.id = "pip-" + i;
    box.appendChild(pip);
  }
}

// A button that marks a choice. Used for the blacksmith's weapons and the Tactician.
function addFavouriteButton(box, id, label, whenClicked) {
  let button = document.createElement("button");
  button.id = id;
  button.textContent = label;
  button.onclick = whenClicked;
  box.appendChild(button);
}

// Runs once, when the game starts
function buildTownList() {
  let box = document.getElementById("town-upgrades");

  for (let item of townUpgrades) {
    addRow(box, "town-" + item.id, function () {
      buyTownUpgrade(item);
    });
  }

  // The blacksmith has one row for the weapon and one for the armor
  let forgeBox = document.getElementById("forge");
  for (let slot of ["weapon", "armor"]) {
    addRow(forgeBox, "forge-" + slot, function () {
      upgradeGear(slot);
    });
  }
}

// Runs once, when the game starts
function buildTowerList() {
  let box = document.getElementById("towers");

  for (let towerName in towers) {
    addRow(box, "tower-" + towerName, function () {
      chooseTower(towerName);
    });

    // "All trophies": opens the tower's full list under its row (game/tidy.js)
    let more = document.createElement("button");
    more.className = "link-button";
    more.id = "tower-" + towerName + "-more";
    more.onclick = function () {
      toggleTowerDetails(towerName);
    };
    document.getElementById("tower-" + towerName + "-note").after(more);
  }
}

// Runs once, when the game starts. The fame upgrades are the same for every class.
function buildFameList() {
  let box = document.getElementById("fame-upgrades");

  for (let item of fameUpgrades) {
    addRow(box, "fame-" + item.id, function () {
      buyFameUpgrade(item);
    });
  }
}

// Runs once, when the game starts: the table of what each way of starting over costs
function buildResetTable() {
  let table = document.getElementById("reset-table");
  document.getElementById("reset-legend-floor").textContent = legendFloor;

  let head = document.createElement("tr");
  for (let title of ["", "When you fall", "When you ascend", "Becoming a legend"]) {
    let cell = document.createElement("th");
    cell.textContent = title;
    head.appendChild(cell);
  }
  table.appendChild(head);

  for (let line of resetTable) {
    let row = document.createElement("tr");
    let name = document.createElement("td");
    name.textContent = line.what;
    row.appendChild(name);

    for (let when of ["fall", "ascend", "legend"]) {
      let cell = document.createElement("td");
      cell.textContent = line[when];
      // (kept and banked are shown bright, lost dim: see style.css)
      cell.className = line[when].startsWith("lost") ? "lost" : "kept";
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

// Runs once, when the game starts. What legend marks buy is the same for every class.
function buildLegendList() {
  let box = document.getElementById("legend-unlocks");

  for (let item of legendUnlocks) {
    addRow(box, "legend-" + item.id, function () {
      buyLegendUnlock(item);
    });
  }
}

// Runs when the game starts and every time the class changes
function buildClassScreen() {
  // The blacksmith's weapon picker lists this class's own kinds of weapon
  let gearBox = document.getElementById("weapon-buttons");
  gearBox.innerHTML = "";
  if (currentClass().stances !== undefined) {
    // A class that fights with stances (the Elementalist's elements) picks one of those
    // here. It is the same choice as on the Skills tab: players looked for it here, where
    // every other class picks its weapon, and took the class for broken.
    for (let id in currentClass().stances) {
      addFavouriteButton(gearBox, "weapon-" + id, currentClass().stances[id].name, function () {
        chooseStance(id);
      });
    }
  } else {
    for (let type in currentClass().gearTypes) {
      addFavouriteButton(gearBox, "weapon-" + type, currentClass().gearTypes[type], function () {
        chooseWeapon(type);
      });
    }
  }

  // The boss weapon picker lists the same kinds (the elements, for a class with stances)
  let bossBox = document.getElementById("boss-weapon-buttons");
  bossBox.innerHTML = "";
  addFavouriteButton(bossBox, "boss-weapon-", "The same", function () {
    chooseBossWeapon("");
  });
  for (let kind in buildKinds()) {
    addFavouriteButton(bossBox, "boss-weapon-" + kind, buildKinds()[kind], function () {
      chooseBossWeapon(kind);
    });
  }

  // The Tactician's list: one row for each boon, with what it does (filled in by showTown)
  let favouriteBox = document.getElementById("favourite-upgrade-rows");
  favouriteBox.innerHTML = "";
  addRow(favouriteBox, "favourite-upgrade-", function () {
    chooseFavouriteUpgrade("");
  });
  for (let upgrade of currentClass().upgrades) {
    addRow(favouriteBox, "favourite-upgrade-" + upgrade.id, function () {
      chooseFavouriteUpgrade(upgrade.id);
    });
  }

  // The stance picker on the Skills tab, for a class that has stances
  let stanceBox = document.getElementById("stance-buttons");
  stanceBox.innerHTML = "";
  if (currentClass().stances !== undefined) {
    for (let id in currentClass().stances) {
      addFavouriteButton(stanceBox, "stance-" + id, currentClass().stances[id].name, function () {
        chooseStance(id);
      });
    }
  }

  let skillBox = document.getElementById("skills");
  skillBox.innerHTML = "";

  for (let skill of currentClass().skills) {
    addRow(skillBox, "skill-" + skill.id, function () {
      buySkill(skill);
    });
  }

  buildMilestones();
}

// Runs when the class changes, and again whenever a new breakthrough joins the list
function buildMilestones() {
  let milestoneBox = document.getElementById("milestones");
  milestoneBox.innerHTML = "";

  for (let milestone of allMilestones()) {
    let row = document.createElement("div");
    row.className = "milestone";

    let title = document.createElement("p");
    title.className = "row-title";
    title.id = "milestone-" + milestone.floor;
    row.appendChild(title);

    let choices = document.createElement("div");
    choices.className = "choices";

    for (let perk of milestone.perks) {
      let button = document.createElement("button");
      button.id = "perk-" + milestone.floor + "-" + perk.id;
      // A keystone is marked with a star (and a colour of its own: see style.css), and a
      // perk for one weapon carries its tag (see textParts in game/page-show.js)
      let parts = textParts(perk.text);
      button.textContent = (perk.keystone === true ? "★ " : "") + perk.name + " (" + parts.words + ")";
      if (parts.name !== "") {
        button.prepend(kindTag(parts.name));
      }
      button.classList.toggle("keystone", perk.keystone === true);
      button.onclick = function () {
        choosePerk(milestone.floor, perk.id);
      };
      choices.appendChild(button);
    }

    row.appendChild(choices);
    milestoneBox.appendChild(row);
  }
}
