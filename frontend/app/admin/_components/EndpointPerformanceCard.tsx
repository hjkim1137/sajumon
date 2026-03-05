export default function EndpointPerformanceCard({
  apiAvg,
  apiP95,
  apiP99,
  endpointErrors,
}: {
  apiAvg: number;
  apiP95: number;
  apiP99: number;
  endpointErrors: { endpoint: string; count: number }[];
}) {
  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">API 성능 / 엔드포인트 에러</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-t-muted mb-2">분석 API 응답시간</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-t-label">평균</span>
              <span className="text-t-heading font-mono">{apiAvg}ms</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-t-label">p95</span>
              <span className={`font-mono ${apiP95 > 3000 ? 'text-t-warning' : 'text-t-heading'}`}>
                {apiP95}ms
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-t-label">p99</span>
              <span className={`font-mono ${apiP99 > 5000 ? 'text-t-danger' : apiP99 > 3000 ? 'text-t-warning' : 'text-t-heading'}`}>
                {apiP99}ms
              </span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-t-muted mb-2">에러 (당일)</p>
          <div className="space-y-1.5">
            {endpointErrors.map((e) => (
              <div key={e.endpoint} className="flex justify-between text-xs">
                <span className="text-t-body truncate max-w-[120px] font-mono">
                  {e.endpoint}
                </span>
                <span className="text-t-danger font-mono">{e.count}</span>
              </div>
            ))}
            {endpointErrors.length === 0 && (
              <p className="text-t-success text-xs">에러 없음</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
