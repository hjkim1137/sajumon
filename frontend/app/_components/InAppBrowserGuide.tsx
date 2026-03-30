'use client';

import { useEffect, useState } from 'react';

/**
 * 인앱 브라우저(Instagram, Facebook, KakaoTalk 등) 감지 후
 * 외부 브라우저로 열기를 안내하는 배너 컴포넌트
 */

type InAppBrowser = 'instagram' | 'facebook' | 'kakaotalk' | 'line' | 'naver' | 'unknown';

function detectInAppBrowser(): InAppBrowser | null {
  if (typeof window === 'undefined') return null;

  const ua = navigator.userAgent || '';

  // Instagram: "Instagram" 문자열 포함
  if (/Instagram/i.test(ua)) return 'instagram';
  // Facebook: FBAN 또는 FBAV 문자열 포함
  if (/FBAN|FBAV/i.test(ua)) return 'facebook';
  // KakaoTalk
  if (/KAKAOTALK/i.test(ua)) return 'kakaotalk';
  // LINE
  if (/\bLine\//i.test(ua)) return 'line';
  // Naver
  if (/NAVER/i.test(ua)) return 'naver';

  return null;
}

const BROWSER_NAMES: Record<InAppBrowser, string> = {
  instagram: '인스타그램',
  facebook: '페이스북',
  kakaotalk: '카카오톡',
  line: '라인',
  naver: '네이버',
  unknown: '앱',
};

export function useIsInAppBrowser() {
  const [inAppBrowser, setInAppBrowser] = useState<InAppBrowser | null>(null);

  useEffect(() => {
    setInAppBrowser(detectInAppBrowser());
  }, []);

  return inAppBrowser;
}

export default function InAppBrowserGuide() {
  const inAppBrowser = useIsInAppBrowser();
  const [dismissed, setDismissed] = useState(false);

  if (!inAppBrowser || dismissed) return null;

  const appName = BROWSER_NAMES[inAppBrowser];
  const isAndroid = /Android/i.test(navigator.userAgent);

  const handleOpenExternal = () => {
    // intent:// 스킴으로 외부 브라우저 열기 시도 (Android)
    if (isAndroid) {
      const currentUrl = window.location.href;
      // Android Intent를 사용해 Chrome/기본 브라우저로 열기
      window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }
    // iOS에서는 Safari로 직접 열기가 어려우므로 안내만 표시
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 animate-fade-in">
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6 pb-8 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <div className="text-2xl font-bold">🔔 외부 브라우저로 열어주세요</div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 text-2xl leading-none hover:text-gray-600 cursor-pointer"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-700 text-base leading-relaxed mb-4 break-keep">
          현재 <strong>{appName}</strong> 앱 내 브라우저로 접속하셨습니다.
          <br />
          <strong>부적 저장</strong> 등 일부 기능이 정상 작동하지 않을 수 있어요.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border-2 border-gray-200">
          <p className="text-sm font-bold text-gray-800 mb-2">📋 외부 브라우저로 여는 방법</p>
          {isAndroid ? (
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>우측 상단 <strong>⋮ (점 세 개)</strong> 버튼을 눌러주세요</li>
              <li><strong>&quot;다른 브라우저로 열기&quot;</strong> 또는 <strong>&quot;Chrome에서 열기&quot;</strong>를 선택해주세요</li>
            </ol>
          ) : (
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>우측 하단 <strong>⋯ (더보기)</strong> 버튼을 눌러주세요</li>
              <li><strong>&quot;Safari로 열기&quot;</strong>를 선택해주세요</li>
            </ol>
          )}
        </div>

        <div className="flex gap-3">
          {isAndroid && (
            <button
              onClick={handleOpenExternal}
              className="flex-1 py-3 bg-purple-700 text-white font-bold rounded-xl text-base shadow-lg hover:bg-purple-800 cursor-pointer transition-colors"
            >
              외부 브라우저로 열기
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className={`${isAndroid ? 'flex-1' : 'w-full'} py-3 bg-gray-200 text-gray-700 font-bold rounded-xl text-base hover:bg-gray-300 cursor-pointer transition-colors`}
          >
            이대로 계속하기
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
