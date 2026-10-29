import { notFound, redirect } from "next/navigation";
import { AdminSignOutButton } from "@/src/components/admin-sign-out-button";
import { AdminProgramEditor } from "@/src/components/admin-console";
import { getAdminProgramEditorData } from "@/src/lib/admin";

export const instant = false;

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    data = await getAdminProgramEditorData(id);
  } catch {
    redirect("/admin");
  }
  if (!data.program) notFound();
  return <section className="section"><div className="container">
    <div className="admin-page-header"><div><h1>Programs</h1><p>Edit program information.</p></div><AdminSignOutButton /></div>
    <AdminProgramEditor program={data.program as Record<string, unknown>} services={data.services as Record<string, unknown>[]} categories={data.categories as Record<string, unknown>[]} />
  </div></section>;
}
