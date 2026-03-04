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
    : 'conic-gradient(#334155 0% 100%)';

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-slate-400 text-xs font-mono mb-3">Device Ratio</p>
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex-shrink-0 relative"
          style={{ background: gradient }}
        >
          <div className="absolute inset-3 bg-slate-800 rounded-full" />
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-sm inline-block" />
            <span className="text-slate-300">Mobile {mobilePct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-sm inline-block" />
            <span className="text-slate-300">Desktop {desktopPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
