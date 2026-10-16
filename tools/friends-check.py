# =====================================================================
#  tools/friends-check.py - checks the online functions for friends and chat
#  (cloud-setup.sql) against the pretend server, tools/fake-cloud.py.
#
#    python tools/fake-cloud.py        (in one window, and leave it running)
#    python tools/friends-check.py     (in another)
#
#  It makes three new accounts with made-up names each time, so it can be run
#  again and again on the same database. It must end ALL GOOD.
# =====================================================================

import json
import random
import sys
import urllib.error
import urllib.request

import psycopg

SERVER = "http://127.0.0.1:8642/rest/v1/rpc/"
DB_PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 54329    # the same database as fake-cloud.py
failures = 0


def call(name, **details):
    """Gives back (answer, error message or "")"""
    request = urllib.request.Request(SERVER + name, data=json.dumps(details).encode(),
                                     headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request) as answer:
            return json.loads(answer.read()), ""
    except urllib.error.HTTPError as error:
        return None, json.loads(error.read()).get("message", "")


def check(what, ok):
    global failures
    print(("ok    " if ok else "FAIL  ") + what)
    if not ok:
        failures += 1


def account(name):
    result, error = call("register_player", p_username=name, p_password="secret")
    return {"p_username": name, "p_token": result["token"]}


def poll(who, chat="", after=0):
    return call("social_poll", **who, p_chat=chat, p_after=after)[0]


def friend(who, name):
    for one in poll(who)["friends"]:
        if one["name"] == name:
            return one
    return None


tag = str(random.randint(100000, 999999))
ann, bob, cat = account("ann" + tag), account("bob" + tag), account("cat" + tag)
annName, bobName, catName = "Ann " + tag, "Bob" + tag, "Cat" + tag

# Player names
check("no player name to begin with", poll(ann)["name"] is None)
result, error = call("add_friend", **ann, p_name=bobName)
check("cannot ask anyone before picking a player name", error.startswith("Pick a player name"))
check("a player name is set, with its spaces tidied", call("set_player_name", **ann, p_name="  Ann   " + tag + " ")[0] == {"name": annName})
check("a name with odd letters is turned down", call("set_player_name", **bob, p_name="<b>x</b>")[1].startswith("A player name is"))
check("a name that is too short is turned down", call("set_player_name", **bob, p_name="ab")[1].startswith("A player name is"))
call("set_player_name", **bob, p_name=bobName)
call("set_player_name", **cat, p_name=catName)
check("a name already taken (in other letters) is turned down", call("set_player_name", **cat, p_name=bobName.upper())[1] == "That player name is taken.")
check("keeping your own name is fine", call("set_player_name", **bob, p_name=bobName)[1] == "")
check("a wrong token is not logged in", call("social_poll", p_username=ann["p_username"], p_token="nope", p_chat="", p_after=0)[1] == "You are not logged in.")
check("the login name never shows as the player name", poll(ann)["name"] == annName)

# Asking, accepting
check("asking somebody who does not exist says so", call("add_friend", **ann, p_name="nobody here")[1].startswith("Nobody has the player name"))
check("asking yourself says so", call("add_friend", **ann, p_name=annName)[1] == "That is your own player name.")
check("asking by player name, in any letters, sends a request", call("add_friend", **ann, p_name=bobName.lower())[0] == {"state": "sent"})
check("asking twice changes nothing", call("add_friend", **ann, p_name=bobName)[0] == {"state": "sent"})
check("the asker sees the request as sent", friend(ann, bobName)["state"] == "sent")
check("the other player sees it as received, first in the list", poll(bob)["friends"][0]["name"] == annName and poll(bob)["friends"][0]["state"] == "received")
check("nobody can message before the request is answered", call("send_message", **ann, p_name=bobName, p_body="hi")[1] == "You can only send messages to your friends.")
check("asking back accepts", call("add_friend", **bob, p_name=annName)[0] == {"state": "friends"})
check("both now see friends", friend(ann, bobName)["state"] == "friends" and friend(bob, annName)["state"] == "friends")
check("a friend just seen is online", friend(ann, bobName)["seen"] <= 1)
check("a stranger is not in the list", friend(cat, annName) is None)

