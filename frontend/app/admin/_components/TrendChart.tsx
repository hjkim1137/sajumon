export default function TrendChart({
  title,
  data,
  labelKey,
  valueKey,
}: {
  title: string;
  data: Record<string, any>[];
  labelKey: string;
  valueKey: string;
}) {
  if (data.length === 0) {
    return (
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <p className="text-slate-400 text-xs font-mono mb-3">{title}</p>
        <p className="text-slate-500 text-sm">데이터 없음</p>
      </div>
    );
  }

  const values = data.map((d) => d[valueKey] as number);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);

  const w = 400;
  const h = 120;
  const padX = 0;
  const padY = 10;

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * (w - padX * 2);
    const y = padY + (1 - (d[valueKey] - min) / Math.max(max - min, 1)) * (h - padY * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const areaPath = `M${points[0]} ${points.join(' L')} L${w - padX},${h - padY} L${padX},${h - padY} Z`;

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-slate-400 text-xs font-mono mb-3">{title}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28">
        <defs>
          <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${title})`} />
        <polyline
          points={polyline}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>{data[0]?.[labelKey]?.slice(5)}</span>
        <span>{data[data.length - 1]?.[labelKey]?.slice(5)}</span>
      </div>
    </div>
  );
}
