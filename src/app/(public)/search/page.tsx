import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { SearchInterface } from "@/src/components/search-interface";
import { getPublicPrograms } from "@/src/lib/content";

export const instant = false;

export default async function SearchPage() { const programs = await getPublicPrograms(); return <><section className="page-intro"><div className="container"><p className="eyebrow">Search</p><h1>Find SFAU information</h1><p>Search published SFAU program content.</p></div></section><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} /><section className="section"><div className="container search-page"><SearchInterface programs={programs} /></div></section></>; }
