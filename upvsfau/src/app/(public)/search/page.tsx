import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { SearchInterface } from "@/src/components/search-interface";

export default function SearchPage() { return <><section className="page-intro"><div className="container"><p className="eyebrow">Search</p><h1>Find SFAU information</h1><p>Search the current static fixture content. Database-backed search will replace this adapter in a later phase.</p></div></section><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} /><section className="section"><div className="container search-page"><SearchInterface /></div></section></>; }
