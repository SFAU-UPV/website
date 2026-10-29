import { ProgramList } from "@/src/components/program-list";
import type { Program } from "@/src/types/domain";

export function AssistanceDirectory({ programs }: { programs: Program[] }) {
  if (!programs.length)
    return (
      <div className="empty-state">
        <h3>No published assistance programs</h3>
        <p>Published assistance programs will appear here when they are available.</p>
      </div>
    );
  return <ProgramList programs={programs} />;
}
