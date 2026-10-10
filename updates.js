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
    version: "20261010p",
    title: "Ability ranks and double speed",
    changes: [
      "Abilities gain ranks as you use them, each rank making them 10% stronger, and keep them for good.",
      "Settings has a double speed for while you are watching the game.",
      "The Beast Tamer's damage is a little lower, so its first wall comes at about the same time as other classes'."
    ]
  },
  {
    version: "20261010o",
    title: "Fairer deep floors",
    changes: [
      "A reflecting boss never throws back more than a quarter of your health from one blow, so killing it in one hit no longer kills you deep in the tower.",
      "Earth throws its first boulder on the first turn of a fight. Boulders hit for less to make up for it, and Landslide is a new keystone.",
      "The Stiletto's critical hit is x2.75 instead of x3."
    ]
  },
  {
    version: "20261010n",
    title: "A modifier every week",
    changes: [
      "Each week brings a twist to every tower, such as Blood Moon or the Week of Plenty, shown under the tower's name.",
      "It changes on Monday for everyone, and each one helps in one way and bites in another."
    ]
  },
  {
    version: "20261010m",
    title: "The Beast Tamer",
    changes: [
      "An eighth class, opened with legend marks: a tamer who fights beside a wolf pack, a bear or a hawk.",
      "An eighth tower, the Wild Reaches, that every class can challenge now."
    ]
  },
  {
    version: "20261010l",
    title: "Legend",
    changes: [
      "A class that reaches floor 100 can become a legend: it climbs the whole tower again and earns legend marks.",
      "Marks open new things for every class: an extra ability slot, a second boon from every boss, relic slots, starting levels and free potions."
    ]
  },
  {
    version: "20261010k",
    title: "Relics that do something",
    changes: [
      "Relics are now rare: the boss of every 25th floor carries one, and now and then a rare monster does.",
      "Eleven new relics change how a run plays, such as a saved life, attacks thrown back or faster abilities."
    ]
  },
  {
    version: "20261010j",
    title: "Where to go when you are stuck",
    changes: [
      "The Towers tab suggests the tower your current damage suits best, and what its next trophy pays.",
      "When your home tower stops giving way, the game points you there."
    ]
  },
  {
    version: "20261010i",
    title: "Trophies worth the trip",
    changes: [
      "Floor 30 of another class's tower now teaches a technique borrowed from that class, such as Brace or Sidestep.",
      "Floor 50 teaches an ability any class can slot, floor 75 lets you keep a relic when you fall, and floor 100 gives a new rule of your own."
    ]
  },
  {
    version: "20261010h",
    title: "Challenge towers",
    changes: [
      "Every tower now has a rule against challengers from other classes, shown on the Towers tab and above the fight.",
      "Three more trophies in every tower, at floors 50, 75 and 100."
    ]
  },
  {
    version: "20261010g",
    title: "Keystones",
    changes: [
      "Floor 51 offers a ★ keystone for each weapon or element: a perk that changes a rule of how it fights, at a cost.",
      "Floors 76 and 101 each offer three more that any class can take, such as Glass Cannon and Second Wind.",
      "Keystones are optional: take one, or none, and change your mind whenever you like.",
      "The count of a run in progress now survives reloading the page."
    ]
  },
  {
    version: "20261010f",
    title: "Reflecting bosses made fair",
    changes: [
      "A boss with a reflect aura no longer kills you for killing it in one hit: only the health it had left is thrown back, and your armor works against it.",
      "Every weapon and element now measures within a quarter of its class's pace to floor 50."
    ]
  },
  {
    version: "20261010e",
    title: "Fixes",
    changes: [
      "The Welcome back report now shows the experience you really earned and the levels gained, and adds up a whole absence instead of the last minute.",
      "Venomous monsters hit as their description says: the poison is part of their attack, not extra on top.",
      "Opening the game in a second tab stops the older tab, so two tabs can no longer save over each other.",
      "Boss killers set to use themselves wait out a boss's shield or minion."
    ]
  },
  {
    version: "20261010d",
    title: "Run summary",
    changes: [
      "When you fall, the log says what your damage and healing were made of and what killed you.",
      "The Character tab has a Last run card with the full breakdown."
    ]
  },
  {
    version: "20261010c",
    title: "Bosses with rules of their own",
    changes: [
      "From floor 10, every boss has a mechanic: a shield phase, minions, an enrage timer, a reflect aura or rising armor.",
      "The rule is written under the boss, and what it is doing now shows above its health bar."
    ]
  },
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
