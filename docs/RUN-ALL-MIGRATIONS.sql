-- ===== 0003_hardening =====
-- Hardening: limits enforced by the database itself, so they hold even if someone bypasses the app.
-- NOT VALID = applies to every new or changed row without failing on any old row.

alter table profiles add constraint profiles_first_name_len check (first_name is null or char_length(first_name) <= 60) not valid;
alter table profiles add constraint profiles_last_name_len  check (last_name  is null or char_length(last_name)  <= 60) not valid;
alter table profiles add constraint profiles_mobile_len     check (mobile     is null or char_length(mobile)     <= 30) not valid;
alter table profiles add constraint profiles_goal_values    check (goal is null or goal in (
  'Maintain my fitness', 'Stay consistent over Christmas', 'Keep my strength', 'Start February strong')) not valid;

alter table missions add constraint missions_title_len  check (char_length(title)  <= 80)  not valid;
alter table missions add constraint missions_detail_len check (char_length(detail) <= 140) not valid;

-- Handy check (run on its own): every table in the public schema should have row level security ON.
--   select tablename from pg_tables where schemaname = 'public' and not rowsecurity;
-- It should return no rows.

-- ===== 0004_rewards =====
-- TYGA Summer Series — weekly Rewards & Perks + simplified points. Run once in Supabase → SQL Editor after 0003.
-- Rewards are NOT bought with points. They unlock each Monday 12:00 am Albury time (when `published` and the week has started).

create table rewards (
  id bigint generated always as identity primary key,
  week int not null check (week between 1 and 7),
  kind text not null check (kind in ('leaderboard', 'draw', 'discount', 'partner', 'finale')),
  title text not null check (char_length(title) <= 80),
  partner text not null default '' check (char_length(partner) <= 80),
  description text not null default '' check (char_length(description) <= 300),
  eligibility text not null default '' check (char_length(eligibility) <= 300),
  how_to text not null default '' check (char_length(how_to) <= 300),
  code text check (code is null or char_length(code) <= 40),
  image_url text check (image_url is null or image_url ~ '^https://'),
  expires_on date,
  winners_count int not null default 1 check (winners_count between 1 and 50),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table reward_entries (
  reward_id bigint not null references rewards on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reward_id, profile_id)
);

create table reward_winners (
  reward_id bigint not null references rewards on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  announced boolean not null default false,
  collected_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (reward_id, profile_id)
);

create table reward_redemptions (
  reward_id bigint not null references rewards on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (reward_id, profile_id)
);

alter table rewards enable row level security;
alter table reward_entries enable row level security;
alter table reward_winners enable row level security;
alter table reward_redemptions enable row level security;

revoke all on rewards, reward_entries, reward_winners, reward_redemptions from anon, authenticated;
grant select on reward_entries, reward_winners, reward_redemptions to authenticated;
grant all on rewards, reward_entries, reward_winners, reward_redemptions to service_role;

create policy "own entries" on reward_entries for select to authenticated using (profile_id = auth.uid() or is_staff());
create policy "own wins" on reward_winners for select to authenticated using (profile_id = auth.uid() or is_staff());
create policy "own reward redemptions" on reward_redemptions for select to authenticated using (profile_id = auth.uid() or is_staff());

-- The seven reward weeks (weeks 1–2 confirmed; 3–7 stay "Coming soon" until staff fill them in and publish)
insert into rewards (week, kind, title, partner, description, eligibility, how_to, expires_on, winners_count, published) values
  (1, 'leaderboard', 'Top 10 win a Yard Gym drink bottle', 'The Yard Gym',
   'The top 10 members on the Week 1 leaderboard each receive an exclusive Yard Gym drink bottle.',
   'Top 10 by verified Week 1 points at the weekly cutoff. Staff confirm the winners.',
   'Climb the Week 1 leaderboard. Winners are notified in the app and collect at The Yard.', '2027-01-26', 10, true),
  (2, 'draw', 'Exclusive Yard Gym keyring giveaway', 'The Yard Gym',
   'Enter the draw to win an exclusive Yard Gym keyring.',
   'Open to all registered members. One entry per member.',
   'Tap Enter draw. The winner is drawn by staff and notified in the app.', '2027-01-26', 1, true),
  (2, 'discount', '10% off new merchandise', 'The Yard Gym',
   '10% off new Yard Gym merchandise.',
   'Eligible new merchandise only. Cannot be combined with other offers unless approved.',
   'Show this reward at The Yard when you buy.', '2027-01-26', 1, true),
  (2, 'discount', '30% off older merchandise', 'The Yard Gym',
   '30% off older Yard Gym merchandise.',
   'Eligible older merchandise only. Cannot be combined with other offers unless approved.',
   'Show this reward at The Yard when you buy.', '2027-01-26', 1, true),
  (3, 'partner', 'Local business collaboration', '', 'Reward to be confirmed.', '', '', null, 1, false),
  (4, 'partner', 'Local business collaboration', '', 'Reward to be confirmed.', '', '', null, 1, false),
  (5, 'partner', 'Local business collaboration', '', 'Reward to be confirmed.', '', '', null, 1, false),
  (6, 'partner', 'Local business collaboration', '', 'Reward to be confirmed.', '', '', null, 1, false),
  (7, 'finale', 'Summer Series finale reward', 'The Yard Gym', 'Reward to be confirmed.', '', '', null, 1, false);

