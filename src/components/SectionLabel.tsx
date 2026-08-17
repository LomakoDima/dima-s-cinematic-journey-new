export function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="hairline-t flex items-baseline gap-4 pt-4">
      <span className="meta text-primary">{index}</span>
      <span className="meta">/ {title}</span>
    </div>
  );
}
