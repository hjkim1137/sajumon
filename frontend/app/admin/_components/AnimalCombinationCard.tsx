const ANIMALS = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
const ANIMAL_SHORT: Record<string, string> = {
  rat: '쥐', ox: '소', tiger: '호', rabbit: '토', dragon: '용', snake: '뱀',
  horse: '말', goat: '양', monkey: '원', rooster: '닭', dog: '개', pig: '돼',
};
const THEMES = ['health', 'money', 'love', 'career', 'study'];
const THEME_SHORT: Record<string, string> = {
  health: '건강', money: '재물', love: '연애', career: '직장', study: '학업',
};

export default function AnimalCombinationCard({
  data,
}: {
  data: Record<string, number>;
}) {
  const max = Math.max(...Object.values(data), 1);

  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border overflow-x-auto">
      <p className="text-t-label text-xs font-mono mb-3">동물 × 테마 히트맵</p>
      <table className="text-[10px] w-full">
        <thead>
          <tr>
            <th />
            {THEMES.map((t) => (
              <th key={t} className="text-t-label px-1 py-1 font-normal">
                {THEME_SHORT[t]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ANIMALS.map((a) => (
            <tr key={a}>
              <td className="text-t-label pr-1 whitespace-nowrap">{ANIMAL_SHORT[a]}</td>
              {THEMES.map((t) => {
                const count = data[`${a}:${t}`] || 0;
                const intensity = max > 0 ? count / max : 0;
                return (
                  <td key={t} className="px-1 py-[2px] text-center">
                    <div
                      className="rounded-sm w-full h-4 flex items-center justify-center text-[9px]"
                      style={{
                        backgroundColor: count > 0
                          ? `rgba(59, 130, 246, ${0.15 + intensity * 0.85})`
                          : 'var(--t-cell-empty)',
                        color: intensity > 0.5 ? '#fff' : 'var(--t-label)',
                      }}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
