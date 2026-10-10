// =====================================================================
//  updates.js - what changed in each version of the game.
//  Shown in the Updates window (the "Updates" button under the game's name).
//  Loaded after data.js. The window itself is made in game/feel.js.
// =====================================================================
//
// TO ADD AN ENTRY: add a block at the TOP of this list, with:
//   version - the same value as gameVersion in index.html (tools/version.sh sets that)
//   title   - a few words
//   changes - one short line for each thing a player would notice
// Keep them brief: this is for players, not a record of the code.
// The pre-upload check (tools/) fails if the top entry is not for the current version.

const gameUpdates = [
  {
    version: "20261010b",
    title: "Updates window",
    changes: [
      "This window: every version now says what changed in it."
    ]
  },
  {
    version: "20261010a",
    title: "Abilities and lasting rewards",
    changes: [
      "Abilities: special moves on a cooldown, in slots that open on floors 10, 35 and 75.",
      "Runs sweep through the floors your class clears without slowing down.",
      "Tabs open one at a time as you reach them.",
      "Rewards that were flat numbers are now percentages, so they never fade."
    ]
  }
];
