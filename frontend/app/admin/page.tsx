'use client';

export default function AdminPage() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl font-mono mb-8">System Monitoring Console</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <p className="text-slate-400 text-sm">Today Traffic</p>
          <p className="text-2xl font-bold text-green-400">1,024</p>
        </div>
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <p className="text-slate-400 text-sm">AI Success Rate</p>
          <p className="text-2xl font-bold text-blue-400">98.5%</p>
        </div>
      </div>
      <div className="bg-slate-800 p-4 rounded border border-slate-700">
        <p className="text-slate-400 text-sm mb-4 italic font-mono">
          {'>'} User Journey Analytics
        </p>
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
          <div className="bg-green-500 h-full w-[80%]"></div>
          <div className="bg-yellow-500 h-full w-[15%]"></div>
          <div className="bg-red-500 h-full w-[5%]"></div>
        </div>
        <div className="mt-2 flex text-xs justify-between">
          <span>Success (80%)</span>
          <span>Pending (15%)</span>
          <span>Failed (5%)</span>
        </div>
      </div>
    </div>
  );
}
