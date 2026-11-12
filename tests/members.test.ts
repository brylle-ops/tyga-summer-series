import { describe, expect, it } from "vitest";
import { isActiveStatus, normaliseEmail, parseMemberCsv, parseSyncPayload } from "@/lib/members";

describe("normaliseEmail", () => {
  it("trims and lower-cases", () => expect(normaliseEmail("  Jess.Smith@Gmail.COM ")).toBe("jess.smith@gmail.com"));
  it("rejects non-emails", () => {
    expect(normaliseEmail("not an email")).toBeNull();
    expect(normaliseEmail("a@b")).toBeNull();
    expect(normaliseEmail("a@@b.com")).toBeNull();
    expect(normaliseEmail("")).toBeNull();
  });
});

describe("parseMemberCsv", () => {
  it("handles BOM, CRLF, quoted commas, bad rows and duplicates", () => {
    const csv = "﻿\"First Name\",\"Last Name\",\"E-mail Address\",\"Mobile Phone\"\r\n" +
      "Jess,\"Smith, Jr\",Jess@X.com,0400 000 000\r\n" +
      "No,Email,,0411\r\n" +
      "Bad,Email,not-an-email,0422\r\n" +
      "Jess,Smith,JESS@x.com ,0433\r\n" +
      "Sam,Lee,sam@y.com,\r\n";
    const r = parseMemberCsv(csv);
    expect(r.error).toBeUndefined();
    expect(r.skipped).toBe(2);
    expect(r.rows).toEqual([
      { email: "jess@x.com", first_name: "Jess", last_name: "Smith", mobile: "0433" },
      { email: "sam@y.com", first_name: "Sam", last_name: "Lee", mobile: "" },
    ]);
  });

  it("accepts other header spellings", () => {
    const r = parseMemberCsv("firstname,surname,email,phone\nA,B,a@b.com,1\n");
    expect(r.rows).toEqual([{ email: "a@b.com", first_name: "A", last_name: "B", mobile: "1" }]);
  });

  it("errors without an email column", () => {
    expect(parseMemberCsv("name,phone\nA,1\n")).toEqual({ rows: [], skipped: 0, error: "No email column found" });
  });
});

describe("member sync from the TYG Dashboard", () => {
  it("keeps only active statuses", () => {
    expect(isActiveStatus("Active", "active")).toBe(true);
    expect(isActiveStatus(" ACTIVE ", "active, current")).toBe(true);
    expect(isActiveStatus("Current", "active, current")).toBe(true);
    expect(isActiveStatus("Suspended", "active")).toBe(false);
    expect(isActiveStatus("", "active")).toBe(false);
    expect(isActiveStatus(undefined, "active")).toBe(false);
  });

  it("parses the dashboard payload", () => {
    const r = parseSyncPayload({ members: [
      { email: " A@B.com", first_name: "A", last_name: "B", mobile: "1", status: "Active" },
      { email: "c@d.com", status: "Suspended" },
      { email: "junk", status: "Active" },
      { email: "a@b.com", first_name: "A2", status: "active" },
    ] }, "active");
    expect(r).toEqual({ rows: [{ email: "a@b.com", first_name: "A2", last_name: "", mobile: "" }], skipped: 1 });
  });

  it("rejects a payload without a members array", () => {
    expect(parseSyncPayload({}, "active")).toBeNull();
    expect(parseSyncPayload(null, "active")).toBeNull();
  });
});
