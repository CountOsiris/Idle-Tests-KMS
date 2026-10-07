// =====================================================================
//  towers.js - the towers, and the monsters and bosses that live in them.
//  Loaded after data.js.
// =====================================================================
// There is one tower per class, listed under the class's own name.
// A class is at HOME in its own tower: the monsters there suit the way it fights.
// In any other tower it is AWAY: monsters are stronger (see the "away" numbers
// in data.js), but it earns more experience and can win that tower's trophies for itself.
//
// ----- Pictures -----
// Every tower has an icon, which is the picture shown for its monsters.
// A single monster or boss can have its own by adding  icon: "🐺"  to its line.
//
// ----- Monsters -----
// A normal monster on floor F starts with:
//   health 20 + F x 10,  attack 1 + F x 2,  armor F / 2
// Each kind of monster then multiplies those numbers.
//
// TO ADD A MONSTER: add a line to a tower's monsters list. It needs:
//   name      - what the player sees
//   text      - a short description, shown under its name
//   minFloor  - the first floor it can appear on
//   hp, attack, armor, gold - multipliers (1 is normal, 2 is double, 0.5 is half)
// and it can have any of these special traits:
//   poison: 0.3  - 30% of its attack ignores your armor
//   regen: 0.04  - heals 4% of its health every turn
//   enrage: 0.1  - its attack grows by 10% every turn
//
// ----- Bosses -----
// Bosses guard the last room of every 5th floor, in the order listed, then start again.
// On top of the numbers here, every boss has triple health and 50% more attack.
//
// ----- Trophies -----
// A trophy is a permanent bonus for the class that wins it (each class wins its own).
// It is won the first time that class reaches the trophy's floor in a tower that is NOT its own.
// Every trophy needs: floor, id (unique, don't rename it later), name, text, bonus.
// The bonus can only use the words every class understands:
//   maxHp, attack, armor, gold, experience

