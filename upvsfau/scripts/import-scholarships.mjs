import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

export const EXPECTED_HEADERS = ["NAME OF SCHOLARSHIP", "ELIGIBILITY", "REQUIREMENTS", "BENEFITS", "DEGREE PROGRAMS", "APPLICATION PROCESS", "STATUS"];

export function parseCsv(input) {
  const rows = []; let row = []; let cell = ""; let quoted = false;
  for (let index = 0; index < input.length; index += 1) { const char = input[index]; const next = input[index + 1]; if (quoted) { if (char === '"' && next === '"') { cell += '"'; index += 1; } else if (char === '"') quoted = false; else cell += char; } else if (char === '"') quoted = true; else if (char === ",") { row.push(cell); cell = ""; } else if (char === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; } else cell += char; }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function clean(value = "") { return value.replace(/^\uFEFF/, "").replace(/\s+/g, " ").trim(); }
function normalizeName(value) { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function slugify(value) { return normalizeName(value).replace(/\s+/g, "-").slice(0, 80); }
function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function stableUuid(value) { const bytes = Buffer.from(sha256(value).slice(0, 32), "hex"); bytes[6] = (bytes[6] & 0x0f) | 0x50; bytes[8] = (bytes[8] & 0x3f) | 0x80; return `${bytes.toString("hex").slice(0, 8)}-${bytes.toString("hex").slice(8, 12)}-${bytes.toString("hex").slice(12, 16)}-${bytes.toString("hex").slice(16, 20)}-${bytes.toString("hex").slice(20)}`; }
function stripLeadingNumber(value) { return clean(value).replace(/^\s*(?:\d+[.)]|[A-Za-z][.)]|[-•])\s*/, "").trim(); }
function splitStructured(value) { return clean(value).split(/\r?\n|[•●]|;|\|/).map(stripLeadingNumber).filter(Boolean); }
function findHeader(rows) { return rows.findIndex((row) => EXPECTED_HEADERS.every((header, index) => clean(row[index]).toUpperCase() === header)); }
function sectionCategory(value) { const upper = value.toUpperCase(); if (upper.includes("UP-FUNDED") || upper.includes("UP-ADMINISTERED")) return "up-administered"; if (upper.includes("GOVERNMENT")) return "government"; if (upper.includes("PRIVATE")) return "private"; if (upper.includes("OTHER FINANCIAL ASSISTANCE")) return "other-assistance"; return undefined; }

export function classifyRow(row, rowNumber, contextCategory) {
  const values = Object.fromEntries(EXPECTED_HEADERS.map((header, index) => [header, clean(row[index] ?? "")]));
  const name = stripLeadingNumber(values["NAME OF SCHOLARSHIP"]);
  const combined = Object.values(values).join(" ");
  const candidates = new Set(); if (contextCategory) candidates.add(contextCategory); if (/\bCHED\b|\bSIKAP\b/i.test(combined)) candidates.add("government"); if (/\bUPV?\b|UP[- ]FUNDED|UNIVERSITY OF THE PHILIPPINES/i.test(combined)) candidates.add("up-administered"); if (/private|foundation|corporate|company/i.test(combined)) candidates.add("private");
  const flags = []; if (!name) flags.push("missing_name"); if (!candidates.size) flags.push("missing_category_review"); if (candidates.size > 1) flags.push("multi_category_reference"); if (/apply\s+directly\s+at|apply.*\bCHED\b|\bSIKAP\b/i.test(combined)) flags.push("instruction_not_application_proof"); if (/SLAS|stipend|rate|₱|peso|contact|email|phone|threshold|bracket/i.test(combined)) flags.push("possible_historical_policy_or_contact_reference");
  return { sourceRowNumber: rowNumber, sourceName: name, normalizedName: normalizeName(name), stableId: stableUuid(normalizeName(name)), slug: slugify(name), rawPayload: values, sourceStatus: values.STATUS || null, eligibility: splitStructured(values.ELIGIBILITY), requirements: splitStructured(values.REQUIREMENTS), benefits: splitStructured(values.BENEFITS), degreePrograms: splitStructured(values["DEGREE PROGRAMS"]), applicationProcess: splitStructured(values["APPLICATION PROCESS"]), categoryCandidates: [...candidates], reviewFlags: flags, applicationAvailability: "unverified" };
}

