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
// Every tower has a "sky": the colour the fight is tinted with while you are there.
// Every tower has an icon, which is the picture shown for its monsters.
// A single monster or boss can have its own by adding  icon: "🐺"  to its line.
//
// PIXEL ART: to give a monster or boss a real picture instead of an emoji, put the
// image file in a folder called "art" next to index.html and add  art: "art/goblin.png"
// to its line. The emoji stays as the fallback and is still used in lists.
// A class gets art the same way, with an  art:  line in its file under  icon:
//
// ----- Monsters -----
// A normal monster on floor F starts with:
//   the health and attack that data.js works out for floor F, and armor that blocks 10%
//   of every weapon hit (armor and ward are shares of a hit: see data.js)
// Each kind of monster then multiplies those numbers.
//
// TO ADD A MONSTER: add a line to a tower's monsters list. It needs:
//   name      - what the player sees
//   text      - a short description, shown under its name
//   minFloor  - the first floor it can appear on
//   hp, attack, armor, gold - multipliers (1 is normal, 2 is double, 0.5 is half)
// and it can have any of these special traits:
//   ward: 2      - how much of every SPELL that hits it is blocked, the way armor
//                  blocks a weapon swing (1 blocks 10%, 2 blocks 20%).
//                  Written on a tower it counts for every monster in it; a monster
//                  can have its own. Left out, there is no ward.
//   weak: ["crushing", "holy"]   - damage types it takes 25% more from
//   resist: ["piercing"]         - damage types it takes 40% less from (see data.js for the list)
//   flying: true - weapon swings miss it some of the time; arrows and spells never do
//   lunge: true  - it strikes first at the start of the fight, unless your class fights
//                  from range. Written on a tower it counts for every monster in it.
//   poison: 0.3  - 30% of its attack ignores your armor
//   regen: 0.04  - heals 4% of its health every turn
//   enrage: 0.1  - its attack grows by 10% every turn
//
// ----- Bosses -----
// Bosses guard the last room of every 5th floor, in the order listed, then start again.
// On top of the numbers here, every boss has more health and attack (bossHealth and
// bossAttack in data.js).
// A boss can have MECHANICS: rules of its own, from floor 10 up. Add for example
//   mechanics: ["shield"]
// The choices are shield, summons, enrage, reflect and armorUp; what each does and its
// numbers are under "Boss mechanics" in data.js. Keep to the rule that a home tower
// never works against its own class: armorUp only where the class casts spells.
//
// ----- Challenging another class's tower -----
// A class that climbs a tower that is not its own is CHALLENGING it. As well as the
// stronger monsters (the "away" numbers in data.js), the tower has a RULE for challengers:
//   awayRule: { name: "Deep woods", text: "no healing potions can be drunk here", bonus: { noPotions: 1 } }
// The rule's bonus words are added to the challenger's own while it is there. The words
// made for rules (any other bonus word works too, and a negative number takes away):
//   enrageAll    every monster's attack grows this much each turn   (0.03 means 3%)
//   ambushed     1 = every monster strikes first, unless the class fights from range
//   noPotions    1 = potions cannot be drunk
//   lostOpening  1 = the class does nothing on the first turn of a fight
//   noKillHeal   1 = no healing after a kill
//   quickHands   share taken off ability cooldowns (so -0.5 makes them half as long again)
//   drain        share of full health lost every turn of a fight   (0.02 means 2%)
//
// ----- Trophies: the tiers of the challenge -----
// A trophy is a permanent bonus for the class that wins it (each class wins its own).
// It is won the first time that class reaches the trophy's floor in a tower that is NOT its own.
// Every tower has six tiers: floors 10, 20, 30, 50, 75 and 100. What they pay grows
// from small to build-changing, the same way in every tower:
//   10, 20  a percentage
//   30      a percentage and a TECHNIQUE: a small mechanic borrowed from that tower's class
//   50      an ABILITY any class can put in a slot (written on the trophy as  ability: { ... } ,
//           exactly like the abilities in a class file)
//   75      a RELIC SLOT: one more relic kept when you fall
//   100     a passive that changes a rule
// Techniques and passives are bonus words, read by the game with totalBonus("theWord"):
//   leech       share of the damage your turns deal that heals you
//   brace       share of every attack against you thrown back, ignoring armor
//   headStart   1 = an enemy that is not a boss misses its first turn
//   sidestep    chance to avoid any attack
//   killStreak  damage added by every kill this run (stops at +100%)
//   exploit     extra damage of a hit on a weakness
//   prayer      share of your health healed every turn of a fight
//   relicSlots  relics kept when you fall
//   bossSlayer  extra damage against bosses
//   opener      extra damage on the first turn of a fight
//   finisher    extra damage against an enemy below half health
//   and armorLimit, secondWind and quickHands, which keystones use too (see data.js)
// Every trophy needs: floor, id (unique, don't rename it later), name, text, and a
// multiply (like a perk's, which never fades as the class grows) or a bonus, or both.
// The bonus can only use the words every class understands:
//   maxHp, attack, armor, gold, experience

