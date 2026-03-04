export default function HourlyTrafficChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-slate-400 text-xs font-mono mb-3">Hourly Traffic</p>
      <div className="flex items-end gap-[2px] h-24">
        {data.map((count, hour) => {
          const height = max > 0 ? (count / max) * 100 : 0;
          return (
            <div
              key={hour}
              className="flex-1 group relative"
              title={`${hour}시: ${count}`}
            >
              <div
                className="bg-blue-500 hover:bg-blue-400 rounded-t-sm transition-colors w-full"
                style={{ height: `${height}%`, minHeight: count > 0 ? '2px' : '0' }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>0시</span>
        <span>6시</span>
        <span>12시</span>
        <span>18시</span>
        <span>23시</span>
      </div>
    </div>
  );
}
