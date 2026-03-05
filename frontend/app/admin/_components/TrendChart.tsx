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
      <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
        <p className="text-t-label text-xs font-mono mb-3">{title}</p>
        <p className="text-t-muted text-sm">데이터 없음</p>
      </div>
    );
  }

  const values = data.map((d) => d[valueKey] as number);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);

  const w = 400;
  const h = 140;
  const padX = 30;
  const padY = 16;

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * (w - padX * 2);
    const y = padY + (1 - (d[valueKey] - min) / Math.max(max - min, 1)) * (h - padY * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const areaPath = `M${points[0]} ${points.join(' L')} L${w - padX},${h - padY} L${padX},${h - padY} Z`;

  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">{title}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
        <defs>
          <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Y축 눈금선 및 숫자 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const yVal = Math.round(min + (max - min) * (1 - ratio));
          const yPos = padY + ratio * (h - padY * 2);
          return (
            <g key={ratio}>
              <line
                x1={padX} y1={yPos} x2={w} y2={yPos}
                style={{ stroke: 'var(--t-card-border)' }}
                strokeWidth="0.5"
              />
              <text
                x={padX - 4} y={yPos + 3}
                textAnchor="end"
                style={{ fill: 'var(--t-muted)' }}
                fontSize="9"
              >
                {yVal}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill={`url(#grad-${title})`} />
        <polyline
          points={polyline}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 데이터 포인트 위 숫자 (최대/최소/마지막) */}
        {data.map((d, i) => {
          const val = d[valueKey] as number;
          const isMax = val === max;
          const isMin = val === min && min !== max;
          const isLast = i === data.length - 1;
          if (!isMax && !isMin && !isLast) return null;
          const x = padX + (i / Math.max(data.length - 1, 1)) * (w - padX * 2);
          const y = padY + (1 - (val - min) / Math.max(max - min, 1)) * (h - padY * 2);
          return (
            <text
              key={i}
              x={x}
              y={y - 5}
              textAnchor="middle"
              style={{ fill: isMax ? '#3b82f6' : isMin ? 'var(--t-danger)' : 'var(--t-label)' }}
              fontSize="9"
              fontWeight="bold"
            >
              {val}
            </text>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-t-muted mt-1">
        <span>{data[0]?.[labelKey]?.slice(5)}</span>
        <span>{data[data.length - 1]?.[labelKey]?.slice(5)}</span>
      </div>
    </div>
  );
}
