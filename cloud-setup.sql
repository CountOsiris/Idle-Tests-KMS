-- =====================================================================
--  Online saves for Lloegrys Idle
-- =====================================================================
-- HOW TO USE THIS FILE
--   1. In your Supabase project, open "SQL Editor" (left-hand menu).
--   2. Press "New query", paste this WHOLE file in, and press "Run".
--   3. It should say "Success. No rows returned".
-- It is safe to run more than once.
--
-- WHAT IT MAKES
--   A table called "players", one row for each player:
--     username       the name they log in with (always lower case)
--     password_hash  their password, scrambled. Nobody can read it back, not even you.
--     token          a long secret their browser keeps, so they stay logged in
--     save           their whole save. Click it in the Table Editor to read or edit it.
--     saved_at       when the save last arrived
--     revision       counts up every time the save is stored. It is how two devices
--                    are kept from overwriting each other: a device may only store a
--                    save if it started from the newest one.
--     force_load     TICK THIS AFTER YOU EDIT A SAVE BY HAND. The player's game then
--                    takes your edited save the next time it checks in, instead of
--                    overwriting it with its own. It unticks itself afterwards.
--     created_at     when the account was made
--
-- TO RESET SOMEBODY'S PASSWORD: there is no "forgot password". Delete their
-- password by running, in the SQL Editor (with their name and a new password):
--     update players set password_hash = extensions.crypt('newpassword', extensions.gen_salt('bf'))
--     where username = 'theirname';
--
-- WHO CAN DO WHAT
--   The game can only use the five functions at the bottom of this file. It cannot
--   read the table, so one player can never see another's save or password.
--   Only you, logged in to Supabase, can open the table.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.players (
  username text primary key,
  password_hash text not null,
  token text not null,
  save jsonb,
  saved_at timestamptz,
  revision integer not null default 0,
  force_load boolean not null default false,
  created_at timestamptz not null default now()
);

-- (for a table made by an earlier copy of this file)
alter table public.players add column if not exists revision integer not null default 0;

-- Nobody but the functions below may touch the table
alter table public.players enable row level security;
revoke all on table public.players from anon, authenticated;


