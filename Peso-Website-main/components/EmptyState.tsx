export default function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="empty-state panel">
      <h4>{title}</h4>
      <p>{sub}</p>
    </div>
  );
}
