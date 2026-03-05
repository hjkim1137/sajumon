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
    <div className="bg-t-card p-4 rounded-xl border border-t-card-border">
      <p className="text-t-label text-xs font-mono mb-3">에러 로그</p>
      {loading ? (
        <p className="text-t-muted text-sm">로딩 중...</p>
      ) : errors.length === 0 ? (
        <p className="text-t-muted text-sm">에러 없음</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-t-label border-b border-t-card-border">
                  <th className="text-left py-2 pr-3">시간</th>
                  <th className="text-left py-2 pr-3">엔드포인트</th>
                  <th className="text-left py-2">메시지</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err) => (
                  <tr key={err.id} className="border-b border-t-card-border/50">
                    <td className="py-2 pr-3 text-t-muted whitespace-nowrap">
                      {new Date(err.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="py-2 pr-3 text-t-body font-mono">
                      {err.endpoint}
                    </td>
                    <td className="py-2 text-t-danger break-all max-w-xs">
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
                className="px-3 py-1 text-xs bg-t-bar text-t-body rounded disabled:opacity-40 cursor-pointer"
              >
                이전
              </button>
              <span className="text-xs text-t-label py-1">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs bg-t-bar text-t-body rounded disabled:opacity-40 cursor-pointer"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
