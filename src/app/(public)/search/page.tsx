import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { SearchInterface } from "@/src/components/search-interface";
import { getPublicProgramsResult } from "@/src/lib/content";
import { ErrorState } from "@/src/components/data-states";

export const instant = false;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const initialQuery = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");
  const result = await getPublicProgramsResult();
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <h1>Find SFAU information</h1>
          <p>Search SFAU services and published programs.</p>
        </div>
      </section>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <section className="section">
        <div className="container search-page">
          {result.status === "error" ? (
            <ErrorState
              title="Program results unavailable"
              message="You can still search SFAU services. Try again later for published programs."
            />
          ) : null}
          <SearchInterface key={initialQuery} programs={result.data} initialQuery={initialQuery} />
        </div>
      </section>
    </>
  );
}
