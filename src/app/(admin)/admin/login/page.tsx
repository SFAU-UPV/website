import { AdminLoginForm } from "@/src/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <section className="admin-auth-page">
      <div className="container admin-auth-layout">
        <div className="admin-auth-card">
          <div className="admin-auth-heading">
            <h1>Admin Sign In</h1>
          </div>
          <AdminLoginForm />
          <p className="admin-auth-note">
            Students do not sign in here. This workspace is for authorized SFAU staff only.
          </p>
        </div>
      </div>
    </section>
  );
}
