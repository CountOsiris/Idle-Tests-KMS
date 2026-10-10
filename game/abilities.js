// =====================================================================
//  game/abilities.js - Abilities: special moves on a cooldown, chosen per class.
// =====================================================================
//
// A class opens ability SLOTS as it climbs (abilitySlotFloors in data.js) and fills
// them from its own list of abilities (the "abilities" list in its class file).
// Each ability waits "cooldown" turns of fighting between uses, and is set to one of:
//   "auto"   - used whenever it is ready
//   "bosses" - used whenever it is ready, but only against a boss
//   "manual" - used only when the player presses its button under the fight
// A ready ability's button can always be pressed, whatever its setting.
// Abilities are used at the start of your turn, as well as your normal attack.

// ----- What the class remembers (saved, per class) -----
let abilitySlots = [];       // the ids of the abilities in the slots, for example ["cleave", "execute"]
let abilityModes = {};       // the setting of each ability that has been changed, for example { execute: "manual" }

// ----- What one run remembers (not saved) -----
let abilityCooldowns = {};   // turns left before an ability is ready again
let abilityPressed = {};     // abilities the player pressed, to be used at the next turn
let lastAbilityUsed = null;  // for the animation
let boostTurns = 0;          // a damage boost from an ability: turns left...
let boostAmount = 0;         // ...and how much (0.5 means +50% damage)
let guardTurns = 0;          // a guard from an ability: turns left...
let guardShare = 0;          // ...and the share of damage it stops (1 means all of it)

// YOUR DAMAGE PER TURN, as it really is: everything your normal turn did to the enemy
// (hits, crits, bleeding, burning, poison, reflected and thrown damage...), averaged
// over the last few turns. Abilities deal their damage as "turns of your damage", so
// they grow with every build by themselves. Abilities' own damage is not counted.
let recentDamage = 0;

function damagePerTurn() {
  if (recentDamage <= 0) {
    return playerAttack;
  }
  return recentDamage;
}

// Runs at the end of each turn with the damage the normal turn did. Each turn counts
// for a fifth, so the number follows changes quickly but is not thrown by one big hit.
function recordTurnDamage(dealt) {
  if (recentDamage <= 0) {
    recentDamage = Math.max(1, dealt);
  } else {
    recentDamage = recentDamage * 0.8 + Math.max(0, dealt) * 0.2;
  }
}

const abilityModeNames = { auto: "Auto", bosses: "Bosses only", manual: "Manual" };

function classAbilities() {
  if (currentClass().abilities === undefined) {
    return [];
  }
  return currentClass().abilities;
}

function abilityById(id) {
  for (let ability of classAbilities()) {
    if (ability.id === id) {
      return ability;
    }
  }
  return null;
}

// How many slots this class has opened
function openAbilitySlots() {
  let open = 0;
  for (let slotFloor of abilitySlotFloors) {
    if (bestFloor >= slotFloor) {
      open = open + 1;
    }
  }
  return open;
}

function abilityMode(ability) {
  if (abilityModes[ability.id] !== undefined) {
    return abilityModes[ability.id];
  }
  return ability.bossKiller === true ? "bosses" : "auto";
}

function setAbilityMode(id, mode) {
  abilityModes[id] = mode;
  updateScreen();
}

function equipAbility(id) {
  if (!abilitySlots.includes(id) && abilitySlots.length < openAbilitySlots() && abilityById(id) !== null) {
    abilitySlots.push(id);
    updateScreen();
  }
}

function unequipAbility(id) {
  abilitySlots = abilitySlots.filter(function (slotted) {
    return slotted !== id;
  });
  updateScreen();
}

// Does a slot stand empty while there is something to put in it?
function hasEmptyAbilitySlot() {
  return abilitySlots.length < openAbilitySlots() && abilitySlots.length < classAbilities().length;
}

function abilityReady(ability) {
  return (abilityCooldowns[ability.id] || 0) <= 0;
}

// The button under the fight: the ability is used at the start of the next turn
function pressAbility(id) {
  let ability = abilityById(id);
  if (ability !== null && abilityReady(ability)) {
    abilityPressed[id] = true;
    updateScreen();
  }
}

