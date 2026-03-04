const THEME_NAMES: Record<string, string> = {
  health: '건강운', money: '재물운', love: '연애운', career: '직장운', study: '학업운',
};

export default function ThemeConversionCard({
  data,
}: {
  data: { theme: string; total: number; success: number; rate: number }[];
}) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-slate-400 text-xs font-mono mb-3">Theme Conversion</p>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.theme}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">
                {THEME_NAMES[item.theme] || item.theme}
              </span>
              <span className="text-slate-400">
                {item.success}/{item.total} ({item.rate}%)
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${item.rate}%` }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-slate-500 text-sm">데이터 없음</p>
        )}
      </div>
    </div>
  );
}
