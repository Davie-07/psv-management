const StatCard = ({ title, value, caption }) => (
  <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <p className="text-sm uppercase tracking-wide text-muted-foreground">{title}</p>
    <p className="my-2 text-4xl font-semibold">{value}</p>
    {caption && <p className="text-sm text-muted-foreground">{caption}</p>}
  </div>
);

export default StatCard;


