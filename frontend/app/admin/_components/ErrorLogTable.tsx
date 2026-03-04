'use client';

import { useState, useEffect } from 'react';

interface ErrorLog {
  id: number;
  endpoint: string;
  message: string;
  stack: string | null;
  created_at: string;
}

export default function ErrorLogTable() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchErrors = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/errors?page=${p}`);
      if (res.ok) {
        const data = await res.json();
        setErrors(data.errors);
        setTotalPages(data.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors(page);
  }, [page]);

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-slate-400 text-xs font-mono mb-3">Error Logs</p>
      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : errors.length === 0 ? (
        <p className="text-slate-500 text-sm">에러 없음</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 pr-3">Time</th>
                  <th className="text-left py-2 pr-3">Endpoint</th>
                  <th className="text-left py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err) => (
                  <tr key={err.id} className="border-b border-slate-700/50">
                    <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">
                      {new Date(err.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="py-2 pr-3 text-slate-300 font-mono">
                      {err.endpoint}
                    </td>
                    <td className="py-2 text-red-400 break-all max-w-xs">
                      {err.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2 mt-3 justify-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span className="text-xs text-slate-400 py-1">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
