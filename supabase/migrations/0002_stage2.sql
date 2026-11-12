-- TYGA Summer Series — stage 2 (the series itself). Run once in Supabase → SQL Editor after 0001.
-- Members read their own rows; every write goes through the app's server, which checks the rules first.

alter table profiles add column if not exists holiday_until date;

create table checkins (
  id bigint generated always as identity primary key,
  profile_id uuid not null references profiles on delete cascade,
  day date not null,
  kind text not null check (kind in ('yard', 'run', 'workout', 'recovery', 'rest')),
  -- Yard sessions wait as 'pending' until the daily Mindbody visit sync (or staff) confirms them.
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamptz not null default now(),
  unique (profile_id, day, kind)
);
create index checkins_pending on checkins (status) where status = 'pending';

create table missions (
  id bigint generated always as identity primary key,
  week int not null check (week between 1 and 7),
  title text not null,
  detail text not null default '',
  points int not null default 10 check (points between 0 and 100),
  is_secret boolean not null default false,
  reveal_at timestamptz,
  double boolean not null default false,
  created_at timestamptz not null default now()
);

create table mission_completions (
  profile_id uuid not null references profiles on delete cascade,
  mission_id bigint not null references missions on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, mission_id)
);

create table perk_redemptions (
  profile_id uuid not null references profiles on delete cascade,
  perk_key text not null,
  redeemed_at timestamptz not null default now(),
  primary key (profile_id, perk_key)
);

alter table checkins enable row level security;
alter table missions enable row level security;
alter table mission_completions enable row level security;
alter table perk_redemptions enable row level security;

revoke all on checkins, missions, mission_completions, perk_redemptions from anon, authenticated;
grant select on checkins, mission_completions, perk_redemptions to authenticated;
grant all on checkins, missions, mission_completions, perk_redemptions to service_role;
grant usage, select on all sequences in schema public to service_role;

create policy "own checkins" on checkins for select to authenticated using (profile_id = auth.uid() or is_staff());
create policy "own completions" on mission_completions for select to authenticated using (profile_id = auth.uid() or is_staff());
create policy "own redemptions" on perk_redemptions for select to authenticated using (profile_id = auth.uid() or is_staff());

-- Starter missions (staff can add more in /admin; each week stays hidden until it unlocks)
insert into missions (week, title, detail, points) values
  (1, 'Collect your singlet', 'Pick it up at The Yard', 10),
  (1, 'Book your first 3 sessions', 'For 7–13 Dec', 10),
  (2, 'Wear your singlet to training', 'Show it off', 10),
  (3, 'Share your favourite holiday movement', 'Post it, or just tell us at the desk', 10),
  (3, 'Try a high-protein summer recipe', '3 recipes in Resources', 10),
  (4, 'Plan your January sessions', 'Book 3 for the first week back', 10),
  (5, 'Bring a friend on Saturday', 'Plus-one session', 15),
  (6, 'Try a new class time', 'Mix it up', 10),
  (7, 'Finish together', 'Team missions — details on the day', 20);
