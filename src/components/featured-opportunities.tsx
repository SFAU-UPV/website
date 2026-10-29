import { ProgramList } from "@/src/components/program-list";
import type { Program } from "@/src/types/domain";

export function FeaturedOpportunities({ programs }: { programs: Program[] }) {
  return <ProgramList programs={programs} />;
}
