import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminSignOutButton } from "@/src/components/admin-sign-out-button";
import { AdminProgramEditor } from "@/src/components/admin-console";
import { getAdminProgramEditorData } from "@/src/lib/admin";

export const instant = false;

export default async function NewProgramPage() {
  let data;
  try {
    await cookies();
    data = await getAdminProgramEditorData();
  } catch {
    redirect("/admin");
  }
  return (
    <section className="section">
      <div className="container">
        <div className="admin-page-header">
          <div>
            <h1>Programs</h1>
            <p>Create and review program information.</p>
          </div>
          <AdminSignOutButton />
        </div>
        <AdminProgramEditor
          services={data.services as Record<string, unknown>[]}
          categories={data.categories as Record<string, unknown>[]}
        />
      </div>
    </section>
  );
}
