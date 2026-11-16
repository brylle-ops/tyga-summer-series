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
