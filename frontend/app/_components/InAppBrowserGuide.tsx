'use client';

import { useEffect, useState } from 'react';

function detectInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Instagram|FBAN|FBAV|KAKAOTALK|\bLine\/|NAVER/i.test(ua);
}

export default function InAppBrowserGuide() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (detectInAppBrowser() && isAndroid) setShow(true);
  }, []);

  if (!show) return null;

  const handleOpenExternal = () => {
    const url = window.location.href;
    window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 animate-fade-in">
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6 pb-8 shadow-2xl animate-slide-up">
        <div className="text-2xl font-bold mb-4">외부 브라우저로 열어주세요</div>

        <p className="text-gray-700 text-base leading-relaxed mb-4 break-keep">
          앱 내 브라우저에서는 <strong>부적 저장</strong> 등 일부 기능이 정상 작동하지 않을 수 있어요.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border-2 border-gray-200">
          <p className="text-sm font-bold text-gray-800 mb-2">외부 브라우저로 여는 방법</p>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>우측 상단 <strong>⋮ (점 세 개)</strong> 버튼을 눌러주세요</li>
            <li><strong>&quot;다른 브라우저로 열기&quot;</strong>를 선택해주세요</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleOpenExternal}
            className="flex-1 py-3 bg-purple-700 text-white font-bold rounded-xl text-base shadow-lg hover:bg-purple-800 cursor-pointer transition-colors"
          >
            외부 브라우저로 열기
          </button>
          <button
            onClick={() => setShow(false)}
            className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl text-base hover:bg-gray-300 cursor-pointer transition-colors"
          >
            이대로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
