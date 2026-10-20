import { notFound } from "next/navigation";
import { getAdminProgramPreview } from "@/src/lib/admin";

export const instant = false;

function List({ title, items }: { title: string; items: unknown }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <section className="prose-section">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={String(item)}>{String(item)}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function AdminProgramPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();
  let rawProgram: Awaited<ReturnType<typeof getAdminProgramPreview>>;
  try {
    rawProgram = await getAdminProgramPreview(id);
  } catch {
    notFound();
  }
  const program = rawProgram as Record<string, unknown>;
  const overview = String(program.description ?? "").trim();
  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Administrator preview · {String(program.publication_status)}</p>
        <h1>{String(program.name)}</h1>
        {overview ? <p className="page-preview-summary">{overview}</p> : null}
        <div className="verification-note">
          This preview is private and is not a public publication.
        </div>
        {overview ? (
          <section className="prose-section">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>
        ) : null}
        <List title="Eligibility" items={program.eligibility} />
        <List title="Requirements" items={program.requirements} />
        <List title="Benefits" items={program.benefits} />
        <List title="Degree programs" items={program.degree_programs} />
        <List title="Application process" items={program.application_process} />
      </div>
    </main>
  );
}
