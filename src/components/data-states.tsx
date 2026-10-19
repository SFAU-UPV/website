export function LoadingState({ label = "Loading content" }: { label?: string }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <span className="state-icon" aria-hidden="true">
        ◌
      </span>
      <p>{label}…</p>
    </div>
  );
}
export function EmptyState({
  title = "Nothing to show yet",
  message = "SFAU content will appear here after it is verified and published.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="empty-state">
      <span className="state-icon" aria-hidden="true">
        □
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
export function ErrorState() {
  return (
    <div className="empty-state state-error" role="alert">
      <span className="state-icon" aria-hidden="true">
        !
      </span>
      <h2>We could not load this content</h2>
      <p>Please try again later or check the official SFAU source.</p>
    </div>
  );
}
