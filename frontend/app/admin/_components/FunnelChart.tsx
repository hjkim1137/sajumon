export default function FunnelChart({
  data,
}: {
  data: { home: number; input: number; question: number; result: number };
}) {
  const max = Math.max(data.home, 1);

  const steps = [
    { label: '홈', value: data.home, color: 'bg-blue-500' },
    { label: '입력', value: data.input, color: 'bg-green-500' },
    { label: '질문', value: data.question, color: 'bg-yellow-500' },
    { label: '결과', value: data.result, color: 'bg-red-500' },
  ];

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-slate-400 text-xs font-mono mb-3">Funnel</p>
      <div className="space-y-2">
        {steps.map((step) => {
          const pct = max > 0 ? Math.round((step.value / max) * 100) : 0;
          return (
            <div key={step.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{step.label}</span>
                <span className="text-slate-400">
                  {step.value} ({pct}%)
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
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
