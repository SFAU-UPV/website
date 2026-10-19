import type { ApplicationStatus } from "@/src/types/domain";
import { Chip } from "@heroui/react";

const labels: Record<ApplicationStatus, string> = { unverified: "Check official source", upcoming: "Upcoming", open: "Open", closed: "Closed", suspended: "Temporarily unavailable" };
const colors = { unverified: "default", upcoming: "warning", open: "success", closed: "danger", suspended: "danger" } as const;
export function StatusBadge({ status }: { status: ApplicationStatus }) { return <Chip className={`status-badge status-chip status-${status}`} color={colors[status]} size="sm" variant="soft" aria-label={`Application status: ${labels[status]}`}>{labels[status]}</Chip>; }
