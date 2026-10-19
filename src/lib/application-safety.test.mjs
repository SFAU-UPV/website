import test from "node:test";
import assert from "node:assert/strict";
import { canApply, resolveApplicationAvailability } from "../types/domain.ts";

const base = { id: "p", programId: "p", startsOn: "2025-01-02", endsOn: "2025-01-10", declaredAvailability: "open", verificationStatus: "verified", externalApplicationUrl: "https://official.example/app" };
const atStart = new Date("2025-01-01T16:00:00Z");

test("resolver requires a usable link and application window", () => {
  assert.equal(resolveApplicationAvailability(undefined, atStart), "unverified");
  assert.equal(resolveApplicationAvailability({ ...base, verificationStatus: "unverified" }, atStart), "open");
  assert.equal(resolveApplicationAvailability({ ...base, externalApplicationUrl: "http://unsafe.example" }, atStart), "unverified");
  assert.equal(resolveApplicationAvailability({ ...base, externalApplicationUrl: undefined }, atStart), "unverified");
  assert.equal(resolveApplicationAvailability({ ...base, startsOn: null, endsOn: null }, atStart), "unverified");
});

test("resolver applies Manila date boundaries", () => {
  assert.equal(resolveApplicationAvailability(base, new Date("2025-01-01T15:59:59Z")), "upcoming");
  assert.equal(resolveApplicationAvailability(base, atStart), "open");
  assert.equal(resolveApplicationAvailability(base, new Date("2025-01-10T16:00:00Z")), "closed");
});

test("explicit status outcomes remain useful and safe", () => {
  assert.equal(resolveApplicationAvailability({ ...base, declaredAvailability: "upcoming" }, atStart), "upcoming");
  assert.equal(resolveApplicationAvailability({ ...base, declaredAvailability: "closed" }, atStart), "closed");
  assert.equal(resolveApplicationAvailability({ ...base, statusOverride: "suspended" }, atStart), "suspended");
  assert.equal(canApply({ id: "p", slug: "p", name: "P", summary: "P", category: "private", serviceSlug: "scholarships", publicationStatus: "published" }, base, atStart), true);
  assert.equal(canApply({ id: "p", slug: "p", name: "P", summary: "P", category: "private", serviceSlug: "scholarships", publicationStatus: "draft" }, base, atStart), false);
});
