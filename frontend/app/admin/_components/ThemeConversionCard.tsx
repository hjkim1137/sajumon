const THEME_NAMES: Record<string, string> = {
  health: '건강운', money: '재물운', love: '연애운', career: '직장운', study: '학업운',
};

export default function ThemeConversionCard({
  data,
}: {
  data: { theme: string; total: number; success: number; rate: number }[];
}) {
  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">테마 전환율</p>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.theme}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-t-body">
                {THEME_NAMES[item.theme] || item.theme}
              </span>
              <span className="text-t-label">
                {item.success}/{item.total} ({item.rate}%)
              </span>
            </div>
            <div className="h-2 bg-t-bar rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${item.rate}%` }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-t-muted text-sm">데이터 없음</p>
        )}
      </div>
    </div>
  );
}
