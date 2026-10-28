-- CHAMPIONS community database starter for Supabase
-- Run in Supabase Dashboard -> SQL Editor.
-- Public submissions are enabled for a simple public demo. Do not use this
-- policy set for sensitive/private student information. See README.md.

create extension if not exists pgcrypto;

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Anonymous' check (char_length(name) <= 40),
  option text not null check (option in ('The Funny One','The Helpful One','The Creative One')),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  type text not null check (type in ('Memory','Poetry','Shout-out','Photo')),
  content text not null check (char_length(content) between 1 and 700),
  image_url text null check (image_url is null or (char_length(image_url) <= 2000 and image_url ~ '^https://')),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.votes enable row level security;
alter table public.posts enable row level security;
alter table public.chat_messages enable row level security;

-- Remove these starter policies if you later switch to authenticated-only access.
drop policy if exists "Anyone can read votes" on public.votes;
drop policy if exists "Anyone can submit votes" on public.votes;
drop policy if exists "Anyone can read posts" on public.posts;
drop policy if exists "Anyone can create posts" on public.posts;
drop policy if exists "Anyone can read chat" on public.chat_messages;
drop policy if exists "Anyone can send chat" on public.chat_messages;

create policy "Anyone can read votes" on public.votes
  for select to anon, authenticated using (true);
create policy "Anyone can submit votes" on public.votes
  for insert to anon, authenticated with check (
    char_length(name) <= 40 and option in ('The Funny One','The Helpful One','The Creative One')
  );

create policy "Anyone can read posts" on public.posts
  for select to anon, authenticated using (true);
create policy "Anyone can create posts" on public.posts
  for insert to anon, authenticated with check (
    char_length(name) between 1 and 40 and
    char_length(content) between 1 and 700 and
    type in ('Memory','Poetry','Shout-out','Photo') and
    (image_url is null or (char_length(image_url) <= 2000 and image_url ~ '^https://'))
  );

create policy "Anyone can read chat" on public.chat_messages
  for select to anon, authenticated using (true);
create policy "Anyone can send chat" on public.chat_messages
  for insert to anon, authenticated with check (
    char_length(name) between 1 and 40 and char_length(message) between 1 and 500
  );

-- Enable Realtime for live updates. If already in publication, skip duplicate errors.
do $$ begin
  alter publication supabase_realtime add table public.posts;
exception when duplicate_object then null;
when undefined_object then raise notice 'supabase_realtime publication not found; enable Realtime in Dashboard.';
end $$;
do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null;
when undefined_object then raise notice 'supabase_realtime publication not found; enable Realtime in Dashboard.';
end $$;
do $$ begin
  alter publication supabase_realtime add table public.votes;
exception when duplicate_object then null;
when undefined_object then raise notice 'supabase_realtime publication not found; enable Realtime in Dashboard.';
end $$;