const towers = {
  barbarian: {
    awayRule: { name: "War drums", text: "every monster grows angrier: its attack rises by 3% each turn", bonus: { enrageAll: 0.03 } },
    name: "Orc Stronghold",
    ward: 2,          // shamans' charms: spells lose twice what a normal armor would take
    sky: "#4d2e1a",
    icon: "👹",
    text: "Big, loud and lightly armored. Plenty of flesh to steal life from.",
    monsters: [
      { name: "Goblin", icon: "👺",text: "Carries more gold than it should.", minFloor: 1, hp: 0.9, attack: 1, armor: 0.5, gold: 1.5, weak: ["slashing", "fire"], resist: ["arcane"] },
      { name: "Orc Grunt", text: "Thick-skulled and thick-skinned.", minFloor: 1, hp: 1.2, attack: 1, armor: 0.5, gold: 1, weak: ["slashing"], resist: ["piercing", "arcane"] },
      { name: "Warg", icon: "🐺",text: "Bites hard, drops fast.", minFloor: 2, hp: 0.9, attack: 1.3, armor: 0.5, gold: 1, weak: ["fire", "crushing"], resist: ["nature", "ice"] },
      { name: "Orc Warrior", text: "Tough and stubborn.", minFloor: 4, hp: 1.5, attack: 1.1, armor: 0.5, gold: 1.2, weak: ["crushing"], resist: ["piercing", "arcane", "nature"] },
      { name: "Orc Berserker", icon: "😡",text: "Enrages: its attack grows by 10% every turn.", minFloor: 8, hp: 1.2, attack: 0.9, armor: 0, gold: 1.4, enrage: 0.1, weak: ["affliction", "ice"], resist: ["piercing", "arcane", "holy"] },
      { name: "Ogre", icon: "🦍",text: "A mountain of health.", minFloor: 10, hp: 2, attack: 1.2, armor: 0.5, gold: 1.5, weak: ["slashing", "lightning"], resist: ["piercing", "nature", "earth"] }
    ],
    bosses: [
      { name: "Orc Warlord", text: "The first real test.", hp: 1, attack: 1, armor: 1, gold: 1, weak: ["slashing"], resist: ["piercing", "arcane", "nature"], mechanics: ["enrage"] },
      { name: "Ogre Chieftain", icon: "🦍",text: "Even more health than the rest of them.", hp: 1.4, attack: 1, armor: 0.5, gold: 1.2, weak: ["affliction", "lightning"], resist: ["piercing", "earth", "holy"], mechanics: ["reflect"] },
      { name: "Warg Mother", icon: "🐺",text: "Enrages: her attack grows by 10% every turn.", hp: 1.1, attack: 1, armor: 0.5, gold: 1.2, enrage: 0.1, weak: ["fire", "crushing"], resist: ["nature", "ice", "arcane"], mechanics: ["summons"] }
    ],
    trophies: [
      { floor: 10, id: "warlordsBanner", name: "Warlord's Banner", text: "attack x1.1", multiply: { attack: 1.1 } },
      { floor: 20, id: "warlordsAxe", name: "Warlord's Axe", text: "attack x1.15", multiply: { attack: 1.15 } },
      { floor: 30, id: "warlordsCrown", name: "Warlord's Crown", text: "attack x1.25, and the technique Bloodthirst: you heal for 3% of the damage your turns deal", multiply: { attack: 1.25 }, bonus: { leech: 0.03 } },
      { floor: 50, id: "warlordsHorn", name: "Warlord's Horn", text: "teaches the ability War Horn: all your damage +60% for 4 turns",
        ability: { id: "towerWarHorn", name: "War Horn", text: "All your damage +60% for 4 turns", cooldown: 14, use: function () { abilityBoost(0.6, 4); } } },
      { floor: 75, id: "warlordsMantle", name: "Warlord's Mantle", text: "a relic slot: you keep 1 more relic when you fall", bonus: { relicSlots: 1 } },
      { floor: 100, id: "throneOfSkulls", name: "Throne of Skulls", text: "Warlord's Fury: all your damage +50% against bosses", bonus: { bossSlayer: 0.5 } }
    ]
  },

  warden: {
    awayRule: { name: "Ambush", text: "every monster strikes first, unless you fight from range", bonus: { ambushed: 1 } },
    name: "Raider's Pass",
    ward: 2.5,
    sky: "#3a3f4d",
    icon: "🤺",
    text: "Reckless raiders who hit hard and fall quickly. Every blow they land comes straight back.",
    monsters: [
      { name: "Cutpurse", icon: "🦹",text: "Quick hands and a full purse.", minFloor: 1, hp: 0.7, attack: 1.1, armor: 0.5, gold: 1.6, weak: ["piercing", "fire"], resist: ["affliction"] },
      { name: "Raider", text: "All attack, no defence.", minFloor: 1, hp: 0.8, attack: 1.4, armor: 1, gold: 1, weak: ["piercing"], resist: ["crushing", "arcane"] },
      { name: "Crossbowman", icon: "🏹",text: "A heavy bolt and a thin jacket.", minFloor: 3, hp: 0.7, attack: 1.6, armor: 0.5, gold: 1, weak: ["slashing", "nature"], resist: ["crushing", "ice"] },
      { name: "Duelist", text: "Strikes fast and hard.", minFloor: 5, hp: 0.9, attack: 1.5, armor: 1, gold: 1.2, weak: ["piercing", "lightning"], resist: ["crushing", "affliction", "arcane"] },
      { name: "Raider Captain", icon: "⚔️",text: "The hardest hitter in the pass.", minFloor: 8, hp: 1.1, attack: 1.6, armor: 1, gold: 1.4, weak: ["slashing", "lightning"], resist: ["crushing", "fire", "holy"] },
      { name: "Pit Fighter", icon: "🥊",text: "Enrages: his attack grows by 10% every turn.", minFloor: 10, hp: 1, attack: 1.2, armor: 0.5, gold: 1.4, enrage: 0.1, weak: ["piercing", "ice"], resist: ["crushing", "affliction", "nature"] }
    ],
    bosses: [
      { name: "Bandit King", icon: "👑",text: "Hits harder than anyone in the pass.", hp: 1, attack: 1.3, armor: 1, gold: 1.5, weak: ["piercing"], resist: ["crushing", "arcane", "affliction"], mechanics: ["summons"] },
      { name: "The Twin Blades", icon: "⚔️",text: "Two swords, very little patience.", hp: 0.9, attack: 1.5, armor: 0.5, gold: 1.2, weak: ["slashing", "lightning"], resist: ["crushing", "fire", "nature"], mechanics: ["enrage"] },
      { name: "Warlord of the Pass", icon: "🏇",text: "Enrages: his attack grows by 10% every turn.", hp: 1.1, attack: 1.1, armor: 1, gold: 1.2, enrage: 0.1, weak: ["piercing"], resist: ["crushing", "elemental", "holy"], mechanics: ["shield"] }
    ],
    trophies: [
      { floor: 10, id: "raidersShield", name: "Raider's Shield", text: "+3 armor", bonus: { armor: 3 } },
      { floor: 20, id: "raidersMail", name: "Raider's Mail", text: "+4 armor", bonus: { armor: 4 } },
      { floor: 30, id: "banditKingsPlate", name: "Bandit King's Plate", text: "+6 armor, and the technique Brace: a quarter of every attack against you is thrown back at the enemy", bonus: { armor: 6, brace: 0.25 } },
      { floor: 50, id: "captainsBulwark", name: "Captain's Bulwark", text: "teaches the ability Raise Shields: take 60% less damage for 3 turns",
        ability: { id: "towerRaiseShields", name: "Raise Shields", text: "Take 60% less damage for 3 turns", cooldown: 12, use: function () { abilityGuard(0.6, 3); } } },
      { floor: 75, id: "passKeepersAegis", name: "Pass Keeper's Aegis", text: "a relic slot: you keep 1 more relic when you fall", bonus: { relicSlots: 1 } },
      { floor: 100, id: "kingOfThePass", name: "King of the Pass", text: "Unbreakable: your armor can block 10% more of every hit", bonus: { armorLimit: 0.1 } }
    ]
  },

  ranger: {
    awayRule: { name: "Deep woods", text: "no healing potions can be drunk here", bonus: { noPotions: 1 } },
    name: "Wildwood",
    lunge: true,      // its beasts leap out: they hit first, unless you fight from range
    ward: 3,          // old forest magic: the hardest place for a caster
    sky: "#1d4028",
    icon: "🐗",
    text: "Slow, heavy beasts. They take a long time to reach an archer.",
    monsters: [
      { name: "Wild Boar", text: "Charges in a straight line.", minFloor: 1, hp: 1.2, attack: 1.1, armor: 0.5, gold: 1, weak: ["piercing"], resist: ["crushing", "earth"] },
      { name: "Giant Spider", icon: "🕷️",text: "Venomous: 30% of its attack ignores your armor.", minFloor: 1, hp: 0.9, attack: 1, armor: 1, gold: 1.1, poison: 0.3, weak: ["fire", "piercing"], resist: ["affliction", "arcane"] },
      { name: "Dire Wolf", icon: "🐺",text: "Bites hard, drops fast.", minFloor: 3, hp: 1, attack: 1.3, armor: 0.5, gold: 1, weak: ["piercing", "fire"], resist: ["arcane", "holy"] },
      { name: "Treant", icon: "🌳",text: "Slow, tough and covered in bark.", minFloor: 5, hp: 1.8, attack: 0.8, armor: 1.5, gold: 1.2, weak: ["fire", "slashing"], resist: ["crushing", "earth", "arcane"] },
      { name: "Forest Troll", icon: "👹",text: "Regenerates 4% of its health every turn.", minFloor: 7, hp: 1.3, attack: 1, armor: 1, gold: 1.3, regen: 0.04, weak: ["fire", "nature"], resist: ["crushing", "affliction", "holy"] },
      { name: "Dire Bear", icon: "🐻",text: "Huge, and hits like it.", minFloor: 10, hp: 1.8, attack: 1.4, armor: 1, gold: 1.5, weak: ["piercing"], resist: ["crushing", "earth", "arcane"] }
    ],
    bosses: [
      { name: "Spider Queen", icon: "🕸️",text: "Venomous: 40% of her attack ignores your armor.", hp: 1, attack: 1, armor: 1, gold: 1.2, poison: 0.4, weak: ["fire", "piercing"], resist: ["affliction", "arcane", "holy"], mechanics: ["summons"] },
      { name: "Elder Treant", icon: "🌲",text: "Ancient, armored and very hard to fell.", hp: 1.5, attack: 0.9, armor: 1.5, gold: 1.2, weak: ["fire", "slashing"], resist: ["crushing", "earth", "arcane"], mechanics: ["shield"] },
      { name: "Troll King", icon: "👹",text: "Regenerates 3% of his health every turn.", hp: 1.2, attack: 1, armor: 1, gold: 1.2, regen: 0.03, weak: ["fire", "nature"], resist: ["crushing", "affliction", "holy"], mechanics: ["reflect"] }
    ],
    trophies: [
      { floor: 10, id: "heartOfTheWild", name: "Heart of the Wild", text: "health x1.1", multiply: { health: 1.1 } },
      { floor: 20, id: "elderBark", name: "Elder Bark", text: "health x1.15", multiply: { health: 1.15 } },
      { floor: 30, id: "trollKingsBlood", name: "Troll King's Blood", text: "health x1.25, and the technique Keen Eye: an enemy that is not a boss misses its first turn against you", multiply: { health: 1.25 }, bonus: { headStart: 1 } },
      { floor: 50, id: "spiderSilkCloak", name: "Spider Silk Cloak", text: "teaches the ability Snipe: 4 turns of your damage in one shot from cover",
        ability: { id: "towerSnipe", name: "Snipe", text: "4 turns of your damage in one shot from cover", cooldown: 10, use: function () { abilityTurns(4); } } },
      { floor: 75, id: "heartwood", name: "Heartwood", text: "a relic slot: you keep 1 more relic when you fall", bonus: { relicSlots: 1 } },
      { floor: 100, id: "crownOfTheWild", name: "Crown of the Wild", text: "First Shot: all your damage +100% on the first turn of every fight", bonus: { opener: 1 } }
    ]
  },

  assassin: {
    awayRule: { name: "Pitch dark", text: "you lose your first turn of every fight finding the enemy", bonus: { lostOpening: 1 } },
    name: "The Undercity",
    ward: 2,
    sky: "#2e2244",
    icon: "🐀",
    text: "Thugs and vermin in the dark. Frail enough to fall to one well-placed blade.",
    monsters: [
      { name: "Sewer Rat", text: "Weak. Everyone starts somewhere.", minFloor: 1, hp: 0.8, attack: 0.9, armor: 0, gold: 0.7, weak: ["affliction", "fire"], resist: ["nature"] },
      { name: "Thug", icon: "😠",text: "Swings first, thinks never.", minFloor: 1, hp: 0.95, attack: 1.2, armor: 0.5, gold: 0.9, weak: ["piercing"], resist: ["crushing", "holy"] },
      { name: "Smuggler", icon: "🕵️",text: "More gold than anyone else down here.", minFloor: 2, hp: 0.9, attack: 1, armor: 0.5, gold: 1.4, weak: ["slashing", "lightning"], resist: ["crushing", "arcane"] },
      { name: "Watchman", icon: "💂",text: "Wears real armor: double.", minFloor: 4, hp: 1, attack: 1, armor: 2, gold: 1, weak: ["piercing", "affliction"], resist: ["crushing", "fire", "holy"] },
      { name: "Plague Bearer", icon: "🤢",text: "Venomous: 30% of its attack ignores your armor.", minFloor: 6, hp: 1, attack: 1, armor: 0.5, gold: 1, poison: 0.3, weak: ["fire", "piercing"], resist: ["nature", "ice", "holy"] },
      { name: "Enforcer", icon: "👊",text: "The guild's muscle.", minFloor: 9, hp: 1.2, attack: 1.4, armor: 1.5, gold: 1.2, weak: ["affliction"], resist: ["crushing", "arcane", "earth"] }
    ],
    bosses: [
      { name: "Rat King", text: "Venomous: 30% of its attack ignores your armor.", hp: 1, attack: 1, armor: 0.5, gold: 1.2, poison: 0.3, weak: ["affliction", "fire"], resist: ["nature", "crushing", "holy"], mechanics: ["summons"] },
      { name: "Guildmaster", icon: "🎩",text: "Did not get the job by fighting fair.", hp: 1, attack: 1.3, armor: 1, gold: 1.5, weak: ["piercing"], resist: ["crushing", "arcane", "lightning"], mechanics: ["shield"] },
      { name: "The Butcher", icon: "🔪",text: "Enrages: his attack grows by 10% every turn.", hp: 1.1, attack: 1, armor: 0.5, gold: 1.2, enrage: 0.1, weak: ["slashing", "affliction"], resist: ["crushing", "holy", "ice"], mechanics: ["enrage"] }
    ],
    trophies: [
      { floor: 10, id: "thievesPurse", name: "Thieves' Purse", text: "+25% gold", bonus: { gold: 0.25 } },
      { floor: 20, id: "smugglersLedger", name: "Smuggler's Ledger", text: "+25% gold", bonus: { gold: 0.25 } },
      { floor: 30, id: "guildmastersSeal", name: "Guildmaster's Seal", text: "+50% gold, and the technique Sidestep: an 8% chance to avoid any attack", bonus: { gold: 0.5, sidestep: 0.08 } },
      { floor: 50, id: "fencesCut", name: "Fence's Cut", text: "teaches the ability Smoke Bomb: the enemy misses its next turn, and you take no damage this turn",
        ability: { id: "towerSmokeBomb", name: "Smoke Bomb", text: "The enemy misses its next turn, and you take no damage this turn", cooldown: 10, use: function () { abilityStun(); abilityGuard(1, 1); } } },
      { floor: 75, id: "guildVaultKey", name: "Guild Vault Key", text: "a relic slot: you keep 1 more relic when you fall", bonus: { relicSlots: 1 } },
      { floor: 100, id: "undercityLedger", name: "The Undercity's Ledger", text: "Opportunist: all your damage +40% against an enemy below half health", bonus: { finisher: 0.4 } }
    ]
  },

  warlock: {
    awayRule: { name: "Grave chill", text: "you do not heal after a kill", bonus: { noKillHeal: 1 } },
    name: "Iron Crypt",
    sky: "#1c3042",
    icon: "💀",
    text: "The armored dead. Steel means nothing to a spell.",
    monsters: [
      { name: "Skeleton", text: "Old bones are hard to cut: double armor.", minFloor: 1, hp: 0.9, attack: 0.9, armor: 2, gold: 1, weak: ["crushing", "holy"], resist: ["piercing", "slashing", "affliction"] },
      { name: "Armored Ghoul", icon: "🧟",text: "Somebody buried it in its plate.", minFloor: 2, hp: 1, attack: 1, armor: 2.5, gold: 1, weak: ["fire", "holy"], resist: ["slashing", "affliction", "nature"] },
      { name: "Bone Knight", icon: "☠️",text: "Triple armor.", minFloor: 4, hp: 1.1, attack: 1.1, armor: 3, gold: 1.2, weak: ["crushing", "holy"], resist: ["piercing", "slashing", "affliction"] },
      { name: "Iron Golem", icon: "🤖",text: "Slow, with four times the armor.", minFloor: 6, hp: 1.4, attack: 0.7, armor: 4, gold: 1.4, weak: ["lightning", "arcane"], resist: ["physical", "affliction", "nature"] },
      { name: "Crypt Guardian", icon: "🗿",text: "Triple armor and a lot of health.", minFloor: 9, hp: 1.5, attack: 1.1, armor: 3, gold: 1.3, weak: ["arcane", "earth"], resist: ["slashing", "piercing", "fire"] },
      { name: "Death Knight", icon: "⚰️",text: "Triple armor, and it hits back hard.", minFloor: 12, hp: 1.3, attack: 1.3, armor: 3, gold: 1.5, weak: ["holy", "arcane"], resist: ["slashing", "affliction", "ice"] }
    ],
    bosses: [
      { name: "Bone Lich", icon: "🧙",text: "Double armor, and hits harder than most.", hp: 1, attack: 1.2, armor: 2, gold: 1.2, weak: ["crushing", "holy"], resist: ["piercing", "affliction", "ice"], mechanics: ["summons"] },
      { name: "Iron Colossus", icon: "🤖",text: "Four times the armor.", hp: 1.3, attack: 0.9, armor: 4, gold: 1.2, weak: ["lightning", "arcane"], resist: ["physical", "affliction", "nature"], mechanics: ["armorUp"] },
      { name: "The Entombed King", icon: "👑",text: "Triple armor, and regenerates 2% of his health every turn.", hp: 1.1, attack: 1, armor: 3, gold: 1.5, regen: 0.02, weak: ["holy", "arcane"], resist: ["slashing", "piercing", "affliction"], mechanics: ["shield"] }
    ],
    trophies: [
      { floor: 10, id: "cryptLore", name: "Crypt Lore", text: "+20% experience", bonus: { experience: 0.2 } },
      { floor: 20, id: "lichsGrimoire", name: "Lich's Grimoire", text: "+20% experience", bonus: { experience: 0.2 } },
      { floor: 30, id: "entombedCrown", name: "Entombed Crown", text: "+30% experience, and the technique Soul Siphon: every kill makes all your damage 0.5% stronger for the rest of the run (up to +100%)", bonus: { experience: 0.3, killStreak: 0.005 } },
      { floor: 50, id: "boneCodex", name: "Bone Codex", text: "teaches the ability Drain Life: 2 turns of your damage, and you heal 15% of your health",
        ability: { id: "towerDrainLife", name: "Drain Life", text: "2 turns of your damage, and you heal 15% of your health", cooldown: 9, use: function () { abilityTurns(2); abilityHeal(0.15); } } },
      { floor: 75, id: "colossusCore", name: "Colossus Core", text: "a relic slot: you keep 1 more relic when you fall", bonus: { relicSlots: 1 } },
      { floor: 100, id: "crownOfTheEntombed", name: "Crown of the Entombed", text: "Phylactery: once a run, a blow that would kill you leaves you alive on half your health", bonus: { secondWind: 1 } }
    ]
  },

  elementalist: {
    awayRule: { name: "Thin air", text: "abilities take half as long again to be ready", bonus: { quickHands: -0.5 } },
    name: "Storm Peak",
    sky: "#1f3d47",
    icon: "🐉",
    text: "A bit of everything: armor, venom and fury. The right element answers each of them.",
    monsters: [
      { name: "Harpy", icon: "🦅",text: "Dives fast, breaks easily.", minFloor: 1, hp: 0.95, attack: 1.2, armor: 0.5, gold: 0.9, weak: ["lightning", "piercing"], resist: ["arcane", "nature"], flying: true },
      { name: "Rock Imp", icon: "👿",text: "Small, but made of stone.", minFloor: 1, hp: 0.9, attack: 0.8, armor: 2.5, gold: 1, weak: ["ice", "crushing"], resist: ["slashing", "piercing", "affliction"] },
      { name: "Frost Wisp", icon: "❄️",text: "Hits very hard, but barely holds together.", minFloor: 3, hp: 0.6, attack: 1.5, armor: 0, gold: 1.2, weak: ["fire"], resist: ["slashing", "affliction", "arcane"], flying: true },
      { name: "Venom Drake", icon: "🐍",text: "Venomous: 30% of its attack ignores your armor.", minFloor: 5, hp: 1, attack: 1, armor: 1, gold: 1.2, poison: 0.3, weak: ["lightning"], resist: ["affliction", "nature", "slashing"] },
      { name: "Magma Hound", icon: "🌋",text: "Enrages: its attack grows by 10% every turn.", minFloor: 8, hp: 1.1, attack: 1, armor: 0.5, gold: 1.4, enrage: 0.1, weak: ["ice"], resist: ["slashing", "arcane", "holy"] },
      { name: "Storm Giant", icon: "⛈️",text: "Huge, armored and angry.", minFloor: 11, hp: 1.8, attack: 1.3, armor: 1.5, gold: 1.5, weak: ["earth"], resist: ["piercing", "arcane", "nature"] }
    ],
    bosses: [
      { name: "Thunderbird", icon: "⚡",text: "Strikes like lightning.", hp: 0.9, attack: 1.3, armor: 0.5, gold: 1.2, weak: ["earth"], resist: ["slashing", "nature", "arcane"], flying: true, mechanics: ["enrage"] },
      { name: "Mountain Heart", icon: "⛰️",text: "Triple armor, and regenerates 2% of its health every turn.", hp: 1.3, attack: 0.9, armor: 3, gold: 1.2, regen: 0.02, weak: ["ice", "crushing"], resist: ["slashing", "piercing", "affliction"], mechanics: ["armorUp"] },
      { name: "Red Dragon", icon: "🐲",text: "Enrages: its attack grows by 10% every turn.", hp: 1.3, attack: 1, armor: 1, gold: 1.5, enrage: 0.1, weak: ["ice"], resist: ["slashing", "arcane", "affliction"], flying: true, mechanics: ["reflect"] }
    ],
    trophies: [
      { floor: 10, id: "stormShard", name: "Storm Shard", text: "attack and health x1.05", multiply: { attack: 1.05, health: 1.05 } },
      { floor: 20, id: "thunderFeather", name: "Thunder Feather", text: "attack and health x1.1", multiply: { attack: 1.1, health: 1.1 } },
      { floor: 30, id: "dragonHeart", name: "Dragon Heart", text: "attack and health x1.15, and the technique Exploit: a hit on a weakness deals 15% more", multiply: { attack: 1.15, health: 1.15 }, bonus: { exploit: 0.15 } },
      { floor: 50, id: "giantsBracer", name: "Giant's Bracer", text: "teaches the ability Flash Freeze: 1.5 turns of your damage, and the enemy is frozen for a turn",
        ability: { id: "towerFlashFreeze", name: "Flash Freeze", text: "1.5 turns of your damage, and the enemy is frozen for a turn", cooldown: 8, use: function () { abilityTurns(1.5); abilityStun(); } } },
      { floor: 75, id: "mountainsRoot", name: "Mountain's Root", text: "a relic slot: you keep 1 more relic when you fall", bonus: { relicSlots: 1 } },
      { floor: 100, id: "dragonsHoard", name: "Dragon's Hoard", text: "Dragonfire: a hit on a weakness deals 25% more, and gold x1.5", bonus: { exploit: 0.25 }, multiply: { gold: 1.5 } }
    ]
  },

  zealot: {
    awayRule: { name: "The restless dead", text: "you lose 2% of your health every turn of a fight", bonus: { drain: 0.02 } },
    name: "Haunted Abbey",
    sky: "#3b2540",
    icon: "👻",
    text: "The restless dead. They wear you down slowly, which only works on those who cannot heal.",
    monsters: [
      { name: "Zombie", icon: "🧟",text: "Slow, with a lot of health.", minFloor: 1, hp: 1.4, attack: 0.8, armor: 0.5, gold: 1, weak: ["holy", "fire"], resist: ["affliction", "piercing"] },
      { name: "Ghoul", text: "Venomous: 20% of its attack ignores your armor.", minFloor: 1, hp: 1, attack: 0.9, armor: 0.5, gold: 1, poison: 0.2, weak: ["holy", "crushing"], resist: ["affliction", "slashing"] },
      { name: "Restless Monk", icon: "🙏",text: "Still keeping his vows, more or less.", minFloor: 3, hp: 1, attack: 1, armor: 1, gold: 1.2, weak: ["crushing", "arcane"], resist: ["slashing", "affliction", "nature"] },
      { name: "Wraith", text: "Hits very hard, but barely holds together.", minFloor: 5, hp: 0.7, attack: 1.5, armor: 0, gold: 1.5, weak: ["holy"], resist: ["slashing", "piercing", "affliction", "ice"] },
      { name: "Vampire Thrall", icon: "🧛",text: "Regenerates 4% of its health every turn.", minFloor: 8, hp: 1.2, attack: 1, armor: 1, gold: 1.3, regen: 0.04, weak: ["holy", "fire"], resist: ["affliction", "ice", "arcane"] },
      { name: "Banshee", icon: "😱",text: "Her wail goes through armor: 40% of her attack ignores it.", minFloor: 11, hp: 0.9, attack: 1.1, armor: 0.5, gold: 1.4, poison: 0.4, weak: ["holy"], resist: ["slashing", "piercing", "nature"] }
    ],
    bosses: [
      { name: "The Abbot", icon: "📿",text: "Regenerates 3% of his health every turn.", hp: 1.1, attack: 1, armor: 1, gold: 1.2, regen: 0.03, weak: ["crushing", "arcane"], resist: ["slashing", "affliction", "nature"], mechanics: ["shield"] },
      { name: "Vampire Lord", icon: "🦇",text: "Hits hard, and regenerates 3% of his health every turn.", hp: 1, attack: 1.2, armor: 1, gold: 1.5, regen: 0.03, weak: ["holy", "fire"], resist: ["affliction", "ice", "arcane", "piercing"], mechanics: ["reflect"] },
      { name: "Lich Bishop", icon: "☠️",text: "Double armor, and 30% of his attack ignores yours.", hp: 1, attack: 1, armor: 2, gold: 1.2, poison: 0.3, weak: ["holy", "crushing"], resist: ["piercing", "affliction", "ice"], mechanics: ["summons"] }
    ],
    trophies: [
      { floor: 10, id: "abbeyBlessing", name: "Abbey Blessing", text: "health x1.1 and +1 armor", bonus: { armor: 1 }, multiply: { health: 1.1 } },
      { floor: 20, id: "abbotsRosary", name: "Abbot's Rosary", text: "health x1.15 and +2 armor", bonus: { armor: 2 }, multiply: { health: 1.15 } },
      { floor: 30, id: "saintsRelic", name: "Saint's Relic", text: "health x1.25 and +3 armor, and the technique Prayer: you heal 1% of your health every turn of a fight", bonus: { armor: 3, prayer: 0.01 }, multiply: { health: 1.25 } },
      { floor: 50, id: "vampiresChalice", name: "Vampire's Chalice", text: "teaches the ability Lay on Hands: heal 35% of your health",
        ability: { id: "towerLayOnHands", name: "Lay on Hands", text: "Heal 35% of your health", cooldown: 12, use: function () { abilityHeal(0.35); } } },
      { floor: 75, id: "bishopsMitre", name: "Bishop's Mitre", text: "a relic slot: you keep 1 more relic when you fall", bonus: { relicSlots: 1 } },
      { floor: 100, id: "abbeyBell", name: "Abbey Bell", text: "Vespers: your abilities are ready a quarter sooner", bonus: { quickHands: 0.25 } }
    ]
  }
};
