'use client';

import { useEffect, useState } from 'react';

export default function LoadingPage() {
  const [dots, setDots] = useState('');

  // 점 세 개가 움직이는 애니메이션 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-center p-6">
      {/* 신비로운 로딩 애니메이션 (CSS로 구현) */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-ping opacity-25"></div>
        <div className="absolute inset-0 border-4 border-t-amber-500 border-transparent rounded-full animate-spin"></div>
      </div>

      <h2 className="text-2xl font-bold text-amber-200 mb-4">
        천기누설 중{dots}
      </h2>
      <p className="text-stone-400 leading-relaxed">
        도사님이 당신의 생년월일을 바탕으로<br />
        운명의 동물을 직접 그리고 있습니다.<br />
        <span className="text-sm mt-4 block text-stone-500">(약 15초 정도 소요됩니다)</span>
      </p>

      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/shattered.png')]"></div>
    </main>
  );
}