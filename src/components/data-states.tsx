import { Skeleton } from "@heroui/react";

export function LoadingState({ label = "Loading content" }: { label?: string }) {
  return (
    <div className="loading-state" role="status" aria-live="polite" aria-label={label}>
      <Skeleton className="loading-skeleton loading-skeleton--title" />
      <Skeleton className="loading-skeleton loading-skeleton--line" />
      <Skeleton className="loading-skeleton loading-skeleton--line loading-skeleton--line-short" />
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
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
export function ErrorState({
  title = "We could not load this content",
  message = "Please try again later or check the official SFAU source.",
}: {
  title?: string;
  message?: string;
} = {}) {
  return (
    <div className="empty-state state-error" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
