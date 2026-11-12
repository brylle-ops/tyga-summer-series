import { beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { addUser, asService, asUser, bootDb } from "./harness";

const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
const S = "00000000-0000-0000-0000-00000000000s".replace("s", "5");
let db: PGlite;

beforeAll(async () => {
  db = await bootDb();
  await addUser(db, A, "a@x.com");
  await addUser(db, B, "b@x.com");
  await addUser(db, S, "staff@x.com", "staff");
  await asService(db, `insert into registrations (profile_id, fit) values ($1,'women'),($2,'men')`, [A, B]);
  await asService(db, `insert into active_members (email) values ('a@x.com')`);
  await asService(db, `insert into square_payments (payment_id, order_id) values ('P1','O1')`);
});

describe("row level security", () => {
  it("members see only their own profile and registration", async () => {
    expect((await asUser(db, A, "select email from profiles")).map((r) => r.email)).toEqual(["a@x.com"]);
    expect(await asUser(db, A, "select profile_id from registrations")).toEqual([{ profile_id: A }]);
  });

  it("members can save their singlet and goal", async () => {
    await asUser(db, A, `update registrations set colour='cream', size='M' where profile_id=$1`, [A]);
    await asUser(db, A, `update profiles set goal='Keep my strength', first_name='Jess' where id=$1`, [A]);
    expect(await asService(db, `select colour, size from registrations where profile_id=$1`, [A])).toEqual([{ colour: "cream", size: "M" }]);
  });

  it("members can't mark themselves paid or make themselves staff", async () => {
    await expect(asUser(db, A, `update registrations set payment_status='paid' where profile_id=$1`, [A])).rejects.toThrow(/permission denied/);
    await expect(asUser(db, A, `update profiles set role='staff' where id=$1`, [A])).rejects.toThrow(/permission denied/);
  });

  it("members can't pick a goal that isn't one of the four", async () => {
    await expect(asUser(db, A, `update profiles set goal='anything' where id=$1`, [A])).rejects.toThrow(/check/);
  });

  it("singlet changes are blocked by the database after 30 Nov", async () => {
    await asService(db, `create or replace function singlets_open() returns boolean language sql stable as $$ select false $$`);
    await expect(asUser(db, A, `update registrations set size='L' where profile_id=$1`, [A])).rejects.toThrow(/row-level security/);
    await asService(db, `create or replace function singlets_open() returns boolean language sql stable as $$ select true $$`);
  });

  it("members can't see or add checkout orders", async () => {
    await asService(db, `insert into checkout_orders (order_id, profile_id) values ('O9', $1)`, [A]);
    await expect(asUser(db, A, "select * from checkout_orders")).rejects.toThrow(/permission denied/);
    await expect(asUser(db, A, `insert into checkout_orders (order_id, profile_id) values ('X', $1)`, [A])).rejects.toThrow(/permission denied/);
  });

  it("members can't touch another member's row", async () => {
    await asUser(db, A, `update registrations set colour='charcoal' where profile_id=$1`, [B]);
    expect(await asService(db, `select colour from registrations where profile_id=$1`, [B])).toEqual([{ colour: null }]);
  });

  it("members can't read the member list or payments", async () => {
    expect(await asUser(db, A, "select * from active_members")).toEqual([]);
    expect(await asUser(db, A, "select * from square_payments")).toEqual([]);
    expect(await asUser(db, A, "select * from signin_attempts")).toEqual([]);
  });

  it("staff see everyone", async () => {
    expect((await asUser(db, S, "select profile_id from registrations")).length).toBe(2);
    expect((await asUser(db, S, "select * from active_members")).length).toBe(1);
    expect((await asUser(db, S, "select * from square_payments")).length).toBe(1);
  });

  it("member numbers count up", async () => {
    const rows = await asService<{ member_no: number }>(db, `select member_no from profiles where id in ($1,$2) order by member_no`, [A, B]);
    expect(rows.map((r) => r.member_no)).toEqual([1, 2]);
  });

  it("member list emails must be lower-case", async () => {
    await expect(asService(db, `insert into active_members (email) values ('Jess@X.com')`)).rejects.toThrow(/check/);
  });

  it("replace_active_members swaps the whole list at once", async () => {
    await asService(db, `select replace_active_members($1::jsonb)`, [JSON.stringify([
      { email: "new1@x.com", first_name: "N", last_name: "One", mobile: "04" },
      { email: "new2@x.com", first_name: "N", last_name: "Two", mobile: "" },
    ])]);
    expect((await asService(db, `select email from active_members order by email`)).map((r) => r.email)).toEqual(["new1@x.com", "new2@x.com"]);
    await expect(asService(db, `select replace_active_members($1::jsonb)`, [JSON.stringify([{ email: "BAD@x.com" }])])).rejects.toThrow();
    expect((await asService(db, `select count(*)::int n from active_members`))[0]).toEqual({ n: 2 });
  });

  it("members can't call replace_active_members", async () => {
    await expect(asUser(db, A, `select replace_active_members('[]'::jsonb)`)).rejects.toThrow(/permission denied/);
  });
});
