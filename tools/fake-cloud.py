# =====================================================================
#  tools/fake-cloud.py - the game with a pretend Supabase, on this computer.
#
#  Serves the game at http://127.0.0.1:8642/ and answers its calls to the online
#  functions (/rest/v1/rpc/...) from a Postgres database on this computer that
#  cloud-setup.sql has been run on. So accounts, friends and chat can be tried
#  with two browsers without touching the real server or anybody's account.
#
#    python tools/fake-cloud.py                   (Postgres on port 54329)
#    python tools/fake-cloud.py 5432              (another port)
#
#  It needs Python's psycopg ("python -m pip install psycopg[binary]") and a
#  Postgres on this computer (the "binaries" zip from enterprisedb.com needs no
#  installing). Make it look like Supabase once, as the user "postgres":
#      create schema extensions; create role anon; create role authenticated;
#  and then run the whole of cloud-setup.sql on it, with psql -f.
#  The game it serves uses this server in place of cloudUrl
#  (data.js is changed on the way out; the file itself is not touched).
#  Every function call runs as "anon", as it does on Supabase.
# =====================================================================

import json
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

import psycopg

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 54329
WEB_PORT = 8642
NAME = re.compile(r"^[a-z_][a-z0-9_]*$")


def call(name, details):
    """Runs one function as Supabase's PostgREST would. Gives back (status, answer)."""
    if not NAME.match(name) or not all(NAME.match(key) for key in details):
        return 400, {"message": "Bad function call."}

    keys = sorted(details)
    with psycopg.connect(port=DB_PORT, user="postgres", dbname="postgres", autocommit=False) as db:
        found = db.execute(
            "select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace "
            "where n.nspname = 'public' and p.proname = %s and has_function_privilege('anon', p.oid, 'execute')",
            [name]).fetchone()
        if found is None:
            return 404, {"code": "PGRST202", "message": "Could not find the function public." + name + " in the schema cache"}

        try:
            db.execute("set local role anon")
            arguments = ", ".join(key + " := %s" for key in keys)
            values = [json.dumps(details[key]) if isinstance(details[key], (dict, list)) else details[key] for key in keys]
            result = db.execute("select public." + name + "(" + arguments + ")", values).fetchone()[0]
            db.commit()
            return 200, result
        except psycopg.Error as error:
            db.rollback()
            message = error.diag.message_primary if error.diag is not None else str(error)
            return 400, {"code": error.sqlstate, "message": message}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, format, *args):
        pass

    def send_json(self, status, answer):
        body = json.dumps(answer).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        match = re.match(r"^/rest/v1/rpc/([a-z_0-9]+)$", self.path)
        if match is None:
            return self.send_json(404, {"message": "Not found."})
        length = int(self.headers.get("Content-Length", 0))
        details = json.loads(self.rfile.read(length) or b"{}")
        status, answer = call(match.group(1), details)
        self.send_json(status, answer)

    def do_GET(self):
        if self.path.split("?")[0] == "/data.js":
            with open(os.path.join(ROOT, "data.js"), encoding="utf-8") as file:
                text = file.read()
            text = re.sub(r'const cloudUrl = "[^"]*";', 'const cloudUrl = "http://127.0.0.1:' + str(WEB_PORT) + '";', text)
            text = re.sub(r'const cloudKey = "[^"]*";', 'const cloudKey = "fake";', text)
            body = text.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/javascript")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


print("The game, with the pretend server: http://127.0.0.1:" + str(WEB_PORT) + "/")
ThreadingHTTPServer(("127.0.0.1", WEB_PORT), Handler).serve_forever()
