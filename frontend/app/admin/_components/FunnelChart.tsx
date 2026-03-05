export default function FunnelChart({
  data,
}: {
  data: { home: number; input: number; question: number; result: number };
}) {
  const max = Math.max(data.home, 1);

  const steps = [
    { label: '홈', value: data.home, color: 'bg-blue-300' },
    { label: '입력', value: data.input, color: 'bg-emerald-300' },
    { label: '질문', value: data.question, color: 'bg-amber-300' },
    { label: '결과', value: data.result, color: 'bg-rose-300' },
  ];

  return (
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">전환 퍼널</p>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const pct = max > 0 ? Math.round((step.value / max) * 100) : 0;
          const prev = i > 0 ? steps[i - 1].value : 0;
          const dropOff = i > 0 && prev > 0 ? Math.round(((prev - step.value) / prev) * 100) : 0;
          return (
            <div key={step.label}>
              {i > 0 && prev > 0 && (
                <div className="flex items-center gap-1 text-[10px] my-1 ml-2">
                  <span className="text-t-muted">↓</span>
                  <span className="text-t-danger">{dropOff}% 이탈</span>
                  <span className="text-t-muted">·</span>
                  <span className="text-t-success">{100 - dropOff}% 전환</span>
                </div>
              )}
              <div className="flex justify-between text-xs mb-1">
                <span className="text-t-body">{step.label}</span>
                <span className="text-t-label">
                  {step.value} ({pct}%)
                </span>
              </div>
              <div className="h-3 bg-t-bar rounded-full overflow-hidden">
                <div
                  className={`h-full ${step.color} rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
