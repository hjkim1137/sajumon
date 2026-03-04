export default function ReferrerCard({
  data,
}: {
  data: { referrer: string; count: number }[];
}) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-slate-400 text-xs font-mono mb-3">Top Referrers</p>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-slate-300 truncate max-w-[200px]">
              {item.referrer}
            </span>
            <span className="text-slate-400 font-mono ml-2 flex-shrink-0">
              {item.count}
            </span>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-slate-500 text-sm">데이터 없음</p>
        )}
      </div>
    </div>
  );
}