-- Makes a new account
create or replace function public.register_player(p_username text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_name text := lower(trim(p_username));
  v_token text;
begin
  if v_name !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'A username is 3 to 20 letters, numbers or underscores.';
  end if;
  if length(p_password) < 4 then
    raise exception 'A password needs at least 4 characters.';
  end if;
  if exists (select 1 from players where username = v_name) then
    raise exception 'That username is taken.';
  end if;

  v_token := encode(gen_random_bytes(24), 'hex');
  insert into players (username, password_hash, token)
  values (v_name, crypt(p_password, gen_salt('bf')), v_token);

  return json_build_object('username', v_name, 'token', v_token);
end;
$$;


-- Logs in with a username and password. Gives back the token and the save.
create or replace function public.login_player(p_username text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_name text := lower(trim(p_username));
  v_player players%rowtype;
begin
  select * into v_player from players where username = v_name;

  if not found or v_player.password_hash <> crypt(p_password, v_player.password_hash) then
    raise exception 'Wrong username or password.';
  end if;

  return json_build_object('username', v_player.username, 'token', v_player.token, 'save', v_player.save, 'revision', v_player.revision);
end;
$$;


-- Fetches the save of a player who is already logged in
create or replace function public.load_save(p_username text, p_token text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_player players%rowtype;
begin
  select * into v_player from players where username = lower(trim(p_username)) and token = p_token;

  if not found then
    raise exception 'You are not logged in.';
  end if;

  return json_build_object('save', v_player.save, 'force', v_player.force_load, 'revision', v_player.revision);
end;
$$;


-- Stores the save of a player who is already logged in.
-- If force_load is ticked, the save is NOT stored: the edited one is sent back instead.
-- If p_revision is not the newest revision, another device has stored a save since
-- this one last looked, so the save is NOT stored and the newer one is sent back.
drop function if exists public.store_save(text, text, jsonb);
create or replace function public.store_save(p_username text, p_token text, p_save jsonb, p_revision integer)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_player players%rowtype;
begin
  select * into v_player from players where username = lower(trim(p_username)) and token = p_token;

  if not found then
    raise exception 'You are not logged in.';
  end if;
  if pg_column_size(p_save) > 500000 then
    raise exception 'That save is too big.';
  end if;

  if v_player.force_load then
    return json_build_object('force', true, 'save', v_player.save, 'revision', v_player.revision);
  end if;

  if v_player.save is not null and p_revision <> v_player.revision then
    return json_build_object('conflict', true, 'save', v_player.save, 'revision', v_player.revision);
  end if;

  update players set save = p_save, saved_at = now(), revision = revision + 1 where username = v_player.username;
  return json_build_object('revision', v_player.revision + 1);
end;
$$;


-- Unticks force_load, once the player's game has taken the edited save
create or replace function public.clear_force(p_username text, p_token text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update players set force_load = false where username = lower(trim(p_username)) and token = p_token;
  return json_build_object('ok', true);
end;
$$;


-- The game may use these five functions, and nothing else
grant execute on function public.register_player(text, text) to anon;
grant execute on function public.login_player(text, text) to anon;
grant execute on function public.load_save(text, text) to anon;
grant execute on function public.store_save(text, text, jsonb, integer) to anon;
grant execute on function public.clear_force(text, text) to anon;


-- =====================================================================
--  Friends and chat
-- =====================================================================
-- Everything below was added for the Friends tab (friends.js). Running this whole
-- file again is how it is switched on: the part above is left as it was.
--
-- WHAT IT ADDS
--   Two columns on "players":
--     player_name    the name friends type to add this player, and the name they see.
--                    Not the username they log in with, so that name stays private.
--                    No two players may have the same one (big and small letters count
--                    as the same).
--     last_seen      when their game last checked in. "Online" means in the last 70 seconds.
--   A table called "friends", two rows for every pair of players, one each way:
--     owner, other   the two usernames
--     state          'sent'      owner asked other to be friends, no answer yet
--                    'received'  other asked owner
--                    'friends'   both said yes
--     last_read      the newest message from other that owner has seen
--   A table called "messages": one row for each chat message.
--     Messages older than 30 days are deleted by themselves.
--
-- WHO CAN DO WHAT
--   As above, the game can only use the functions. Messages can only be sent between
--   friends, and only the two of them can read them.
--
-- TO READ OR DELETE MESSAGES: open the "messages" table in the Table Editor.

alter table public.players add column if not exists player_name text;
alter table public.players add column if not exists last_seen timestamptz;
create unique index if not exists players_player_name on public.players (lower(player_name));

create table if not exists public.friends (
  owner text not null references public.players (username) on delete cascade,
  other text not null references public.players (username) on delete cascade,
  state text not null check (state in ('sent', 'received', 'friends')),
  last_read bigint not null default 0,
  primary key (owner, other)
);

create table if not exists public.messages (
  id bigserial primary key,
  sender text not null references public.players (username) on delete cascade,
  receiver text not null references public.players (username) on delete cascade,
  body text not null,
  sent_at timestamptz not null default now()
);
create index if not exists messages_pair on public.messages (sender, receiver, id);
create index if not exists messages_sent_at on public.messages (sent_at);

alter table public.friends enable row level security;
alter table public.messages enable row level security;
revoke all on table public.friends from anon, authenticated;
revoke all on table public.messages from anon, authenticated;
revoke all on sequence public.messages_id_seq from anon, authenticated;


-- Gives back the username of a player who is logged in, or stops with an error.
-- Only the functions below use it: the game cannot call it itself.
create or replace function public.logged_in_player(p_username text, p_token text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_name text;
begin
  select username into v_name from players where username = lower(trim(p_username)) and token = p_token;
  if not found then
    raise exception 'You are not logged in.';
  end if;
  return v_name;
end;
$$;
revoke all on function public.logged_in_player(text, text) from public, anon, authenticated;


-- Gives back the username of the player with this player name ('' for nobody).
-- The name is tidied as set_player_name tidies it, so "Big  Bob" finds "Big Bob".
create or replace function public.player_called(p_name text)
returns text
language sql
security definer
set search_path = public, extensions
as $$
  select coalesce((select username from players
    where lower(player_name) = lower(regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g'))), '');
$$;
revoke all on function public.player_called(text) from public, anon, authenticated;


-- A whole number read from a save, or null if the save holds anything else there.
-- (A save is whatever a player's browser sent, so it is never trusted to hold a number:
-- one odd save must not stop its owner's friends from seeing their list.)
create or replace function public.save_number(p_text text)
returns integer
language sql
immutable
as $$
  select case when p_text ~ '^[0-9]{1,9}$' then p_text::integer end;
$$;
revoke all on function public.save_number(text) from public, anon, authenticated;


-- Sets the player name. Spaces at the ends are dropped and runs of spaces become one.
create or replace function public.set_player_name(p_username text, p_token text, p_name text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_me text := logged_in_player(p_username, p_token);
  v_name text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  v_holder text := player_called(v_name);
begin
  if v_name !~ '^[A-Za-z0-9_ -]{3,16}$' then
    raise exception 'A player name is 3 to 16 letters, numbers, spaces, - or _.';
  end if;
  if v_holder <> '' and v_holder <> v_me then
    raise exception 'That player name is taken.';
  end if;

  begin
    update players set player_name = v_name where username = v_me;
  exception when unique_violation then
    raise exception 'That player name is taken.';
  end;
  return json_build_object('name', v_name);
end;
$$;


-- Asks another player to be friends, by their player name. If they had already asked,
-- this says yes to them instead, so "Accept" on the Friends tab is this same function.
create or replace function public.add_friend(p_username text, p_token text, p_name text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_me text := logged_in_player(p_username, p_token);
  v_other text := player_called(coalesce(p_name, ''));
  v_state text;
begin
  if (select player_name from players where username = v_me) is null then
    raise exception 'Pick a player name first, so they can see who is asking.';
  end if;
  if v_other = '' then
    raise exception 'Nobody has the player name "%".', trim(p_name);
  end if;
  if v_other = v_me then
    raise exception 'That is your own player name.';
  end if;

  -- (two players adding each other at the same moment wait for one another here,
  -- in the same order every time, so they cannot both make a request)
  perform 1 from players where username in (v_me, v_other) order by username for update;

  select state into v_state from friends where owner = v_me and other = v_other;

  if v_state = 'received' then
    -- (messages from an earlier friendship are kept, but they do not count as new)
    update friends set state = 'friends',
      last_read = coalesce((select max(id) from messages where sender = friends.other and receiver = friends.owner), 0)
    where (owner = v_me and other = v_other) or (owner = v_other and other = v_me);
    return json_build_object('state', 'friends');
  end if;
  if v_state is not null then
    return json_build_object('state', v_state);
  end if;

  -- (requests other players sent you do not count here, so nobody can fill your list
  -- with requests and stop you adding anyone; they are capped on their own below)
  if (select count(*) from friends where owner = v_me and state <> 'received') >= 100 then
    raise exception 'You have 100 friends and requests already.';
  end if;
  if (select count(*) from friends where owner = v_other and state = 'received') >= 30 then
    raise exception 'That player has too many requests waiting. Ask them to answer some.';
  end if;
  if (select count(*) from friends where owner = v_me and state = 'sent') >= 20 then
    raise exception 'You have 20 requests nobody has answered yet. Cancel some first.';
  end if;

  insert into friends (owner, other, state) values (v_me, v_other, 'sent'), (v_other, v_me, 'received');
  return json_build_object('state', 'sent');
end;
$$;


-- Removes a friend, turns down a request, or cancels one sent. Both sides go.
create or replace function public.remove_friend(p_username text, p_token text, p_name text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_me text := logged_in_player(p_username, p_token);
  v_other text := player_called(coalesce(p_name, ''));
begin
  delete from friends where (owner = v_me and other = v_other) or (owner = v_other and other = v_me);
  return json_build_object('ok', true);
end;
$$;


-- Sends a chat message to a friend
create or replace function public.send_message(p_username text, p_token text, p_name text, p_body text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_me text := logged_in_player(p_username, p_token);
  v_other text := player_called(coalesce(p_name, ''));
  v_body text := trim(regexp_replace(coalesce(p_body, ''), '[[:cntrl:]]', ' ', 'g'));
  v_id bigint;
begin
  if not exists (select 1 from friends where owner = v_me and other = v_other and state = 'friends') then
    raise exception 'You can only send messages to your friends.';
  end if;
  if v_body = '' then
    raise exception 'The message is empty.';
  end if;
  if length(v_body) > 300 then
    raise exception 'A message is at most 300 letters.';
  end if;
  if (select count(*) from messages where sender = v_me and sent_at > now() - interval '1 minute') >= 20 then
    raise exception 'That is a lot of messages. Wait a moment.';
  end if;

  insert into messages (sender, receiver, body) values (v_me, v_other, v_body) returning id into v_id;
  delete from messages where sent_at < now() - interval '30 days';
  return json_build_object('id', v_id);
end;
$$;


-- The game calls this every 20 seconds, and every 3 seconds while a chat is open.
-- It marks the player as online and gives back:
--   name      their own player name (null until they pick one)
--   friends   every friend and request: their player name, the state, how many messages from them are
--             unread, and (for friends only) how many seconds ago their game last checked
--             in and the class they are playing, its level and best floor
--   messages  if p_chat is a friend's player name: the messages between the two of you.
--             With p_after 0 (a chat just opened), the newest 50. Otherwise the 50 that
--             follow message number p_after, oldest first: if 50 come back, there may be
--             more, and the game asks again. The messages given back are marked as read.
create or replace function public.social_poll(p_username text, p_token text, p_chat text, p_after bigint)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_me text := logged_in_player(p_username, p_token);
  v_myname text;
  v_other text := player_called(coalesce(p_chat, ''));
  v_messages json := '[]';
  v_friends json;
begin
  update players set last_seen = now() where username = v_me returning player_name into v_myname;

  if exists (select 1 from friends where owner = v_me and other = v_other and state = 'friends') then
    select coalesce(json_agg(m order by m.id), '[]') into v_messages from (
      select id, sender = v_me as mine, body, sent_at as at from messages
      where ((sender = v_me and receiver = v_other) or (sender = v_other and receiver = v_me)) and id > coalesce(p_after, 0)
      order by case when coalesce(p_after, 0) = 0 then -id else id end
      limit 50
    ) m;

    update friends set last_read = greatest(last_read, coalesce((select max((m ->> 'id')::bigint) from json_array_elements(v_messages) m), 0))
    where owner = v_me and other = v_other;
  end if;

  select coalesce(json_agg(f order by f.place, lower(f.name)), '[]') into v_friends from (
    select p.player_name as name,
      fr.state,
      case when fr.state = 'friends' then floor(extract(epoch from now() - p.last_seen))::int end as seen,
      (select count(*) from messages m where m.sender = fr.other and m.receiver = v_me and m.id > fr.last_read)::int as unread,
      case when fr.state = 'friends' then p.save ->> 'playerClass' end as class,
      case when fr.state = 'friends' then save_number(p.save -> 'classSaves' -> (p.save ->> 'playerClass') ->> 'level') end as level,
      case when fr.state = 'friends' then save_number(p.save -> 'classSaves' -> (p.save ->> 'playerClass') ->> 'bestFloor') end as floor,
      case fr.state when 'received' then 0 when 'friends' then 1 else 2 end as place
    from friends fr join players p on p.username = fr.other
    where fr.owner = v_me
  ) f;

  return json_build_object('name', v_myname, 'friends', v_friends, 'messages', v_messages);
end;
$$;


grant execute on function public.set_player_name(text, text, text) to anon;
grant execute on function public.add_friend(text, text, text) to anon;
grant execute on function public.remove_friend(text, text, text) to anon;
grant execute on function public.send_message(text, text, text, text) to anon;
grant execute on function public.social_poll(text, text, text, bigint) to anon;
