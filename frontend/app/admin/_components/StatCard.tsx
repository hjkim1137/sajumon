export default function StatCard({
  label,
  value,
  sub,
  delta,
}: {
  label: string;
  value: string | number;
  sub?: string;
  delta?: number | null;
}) {
  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-t-heading">{value}</p>
        {delta != null && (
          <span
            className={`text-xs font-bold font-mono ${
              delta > 0 ? 'text-t-success' : delta < 0 ? 'text-t-danger' : 'text-t-muted'
            }`}
          >
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '-'}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {sub && <p className="text-t-muted text-xs mt-1">{sub}</p>}
    </div>
  );
}
