// =====================================================================
//  Online saves
// =====================================================================
// The game always saves in the browser, exactly as before (see game.js).
// This file ADDS a copy kept online, for players who make an account:
//   - the save is sent up about once a minute, and when the tab is closed or hidden
//   - on another device, or after the browser's data was cleared, logging in
//     brings it back
// Playing without an account works exactly as it always did.
//
// The online side is a free Supabase project. Its address and key are at the
// top of data.js (cloudUrl and cloudKey). While they are empty, none of this
// does anything and the Account card says online saves are not switched on.
// The file cloud-setup.sql makes the table and the functions used here.

// Where the browser remembers who is logged in. This is kept apart from the save,
// so that loading a save code or resetting the save does not log anyone out.
const accountName = "lloegrys-idle-account";

let cloudUser = "";         // the username logged in on this browser ("" for nobody)
let cloudToken = "";        // the secret that keeps this browser logged in
let cloudRevision = 0;      // which version of the online save this browser started from
let cloudMessage = "";      // the line shown on the Account card
let cloudLastSent = "";     // the save as it was when last sent, so nothing is sent twice
let cloudBusy = false;      // true while something is being sent or fetched

const cloudEvery = 60;      // seconds between sending the save

function cloudIsSetUp() {
  return cloudUrl !== "" && cloudKey !== "";
}

function cloudLoggedIn() {
  return cloudUser !== "" && cloudToken !== "";
}

// ----- Talking to the server -----
// Runs one of the functions from cloud-setup.sql and gives back its answer.
// If the server says no, this throws an error whose message is the reason.
async function cloudCall(name, details) {
  let answer = await fetch(cloudUrl + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: {
      "apikey": cloudKey,
      "Authorization": "Bearer " + cloudKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(details),

    // Lets a save that is sent as the tab closes still arrive
    keepalive: true
  });

  let result = await answer.json();

  if (!answer.ok) {
    let reason = "The server could not be reached.";
    if (result !== null && result.message !== undefined) {
      reason = result.message;
    }
    throw new Error(reason);
  }
  return result;
}

// ----- Remembering who is logged in -----
function loadAccount() {
  let saved = localStorage.getItem(accountName);

  if (saved !== null) {
    try {
      let account = JSON.parse(saved);
      cloudUser = account.username || "";
      cloudToken = account.token || "";
      cloudRevision = account.revision || 0;
    } catch (error) {
      cloudUser = "";
      cloudToken = "";
    }
  }
}

function rememberAccount(username, token, revision) {
  cloudUser = username;
  cloudToken = token;
  cloudRevision = revision;
  localStorage.setItem(accountName, JSON.stringify({ username: username, token: token, revision: revision }));
}

// TWO DEVICES. The server counts every save it stores (the "revision"). A browser
// may only store a save if it started from the newest one. So if you play on a
// phone while a tab is still open on a computer, the computer's next save is turned
// down and it takes the phone's save instead of wiping it out.

function forgetAccount() {
  cloudUser = "";
  cloudToken = "";
  cloudRevision = 0;
  cloudLastSent = "";
  localStorage.removeItem(accountName);
}

// ----- The save, as the server keeps it -----
// The save in this browser, as an object (or null if there is none that can be read)
function localSave() {
  try {
    return JSON.parse(localStorage.getItem(saveName));
  } catch (error) {
    return null;
  }
}

// Has anything been achieved in this browser's save? (Used to ask before replacing it.)
function localSaveHasProgress() {
  let save = localSave();
  if (save === null || save.classSaves === undefined) {
    return false;
  }

  for (let className in save.classSaves) {
    let one = save.classSaves[className];
    if (one.level > 1 || one.ascensions > 0 || one.bestFloor > 1) {
      return true;
    }
  }
  return false;
}

// Replaces this browser's save with one from the server, and starts the game again with it
function takeCloudSave(save) {
  clearInterval(timer);
  localStorage.setItem(saveName, JSON.stringify(save));
  location.reload();
}

// ----- Sending the save up -----
async function cloudUpload() {
  if (!cloudIsSetUp() || !cloudLoggedIn() || cloudBusy || saveProblem !== "") {
    return;
  }

  // The game writes the save into the browser every second (see "tick" in game.js),
  // so what is there is always fresh. This must NOT call saveGame itself: it also runs
  // as the page is closing or reloading, and just after a save code or an online save
  // has been loaded that would write the old game over the new save.
  let text = localStorage.getItem(saveName);
  if (text === null || text === cloudLastSent) {
    return;
  }

  cloudBusy = true;
  try {
    let result = await cloudCall("store_save", { p_username: cloudUser, p_token: cloudToken, p_save: JSON.parse(text), p_revision: cloudRevision });

    if (result.force === true && result.save !== null) {
      // The save was edited by hand on the server and marked to be taken as it is
      await cloudCall("clear_force", { p_username: cloudUser, p_token: cloudToken });
      rememberAccount(cloudUser, cloudToken, result.revision);
      takeCloudSave(result.save);
      return;
    }

    if (result.conflict === true) {
      // Another device has saved since this one last looked: its save is the newer game
      rememberAccount(cloudUser, cloudToken, result.revision);
      takeCloudSave(result.save);
      return;
    }

    rememberAccount(cloudUser, cloudToken, result.revision);
    cloudLastSent = text;
    cloudMessage = "Saved online at " + new Date().toLocaleTimeString() + ".";
  } catch (error) {
    if (error.message === "You are not logged in.") {
      forgetAccount();
      cloudMessage = "You were logged out. Log in again to keep saving online.";
    } else {
      cloudMessage = "Could not save online just now (" + error.message + "). It will try again.";
    }
  }
  cloudBusy = false;
  showAccount();
}

