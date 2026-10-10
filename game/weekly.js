// =====================================================================
//  game/weekly.js - The week's modifier: a twist on every tower that changes each Monday.
// =====================================================================
//
// Every week one entry of weeklyModifiers (data.js) is in force, for every class in
// every tower, home or away. They come round in the order of the list. Each has
// something that helps and something that bites, written like any perk: bonus words
// that are added to the class's own, and numbers that multiply.
// Which week it is comes from the calendar (weeks counted from a Monday, in UTC), so
// everyone playing has the same one, and it changes while the game is closed.

// For the tools: a number here is used as the week instead of the calendar's, and
// "none" switches the modifier off (the balance bot does, so that its runs can be
// compared from one week to the next).
let weekOverride = null;

const msInADay = 24 * 60 * 60 * 1000;

// Weeks since Monday the 5th of January 1970
function weekNumber() {
  if (typeof weekOverride === "number") {
    return weekOverride;
  }
  return Math.floor((Date.now() / msInADay - 4) / 7);
}

// The modifier in force, or null if there is none
function weeklyModifier() {
  if (weekOverride === "none" || weeklyModifiers.length === 0) {
    return null;
  }
  return weeklyModifiers[weekNumber() % weeklyModifiers.length];
}

function weeklyBonus(stat) {
  let week = weeklyModifier();
  if (week === null || week.bonus === undefined || week.bonus[stat] === undefined) {
    return 0;
  }
  return week.bonus[stat];
}

function weeklyMultiplier(stat) {
  let week = weeklyModifier();
  if (week === null || week.multiply === undefined || week.multiply[stat] === undefined) {
    return 1;
  }
  return week.multiply[stat];
}

// How long until the next one, in words: "3 days" or "5 hours"
function weekEndsIn() {
  let daysIntoWeek = (Date.now() / msInADay - 4) % 7;
  let hoursLeft = (7 - daysIntoWeek) * 24;

  if (hoursLeft >= 48) {
    return Math.floor(hoursLeft / 24) + " days";
  }
  if (hoursLeft >= 2) {
    return Math.floor(hoursLeft) + " hours";
  }
  return "an hour";
}

// The line under the tower's name
function weeklyText() {
  let week = weeklyModifier();
  if (week === null) {
    return "";
  }
  return "This week · " + week.name + ": " + week.text + ". Changes in " + weekEndsIn() + ".";
}

// Says so in the log when the game opens, and again when the week turns over while it is open
let weekAnnounced = -1;

function announceWeek() {
  let week = weeklyModifier();
  if (week === null || weekAnnounced === weekNumber()) {
    return;
  }
  let first = weekAnnounced === -1;
  weekAnnounced = weekNumber();
  recalcStats();

  if (first) {
    say("This week · " + week.name + ": " + week.text + ".");
  } else {
    announce("banner", "A new week: " + week.name, week.text + ".");
  }
}