-- Simplified points: featured mission 15 · tag us after a workout 5 · surprise bonus 10 (plus 30 for completing 3 sessions, in the app).
-- Replaces the starter missions that nobody has ticked yet; any mission someone already completed is kept.
delete from missions where id not in (select mission_id from mission_completions);
insert into missions (week, title, detail, points)
select w, f.title, f.detail, 15 from (values
  (1, 'Collect your singlet', 'Pick it up at The Yard'),
  (2, 'Wear your singlet to training', 'Show it off'),
  (3, 'Try a high-protein summer recipe', '3 recipes in Resources'),
  (4, 'Plan your January sessions', 'Book 3 for the first week back'),
  (5, 'Bring a friend on Saturday', 'Plus-one session'),
  (6, 'Try a new class time', 'Mix it up'),
  (7, 'Finish together', 'Team missions — details on the day')
) as f(w, title, detail);
insert into missions (week, title, detail, points)
select w, 'Tag us after a workout', 'Use #SummerSeries', 5 from generate_series(1, 7) as w;
insert into missions (week, title, detail, points, is_secret, reveal_at)
select w, 'Surprise bonus mission', 'A surprise from the team', 10, true,
  timestamptz '2026-12-07 12:00:00+11' + ((w - 1) * 7 + 3) * interval '1 day'
from generate_series(1, 7) as w;

-- ===== 0005_mission_copy =====
-- TYGA Summer Series — the seven weekly missions exactly as Amy listed them (15 pts each, unlock Monday, close Sunday).
-- Run after 0004. Safe to run twice.
update missions m set title = v.title, detail = v.detail
from (values
  (1, 'The Standards',        'Complete your weekly commitment of 3 sessions.'),
  (2, 'Wear the Singlet',     'Wear your Summer Series singlet to a class. Take a photo, tag @theyardgym_albury and use #SummerSeries.'),
  (3, 'Run It',               'Complete a run (any distance). Screenshot your Strava and share it to Instagram. Tag @theyardgym_albury #SummerSeries.'),
  (4, 'Hello, 2027!',         'Share a photo of how you''re welcoming the New Year. Tag @theyardgym_albury, use #SummerSeries #MaintainTheStandard.'),
  (5, 'Squad Session',        'Get a photo of 4 or more doing the Summer Series in the gym. Tag @theyardgym_albury and use #SummerSeries.'),
  (6, 'Fuel It',              'Prepare one of the Summer Series recipes. Take a photo or screenshot and upload it in the app.'),
  (7, 'Bring Your Plus One',  'Bring a friend, family member or someone new to a class (any class) for a free session. Tell the team who (app or FOH).')
) as v(week, title, detail)
where m.week = v.week and m.points = 15 and not m.is_secret;

update missions set title = 'Tag us in a workout', detail = 'Take a photo, tag @theyardgym_albury and use #SummerSeries.'
where points = 5 and not is_secret;

update missions set title = 'Bonus mission', detail = 'Announced by the team this week.'
where points = 10 and is_secret;

-- ===== 0006_staff_emails =====
-- TYGA Summer Series — staff by email. Anyone on this list gets the staff (backend) view the moment their profile exists.
-- Run once in Supabase → SQL Editor after 0005. To add more staff later: insert into staff_emails values ('name@example.com');

create table if not exists staff_emails (
  email text primary key check (email = lower(email))
);
alter table staff_emails enable row level security;
revoke all on staff_emails from anon, authenticated;
grant all on staff_emails to service_role;

insert into staff_emails values ('brylle@supersidekick.co') on conflict do nothing;

-- New profiles for a listed email become staff automatically (sign-in proves the email is theirs).
create or replace function promote_staff() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from staff_emails s where s.email = lower(new.email)) then
    new.role := 'staff';
  end if;
  return new;
end $$;

drop trigger if exists profiles_promote_staff on profiles;
create trigger profiles_promote_staff before insert on profiles
  for each row execute function promote_staff();

-- If they have already signed in once, promote the existing profile too.
update profiles set role = 'staff' where lower(email) in (select email from staff_emails) and role <> 'staff';

-- ===== 0007_announcements_proofs =====
-- Announcements (staff post, members read via the server) and mission proof uploads.
create table if not exists announcements (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) <= 80),
  body text not null check (char_length(body) <= 300),
  created_at timestamptz default now()
);

alter table announcements enable row level security;
revoke all on announcements from anon, authenticated;
grant all on announcements to service_role;

alter table mission_completions add column if not exists proof_path text;

