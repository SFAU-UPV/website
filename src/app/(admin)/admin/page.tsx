import { AdminConsole } from "@/src/components/admin-console";
import { getAdminSnapshot } from "@/src/lib/admin";

export const instant = false;

export default async function AdminPage() {
  try {
    const snapshot = await getAdminSnapshot();
    return (
      <section className="section">
        <div className="container">
          <div className="admin-page-header">
            <div>
              <p className="eyebrow">SFAU administration</p>
              <h1>Content workspace</h1>
              <p>Manage published information separately from application availability.</p>
            </div>
            <form action="/admin/login" method="get">
              <button className="button button-secondary" type="submit">
                Sign in again
              </button>
            </form>
          </div>
          <AdminConsole snapshot={snapshot} />
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="section">
        <div className="container admin-login-shell">
          <div className="card">
            <p className="eyebrow">Protected workspace</p>
            <h1>Administrator sign in required</h1>
            <p>
              {error instanceof Error
                ? error.message
                : "Sign in with an authorized SFAU account to continue."}
            </p>
            <a className="button button-primary" href="/admin/login">
              Go to sign in
            </a>
          </div>
        </div>
      </section>
    );
  }
}