const towers = {
  barbarian: {
    name: "Orc Stronghold",
    icon: "👹",
    text: "Big, loud and lightly armored. Plenty of flesh to steal life from.",
    monsters: [
      { name: "Goblin", icon: "👺",text: "Carries more gold than it should.", minFloor: 1, hp: 0.9, attack: 1, armor: 0.5, gold: 1.5 },
      { name: "Orc Grunt", text: "Thick-skulled and thick-skinned.", minFloor: 1, hp: 1.2, attack: 1, armor: 0.5, gold: 1 },
      { name: "Warg", icon: "🐺",text: "Bites hard, drops fast.", minFloor: 2, hp: 0.9, attack: 1.3, armor: 0.5, gold: 1 },
      { name: "Orc Warrior", text: "Tough and stubborn.", minFloor: 4, hp: 1.5, attack: 1.1, armor: 0.5, gold: 1.2 },
      { name: "Orc Berserker", icon: "😡",text: "Enrages: its attack grows by 10% every turn.", minFloor: 8, hp: 1.2, attack: 0.9, armor: 0, gold: 1.4, enrage: 0.1 },
      { name: "Ogre", icon: "🦍",text: "A mountain of health.", minFloor: 10, hp: 2, attack: 1.2, armor: 0.5, gold: 1.5 }
    ],
    bosses: [
      { name: "Orc Warlord", text: "The first real test.", hp: 1, attack: 1, armor: 1, gold: 1 },
      { name: "Ogre Chieftain", icon: "🦍",text: "Even more health than the rest of them.", hp: 1.4, attack: 1, armor: 0.5, gold: 1.2 },
      { name: "Warg Mother", icon: "🐺",text: "Enrages: her attack grows by 10% every turn.", hp: 1.1, attack: 1, armor: 0.5, gold: 1.2, enrage: 0.1 }
    ],
    trophies: [
      { floor: 10, id: "warlordsBanner", name: "Warlord's Banner", text: "+5 attack", bonus: { attack: 5 } },
      { floor: 20, id: "warlordsAxe", name: "Warlord's Axe", text: "+8 attack", bonus: { attack: 8 } },
      { floor: 30, id: "warlordsCrown", name: "Warlord's Crown", text: "+12 attack", bonus: { attack: 12 } }
    ]
  },

  warden: {
    name: "Raider's Pass",
    icon: "🤺",
    text: "Reckless raiders who hit hard and fall quickly. Every blow they land comes straight back.",
    monsters: [
      { name: "Cutpurse", icon: "🦹",text: "Quick hands and a full purse.", minFloor: 1, hp: 0.7, attack: 1.1, armor: 0.5, gold: 1.6 },
      { name: "Raider", text: "All attack, no defence.", minFloor: 1, hp: 0.8, attack: 1.4, armor: 1, gold: 1 },
      { name: "Crossbowman", icon: "🏹",text: "A heavy bolt and a thin jacket.", minFloor: 3, hp: 0.7, attack: 1.6, armor: 0.5, gold: 1 },
      { name: "Duelist", text: "Strikes fast and hard.", minFloor: 5, hp: 0.9, attack: 1.5, armor: 1, gold: 1.2 },
      { name: "Raider Captain", icon: "⚔️",text: "The hardest hitter in the pass.", minFloor: 8, hp: 1.1, attack: 1.6, armor: 1, gold: 1.4 },
      { name: "Pit Fighter", icon: "🥊",text: "Enrages: his attack grows by 10% every turn.", minFloor: 10, hp: 1, attack: 1.2, armor: 0.5, gold: 1.4, enrage: 0.1 }
    ],
    bosses: [
      { name: "Bandit King", icon: "👑",text: "Hits harder than anyone in the pass.", hp: 1, attack: 1.3, armor: 1, gold: 1.5 },
      { name: "The Twin Blades", icon: "⚔️",text: "Two swords, very little patience.", hp: 0.9, attack: 1.5, armor: 0.5, gold: 1.2 },
      { name: "Warlord of the Pass", icon: "🏇",text: "Enrages: his attack grows by 10% every turn.", hp: 1.1, attack: 1.1, armor: 1, gold: 1.2, enrage: 0.1 }
    ],
    trophies: [
      { floor: 10, id: "raidersShield", name: "Raider's Shield", text: "+3 armor", bonus: { armor: 3 } },
      { floor: 20, id: "raidersMail", name: "Raider's Mail", text: "+4 armor", bonus: { armor: 4 } },
      { floor: 30, id: "banditKingsPlate", name: "Bandit King's Plate", text: "+6 armor", bonus: { armor: 6 } }
    ]
  },

  ranger: {
    name: "Wildwood",
    icon: "🐗",
    text: "Slow, heavy beasts. They take a long time to reach an archer.",
    monsters: [
      { name: "Wild Boar", text: "Charges in a straight line.", minFloor: 1, hp: 1.2, attack: 1.1, armor: 0.5, gold: 1 },
      { name: "Giant Spider", icon: "🕷️",text: "Venomous: 30% of its attack ignores your armor.", minFloor: 1, hp: 0.9, attack: 1, armor: 1, gold: 1.1, poison: 0.3 },
      { name: "Dire Wolf", icon: "🐺",text: "Bites hard, drops fast.", minFloor: 3, hp: 1, attack: 1.3, armor: 0.5, gold: 1 },
      { name: "Treant", icon: "🌳",text: "Slow, tough and covered in bark.", minFloor: 5, hp: 1.8, attack: 0.8, armor: 1.5, gold: 1.2 },
      { name: "Forest Troll", icon: "👹",text: "Regenerates 4% of its health every turn.", minFloor: 7, hp: 1.3, attack: 1, armor: 1, gold: 1.3, regen: 0.04 },
      { name: "Dire Bear", icon: "🐻",text: "Huge, and hits like it.", minFloor: 10, hp: 1.8, attack: 1.4, armor: 1, gold: 1.5 }
    ],
    bosses: [
      { name: "Spider Queen", icon: "🕸️",text: "Venomous: 40% of her attack ignores your armor.", hp: 1, attack: 1, armor: 1, gold: 1.2, poison: 0.4 },
      { name: "Elder Treant", icon: "🌲",text: "Ancient, armored and very hard to fell.", hp: 1.5, attack: 0.9, armor: 1.5, gold: 1.2 },
      { name: "Troll King", icon: "👹",text: "Regenerates 3% of his health every turn.", hp: 1.2, attack: 1, armor: 1, gold: 1.2, regen: 0.03 }
    ],
    trophies: [
      { floor: 10, id: "heartOfTheWild", name: "Heart of the Wild", text: "+40 health", bonus: { maxHp: 40 } },
      { floor: 20, id: "elderBark", name: "Elder Bark", text: "+60 health", bonus: { maxHp: 60 } },
      { floor: 30, id: "trollKingsBlood", name: "Troll King's Blood", text: "+100 health", bonus: { maxHp: 100 } }
    ]
  },

  assassin: {
    name: "The Undercity",
    icon: "🐀",
    text: "Thugs and vermin in the dark. Frail enough to fall to one well-placed blade.",
    monsters: [
      { name: "Sewer Rat", text: "Weak. Everyone starts somewhere.", minFloor: 1, hp: 0.8, attack: 0.9, armor: 0, gold: 0.7 },
      { name: "Thug", icon: "😠",text: "Swings first, thinks never.", minFloor: 1, hp: 0.95, attack: 1.2, armor: 0.5, gold: 0.9 },
      { name: "Smuggler", icon: "🕵️",text: "More gold than anyone else down here.", minFloor: 2, hp: 0.9, attack: 1, armor: 0.5, gold: 1.4 },
      { name: "Watchman", icon: "💂",text: "Wears real armor: double.", minFloor: 4, hp: 1, attack: 1, armor: 2, gold: 1 },
      { name: "Plague Bearer", icon: "🤢",text: "Venomous: 30% of its attack ignores your armor.", minFloor: 6, hp: 1, attack: 1, armor: 0.5, gold: 1, poison: 0.3 },
      { name: "Enforcer", icon: "👊",text: "The guild's muscle.", minFloor: 9, hp: 1.2, attack: 1.4, armor: 1.5, gold: 1.2 }
    ],
    bosses: [
      { name: "Rat King", text: "Venomous: 30% of its attack ignores your armor.", hp: 1, attack: 1, armor: 0.5, gold: 1.2, poison: 0.3 },
      { name: "Guildmaster", icon: "🎩",text: "Did not get the job by fighting fair.", hp: 1, attack: 1.3, armor: 1, gold: 1.5 },
      { name: "The Butcher", icon: "🔪",text: "Enrages: his attack grows by 10% every turn.", hp: 1.1, attack: 1, armor: 0.5, gold: 1.2, enrage: 0.1 }
    ],
    trophies: [
      { floor: 10, id: "thievesPurse", name: "Thieves' Purse", text: "+25% gold", bonus: { gold: 0.25 } },
      { floor: 20, id: "smugglersLedger", name: "Smuggler's Ledger", text: "+25% gold", bonus: { gold: 0.25 } },
      { floor: 30, id: "guildmastersSeal", name: "Guildmaster's Seal", text: "+50% gold", bonus: { gold: 0.5 } }
    ]
  },

  warlock: {
    name: "Iron Crypt",
    icon: "💀",
    text: "The armored dead. Steel means nothing to a spell.",
    monsters: [
      { name: "Skeleton", text: "Old bones are hard to cut: double armor.", minFloor: 1, hp: 0.9, attack: 0.9, armor: 2, gold: 1 },
      { name: "Armored Ghoul", icon: "🧟",text: "Somebody buried it in its plate.", minFloor: 2, hp: 1, attack: 1, armor: 2.5, gold: 1 },
      { name: "Bone Knight", icon: "☠️",text: "Triple armor.", minFloor: 4, hp: 1.1, attack: 1.1, armor: 3, gold: 1.2 },
      { name: "Iron Golem", icon: "🤖",text: "Slow, with four times the armor.", minFloor: 6, hp: 1.4, attack: 0.7, armor: 4, gold: 1.4 },
      { name: "Crypt Guardian", icon: "🗿",text: "Triple armor and a lot of health.", minFloor: 9, hp: 1.5, attack: 1.1, armor: 3, gold: 1.3 },
      { name: "Death Knight", icon: "⚰️",text: "Triple armor, and it hits back hard.", minFloor: 12, hp: 1.3, attack: 1.3, armor: 3, gold: 1.5 }
    ],
    bosses: [
      { name: "Bone Lich", icon: "🧙",text: "Double armor, and hits harder than most.", hp: 1, attack: 1.2, armor: 2, gold: 1.2 },
      { name: "Iron Colossus", icon: "🤖",text: "Four times the armor.", hp: 1.3, attack: 0.9, armor: 4, gold: 1.2 },
      { name: "The Entombed King", icon: "👑",text: "Triple armor, and regenerates 2% of his health every turn.", hp: 1.1, attack: 1, armor: 3, gold: 1.5, regen: 0.02 }
    ],
    trophies: [
      { floor: 10, id: "cryptLore", name: "Crypt Lore", text: "+20% experience", bonus: { experience: 0.2 } },
      { floor: 20, id: "lichsGrimoire", name: "Lich's Grimoire", text: "+20% experience", bonus: { experience: 0.2 } },
      { floor: 30, id: "entombedCrown", name: "Entombed Crown", text: "+30% experience", bonus: { experience: 0.3 } }
    ]
  },

  elementalist: {
    name: "Storm Peak",
    icon: "🐉",
    text: "A bit of everything: armor, venom and fury. The right element answers each of them.",
    monsters: [
      { name: "Harpy", icon: "🦅",text: "Dives fast, breaks easily.", minFloor: 1, hp: 0.95, attack: 1.2, armor: 0.5, gold: 0.9 },
      { name: "Rock Imp", icon: "👿",text: "Small, but made of stone.", minFloor: 1, hp: 0.9, attack: 0.8, armor: 2.5, gold: 1 },
      { name: "Frost Wisp", icon: "❄️",text: "Hits very hard, but barely holds together.", minFloor: 3, hp: 0.6, attack: 1.5, armor: 0, gold: 1.2 },
      { name: "Venom Drake", icon: "🐍",text: "Venomous: 30% of its attack ignores your armor.", minFloor: 5, hp: 1, attack: 1, armor: 1, gold: 1.2, poison: 0.3 },
      { name: "Magma Hound", icon: "🌋",text: "Enrages: its attack grows by 10% every turn.", minFloor: 8, hp: 1.1, attack: 1, armor: 0.5, gold: 1.4, enrage: 0.1 },
      { name: "Storm Giant", icon: "⛈️",text: "Huge, armored and angry.", minFloor: 11, hp: 1.8, attack: 1.3, armor: 1.5, gold: 1.5 }
    ],
    bosses: [
      { name: "Thunderbird", icon: "⚡",text: "Strikes like lightning.", hp: 0.9, attack: 1.3, armor: 0.5, gold: 1.2 },
      { name: "Mountain Heart", icon: "⛰️",text: "Triple armor, and regenerates 2% of its health every turn.", hp: 1.3, attack: 0.9, armor: 3, gold: 1.2, regen: 0.02 },
      { name: "Red Dragon", icon: "🐲",text: "Enrages: its attack grows by 10% every turn.", hp: 1.3, attack: 1, armor: 1, gold: 1.5, enrage: 0.1 }
    ],
    trophies: [
      { floor: 10, id: "stormShard", name: "Storm Shard", text: "+4 attack and +20 health", bonus: { attack: 4, maxHp: 20 } },
      { floor: 20, id: "thunderFeather", name: "Thunder Feather", text: "+6 attack and +30 health", bonus: { attack: 6, maxHp: 30 } },
      { floor: 30, id: "dragonHeart", name: "Dragon Heart", text: "+10 attack and +50 health", bonus: { attack: 10, maxHp: 50 } }
    ]
  },

  zealot: {
    name: "Haunted Abbey",
    icon: "👻",
    text: "The restless dead. They wear you down slowly, which only works on those who cannot heal.",
    monsters: [
      { name: "Zombie", icon: "🧟",text: "Slow, with a lot of health.", minFloor: 1, hp: 1.4, attack: 0.8, armor: 0.5, gold: 1 },
      { name: "Ghoul", text: "Venomous: 20% of its attack ignores your armor.", minFloor: 1, hp: 1, attack: 0.9, armor: 0.5, gold: 1, poison: 0.2 },
      { name: "Restless Monk", icon: "🙏",text: "Still keeping his vows, more or less.", minFloor: 3, hp: 1, attack: 1, armor: 1, gold: 1.2 },
      { name: "Wraith", text: "Hits very hard, but barely holds together.", minFloor: 5, hp: 0.7, attack: 1.5, armor: 0, gold: 1.5 },
      { name: "Vampire Thrall", icon: "🧛",text: "Regenerates 4% of its health every turn.", minFloor: 8, hp: 1.2, attack: 1, armor: 1, gold: 1.3, regen: 0.04 },
      { name: "Banshee", icon: "😱",text: "Her wail goes through armor: 40% of her attack ignores it.", minFloor: 11, hp: 0.9, attack: 1.1, armor: 0.5, gold: 1.4, poison: 0.4 }
    ],
    bosses: [
      { name: "The Abbot", icon: "📿",text: "Regenerates 3% of his health every turn.", hp: 1.1, attack: 1, armor: 1, gold: 1.2, regen: 0.03 },
      { name: "Vampire Lord", icon: "🦇",text: "Hits hard, and regenerates 3% of his health every turn.", hp: 1, attack: 1.2, armor: 1, gold: 1.5, regen: 0.03 },
      { name: "Lich Bishop", icon: "☠️",text: "Double armor, and 30% of his attack ignores yours.", hp: 1, attack: 1, armor: 2, gold: 1.2, poison: 0.3 }
    ],
    trophies: [
      { floor: 10, id: "abbeyBlessing", name: "Abbey Blessing", text: "+30 health and +1 armor", bonus: { maxHp: 30, armor: 1 } },
      { floor: 20, id: "abbotsRosary", name: "Abbot's Rosary", text: "+45 health and +2 armor", bonus: { maxHp: 45, armor: 2 } },
      { floor: 30, id: "saintsRelic", name: "Saint's Relic", text: "+75 health and +3 armor", bonus: { maxHp: 75, armor: 3 } }
    ]
  }
};
