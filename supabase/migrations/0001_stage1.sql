-- TYGA Summer Series — stage 1 (real sign-ups)
-- Run once in Supabase → SQL Editor. Safe to read: every table has Row Level Security on.
-- Members can only see and change their own rows; payment columns are written by the server only.

create sequence if not exists member_no_seq start 1;

-- The gym's active members (from the TYG Dashboard's daily Mindbody import, or a staff CSV upload).
create table active_members (
  email text primary key check (email = lower(trim(email)) and email <> ''),
  first_name text,
  last_name text,
  mobile text,
  uploaded_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  first_name text,
  last_name text,
  mobile text,
  role text not null default 'member' check (role in ('member', 'staff')),
  member_no int unique default nextval('member_no_seq'),
  goal text check (goal is null or goal in ('Maintain my fitness', 'Stay consistent over Christmas', 'Keep my strength', 'Start February strong')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table registrations (
  profile_id uuid primary key references profiles on delete cascade,
  fit text check (fit in ('women', 'men')),
  colour text check (colour in ('cream', 'charcoal')),
  size text check (size in ('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL')),
  terms_accepted_at timestamptz,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'refunded')),
  square_order_id text unique,
  square_payment_id text unique,
  paid_at timestamptz,
  amount_cents int,
  updated_at timestamptz not null default now()
);

-- Every Square checkout a member opened (they may open several; any of them can be the one they pay).
create table checkout_orders (
  order_id text primary key,
  profile_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now()
);

-- Every payment Square reports, so staff can spot anyone who paid twice.
create table square_payments (
  payment_id text primary key,
  order_id text,
  status text,
  amount_cents int,
  duplicate boolean not null default false,
  received_at timestamptz not null default now()
);

create table signin_attempts (
  id bigint generated always as identity primary key,
  email text,
  found boolean,
  created_at timestamptz not null default now()
);

-- Singlet choices close at the end of 30 Nov, Albury time — enforced here too, not just in the app.
create function singlets_open() returns boolean language sql stable as $$ select now() < '2026-12-01T00:00:00+11:00'::timestamptz $$;

-- Is the signed-in user staff? (security definer so it can read profiles without tripping RLS)
create function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'staff' from profiles where id = auth.uid()), false)
$$;

-- Replace the whole member list in one go (all rows or none). Server / SQL editor only.
create function replace_active_members(rows jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from active_members where true;
  insert into active_members (email, first_name, last_name, mobile)
    select r.email, r.first_name, r.last_name, r.mobile
    from jsonb_to_recordset(rows) as r(email text, first_name text, last_name text, mobile text);
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function replace_active_members(jsonb) from public;
revoke all on function replace_active_members(jsonb) from anon, authenticated;
grant execute on function is_staff() to anon, authenticated;

-- Row Level Security
alter table active_members enable row level security;
alter table profiles enable row level security;
alter table registrations enable row level security;
alter table square_payments enable row level security;
alter table signin_attempts enable row level security;
alter table checkout_orders enable row level security;

-- Table privileges: start from nothing, then grant exactly what members need.
revoke all on active_members, profiles, registrations, square_payments, signin_attempts, checkout_orders from anon, authenticated;
grant select on active_members, profiles, registrations, square_payments, signin_attempts to authenticated;
grant update (first_name, last_name, goal, last_seen_at) on profiles to authenticated;
grant insert (profile_id, fit, colour, size, terms_accepted_at) on registrations to authenticated;
grant update (fit, colour, size, terms_accepted_at, updated_at) on registrations to authenticated;

create policy "own profile" on profiles for select to authenticated using (id = auth.uid() or is_staff());
create policy "update own profile" on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "own registration" on registrations for select to authenticated using (profile_id = auth.uid() or is_staff());
create policy "create own registration" on registrations for insert to authenticated with check (profile_id = auth.uid() and singlets_open());
create policy "update own registration" on registrations for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid() and singlets_open());

create policy "staff read members" on active_members for select to authenticated using (is_staff());
create policy "staff read payments" on square_payments for select to authenticated using (is_staff());
create policy "staff read sign-ins" on signin_attempts for select to authenticated using (is_staff());
