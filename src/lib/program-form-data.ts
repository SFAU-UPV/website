export function readProgramList(form: FormData, key: string) {
  const repeated = form.getAll(`${key}_items`).filter((item): item is string => typeof item === "string");
  const values = repeated.length ? repeated : String(form.get(key) ?? "").split(/\r?\n/);
  return values.map((item) => item.trim()).filter(Boolean);
}
