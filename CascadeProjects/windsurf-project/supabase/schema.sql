-- VibeCheck Database Schema
-- Safe to re-run: drops existing policies before recreating them.
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- ============================================================
-- 1. PROFILES — extends auth.users with app-specific fields
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  username text unique not null default '',
  city text not null default '',
  bio text not null default '',
  intent text not null default 'Friends',
  genres text[] default '{}',
  favorite_artists text[] default '{}',
  moods text[] default '{}',
  avatar_url text,
  location_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view all profiles" on public.profiles;
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || left(new.id::text, 8))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. POSTS — Musical Thoughts, Songs, and Playlists
-- ============================================================
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  post_type text not null default 'thought',  -- 'thought', 'song', 'playlist'
  song_title text,
  song_artist text,
  playlist_name text,
  playlist_songs jsonb default '[]',  -- array of { title, artist }
  reactions jsonb default '{}',
  created_at timestamptz default now()
);

-- Safe column additions for existing tables
do $$ begin
  alter table public.posts add column if not exists post_type text not null default 'thought';
  alter table public.posts add column if not exists song_title text;
  alter table public.posts add column if not exists song_artist text;
  alter table public.posts add column if not exists playlist_name text;
  alter table public.posts add column if not exists playlist_songs jsonb default '[]';
exception when others then null;
end $$;

alter table public.posts enable row level security;

drop policy if exists "Anyone can view posts" on public.posts;
create policy "Anyone can view posts"
  on public.posts for select
  using (true);

drop policy if exists "Users can create their own posts" on public.posts;
create policy "Users can create their own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. CONVERSATIONS — chat threads between two users
-- ============================================================
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references public.profiles(id) on delete cascade not null,
  user_b uuid references public.profiles(id) on delete cascade not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

alter table public.conversations enable row level security;

drop policy if exists "Users can view their own conversations" on public.conversations;
create policy "Users can view their own conversations"
  on public.conversations for select
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can create conversations they belong to" on public.conversations;
create policy "Users can create conversations they belong to"
  on public.conversations for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can delete conversations they belong to" on public.conversations;
create policy "Users can delete conversations they belong to"
  on public.conversations for delete
  using (auth.uid() = user_a or auth.uid() = user_b);

-- ============================================================
-- 4. MESSAGES — individual messages in a conversation
-- ============================================================
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

drop policy if exists "Users can view messages in their conversations" on public.messages;
create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

drop policy if exists "Users can send messages in their conversations" on public.messages;
create policy "Users can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- ============================================================
-- 5. NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,          -- 'vibe_ping', 'message', 'reaction', 'match'
  title text not null,
  body text,
  read boolean default false,
  data jsonb default '{}',     -- extra payload (sender_id, post_id, etc.)
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert notifications" on public.notifications;
create policy "Users can insert notifications"
  on public.notifications for insert
  with check (true);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 6. VIBE PINGS
-- ============================================================
create table if not exists public.vibe_pings (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (sender_id, receiver_id)
);

alter table public.vibe_pings enable row level security;

drop policy if exists "Users can view pings they sent or received" on public.vibe_pings;
create policy "Users can view pings they sent or received"
  on public.vibe_pings for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send pings" on public.vibe_pings;
create policy "Users can send pings"
  on public.vibe_pings for insert
  with check (auth.uid() = sender_id);

-- ============================================================
-- 7. CIRCLE REQUESTS — mutual add-to-circle with accept/reject
-- ============================================================
create table if not exists public.circle_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending',  -- 'pending', 'accepted', 'rejected'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (sender_id, receiver_id)
);

alter table public.circle_requests enable row level security;

drop policy if exists "Users can view their own requests" on public.circle_requests;
create policy "Users can view their own requests"
  on public.circle_requests for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send requests" on public.circle_requests;
create policy "Users can send requests"
  on public.circle_requests for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Users can update requests they received" on public.circle_requests;
create policy "Users can update requests they received"
  on public.circle_requests for update
  using (auth.uid() = receiver_id);

