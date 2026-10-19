import { AdminSetupForm } from "@/src/components/admin-setup-form";

export default function AdminSetupPage() {
  return (
    <section className="admin-auth-page">
      <div className="container admin-auth-layout">
        <div className="admin-auth-card">
          <div className="admin-auth-heading">
            <h1>Create Admin Account</h1>
            <p>Use this one-time setup flow to create the first Neon Auth account.</p>
          </div>
          <AdminSetupForm />
        </div>
      </div>
    </section>
  );
}
