// =====================================================================
//  Friends and chat
// =====================================================================
// The Friends tab: add other players by their player name, see who is online and
// what they are playing, and chat with them.
//
// It needs an account (cloud.js): friends are kept on the same Supabase server as
// the online saves, by the functions at the bottom of cloud-setup.sql. Nothing about
// friends is in the save, so a save code or a reset never touches them.
//
// HOW IT STAYS UP TO DATE. The server cannot call the game, so the game asks it
// (social_poll): every friendsEvery seconds, and every chatEvery seconds while a
// chat is open on screen. Each ask also tells the server this player is online.
// Nothing is asked while the page is hidden, so a player who has left the tab
// shows as away a little later.
//
// THE PLAYER NAME is not the username. The username is what you log in with, and
// it stays private. The player name is what friends type to add you and the name
// they see. It is picked on the Settings tab (Account card) or on the Friends tab.

const friendsEvery = 20;    // seconds between asks while no chat is open
const chatEvery = 3;        // seconds between asks while a chat is open on screen
const onlineSeconds = 70;   // a friend whose game asked this recently is "online"

// What the server said last time. A friend is
//   { name, state, seen, unread, class, level, floor }
// state is "received" (they asked you), "friends", or "sent" (you asked them).
// seen is how many seconds ago their game last asked (null if it never has).
// class, level and floor are what a friend is playing (null for a request).
let friends = [];
let myPlayerName = null;    // null until a player name is picked
let friendsFor = "";        // the username these friends belong to ("" before the first answer)
let friendsMissing = false; // true if the server does not have the friends functions yet
let friendsProblem = "";    // why the last ask failed ("" if it did not)

// The chat that is open ("" for none), the messages in it, and the number of the
// newest one, so that each ask only brings the messages after it
let chatWith = "";
let chatLines = [];
let chatAfter = 0;
let chatNumber = 0;         // goes up each time a chat is opened or closed (see askFriends)

let friendsBusy = false;    // an ask is on its way
let friendsAgain = false;   // something changed while it was: ask again when it is back
let lastFriendsAsk = 0;     // when the last ask was sent (milliseconds; 0 to ask at once)
let filledName;             // the player name last put in the name boxes (undefined for none yet)

// ----- Asking the server -----
function friendsCanRun() {
  return cloudIsSetUp() && cloudLoggedIn() && !friendsMissing && !otherTabOpen;
}

function chatOnScreen() {
  return chatWith !== "" && document.body.dataset.tab === "friends" && !document.hidden;
}

// Forgets the friends of whoever was logged in before (logging out, or in as somebody else)
function resetFriends() {
  friends = [];
  myPlayerName = null;
  friendsFor = "";
  friendsProblem = "";
  filledName = undefined;
  chatWith = "";
  chatNumber = chatNumber + 1;
  chatLines = [];
  chatAfter = 0;
}

async function askFriends() {
  if (!friendsCanRun()) {
    showFriends();
    return;
  }
  if (friendsBusy) {
    friendsAgain = true;
    return;
  }
  friendsBusy = true;
  lastFriendsAsk = Date.now();

  // The chat's messages are only asked for while it is on screen: the server marks the
  // messages it gives back as read, and a chat left open behind the Fight tab must not.
  // (The player may open or close a chat, or log out, while the answer is on its way:
  // an answer about something that has changed since is not used. Closing a chat and
  // opening the same one again counts as a change, hence chatNumber.)
  let asked = { user: cloudUser, chat: chatOnScreen() ? chatWith : "", number: chatNumber, after: chatAfter };
  try {
    let result = await cloudCall("social_poll", { p_username: asked.user, p_token: cloudToken, p_chat: asked.chat, p_after: asked.after });
    if (cloudUser === asked.user) {
      friendsFor = asked.user;
      myPlayerName = result.name;
      friends = result.friends || [];
      friendsProblem = "";
      let messages = result.messages || [];
      if (asked.chat !== "" && chatNumber === asked.number) {
        addChatLines(messages);
        // (50 is as many as the server gives at once: after time away there may be more)
        if (asked.after > 0 && messages.length === 50) {
          friendsAgain = true;
        }
      }
    }
  } catch (error) {
    friendsProblem = friendsReason(error);
  }

  friendsBusy = false;
  showFriends();
  if (friendsAgain) {
    friendsAgain = false;
    askFriends();
  }
}

// What to tell the player when the server said no
function friendsReason(error) {
  if (error.message.includes("Could not find the function")) {
    friendsMissing = true;
    return "";
  }
  // (no answer at all, or an answer that is not the server's: a network problem)
  if (error instanceof TypeError || error instanceof SyntaxError) {
    return "Could not reach the server. It will try again.";
  }
  return error.message;
}

