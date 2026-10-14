import test from "node:test";
import assert from "node:assert/strict";
import { buildImportReport } from "./import-scholarships.mjs";

const csv = `Preamble,,,,,,\nMASTERLIST,,,,,,\nNAME OF SCHOLARSHIP,ELIGIBILITY,REQUIREMENTS,BENEFITS,DEGREE PROGRAMS,APPLICATION PROCESS,STATUS\nA. UP-FUNDED SCHOLARSHIPS,,,,,,\n1. Lingap Iskolar Program,"UPV student",Proof,"Support",All programs,"Apply directly at CHED",Open\nB. GOVERNMENT SCHOLARSHIPS,,,,,,\n2. Lingap Iskolar Program,"SIKAP applicant",Proof,"Support",All programs,See announcement,Open\n`;

test("importer finds the exact header row, preserves raw fields, and flags review risks", () => {
  const report = buildImportReport(csv, "fixture.csv");
  assert.equal(report.recordCount, 2);
  assert.equal(report.records[0].sourceName, "Lingap Iskolar Program");
  assert.equal(report.records[0].rawPayload["ELIGIBILITY"], "UPV student");
  assert.ok(report.records[0].reviewFlags.includes("instruction_not_application_proof"));
  assert.ok(report.records[0].reviewFlags.includes("duplicate_name"));
  assert.ok(report.records[0].reviewFlags.includes("multi_category_reference"));
  assert.equal(report.records[0].applicationAvailability, "unverified");
  assert.equal(report.summary.applicationCyclesCreated, 0);
});
