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