// ----- When the game starts -----
// If somebody is logged in, see whether the server has a newer save than this
// browser (they played on another device), or one that was edited by hand.
async function cloudCheckOnStart() {
  if (!cloudIsSetUp() || !cloudLoggedIn()) {
    return;
  }

  try {
    let result = await cloudCall("load_save", { p_username: cloudUser, p_token: cloudToken });

    if (result.save !== null && result.save.classSaves !== undefined) {
      if (result.force === true) {
        await cloudCall("clear_force", { p_username: cloudUser, p_token: cloudToken });
        rememberAccount(cloudUser, cloudToken, result.revision);
        takeCloudSave(result.save);
        return;
      }

      // The server has stored a save that this browser has never seen: the player has
      // been on another device since. That one is the newer game, so take it.
      // (Clocks are not used for this. The game writes "now" into the save the moment
      // it starts, so this browser's save always looks the most recent.)
      if (result.revision !== cloudRevision) {
        rememberAccount(cloudUser, cloudToken, result.revision);
        takeCloudSave(result.save);
        return;
      }
    }

    cloudMessage = "Logged in. Your save is kept online.";
  } catch (error) {
    if (error.message === "You are not logged in.") {
      forgetAccount();
      cloudMessage = "You were logged out. Log in again to keep saving online.";
    } else {
      cloudMessage = "Could not reach the server (" + error.message + "). Playing from this browser's save.";
    }
  }
  showAccount();
}

// ----- The buttons on the Account card -----
function accountFields() {
  return {
    username: document.getElementById("account-username").value.trim(),
    password: document.getElementById("account-password").value
  };
}

async function createAccount() {
  let fields = accountFields();
  cloudMessage = "Creating your account...";
  showAccount();

  try {
    let result = await cloudCall("register_player", { p_username: fields.username, p_password: fields.password });
    rememberAccount(result.username, result.token, 0);
    document.getElementById("account-password").value = "";
    cloudMessage = "Account created. Your save is now kept online.";
    showAccount();

    // Send this browser's save up straight away
    await cloudUpload();
  } catch (error) {
    cloudMessage = error.message;
    showAccount();
  }
}

async function logIn() {
  let fields = accountFields();
  cloudMessage = "Logging in...";
  showAccount();

  try {
    let result = await cloudCall("login_player", { p_username: fields.username, p_password: fields.password });
    document.getElementById("account-password").value = "";

    let hasCloudSave = result.save !== null && result.save !== undefined && result.save.classSaves !== undefined;

    // An account with a save: it replaces what is in this browser. Ask first if
    // that would throw progress away.
    if (hasCloudSave) {
      if (localSaveHasProgress() && !confirm("Load the save from your account? It replaces the progress in this browser.")) {
        cloudMessage = "Not logged in. The progress in this browser was kept.";
        showAccount();
        return;
      }
      rememberAccount(result.username, result.token, result.revision);
      takeCloudSave(result.save);
      return;
    }

    // An account with no save yet: this browser's save becomes its save
    rememberAccount(result.username, result.token, result.revision);
    cloudMessage = "Logged in. Your save is now kept online.";
    showAccount();
    await cloudUpload();
  } catch (error) {
    cloudMessage = error.message;
    showAccount();
  }
}

async function logOut() {
  // One last save, so nothing since the last minute is lost
  await cloudUpload();
  forgetAccount();
  cloudMessage = "Logged out. This browser still has your save, and the game still saves here.";
  showAccount();
}

// ----- Showing the Account card -----
function showAccount() {
  document.getElementById("account-off").hidden = cloudIsSetUp();
  document.getElementById("account-out").hidden = !cloudIsSetUp() || cloudLoggedIn();
  document.getElementById("account-in").hidden = !cloudIsSetUp() || !cloudLoggedIn();
  document.getElementById("account-name").textContent = cloudUser;
  document.getElementById("account-message").textContent = cloudMessage;
}

// ----- Start-up -----
loadAccount();
showAccount();
cloudCheckOnStart();

// Send the save up every so often, and whenever the player leaves the tab
setInterval(cloudUpload, cloudEvery * 1000);
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    cloudUpload();
  }
});
