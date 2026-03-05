export default function DeviceRatioCard({
  data,
}: {
  data: { mobile: number; desktop: number };
}) {
  const total = data.mobile + data.desktop;
  const mobilePct = total > 0 ? Math.round((data.mobile / total) * 100) : 0;
  const desktopPct = 100 - mobilePct;

  // CSS conic-gradient donut
  const gradient = total > 0
    ? `conic-gradient(#3b82f6 0% ${mobilePct}%, #22c55e ${mobilePct}% 100%)`
    : `conic-gradient(var(--t-bar) 0% 100%)`;

  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">기기 비율</p>
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex-shrink-0 relative"
          style={{ background: gradient }}
        >
          <div className="absolute inset-3 bg-t-card rounded-full" />
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-sm inline-block" />
            <span className="text-t-body">모바일 {mobilePct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-sm inline-block" />
            <span className="text-t-body">데스크톱 {desktopPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