// Runs one of the friends functions on the server. Gives back its answer, or
// null after putting the reason in the message line with the id given.
async function friendsCall(name, details, messageId) {
  let message = document.getElementById(messageId);
  message.textContent = "";
  try {
    details.p_username = cloudUser;
    details.p_token = cloudToken;
    return await cloudCall(name, details);
  } catch (error) {
    message.textContent = friendsReason(error);
    showFriends();
    return null;
  }
}

// ----- The buttons -----
async function savePlayerName(boxId) {
  let messageId = boxId === "player-name-box" ? "player-name-message" : "friends-message";
  let result = await friendsCall("set_player_name", { p_name: document.getElementById(boxId).value }, messageId);
  if (result !== null) {
    myPlayerName = result.name;
    document.getElementById(messageId).textContent = "Your player name is now " + result.name + ".";
    askFriends();
  }
}

async function addFriend() {
  let box = document.getElementById("friend-box");
  let result = await friendsCall("add_friend", { p_name: box.value }, "friends-message");
  if (result !== null) {
    let message = result.state === "friends"
      ? "You are now friends with " + box.value.trim() + "."
      : "Invited " + box.value.trim() + ". You can chat once they accept.";
    box.value = "";
    document.getElementById("friends-message").textContent = message;
    askFriends();
  }
}

async function acceptFriend(name) {
  if (await friendsCall("add_friend", { p_name: name }, "friends-message") !== null) {
    document.getElementById("friends-message").textContent = "You are now friends with " + name + ".";
    askFriends();
  }
}

// Removes a friend, turns down a request, or takes back one you sent
async function removeFriend(name, state) {
  if (state === "friends" && !confirm("Remove " + name + " from your friends? You can add each other again later.")) {
    return;
  }
  if (await friendsCall("remove_friend", { p_name: name }, "friends-message") !== null) {
    if (chatWith === name) {
      closeChat();
    }
    askFriends();
  }
}

function openChat(name) {
  chatWith = name;
  chatNumber = chatNumber + 1;
  chatLines = [];
  chatAfter = 0;
  document.getElementById("chat-message").textContent = "";
  document.getElementById("chat-lines").replaceChildren();
  showFriends();
  document.getElementById("chat-card").scrollIntoView({ block: "nearest" });
  document.getElementById("chat-box").focus();
  askFriends();
}

function closeChat() {
  chatWith = "";
  chatNumber = chatNumber + 1;
  chatLines = [];
  chatAfter = 0;
  showFriends();
}

async function sendChat() {
  let box = document.getElementById("chat-box");
  if (box.value.trim() === "" || chatWith === "") {
    return;
  }
  if (await friendsCall("send_message", { p_name: chatWith, p_body: box.value }, "chat-message") !== null) {
    box.value = "";
    // (the message comes back with the next ask, in its place among the others)
    askFriends();
  }
}

// ----- The chat -----
// Adds the messages the server sent that are not on screen yet
function addChatLines(messages) {
  let list = document.getElementById("chat-lines");
  let atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 30;

  for (let message of messages) {
    if (message.id <= chatAfter) {
      continue;
    }
    chatAfter = message.id;
    chatLines.push(message);

    let line = document.createElement("div");
    line.className = message.mine ? "chat-line mine" : "chat-line";
    let who = document.createElement("span");
    who.className = "chat-who";
    who.textContent = (message.mine ? "You" : chatWith) + ", " + new Date(message.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let text = document.createElement("span");
    text.className = "chat-text";
    text.textContent = message.body;
    line.append(who, text);
    list.append(line);
  }

  if (atBottom) {
    list.scrollTop = list.scrollHeight;
  }
}

// ----- Showing the Friends tab -----
function seenText(seconds) {
  if (seconds === null) {
    return "Not seen yet";
  }
  if (seconds < onlineSeconds) {
    return "Online";
  }
  let minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return "Last seen " + minutes + (minutes === 1 ? " minute ago" : " minutes ago");
  }
  let hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return "Last seen " + hours + (hours === 1 ? " hour ago" : " hours ago");
  }
  let days = Math.floor(hours / 24);
  return "Last seen " + days + (days === 1 ? " day ago" : " days ago");
}

// What a friend is playing, as a line of text ("" if not known)
function playingText(friend) {
  if (friend.class === null || !Object.hasOwn(classes, friend.class)) {
    return "";
  }
  return classes[friend.class].name + ", level " + friend.level + ", best floor " + friend.floor;
}

function friendButton(text, quiet, onPress) {
  let button = document.createElement("button");
  button.textContent = text;
  if (quiet) {
    button.className = "quiet";
  }
  button.onclick = onPress;
  return button;
}