export function buildImportReport(csvText, sourceFilename) {
  const rows = parseCsv(csvText); const headerIndex = findHeader(rows); if (headerIndex < 0) throw new Error(`Required CSV columns not found. Expected: ${EXPECTED_HEADERS.join(", ")}`);
  const records = []; let contextCategory; for (let index = headerIndex + 1; index < rows.length; index += 1) { const row = rows[index]; const category = sectionCategory(row[0] ?? ""); if (category && row.slice(1).every((value) => !clean(value))) { contextCategory = category; continue; } if (!clean(row[0])) continue; records.push(classifyRow(row, index + 1, contextCategory)); }
  const names = new Map(); for (const record of records) names.set(record.normalizedName, [...(names.get(record.normalizedName) ?? []), record.sourceRowNumber]); for (const record of records) if ((names.get(record.normalizedName)?.length ?? 0) > 1) record.reviewFlags.push("duplicate_name");
  const sourceSha256 = sha256(csvText); return { sourceFilename, sourceSha256, expectedHeaders: EXPECTED_HEADERS, headerRow: headerIndex + 1, recordCount: records.length, records, summary: { duplicateNames: [...names.entries()].filter(([, rowsForName]) => rowsForName.length > 1).map(([name, rowsForName]) => ({ name, rows: rowsForName })), reviewCount: records.filter((record) => record.reviewFlags.length).length, applicationCyclesCreated: 0, publicRecordsCreated: 0 } };
}

function loadDotEnv(text) { for (const line of text.split(/\r?\n/)) { const match = line.match(/^([A-Z0-9_]+)=(.*)$/); if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, ""); } }
async function loadLocalEnv(root) { for (const filename of [".env", ".env.local"]) { try { loadDotEnv(await fs.readFile(path.join(root, filename), "utf8")); } catch { /* optional */ } } }

export async function applyImport(report, projectRoot) {
  await loadLocalEnv(projectRoot); const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url || !key) throw new Error("--apply requires SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) in the environment.");
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const batch = { source_filename: report.sourceFilename, source_sha256: report.sourceSha256, source_columns: report.expectedHeaders, dry_run: false, review_status: "needs_review", report };
  const { data: batchRow, error: batchError } = await supabase.from("import_batches").upsert(batch, { onConflict: "source_sha256" }).select("id").single(); if (batchError) throw batchError;
  const records = report.records.map((record) => ({ id: record.stableId, slug: record.slug, name: record.sourceName, summary: "Imported source record; pending SFAU review.", eligibility: record.eligibility, requirements: record.requirements, benefits: record.benefits, degree_programs: record.degreePrograms, application_process: record.applicationProcess, publication_status: "draft", source_status: record.sourceStatus, service_category_id: null }));
  if (records.length) { const { error } = await supabase.from("programs").upsert(records, { onConflict: "id" }); if (error) throw error; }
  const sourceRecords = report.records.map((record) => ({ import_batch_id: batchRow.id, source_row_number: record.sourceRowNumber, source_name: record.sourceName, normalized_name: record.normalizedName, raw_payload: record.rawPayload, source_status: record.sourceStatus, review_flags: record.reviewFlags, content_sha256: sha256(`${report.sourceSha256}:${record.sourceRowNumber}:${record.normalizedName}`) }));
  if (sourceRecords.length) { const { error } = await supabase.from("program_source_records").upsert(sourceRecords, { onConflict: "content_sha256" }); if (error) throw error; }
  return { ...report, appliedBatchId: batchRow.id, summary: { ...report.summary, publicRecordsCreated: 0 } };
}

async function main() { const args = process.argv.slice(2); const input = args[args.indexOf("--input") + 1]; const reportPath = args.includes("--report") ? args[args.indexOf("--report") + 1] : "reports/scholarship-import-report.json"; const apply = args.includes("--apply"); if (!input) throw new Error("Usage: node scripts/import-scholarships.mjs --input <csv> [--report <json>] [--apply]"); const csvText = await fs.readFile(input, "utf8"); const report = buildImportReport(csvText, path.basename(input)); const finalReport = apply ? await applyImport(report, process.cwd()) : report; await fs.mkdir(path.dirname(reportPath), { recursive: true }); await fs.writeFile(reportPath, JSON.stringify({ dryRun: !apply, ...finalReport }, null, 2)); console.log(JSON.stringify({ dryRun: !apply, reportPath, sourceSha256: finalReport.sourceSha256, recordCount: finalReport.recordCount, reviewCount: finalReport.summary.reviewCount, applicationCyclesCreated: 0, publicRecordsCreated: 0 }, null, 2)); }

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
