export default function AgeGroupCard({
  data,
}: {
  data: { group: string; count: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">연령대 분포</p>
      {data.length === 0 ? (
        <p className="text-t-muted text-sm">데이터 없음</p>
      ) : (
        <div className="space-y-2">
          {data.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            const barWidth = Math.round((item.count / max) * 100);
            return (
              <div key={item.group}>
                <div className="flex items-center justify-between text-sm mb-0.5">
                  <span className="text-t-heading font-mono">{item.group}</span>
                  <span className="text-t-label font-mono">
                    {item.count}건 ({pct}%)
                  </span>
                </div>
                <div className="w-full h-4 bg-t-bar rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-t-muted text-xs font-mono text-right mt-1">
            총 {total.toLocaleString()}건
          </p>
        </div>
      )}
    </div>
  );
}
