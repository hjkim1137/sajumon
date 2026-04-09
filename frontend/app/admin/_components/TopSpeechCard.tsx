const MEDALS = ['🥇', '🥈', '🥉'];

export default function TopSpeechCard({
  data,
}: {
  data: { text: string; count: number }[];
}) {
  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">인기 문구</p>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={item.text} className="flex items-center justify-between gap-2">
            <span className="text-t-heading text-sm truncate">
              {MEDALS[i]} {item.text.replace(/\n/g, ' ')}
            </span>
            <span className="text-t-label text-sm font-mono flex-shrink-0">{item.count}</span>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-t-muted text-sm">데이터 없음</p>
        )}
      </div>
    </div>
  );
}