// One line of the list, for a friend or a request
function friendRow(friend) {
  let row = document.createElement("div");
  row.className = "row friend-row";

  let words = document.createElement("div");
  words.className = "row-text";
  let title = document.createElement("p");
  title.className = "row-title";
  let dot = document.createElement("span");
  dot.className = friend.state === "friends" && friend.seen !== null && friend.seen < onlineSeconds ? "friend-dot online" : "friend-dot";
  title.append(dot, friend.name);
  if (friend.unread > 0) {
    let unread = document.createElement("span");
    unread.className = "friend-unread";
    unread.textContent = friend.unread > 99 ? "99+" : String(friend.unread);
    unread.title = friend.unread + " new";
    title.append(unread);
  }
  let note = document.createElement("p");
  note.className = "note";
  words.append(title, note);

  let buttons = document.createElement("div");
  buttons.className = "friend-buttons";

  if (friend.state === "received") {
    note.textContent = "Invited you. Accept to chat.";
    buttons.append(
      friendButton("Accept", false, function () { acceptFriend(friend.name); }),
      friendButton("Decline", true, function () { removeFriend(friend.name, friend.state); }));
  } else if (friend.state === "sent") {
    note.textContent = "Invited. Waiting for them to accept.";
    buttons.append(friendButton("Cancel invite", true, function () { removeFriend(friend.name, friend.state); }));
  } else {
    let playing = playingText(friend);
    note.textContent = seenText(friend.seen) + (playing === "" ? "." : ". " + playing + ".");
    buttons.append(
      friendButton(chatWith === friend.name ? "Chatting" : "Chat", false, function () { openChat(friend.name); }),
      friendButton("Remove", true, function () { removeFriend(friend.name, friend.state); }));
  }

  row.append(words, buttons);
  return row;
}

function showFriends() {
  // (a different player logged in, or nobody: their friends are not this player's)
  if (cloudUser !== friendsFor && friendsFor !== "") {
    resetFriends();
  }
  let heard = friendsFor !== "" && friendsFor === cloudUser;

  let off = "";
  if (!cloudIsSetUp()) {
    off = "Friends need online saves, which are not switched on yet.";
  } else if (!cloudLoggedIn()) {
    off = "Friends need an account. Make one, or log in, on the Settings tab. Then pick a player name, and friends can add you by it.";
  } else if (friendsMissing) {
    off = "Friends are not switched on on the server yet.";
  } else if (otherTabOpen) {
    off = "The game is open in another tab. Friends are there.";
  } else if (!heard) {
    off = friendsProblem !== "" ? friendsProblem : "Looking for your friends...";
  }

  document.getElementById("friends-off").hidden = off === "";
  document.getElementById("friends-off").textContent = off;
  document.getElementById("friends-unnamed").hidden = off !== "" || myPlayerName !== null;
  document.getElementById("friends-on").hidden = off !== "" || myPlayerName === null;
  document.getElementById("friends-my-name").textContent = myPlayerName || "";

  // The name boxes show the player name, once, when it is first known or has changed
  // (not every time, so that a name being typed is not written over)
  if (heard && myPlayerName !== filledName) {
    filledName = myPlayerName;
    document.getElementById("player-name-box").value = myPlayerName || "";
    document.getElementById("friends-name-box").value = myPlayerName || "";
  }

  let list = document.getElementById("friends-list");
  list.replaceChildren();
  for (let friend of friends) {
    list.append(friendRow(friend));
  }
  if (friends.length === 0) {
    let empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = "No friends yet. Ask a friend for their player name, and invite them above.";
    list.append(empty);
  }

  // The chat, if the one it is with is still a friend
  let partner = friends.find(function (friend) { return friend.name === chatWith && friend.state === "friends"; });
  if (chatWith !== "" && heard && partner === undefined) {
    document.getElementById("friends-message").textContent = chatWith + " is no longer on your friends list.";
    chatWith = "";
    chatNumber = chatNumber + 1;
  }
  document.getElementById("chat-card").hidden = chatWith === "" || off !== "";
  document.getElementById("chat-name").textContent = chatWith;
  document.getElementById("chat-status").textContent = partner === undefined ? "" : seenText(partner.seen) + ".";

  // A dot on the tab for an unread message or a request to answer
  let waiting = friends.some(function (friend) { return friend.unread > 0 || friend.state === "received"; });
  markTab("friends", off === "" && waiting);
}

// ----- Start-up -----
// Once a second: is an ask due? How long to wait is worked out from what is on screen
// NOW, so opening a chat, logging in or coming back to the tab is noticed within a second.
setInterval(function () {
  if (cloudUser !== friendsFor && friendsFor !== "") {
    showFriends();
    lastFriendsAsk = 0;
  }
  let wait = (chatOnScreen() ? chatEvery : friendsEvery) * 1000;
  if (document.hidden || Date.now() - lastFriendsAsk < wait || !friendsCanRun()) {
    return;
  }
  askFriends();
}, 1000);

// Opening the tab, or coming back to the page, asks straight away
document.getElementById("tab-friends").addEventListener("click", function () {
  lastFriendsAsk = 0;
});
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    lastFriendsAsk = 0;
  }
});

showFriends();
