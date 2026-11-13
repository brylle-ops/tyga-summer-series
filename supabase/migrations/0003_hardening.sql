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