# Chat
first, error = call("send_message", **ann, p_name=bobName, p_body="  hello\nBob  ")
check("a message is sent", error == "" and first["id"] > 0)
check("an empty message is turned down", call("send_message", **ann, p_name=bobName, p_body="   ")[1] == "The message is empty.")
check("a long message is turned down", call("send_message", **ann, p_name=bobName, p_body="x" * 301)[1] == "A message is at most 300 letters.")
check("a stranger cannot message", call("send_message", **cat, p_name=bobName, p_body="hi")[1] == "You can only send messages to your friends.")
check("the friend has one unread", friend(bob, annName)["unread"] == 1)
messages = poll(bob, chat=annName)["messages"]
check("opening the chat shows the message, tidied, not as mine", len(messages) == 1 and messages[0]["body"] == "hello Bob" and messages[0]["mine"] is False)
check("reading it marks it read", friend(bob, annName)["unread"] == 0)
check("the sender sees it as mine", poll(ann, chat=bobName)["messages"][0]["mine"] is True)
call("send_message", **bob, p_name=annName, p_body="hi Ann")
newer = poll(ann, chat=bobName, after=first["id"])["messages"]
check("asking for newer messages gives only the newer one", len(newer) == 1 and newer[0]["body"] == "hi Ann")
check("a stranger cannot read a chat", poll(cat, chat=annName)["messages"] == [])
for n in range(30):
    result, error = call("send_message", **bob, p_name=annName, p_body="spam " + str(n))
check("a flood of messages is stopped", error == "That is a lot of messages. Wait a moment.")
check("opening a long chat gives the newest 50", len(poll(ann, chat=bobName)["messages"]) <= 50)

# What a friend is playing
check("a friend with no save shows no class", friend(ann, bobName)["class"] is None)
save = {"playerClass": "warden", "classSaves": {"warden": {"level": 31, "bestFloor": 47}}}
call("store_save", **bob, p_save=save, p_revision=0)
seen = friend(ann, bobName)
check("a friend shows the class, level and best floor they play", seen["class"] == "warden" and seen["level"] == 31 and seen["floor"] == 47)
call("add_friend", **cat, p_name=annName)
check("a request does not show what they play", friend(ann, catName)["class"] is None)

# Catching up after time away: more than 50 messages arrive while the chat is not on screen
last = poll(ann, chat=bobName)["messages"][-1]["id"]
call("remove_friend", **cat, p_name=annName)
call("set_player_name", **cat, p_name=catName)
# (written straight into the database: sending 60 would take three minutes, at 20 a minute)
with psycopg.connect(port=DB_PORT, user="postgres", dbname="postgres") as db:
    for n in range(60):
        db.execute("insert into messages (sender, receiver, body) values (%s, %s, %s)", [ann["p_username"], bob["p_username"], "catch " + str(n)])
first50 = poll(bob, chat=annName, after=last)["messages"]
rest = poll(bob, chat=annName, after=first50[-1]["id"])["messages"]
bodies = [m["body"] for m in first50 + rest if m["body"].startswith("catch")]
check("catching up after 60 messages gives 50, oldest first, then the other 10, none skipped", len(first50) == 50 and bodies == ["catch " + str(n) for n in range(60)])
check("and only then is everything read", friend(bob, annName)["unread"] == 0)

# One odd save must not break anybody's list
call("store_save", **bob, p_save={"playerClass": "warden", "classSaves": {"warden": {"level": "abc", "bestFloor": 1e20}}}, p_revision=1)
odd = friend(ann, bobName)
check("a friend whose save holds nonsense still shows, without numbers", odd is not None and odd["level"] is None and odd["floor"] is None)

# Two spaces typed find a name with one
check("a name typed with extra spaces is still found", call("add_friend", **cat, p_name="Ann  " + tag)[0] == {"state": "sent"})
check("a request shows no online time to the one who asked", friend(cat, annName)["seen"] is None)
call("remove_friend", **cat, p_name=annName)

# Removing
check("turning down a request removes it on both sides", call("remove_friend", **ann, p_name=catName)[1] == "" and friend(ann, catName) is None and friend(cat, annName) is None)
call("remove_friend", **ann, p_name=bobName)
check("removing a friend removes it on both sides", friend(ann, bobName) is None and friend(bob, annName) is None)
check("and they can no longer message", call("send_message", **bob, p_name=annName, p_body="hi")[1] == "You can only send messages to your friends.")
call("add_friend", **ann, p_name=bobName)
call("add_friend", **bob, p_name=annName)
check("friends again: the old messages are there but none counts as new", friend(ann, bobName)["unread"] == 0 and friend(bob, annName)["unread"] == 0
      and len(poll(ann, chat=bobName)["messages"]) > 0)

# Nobody can fill a player's list with requests
targets = [account("t" + tag + str(n)) for n in range(31)]
for n, one in enumerate(targets):
    call("set_player_name", **one, p_name="T" + tag + "-" + str(n))
    result, error = call("add_friend", **one, p_name=catName)
check("a player takes at most 30 waiting requests", error == "That player has too many requests waiting. Ask them to answer some.")
check("and can still add friends of their own", call("add_friend", **cat, p_name=annName)[0] == {"state": "sent"})

# The game can only use the functions meant for it
check("the helper functions cannot be called", call("logged_in_player", **ann)[1].startswith("Could not find"))

print("ALL GOOD" if failures == 0 else str(failures) + " FAILED")
