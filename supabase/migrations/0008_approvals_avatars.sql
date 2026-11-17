-- Run once in Supabase → SQL Editor after 0007.
-- 1) Mission ticks now wait for staff approval before their points count.
--    Existing completions stay counted ('confirmed'); new ones arrive as 'pending'.
alter table mission_completions
  add column if not exists status text not null default 'confirmed'
  check (status in ('pending', 'confirmed'));
create index if not exists mission_completions_pending on mission_completions (created_at) where status = 'pending';

-- 2) Optional member profile photo (stored in the private "avatars" bucket; the app shows it via short-lived links).
alter table profiles add column if not exists avatar_path text;
