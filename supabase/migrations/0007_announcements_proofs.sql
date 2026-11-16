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
