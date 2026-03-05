interface CountItem {
  name: string;
  count: number;
}

export default function BrowserOsCard({
  browsers,
  os,
}: {
  browsers: CountItem[];
  os: CountItem[];
}) {
  const bMax = browsers[0]?.count || 1;
  const oMax = os[0]?.count || 1;

  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">브라우저 / OS</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-t-muted mb-2">브라우저</p>
          <div className="space-y-1">
            {browsers.map((b) => (
              <div key={b.name}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-t-body">{b.name}</span>
                  <span className="text-t-label font-mono">{b.count}</span>
                </div>
                <div className="h-1.5 bg-t-bar rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.round((b.count / bMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {browsers.length === 0 && (
              <p className="text-t-muted text-[11px]">데이터 없음</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-t-muted mb-2">OS</p>
          <div className="space-y-1">
            {os.map((o) => (
              <div key={o.name}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-t-body">{o.name}</span>
                  <span className="text-t-label font-mono">{o.count}</span>
                </div>
                <div className="h-1.5 bg-t-bar rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.round((o.count / oMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {os.length === 0 && (
              <p className="text-t-muted text-[11px]">데이터 없음</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
