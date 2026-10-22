import { notFound } from "next/navigation";
import { ProgramDetail } from "@/src/components/program-detail";
import { getAdminProgramPreview } from "@/src/lib/admin";
import { mapProgram, type DbProgram } from "@/src/lib/content";

export const instant = false;

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
  } catch (error) {
    if (error instanceof Error && error.message === "Program preview not found.") notFound();
    return (
      <main className="section">
        <div className="container admin-login-shell">
          <div className="card">
            <h1>Preview unavailable</h1>
            <p>The program preview could not load. Return to the workspace and try again.</p>
            <a className="button button-primary" href="/admin">Return to workspace</a>
          </div>
        </div>
      </main>
    );
  }
  const program = mapProgram(rawProgram as unknown as DbProgram);
  return (
    <main>
      <div className="admin-preview-banner" role="status">
        <div className="container">
          <strong>Staff preview</strong>
          <span>Publication: {program.publicationStatus}. Application actions follow the same verification rules as the public page.</span>
        </div>
      </div>
      <ProgramDetail
        program={program}
        breadcrumbs={[{ label: "Admin workspace", href: "/admin" }, { label: "Program preview" }]}
      />
    </main>
  );
}