// Runs at the start of each of your turns in a fight
function useAbilities() {
  for (let id of abilitySlots) {
    let ability = abilityById(id);
    if (ability === null || !abilityReady(ability) || monsterHp <= 0) {
      continue;
    }
    // An ability for another weapon does nothing, so it waits
    if (!fitsBuild(ability)) {
      continue;
    }

    let mode = abilityMode(ability);
    let wanted = abilityPressed[id] === true
      || mode === "auto"
      || (mode === "bosses" && encounterType === "boss");
    if (!wanted) {
      continue;
    }
    // A boss killer that uses itself waits while the boss's shield or minion would
    // waste it. Pressing its button still uses it at once.
    if (ability.bossKiller === true && abilityPressed[id] !== true && bossWouldWasteAHit()) {
      continue;
    }

    ability.use();
    // (the Quick Hands keystone shortens every cooldown: "quickHands")
    abilityCooldowns[id] = Math.max(1, Math.ceil(ability.cooldown * (1 - totalBonus("quickHands"))));
    abilityPressed[id] = false;
    lastAbilityUsed = ability;
    say("You use " + ability.name + "!");
  }
}

// Runs at the end of each of your turns in a fight
function tickAbilityTimers() {
  for (let id in abilityCooldowns) {
    if (abilityCooldowns[id] > 0) {
      abilityCooldowns[id] = abilityCooldowns[id] - 1;
    }
  }
  if (boostTurns > 0) {
    boostTurns = boostTurns - 1;
  }
  if (guardTurns > 0) {
    guardTurns = guardTurns - 1;
  }
}

// Everything is ready again at the start of a run
function resetAbilitiesForRun() {
  abilityCooldowns = {};
  abilityPressed = {};
  boostTurns = 0;
  boostAmount = 0;
  guardTurns = 0;
  guardShare = 0;
}

// ----- Pieces the abilities in the class files are built from -----

// Damage worth "turns" of your normal turns, all at once. Nothing is taken off it:
// your armor-, ward- and resistance-beating are already in what your turns deal.
function abilityTurns(turns) {
  let damage = Math.max(1, Math.round(damagePerTurn() * turns));
  monsterHp = monsterHp - damage;
  return damage;
}

// A weapon hit for "times" your attack. Armor counts against it.
function abilityHit(times, type, armorShare) {
  return hitMonster(playerAttack * times, type, armorShare);
}

// A spell for "times" your attack. Ward counts against it.
function abilitySpell(times, type) {
  return spellHitMonster(playerAttack * times, type);
}

// Damage that nothing is taken off: not armor, not ward. "amount" is the damage itself.
function abilityPure(amount, type) {
  return magicHitMonster(amount, type);
}

// Adds "count" stacks of the class's damage over time, up to its limit ("limitWord",
// like "bleedStacks")
function abilityStacks(count, limitWord) {
  for (let i = 0; i < count; i++) {
    addDotStack(totalBonus(limitWord));
  }
}

// The enemy misses its next turn
function abilityStun() {
  monsterStunned = true;
}

// Heals a share of your health. Gives back how much of it you did not need.
function abilityHeal(share) {
  let amount = playerMaxHp * share;
  let spare = Math.max(0, amount - (playerMaxHp - playerHp));
  healPlayer(amount);
  return spare;
}

// For "turns" turns, all your damage is +amount (0.5 means +50%)
function abilityBoost(amount, turns) {
  boostAmount = amount;
  boostTurns = turns;
}

// For "turns" turns, you take "share" less damage (1 means none at all)
function abilityGuard(share, turns) {
  guardShare = share;
  guardTurns = turns;
}

// What the hit functions multiply all your damage by: a boost from an ability, and
// what the run itself has built up
function abilityDamageBoost() {
  if (boostTurns > 0) {
    return (1 + boostAmount) * runDamageBoost();
  }
  return runDamageBoost();
}

// Keystones that grow stronger as a run goes on (see keystoneMilestones in data.js):
//   killStreak  every kill this run adds this much damage
//   momentum    every floor swept through at the start of the run adds this much
// Each stops at keystoneRunLimit (1 means +100%).
function runDamageBoost() {
  let streak = Math.min(keystoneRunLimit, totalBonus("killStreak") * runStats.kills);
  let momentum = Math.min(keystoneRunLimit, totalBonus("momentum") * (runStartFloor - 1));
  return 1 + streak + momentum;
}

// What a monster's hit is multiplied by while a guard is up (0 means it does nothing)
function abilityGuardFactor() {
  if (guardTurns > 0) {
    return Math.max(0, 1 - guardShare);
  }
  return 1;
}

// ----- On the page -----

// The abilities card on the Skills tab: rebuilt only when something on it changes
let abilitiesShown = "";

