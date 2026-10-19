import { neon } from "@neondatabase/serverless";

export function isNeonConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getNeonSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Neon DATABASE_URL is not configured.");
  return neon(url);
}
