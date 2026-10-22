export function SectionHeading({
  title,
  intro,
}: {
  title: string;
  intro?: string;
}) {
  return (
    <div className="section-heading">
      <h2 className="typography typography--h2 typography--weight-semibold">{title}</h2>
      {intro && <p className="typography typography--body-sm typography--color-muted">{intro}</p>}
    </div>
  );
}
