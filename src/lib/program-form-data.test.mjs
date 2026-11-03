import assert from "node:assert/strict";
import test from "node:test";
import { readProgramList } from "./program-form-data.ts";

test("structured items keep their order and internal line breaks when saved", () => {
  const form = new FormData();
  form.append("requirements_items", "Transcript\nInclude all semesters");
  form.append("requirements_items", "  Proof of income  ");
  assert.deepEqual(readProgramList(form, "requirements"), [
    "Transcript\nInclude all semesters", "Proof of income",
  ]);
});

test("empty added rows are omitted without losing other entries", () => {
  const form = new FormData();
  form.append("benefits_items", " ");
  form.append("benefits_items", "Allowance");
  form.append("benefits_items", "");
  assert.deepEqual(readProgramList(form, "benefits"), ["Allowance"]);
});

test("removing all rows saves an empty list", () => {
  assert.deepEqual(readProgramList(new FormData(), "eligibility"), []);
});

test("legacy newline input remains supported", () => {
  const form = new FormData();
  form.set("eligibility", "Enrolled\r\n\r\nGood standing");
  assert.deepEqual(readProgramList(form, "eligibility"), ["Enrolled", "Good standing"]);
});
