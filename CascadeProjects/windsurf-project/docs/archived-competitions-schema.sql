-- ARCHIVED: Playlist Competitions Schema
-- Pull this back into supabase/schema.sql when ready to re-enable

-- 7. PLAYLIST COMPETITIONS
create table if not exists public.competitions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null default '',
  theme text not null default '',
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now()
);
alter table public.competitions enable row level security;
drop policy if exists "Anyone can view competitions" on public.competitions;
create policy "Anyone can view competitions" on public.competitions for select using (true);
drop policy if exists "Authenticated users can create competitions" on public.competitions;
create policy "Authenticated users can create competitions" on public.competitions for insert with check (auth.uid() = created_by);
drop policy if exists "Creators can update their competitions" on public.competitions;
create policy "Creators can update their competitions" on public.competitions for update using (auth.uid() = created_by);

-- 8. COMPETITION ENTRIES
create table if not exists public.competition_entries (
  id uuid default gen_random_uuid() primary key,
  competition_id uuid references public.competitions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  playlist_name text not null,
  description text not null default '',
  songs jsonb default '[]',
  vote_count integer default 0,
  created_at timestamptz default now(),
  unique (competition_id, user_id)
);
alter table public.competition_entries enable row level security;
drop policy if exists "Anyone can view competition entries" on public.competition_entries;
create policy "Anyone can view competition entries" on public.competition_entries for select using (true);
drop policy if exists "Users can submit their own entries" on public.competition_entries;
create policy "Users can submit their own entries" on public.competition_entries for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own entries" on public.competition_entries;
create policy "Users can update their own entries" on public.competition_entries for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own entries" on public.competition_entries;
create policy "Users can delete their own entries" on public.competition_entries for delete using (auth.uid() = user_id);

-- 9. COMPETITION VOTES
create table if not exists public.competition_votes (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references public.competition_entries(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (entry_id, user_id)
);
alter table public.competition_votes enable row level security;
drop policy if exists "Anyone can view votes" on public.competition_votes;
create policy "Anyone can view votes" on public.competition_votes for select using (true);
drop policy if exists "Users can cast votes" on public.competition_votes;
create policy "Users can cast votes" on public.competition_votes for insert with check (auth.uid() = user_id);
drop policy if exists "Users can remove their votes" on public.competition_votes;
create policy "Users can remove their votes" on public.competition_votes for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_competitions_status on public.competitions(status);
create index if not exists idx_competition_entries_comp on public.competition_entries(competition_id);
create index if not exists idx_competition_votes_entry on public.competition_votes(entry_id);
