"use client";

export default function AdminError({ retry }: { retry: () => void }) {
  return (
    <section className="section">
      <div className="container admin-login-shell">
        <h1>Workspace could not load</h1>
        <p role="alert">
          An unexpected error interrupted this page. Try again to reload it.
          Changes that were not saved may need to be entered again.
        </p>
        <div className="admin-actions">
          <button className="button button-primary" type="button" onClick={retry}>
            Try again
          </button>
          <a href="/admin">Back to workspace</a>
        </div>
      </div>
    </section>
  );
}
