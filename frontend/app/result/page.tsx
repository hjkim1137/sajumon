'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fortuneData, FortuneContent } from '@/lib/fortuneData';
import { getSpeechText } from '@/lib/speechTexts';
import { getCharacterInterpretation } from '@/lib/characterInterpretations';
import { MODIFIERS, ThemeKey } from '@/lib/modifiers';
import PageTracker from '../_components/PageTracker';
import { trackDownload, trackShare } from '@/lib/tracking';
import { LOADING_MESSAGES } from '@/lib/constants';


function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{
    userName: string;
    animal: string;
    theme: string;
    ilju: string;
    title: string;
  } | null>(null);
  const [fortune, setFortune] = useState<FortuneContent | null>(null);
  const [luckySpeech, setluckySpeech] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [stats, setStats] = useState<{
    guardianStat: number;
    themeStat: number;
  } | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadingMessages = LOADING_MESSAGES;

  const onShareBtn = async () => {
    if (!data) return;

    const params = new URLSearchParams({
      name: data.userName,
      animal: data.animal,
      theme: data.theme,
      ilju: data.ilju,
      title: data.title,
    });
    const shareUrl = `${window.location.origin}/result?${params.toString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.title} ${data.userName} - 사주몬`,
          url: shareUrl,
        });
        trackShare('link');
        return;
      } catch {
        // 사용자가 공유 취소한 경우 — 클립보드 복사로 폴백
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage('링크가 복사되었습니다!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      trackShare('link');
    } catch {
      // 클립보드 API 미지원 시
    }
  };

  useEffect(() => {
    if (data) return;
    const timer = setInterval(() => {
      setLoadingMsg((prev) => (prev + 1) % 3);
    }, 900);
    return () => clearInterval(timer);
  }, [data]);

  const onDownloadBtn = async () => {
    if (cardRef.current === null) return;

    try {
      const { toBlob } = await import('html-to-image');

      const options = {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipAutoScale: true,
        includeQueryParams: true,
      };

      // 첫 번째 호출은 폰트/이미지 리소스를 캐시에 올리기 위한 워밍업
      await toBlob(cardRef.current, options);

      const fileName = `sajumon-${Date.now()}.png`;

      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      // 두 번째 호출에서 실제 캡처 (리소스가 캐시에 있으므로 정상 렌더링)
      const blob = await toBlob(cardRef.current, options);
      if (!blob) throw new Error('이미지 생성 실패');

      const file = new File([blob], fileName, { type: 'image/png' });

      // iOS: Web Share API로 네이티브 공유 시트 → 사진 앱 저장
      if (isIOS && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${data?.title || ''} ${data?.userName || '사주몬'} 부적`,
        });
      } else {
        // Android & 데스크톱: <a download>로 직접 다운로드 (Downloads 폴더 저장)
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }

      setToastMessage('부적 이미지가\n저장되었습니다!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

      trackDownload(data?.animal, data?.theme);
    } catch (err) {
      // 사용자가 공유 취소한 경우는 무시
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('이미지 저장 실패:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    // 1) URL 파라미터에서 로드 시도
    const nameParam = searchParams.get('name');
    const animalParam = searchParams.get('animal');
    const themeParam = searchParams.get('theme');
    const iljuParam = searchParams.get('ilju');
    const titleParam = searchParams.get('title');

    let result: Record<string, string> | null = null;

    if (nameParam && animalParam && themeParam && iljuParam && titleParam) {
      result = {
        userName: nameParam,
        animal: animalParam,
        theme: themeParam,
        ilju: iljuParam,
        title: titleParam,
      };
    } else {
      // 2) localStorage 폴백
      const saved = localStorage.getItem('sajuResult');
      if (saved) {
        const parsed = JSON.parse(saved);
        result = {
          animal: parsed.animal || 'dog',
          theme: parsed.theme || 'health',
          userName: parsed.userName || '사주몬',
          title: parsed.title || '영험한',
          ilju: parsed.ilju || '갑자',
        };
      }
    }

    if (result) {
      const { animal, theme, userName, title, ilju } = result;

      setluckySpeech(getSpeechText(theme));
      setInterpretation(getCharacterInterpretation(theme, animal));
      setFortune(fortuneData[ilju] || null);

      const isSpecial = MODIFIERS[theme as ThemeKey]?.some(
        (m) => m.animal && m.text === title,
      );
      setStats({
        guardianStat: isSpecial ? 99 : Math.floor(Math.random() * 40) + 10,
        themeStat: isSpecial ? 99 : Math.floor(Math.random() * 40) + 10,
      });

      setData({ userName, title, animal, theme, ilju });
    }
  }, [searchParams]);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono bg-[#4b3ba0] text-white">
        {loadingMessages[loadingMsg]}
      </div>
    );

  const localImageUrl = `/images/${data.theme}-${data.animal}.webp`;

  const themeName: Record<string, string> = {
    love: '애정운',
    money: '금전운',
    health: '건강운',
    study: '학업운',
    career: '커리어운',
  };

  const displayTitle =
    luckySpeech === '운동 많이 된다'
      ? `${data.userName || '사주몬'} 운동 많이 된다`
      : `${data.title || '영험한'} ${data.userName || '사주몬'}`;

  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#4b3ba0] font-[Galmuri11]"
        style={{
          backgroundImage: "url('/images/pixel-sky.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      >
        <PageTracker page="/result" />
        <div
          ref={cardRef}
          className="w-full max-w-[480px] bg-white border-[6px] border-black p-6 sm:p-8 flex flex-col relative shadow-[10px_10px_0_rgba(0,0,0,0.1)] mb-10"
        >
          <div className="text-center text-2xl sm:text-3xl font-bold text-black mb-6 pb-2 border-b-4 border-black leading-tight whitespace-pre-line">
            {displayTitle}
          </div>

          <div className="relative w-full flex flex-col sm:flex-row items-center sm:items-end mb-6 gap-4">
            <div className="w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 z-[1]">
              <img
                src={localImageUrl}
                alt={data.animal}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                loading="eager"
                crossOrigin="anonymous"
                width={224}
                height={224}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default.webp';
                }}
              />
            </div>

            <div className="w-full sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:right-[-10px] sm:w-[200px] border-4 border-dashed border-black bg-white p-3 flex items-center justify-center z-[2] shadow-sm">
              <div className="text-sm sm:text-base leading-[1.4] text-center break-keep font-bold whitespace-pre-line">
                {luckySpeech}
              </div>
            </div>
          </div>

          {stats && (
            <div className="flex gap-4 mb-4 text-lg font-bold">
              <span
                className={
                  stats.guardianStat === 99 ? 'text-red-600' : 'text-gray-600'
                }
              >
                수호운 +{stats.guardianStat}
              </span>
              <span
                className={
                  stats.themeStat === 99 ? 'text-red-600' : 'text-gray-600'
                }
              >
                {themeName[data.theme] || '운세'} +{stats.themeStat}
              </span>
            </div>
          )}

          <div className="border-t-4 border-black pt-4 flex justify-between items-center gap-2">
            <div className="text-base sm:text-lg font-bold text-black text-right break-keep leading-tight">
              {interpretation}
            </div>
          </div>
        </div>

        <div className="w-full max-w-[480px] space-y-6">
          <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">
              사주몬 캐릭터 해석
            </h3>
            <p className="text-lg text-black leading-relaxed break-keep font-medium">
              <span className="text-red-600">[{data.ilju}일주]</span>{' '}
              {fortune?.character}
            </p>
          </div>

          <div className="bg-purple-50 border-4 border-purple-600 p-6 rounded-3xl relative shadow-md">
            <div className="absolute -top-4 left-6 bg-purple-700 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm">
              2026 총운 해석
            </div>

            <div className="mt-4 space-y-8">
              <section>
                <h4 className="text-xl font-black text-purple-800 mb-3 flex items-center gap-2">
                  🔮 2026년 총운
                </h4>
                <p className="text-purple-900 text-lg leading-[1.8] break-keep">
                  {fortune?.total}
                </p>
              </section>

              <section className="bg-white/60 p-5 rounded-2xl border-2 border-dashed border-purple-400/30">
                <h4 className="text-lg font-bold text-purple-600 mb-2 font-black">
                  ✨ 올해의 {themeName[data.theme] || '상세 운세'}
                </h4>
                <p className="text-purple-900 leading-[1.7] break-keep font-medium">
                  {fortune
                    ? fortune[data.theme as keyof FortuneContent]
                    : '데이터 로딩 중...'}
                </p>
              </section>
            </div>
          </div>

          <button
            onClick={onShareBtn}
            className="w-full py-4 bg-pink-400 border-4 border-black text-black font-bold rounded-2xl text-lg shadow-lg hover:bg-pink-500 cursor-pointer transition-colors"
          >
            결과 공유하기
          </button>

          <div className="grid grid-cols-2 gap-4 pt-4 mb-12">
            <button
              onClick={() => router.push('/input')}
              className="py-4 bg-purple-800 text-white font-bold rounded-2xl text-lg shadow-lg hover:bg-purple-900 cursor-pointer transition-colors"
            >
              다시 뽑기
            </button>
            <button
              onClick={onDownloadBtn}
              className="py-4 bg-white border-4 border-purple-600 text-purple-600 font-bold rounded-2xl text-lg shadow-lg hover:bg-purple-50 cursor-pointer transition-colors"
            >
              부적 저장
            </button>
          </div>
        </div>
        <p className="mt-4 mb-8 text-white/50 text-sm font-medium">
          © 2026 TTSY. All rights reserved.
        </p>
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg z-50 animate-fade-in text-center whitespace-pre-line">
            {toastMessage}
          </div>
        )}
      </main>
    </>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-mono bg-[#4b3ba0] text-white">
          사주몬이 차원문을 통과하는 중..!
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
