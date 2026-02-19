'use client';

import { useEffect, useState } from 'react';

export default function ResultPage() {
  const [data, setData] = useState<{ text: string; imageUrl: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sajuResult');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  if (!data) return <div className="p-10 text-center">운명을 읽어오는 중...</div>;

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 mt-10 text-center">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">당신의 수호 동물</h1>

        {/* 🎨 생성된 AI 이미지 표시 */}
        {data.imageUrl && (
          <div className="mb-8 flex justify-center">
            <img
              src={data.imageUrl}
              alt="AI Saju Animal"
              className="w-64 h-64 rounded-2xl border-4 border-amber-100 shadow-sm object-contain"
            />
          </div>
        )}

        {/* 📜 사주 풀이 텍스트 */}
        <div className="prose prose-amber max-w-none text-left text-gray-700 leading-relaxed whitespace-pre-wrap border-t pt-8">
          {data.text}
        </div>
      </div>
    </main>
  );
}