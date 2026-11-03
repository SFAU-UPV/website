import { ProgramList } from "@/src/components/program-list";
import type { Program } from "@/src/types/domain";

export function FeaturedOpportunities({ programs, today }: { programs: Program[]; today: Date }) {
  return <ProgramList programs={programs} today={today} />;
}
