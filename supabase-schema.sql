-- Oh Hell Game Tracker — Supabase Schema
-- Run this in the Supabase SQL Editor to create the tables.

create table if not exists players (
  id text primary key,
  name text not null,
  elo integer not null default 1000,
  elo_history jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{
    "gamesPlayed": 0,
    "gamesWon": 0,
    "totalRoundsPlayed": 0,
    "totalBidsCorrect": 0,
    "totalBidsSum": 0,
    "totalPlacement": 0
  }'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists games (
  id text primary key,
  status text not null default 'active',
  date timestamptz not null default now(),
  player_ids jsonb not null default '[]'::jsonb,
  max_cards integer not null,
  round_sequence jsonb not null default '[]'::jsonb,
  current_round_index integer not null default 0,
  initial_dealer_index integer not null default 0,
  rounds jsonb not null default '[]'::jsonb,
  final_scores jsonb,
  elo_changes jsonb,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (allow all for anon key — this is a shared app)
alter table players enable row level security;
alter table games enable row level security;

create policy "Allow all on players" on players for all using (true) with check (true);
create policy "Allow all on games" on games for all using (true) with check (true);
