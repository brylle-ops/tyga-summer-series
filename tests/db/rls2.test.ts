import { beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { addUser, asService, asUser, bootDbStage2 } from "./harness";

const A = "00000000-0000-0000-0000-00000000000a", B = "00000000-0000-0000-0000-00000000000b";
let db: PGlite;
beforeAll(async () => {
  db = await bootDbStage2();
  await addUser(db, A, "a@x.com"); await addUser(db, B, "b@x.com");
  await asService(db, `insert into checkins (profile_id, day, kind) values ($1,'2026-12-08','run'),($2,'2026-12-08','run')`, [A, B]);
});

describe("stage 2 rules", () => {
  it("members see only their own check-ins", async () => {
    expect((await asUser(db, A, "select profile_id from checkins")).length).toBe(1);
  });
  it("members can't log or confirm check-ins directly", async () => {
    await expect(asUser(db, A, `insert into checkins (profile_id, day, kind) values ($1,'2026-12-09','run')`, [A])).rejects.toThrow(/permission denied/);
    await expect(asUser(db, A, `update checkins set status='confirmed'`)).rejects.toThrow(/permission denied/);
  });
  it("members can't read missions ahead of time or complete them directly", async () => {
    await expect(asUser(db, A, "select * from missions")).rejects.toThrow(/permission denied/);
    await expect(asUser(db, A, `insert into mission_completions values ($1, 1)`, [A])).rejects.toThrow(/permission denied/);
  });
  it("one log per kind per day", async () => {
    await expect(asService(db, `insert into checkins (profile_id, day, kind) values ($1,'2026-12-08','run')`, [A])).rejects.toThrow(/duplicate/);
  });
  it("starter missions are loaded", async () => {
    expect((await asService<{ n: number }>(db, "select count(*)::int n from missions"))[0].n).toBe(9);
  });
});
