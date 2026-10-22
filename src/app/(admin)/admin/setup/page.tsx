import { AdminSetupForm } from "@/src/components/admin-setup-form";

export default function AdminSetupPage() {
  return (
    <section className="admin-auth-page">
      <div className="container admin-auth-layout">
        <div className="admin-auth-card">
          <div className="admin-auth-heading">
            <h1>Create a staff sign-in</h1>
            <p>Create the first sign-in account. Workspace access is granted separately by an administrator.</p>
          </div>
          <AdminSetupForm />
        </div>
      </div>
    </section>
  );
}