drop policy if exists "Users can delete their own requests" on public.circle_requests;
create policy "Users can delete their own requests"
  on public.circle_requests for delete
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- ============================================================
-- 8. POST REACTIONS — heart, like, dislike per user per post
-- ============================================================
create table if not exists public.post_reactions (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction_type text not null,  -- 'heart', 'like', 'dislike'
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

alter table public.post_reactions enable row level security;

drop policy if exists "Anyone can view reactions" on public.post_reactions;
create policy "Anyone can view reactions"
  on public.post_reactions for select
  using (true);

drop policy if exists "Users can add reactions" on public.post_reactions;
create policy "Users can add reactions"
  on public.post_reactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their reactions" on public.post_reactions;
create policy "Users can update their reactions"
  on public.post_reactions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can remove their reactions" on public.post_reactions;
create policy "Users can remove their reactions"
  on public.post_reactions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 8. COMMENTS — threaded comments on posts
-- ============================================================
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,  -- null = top-level
  content text not null,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

drop policy if exists "Anyone can view comments" on public.comments;
create policy "Anyone can view comments"
  on public.comments for select
  using (true);

drop policy if exists "Users can create comments" on public.comments;
create policy "Users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 10. LISTENING PROFILES — per-user Spotify listening data
-- ============================================================
create table if not exists public.listening_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  spotify_id text,
  display_name text,
  top_artists jsonb default '[]',        -- array of artist objects from Spotify
  top_tracks jsonb default '[]',         -- array of track objects from Spotify
  recently_played jsonb default '[]',    -- array of recently played track objects
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

alter table public.listening_profiles enable row level security;

drop policy if exists "Users can view their own listening profile" on public.listening_profiles;
create policy "Users can view their own listening profile"
  on public.listening_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own listening profile" on public.listening_profiles;
create policy "Users can insert their own listening profile"
  on public.listening_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own listening profile" on public.listening_profiles;
create policy "Users can update their own listening profile"
  on public.listening_profiles for update
  using (auth.uid() = user_id);

-- ============================================================
-- 11. MATCHES — computed compatibility results between users
-- ============================================================
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  user_a_id uuid references auth.users(id) on delete cascade not null,
  user_b_id uuid references auth.users(id) on delete cascade not null,
  compatibility_score float not null default 0 check (compatibility_score >= 0 and compatibility_score <= 1),
  shared_artists jsonb default '[]',     -- array of shared artist objects
  shared_tracks jsonb default '[]',      -- array of shared track objects
  match_summary text,                    -- AI-generated summary of compatibility
  generated_at timestamptz default now(),
  unique (user_a_id, user_b_id)
);

alter table public.matches enable row level security;

drop policy if exists "Users can view their own matches" on public.matches;
create policy "Users can view their own matches"
  on public.matches for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "Service role can insert matches" on public.matches;
create policy "Service role can insert matches"
  on public.matches for insert
  with check (true);

drop policy if exists "Service role can update matches" on public.matches;
create policy "Service role can update matches"
  on public.matches for update
  using (true);

-- ============================================================
-- 12. INDEXES for performance
-- ============================================================
create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_vibe_pings_receiver on public.vibe_pings(receiver_id);
create index if not exists idx_post_reactions_post on public.post_reactions(post_id);
create index if not exists idx_comments_post on public.comments(post_id);
create index if not exists idx_comments_parent on public.comments(parent_id);
create index if not exists idx_circle_requests_sender on public.circle_requests(sender_id);
create index if not exists idx_circle_requests_receiver on public.circle_requests(receiver_id);
create index if not exists idx_circle_requests_status on public.circle_requests(status);
create index if not exists idx_listening_profiles_user on public.listening_profiles(user_id);
create index if not exists idx_listening_profiles_spotify on public.listening_profiles(spotify_id);
create index if not exists idx_matches_user_a on public.matches(user_a_id);
create index if not exists idx_matches_user_b on public.matches(user_b_id);
create index if not exists idx_matches_score on public.matches(compatibility_score desc);
