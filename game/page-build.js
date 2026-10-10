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

// Writes into the three parts of a row made by addRow
function fillRow(name, title, note, buttonText, buttonOff) {
  document.getElementById(name + "-title").textContent = title;
  document.getElementById(name + "-note").textContent = note;
  document.getElementById(name).textContent = buttonText;
  document.getElementById(name).disabled = buttonOff;
}

// Runs once, when the game starts
function buildClassButtons() {
  let box = document.getElementById("class-buttons");

  for (let className in classes) {
    let button = document.createElement("button");
    button.id = "class-" + className;
    button.textContent = classes[className].icon + " " + classes[className].name;
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

// Runs when the game starts and every time the class changes
function buildClassScreen() {
  // The blacksmith's weapon picker lists this class's own kinds of weapon
  let gearBox = document.getElementById("weapon-buttons");
  gearBox.innerHTML = "";
  for (let type in currentClass().gearTypes) {
    addFavouriteButton(gearBox, "weapon-" + type, currentClass().gearTypes[type], function () {
      chooseWeapon(type);
    });
  }

  let favouriteBox = document.getElementById("favourite-upgrade-buttons");
  favouriteBox.innerHTML = "";
  addFavouriteButton(favouriteBox, "favourite-upgrade-", "None", function () {
    chooseFavouriteUpgrade("");
  });
  for (let upgrade of currentClass().upgrades) {
    addFavouriteButton(favouriteBox, "favourite-upgrade-" + upgrade.id, upgrade.name, function () {
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
      // A keystone is marked with a star (and a colour of its own: see style.css)
      button.textContent = (perk.keystone === true ? "★ " : "") + perk.name + " (" + perk.text + ")";
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
