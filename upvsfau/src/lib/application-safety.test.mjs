import test from "node:test";
import assert from "node:assert/strict";

function canApply(program, cycle) {
  return Boolean(program.publicationStatus === "published" && cycle?.verificationStatus === "open" && cycle.overrideStatus !== "suspended" && program.externalApplicationUrl && /^https:\/\//.test(program.externalApplicationUrl));
}

test("Apply stays unavailable until publication, verification, schedule, and HTTPS link are present", () => {
  const program = { publicationStatus: "published" };
  assert.equal(canApply(program), false);
  assert.equal(canApply(program, { verificationStatus: "open", externalApplicationUrl: "http://unsafe.example" }), false);
  assert.equal(canApply({ ...program, externalApplicationUrl: "https://official.example" }, { verificationStatus: "open" }), true);
});
