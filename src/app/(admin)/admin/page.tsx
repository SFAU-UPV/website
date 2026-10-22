import { AdminConsole } from "@/src/components/admin-console";
import { AdminSignOutButton } from "@/src/components/admin-sign-out-button";
import { getAdminSnapshot } from "@/src/lib/admin";

export const instant = false;

export default async function AdminPage() {
  let snapshot;
  let loadError: unknown;
  try {
    snapshot = await getAdminSnapshot();
  } catch (error) {
    loadError = error;
  }
  if (snapshot) {
    return (
      <section className="section">
        <div className="container">
          <div className="admin-page-header">
            <div>
              <h1>Content workspace</h1>
              <p>Manage published information separately from application availability.</p>
            </div>
            <AdminSignOutButton />
          </div>
          <AdminConsole snapshot={snapshot} />
        </div>
      </section>
    );
  } else {
    const message = loadError instanceof Error ? loadError.message : "";
    const signInRequired = message.includes("session has expired");
    const accessDenied = message.includes("not authorized");
    return (
      <section className="section">
        <div className="container admin-login-shell">
          <div className="card">
            <h1>{signInRequired ? "Administrator sign in required" : accessDenied ? "Access not enabled" : "Workspace unavailable"}</h1>
            <p>
              {signInRequired
                ? "Sign in with an authorized SFAU account to continue."
                : accessDenied
                  ? "Your account is signed in, but an administrator has not granted workspace access. Contact the SFAU administrator."
                  : "The content workspace could not load. Please try again shortly or contact the SFAU administrator."}
            </p>
            <a className="button button-primary" href={signInRequired || accessDenied ? "/admin/login" : "/admin"}>
              {signInRequired ? "Go to sign in" : accessDenied ? "Use another account" : "Try again"}
            </a>
          </div>
        </div>
      </section>
    );
  }
}
