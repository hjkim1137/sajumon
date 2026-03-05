export default function ReferrerCard({
  data,
}: {
  data: { referrer: string; count: number }[];
}) {
  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">유입 경로</p>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-t-body truncate max-w-[200px]">
              {item.referrer}
            </span>
            <span className="text-t-label font-mono ml-2 flex-shrink-0">
              {item.count}
            </span>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-t-muted text-sm">데이터 없음</p>
        )}
      </div>
    </div>
  );
}
