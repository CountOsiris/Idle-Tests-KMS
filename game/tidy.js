// =====================================================================
//  game/tidy.js - Keeping the page quiet: cards that fold away, and explanations that
//  stay behind a "?" until they are asked for. Nothing here changes the game.
// =====================================================================
// Every card on the page (a box with a heading) gets two things when the game starts:
//   - its heading can be pressed to FOLD the card down to that heading, and again to
//     open it. Which cards are folded is remembered on this device.
//   - the paragraph of explanation under its heading is hidden behind a "?" beside the
//     heading. Settings has a switch to show them all, always.
// A card in index.html needs nothing added to it for this to work.

// The cards folded on this device, by key (see cardKey), and whether explanations are
// always shown. Saved with the other settings (game/feel.js).
let foldedCards = null;
let helpAlways = false;

// Folded until the player opens them, on a device that has no choice saved yet
const foldedAtFirst = ["page-ascension-1"];

// A name for a card that stays the same between visits: its tab and its place on it
function cardKey(card) {
  let page = card.closest(".page");
  let home = page !== null ? page : card.parentElement;
  let cards = Array.from(home.querySelectorAll(".card"));
  return (page !== null ? page.id : "side") + "-" + cards.indexOf(card);
}

// Runs once, when the game starts (after the settings have been read)
function tidyCards() {
  if (foldedCards === null) {
    foldedCards = foldedAtFirst.slice();
  }

  for (let card of document.querySelectorAll(".card")) {
    let heading = card.querySelector("h2");
    // (not the windows that open over the page, and not the fight itself)
    if (heading === null || card.closest(".window") !== null || card.querySelector("#stage") !== null) {
      continue;
    }
    let key = cardKey(card);
    card.dataset.card = key;
    card.classList.toggle("folded", foldedCards.includes(key));

    heading.classList.add("fold-heading");
    heading.title = "Press to fold this away, or to open it again";
    heading.onclick = function () {
      foldCard(card, !card.classList.contains("folded"));
    };

    // The explanation: the first note that comes straight after the heading
    let head = heading.parentElement.classList.contains("card-head") ? heading.parentElement : heading;
    let help = head.nextElementSibling;
    if (help !== null && help.tagName === "P" && help.classList.contains("note") && help.id === "") {
      help.classList.add("card-help");

      let button = document.createElement("button");
      button.className = "help-button";
      button.textContent = "?";
      button.title = "What is this?";
      button.onclick = function (event) {
        event.stopPropagation();
        card.classList.toggle("help-open");
      };
      heading.appendChild(button);
    }
  }
  document.body.classList.toggle("help-always", helpAlways);
}

function foldCard(card, folded) {
  card.classList.toggle("folded", folded);
  foldedCards = foldedCards.filter(function (key) { return key !== card.dataset.card; });
  if (folded) {
    foldedCards.push(card.dataset.card);
  }
  saveSettings();
}

function setHelpAlways(on) {
  helpAlways = on;
  document.body.classList.toggle("help-always", helpAlways);
  saveSettings();
  showSettings();
}

// ----- The Towers tab: one short row a tower, and its trophies on request -----
// Which towers have their full list of trophies open (not remembered between visits)
let towersOpen = {};

function toggleTowerDetails(towerName) {
  towersOpen[towerName] = !towersOpen[towerName];
  updateScreen();
}
