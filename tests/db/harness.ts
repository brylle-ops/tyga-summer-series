import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import path from "node:path";

// A real Postgres (PGlite, in memory) with just enough of Supabase's auth schema to run our migration
// and check the Row Level Security rules as a member, as staff, and as the server.
export async function bootDb() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
  `);
  await db.exec(readFileSync(path.join(__dirname, "../../supabase/migrations/0001_stage1.sql"), "utf8"));
  return db;
}

/** Run SQL as a signed-in member (role authenticated, auth.uid() = id). */
export async function asUser<T = Record<string, unknown>>(db: PGlite, id: string, sql: string, params: unknown[] = []) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${id}', false);`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
  }
}

/** Run SQL as the database owner (what the secret key / SQL editor does). */
export async function asService<T = Record<string, unknown>>(db: PGlite, sql: string, params: unknown[] = []) {
  return (await db.query<T>(sql, params)).rows;
}

export async function addUser(db: PGlite, id: string, email: string, role: "member" | "staff" = "member") {
  await db.query(`insert into auth.users (id, email) values ($1, $2)`, [id, email]);
  await db.query(`insert into profiles (id, email, role) values ($1, $2, $3)`, [id, email, role]);
}
