const ANIMAL_NAMES: Record<string, string> = {
  rat: '쥐', ox: '소', tiger: '호랑이', rabbit: '토끼',
  dragon: '용', snake: '뱀', horse: '말', goat: '양',
  monkey: '원숭이', rooster: '닭', dog: '개', pig: '돼지',
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default function TopAnimalsCard({
  data,
}: {
  data: { animal: string; count: number }[];
}) {
  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">인기 동물</p>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={item.animal} className="flex items-center justify-between">
            <span className="text-t-heading text-sm">
              {MEDALS[i]} {ANIMAL_NAMES[item.animal] || item.animal}
            </span>
            <span className="text-t-label text-sm font-mono">{item.count}</span>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-t-muted text-sm">데이터 없음</p>
        )}
      </div>
    </div>
  );
}
