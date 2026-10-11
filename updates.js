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
    version: "20261011p",
    title: "A new layout: the fight on top, the tabs along the bottom",
    changes: [
      "The fight now stays at the top of the screen on every tab, in a short form: the two fighters and their health.",
      "The tabs are a bar along the bottom, a picture and a word each, the same on a computer and a phone.",
      "On a wide screen the fight stands on the left and the page has the whole height on the right.",
      "The Fight tab opens the whole fight: what the monster is, how you stand against the floor, your goals, the boons of the run and the log.",
      "The header is one line."
    ]
  },
  {
    version: "20261011o",
    title: "Legendary relics, and a Phoenix Feather you can see",
    changes: [
      "Every weapon and element now has a legendary relic. It multiplies that build's damage by 2.5 or 3 and your health by 1.5 until you fall. A relic boss you fight has a 3% chance to carry it.",
      "Phoenix Feather always worked, but only wrote one quiet line. It now says its name, pops up over the fight, and shows as used up in the relic list."
    ]
  },
  {
    version: "20261011n",
    title: "A page that holds still",
    changes: [
      "The page no longer jumps up and down while a fight runs. The fight box changed height every few turns, and the browser moved the page to follow it, which made buying skills a chase.",
      "The fight box now keeps one height through monsters, bosses, rest rooms and chests."
    ]
  },
  {
    version: "20261011m",
    title: "A tidier page, and milestone perks worth picking",
    changes: [
      "Press a box's heading to fold it away. Explanations now wait behind the \"?\" by each heading (Settings can show them all).",
      "The Towers tab shows one short row a tower, with the next trophy to win. \"All trophies\" opens the full list.",
      "Plunderer (floor 35) was a trap beside Veteran: it now doubles gold and makes the blacksmith's gear 10% stronger.",
      "Floor 50 and 100 perks that added a percentage where the others multiplied now multiply: Ravager, Nightwalker, Master Assassin, Titan, Saint, Martyr and Hand of God."
    ]
  },
  {
    version: "20261011l",
    title: "Rage and Crusade are builds now",
    changes: [
      "Rage grows as your health falls and is all on below half health. It was all or nothing, and the Rage perks were 40 to 70 floors behind the weapon perks.",
      "Crusade counts the first turn of a fight. Its perks now climb as deep as the Zealot's weapon perks.",
      "Frenzy and Blood God also give attack and health. The Crusade skill is +2.5% a turn, since every turn now counts.",
      "Small retunes to keep every weapon level: Crossbow and the Zealot's weapons down a little, Earth and the Arcane and Rune tomes up."
    ]
  },
  {
    version: "20261011k",
    title: "Bleed, poison and burn that work",
    changes: [
      "A hit now adds a third of your bleed or poison stacks at once, not one stack. Fights are over in two or three turns, so the old way never reached the limit, and bleeding was a sixth of an axe's damage. It is now a fifth to a half, and poison likewise.",
      "Everything that raises the stack limit now matters. The Axe, Venom and Fire masteries give damage only, and the bleed, poison and burn multipliers are smaller to match.",
      "Tested for 100 hours: Axe, Venom Dagger and Fire reach floors 273 to 285, in line with every other weapon."
    ]
  },
  {
    version: "20261011j",
    title: "Souls for everyone, and no more runaway Warlock",
    changes: [
      "Every class now grows stronger with every kill of a run: Bloodlust, Resolve, Focus, Notoriety, Attunement, Fervour, The Hunt. 100 kills give +20% damage, and each kill past that counts for less. It is lost when you fall.",
      "The Warlock's souls are now exactly that, and nothing raises them. Before, a skill, a boon, five perks and a relic multiplied souls on top of critical hits and echoes, to over +1000%.",
      "The Warlock's soul perks, Soul Mastery and Soul Jar keep their names and give plain attack and health instead.",
      "In 100 hours of testing every build now reaches floors 268 to 314, with the Warlock in the middle."
    ]
  },
  {
    version: "20261011i",
    title: "The Elementalist's elements, where you look for them",
    changes: [
      "The Elementalist now picks its element on the Blacksmith tab too, under \"Fight with\", where every other class picks its weapon. It was only on the Skills tab."
    ]
  },
  {
    version: "20261011h",
    title: "Shields, healing and health matter again",
    changes: [
      "Past floor 35 a monster's attack now grows more slowly than its health. Before, one hit was more than any hero's whole health from about floor 40, so only killing on the first turn worked.",
      "Every weapon now reaches about the same depth: in 100 hours of testing, floors 254 to 306, where it was 165 to 287.",
      "Stronger class skills: Hunter's Mark, Bond, Crusade, Rage, Ambush Training, Soul Mastery and Plating. The Warden's Power also feeds its shield.",
      "Floor 100 perks retuned for the builds that were behind. The Spiked Shield's reflection perks are smaller, as it no longer needs them."
    ]
  },
  {
    version: "20261011g",
    title: "Double speed you can see",
    changes: [
      "Double speed while watching now plays every fight twice as fast on screen. Before, it doubled the climb but looked the same.",
      "\"x2 speed\" shows by the floor number while it is on."
    ]
  },
  {
    version: "20261011f",
    title: "Smoother monsters",
    changes: [
      "The monsters' pictures are enlarged with their edges rounded off, so they no longer show as blocks.",
      "The Wild Boar is a boar now: brown, bristled and tusked."
    ]
  },
  {
    version: "20261011e",
    title: "Bestiary",
    changes: [
      "The Inventory tab has a Bestiary: every kind of monster and boss, a shadow until you kill your first.",
      "A kind you know well drops more gold: +10% at 10, 100, 1,000 and 10,000 killed, across all your classes."
    ]
  },
  {
    version: "20261011d",
    title: "Pictures for every monster",
    changes: [
      "All 72 monsters and bosses have pixel art in place of emoji, and so does the Beast Tamer.",
      "The art is from Dungeon Crawl Stone Soup, given to the public domain by its artists. Credits are in Settings."
    ]
  },
  {
    version: "20261011c",
    title: "Tidier windows",
    changes: [
      "The Updates window has an X at the top, and also closes with Escape or a click outside it.",
      "The favourite boon is now one line in town with a Change button. The list opens in its own window."
    ]
  },
  {
    version: "20261011b",
    title: "Plain attack perks worth picking",
    changes: [
      "The plain attack perks at floors 50, 75 and 100 now multiply attack (x1.3 to x1.5). They used to add a percentage that was worth very little by then."
    ]
  },
  {
    version: "20261011a",
    title: "What is kept, and what is lost",
    changes: [
      "The Ascension tab has a table of what you keep and lose when you fall, when you ascend, and when you become a legend."
    ]
  },
  {
    version: "20261010z",
    title: "The fight stays in sight on a phone",
    changes: [
      "On a narrow screen, a strip at the top shows the floor and both health bars while any other tab is open. Tap it to go to the fight."
    ]
  },
  {
    version: "20261010y",
    title: "Potions that keep themselves stocked",
    changes: [
      "A tick box in town fills your potion belt from the bank every time you fall.",
      "A potion now costs more the deeper you have been: 150 gold more for every 10 floors."
    ]
  },
  {
    version: "20261010x",
    title: "More time away",
    changes: [
      "Settings now says how much time away counts: 8 hours.",
      "The Night Watch in town raises it to 16 hours, and is kept through ascensions."
    ]
  },
  {
    version: "20261010w",
    title: "How you stand against the floor",
    changes: [
      "Two bars under the fight show your damage against an ordinary monster's health here, and its hit against yours.",
      "The level card says what falling now would pay and how many such falls the next level needs."
    ]
  },
  {
    version: "20261010v",
    title: "Updates button in Settings",
    changes: [
      "The Settings tab has an Updates button, with the version you are playing beside it."
    ]
  },
  {
    version: "20261010u",
    title: "Reload loop fixed",
    changes: [
      "Refreshing the page while logged in could trap the game in a loop of reloading, with pop-ups that could not be clicked. Fixed.",
      "Your progress in this browser is kept through a refresh: the online copy is only taken when another device has really played."
    ]
  },
  {
    version: "20261010t",
    title: "Runaway builds reined in",
    changes: [
      "The Void Tome's tear is now a true share of the enemy's health. Fame used to multiply it, until it killed anything in one spell on any floor.",
      "The same relic can be held three times in a run, not without limit, and no cooldown or armor can be pushed past a fixed limit.",
      "Late-game balance: the Stiletto's and Ice's critical perks are x1.6, and the big perks of the Axe, Shadow Blade, Venom Dagger and Mace and Shield now also multiply attack.",
      "The Tactician's list says what every boon does, and warns when your favourite does not work with your weapon.",
      "A run can never start above the floor the last one ended on, and the log says where the next run starts and why."
    ]
  },
  {
    version: "20261010s",
    title: "Class relics do something too",
    changes: [
      "Every class's own relics keep what they gave their weapon and gain an effect of their own, such as healing from damage or a first turn the enemy misses."
    ]
  },
  {
    version: "20261010r",
    title: "A second weapon",
    changes: [
      "A new Legend unlock lets every class carry a second weapon or element and fight bosses with it."
    ]
  },
  {
    version: "20261010q",
    title: "Named weapons",
    changes: [
      "Floor 100 of another class's tower now wins a named weapon, such as Whisper or Dragonsoul, each with a rule of its own.",
      "You wield one at a time, picked at the blacksmith, and it keeps the blacksmith's work."
    ]
  },
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
