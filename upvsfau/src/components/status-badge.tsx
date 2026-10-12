import type { ApplicationStatus } from "@/src/types/domain";

const labels: Record<ApplicationStatus, string> = { unverified: "Check official source", upcoming: "Upcoming", open: "Open", closed: "Closed", suspended: "Temporarily unavailable" };
export function StatusBadge({ status }: { status: ApplicationStatus }) { return <span className={`status-badge status-${status}`}>{labels[status]}</span>; }