function showAbilities() {
  // Shown from the start, even before the first slot opens, so the player can see
  // what is coming and when
  let card = document.getElementById("abilities-card");
  card.hidden = classAbilities().length === 0;
  if (card.hidden) {
    return;
  }

  document.getElementById("ability-slots").textContent = abilitySlots.length + " / " + openAbilitySlots();
  let next = "";
  for (let slotFloor of abilitySlotFloors) {
    if (bestFloor < slotFloor) {
      if (openAbilitySlots() === 0) {
        next = " Your first slot opens when this class reaches floor " + slotFloor + ".";
      } else {
        next = " The next slot opens on floor " + slotFloor + ".";
      }
      break;
    }
  }
  document.getElementById("ability-next").textContent = next;
  document.getElementById("ability-damage").textContent = big(Math.round(damagePerTurn()));

  let key = playerClass + weapon + stance + JSON.stringify(abilitySlots) + JSON.stringify(abilityModes) + openAbilitySlots();
  if (key === abilitiesShown) {
    return;
  }
  abilitiesShown = key;

  let box = document.getElementById("abilities");
  box.innerHTML = "";

  for (let ability of classAbilities()) {
    let equipped = abilitySlots.includes(ability.id);

    let row = document.createElement("div");
    row.className = "row";

    let words = document.createElement("div");
    words.className = "row-text";
    let title = document.createElement("p");
    title.className = "row-title";
    title.textContent = ability.name + " · every " + ability.cooldown + " turns" + (equipped ? " · in a slot" : "");
    let note = document.createElement("p");
    note.className = "note";
    note.textContent = ability.text + "." + otherBuildNote(ability.text);
    words.appendChild(title);
    words.appendChild(note);

    // When it is in a slot, the three settings
    if (equipped) {
      let modes = document.createElement("div");
      modes.className = "choices";
      for (let mode in abilityModeNames) {
        let button = document.createElement("button");
        button.textContent = abilityModeNames[mode];
        button.className = abilityMode(ability) === mode ? "chosen" : "";
        button.onclick = function () {
          setAbilityMode(ability.id, mode);
        };
        modes.appendChild(button);
      }
      words.appendChild(modes);
    }

    let button = document.createElement("button");
    if (equipped) {
      button.textContent = "Remove";
      button.onclick = function () {
        unequipAbility(ability.id);
      };
    } else {
      button.textContent = openAbilitySlots() === 0 ? "Floor " + abilitySlotFloors[0] : "Put in a slot";
      button.disabled = abilitySlots.length >= openAbilitySlots();
      button.onclick = function () {
        equipAbility(ability.id);
      };
    }

    row.appendChild(words);
    row.appendChild(button);
    box.appendChild(row);
  }
}

// The ability buttons under the fight: one per slot, with how long until it is ready
function showAbilityBar() {
  let bar = document.getElementById("ability-bar");
  bar.hidden = abilitySlots.length === 0;
  if (bar.hidden) {
    return;
  }

  // The buttons are made again only when the slots change; their words change every second
  if (bar.dataset.slots !== abilitySlots.join(",")) {
    bar.dataset.slots = abilitySlots.join(",");
    bar.innerHTML = "";
    for (let id of abilitySlots) {
      let button = document.createElement("button");
      button.id = "ability-" + id;
      button.onclick = function () {
        pressAbility(id);
      };
      bar.appendChild(button);
    }
  }

  for (let id of abilitySlots) {
    let ability = abilityById(id);
    let button = document.getElementById("ability-" + id);
    if (ability === null || button === null) {
      continue;
    }

    let state = abilityModeNames[abilityMode(ability)];
    if (!fitsBuild(ability)) {
      state = "not with this weapon";
    } else if (abilityPressed[id] === true) {
      state = "next turn";
    } else if (!abilityReady(ability)) {
      state = abilityCooldowns[id] + "s";
    } else if (abilityMode(ability) === "manual") {
      state = "ready: press";
    } else {
      state = "ready";
    }

    button.textContent = ability.name + " · " + state;
    button.disabled = !abilityReady(ability) || !fitsBuild(ability);
    button.className = abilityReady(ability) && fitsBuild(ability) ? "chosen" : "";
    button.title = ability.text + ". Setting: " + abilityModeNames[abilityMode(ability)] + " (change it on the Skills tab).";
  }
}

// A new slot has opened: a moment to fill it
function announceAbilitySlot() {
  let choices = [];
  for (let ability of classAbilities()) {
    if (!abilitySlots.includes(ability.id) && fitsBuild(ability)) {
      choices.push({
        title: ability.name + " · every " + ability.cooldown + " turns",
        note: ability.text,
        whenPicked: function () {
          equipAbility(ability.id);
        }
      });
    }
  }
  announce("moment", "A new ability slot",
    "Abilities are special moves used on a cooldown, as well as your normal attack. Pick one for the new slot. You can change it, and whether it is used by itself, on the Skills tab.", choices);
}
