-- Run once in Supabase → SQL Editor after 0008.
-- Staff can block a member: they can't sign in or use the app and drop off the leaderboard. History is kept; unblocking restores everything.
alter table profiles add column if not exists blocked_at timestamptz;
