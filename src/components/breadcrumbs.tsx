import { Breadcrumbs as HeroBreadcrumbs } from "@heroui/react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <HeroBreadcrumbs className="breadcrumbs container" aria-label="Breadcrumb">
      {items.map((item, index) => (
        item.href ? (
          <HeroBreadcrumbs.Item key={`${item.label}-${index}`} href={item.href}>
            {item.label}
          </HeroBreadcrumbs.Item>
        ) : (
          <HeroBreadcrumbs.Item key={`${item.label}-${index}`}>
            {item.label}
          </HeroBreadcrumbs.Item>
        )
      ))}
    </HeroBreadcrumbs>
  );
}
