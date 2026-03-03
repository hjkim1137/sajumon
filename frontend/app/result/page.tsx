'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fortuneData, FortuneContent } from '@/lib/fortuneData';
import { getSpeechText } from '@/lib/speechTexts';
import { getCharacterInterpretation } from '@/lib/characterInterpretations';
import { MODIFIERS, ThemeKey } from '@/lib/modifiers';

export default function ResultPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [fortune, setFortune] = useState<FortuneContent | null>(null);
  const [luckySpeech, setluckySpeech] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [stats, setStats] = useState<{
    guardianStat: number;
    themeStat: number;
  } | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(0);

  const loadingMessages = [
    '사주몬이 차원문을 통과하는 중..!',
    '운명의 알에서 사주몬이 부활하고 있어요',
    '나의 사주몬이 나오고 있어요!',
  ];

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
      const { toPng } = await import('html-to-image');

      const options = {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipAutoScale: true,
        includeQueryParams: true,
      };

      // 첫 번째 호출은 폰트/이미지 리소스를 캐시에 올리기 위한 워밍업
      await toPng(cardRef.current, options);
      // 두 번째 호출에서 실제 캡처 (리소스가 캐시에 있으므로 정상 렌더링)
      const dataUrl = await toPng(cardRef.current, options);

      const link = document.createElement('a');
      link.download = `sajumon-${data?.userName || 'result'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('이미지 저장 실패:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('sajuResult');
    if (saved) {
      const result = JSON.parse(saved);

      const animal = result.animal || 'dog';
      const theme = result.theme || 'health';
      const userName = result.userName || '사주몬';
      const title = result.title || '영험한';
      const ilju = result.ilju || '갑자';

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

      setData({
        userName,
        title,
        animal,
        theme,
        ilju,
      });
    }
  }, []);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono bg-[#ddd]">
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

  const displayTitle = `${data.title || '영험한'} ${data.userName || '사주몬'}`;

  return (
    <>
      <main className="min-h-screen bg-[#ddd] flex flex-col items-center p-4 sm:p-8 overflow-y-auto font-[Galmuri11]">
        <div
          ref={cardRef}
          className="w-full max-w-[480px] bg-white border-[6px] border-black p-6 sm:p-8 flex flex-col relative shadow-[10px_10px_0_rgba(0,0,0,0.1)] mb-10"
        >
          <div className="text-center text-2xl sm:text-3xl font-bold text-black mb-6 pb-2 border-b-4 border-black leading-tight">
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
              <div className="text-sm sm:text-base leading-[1.4] text-center break-keep font-bold">
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

          <div className="bg-[#fdf6e3] border-4 border-[#856404] p-6 rounded-3xl relative shadow-md">
            <div className="absolute -top-4 left-6 bg-[#856404] text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm">
              2026 총운 해석
            </div>

            <div className="mt-4 space-y-8">
              <section>
                <h4 className="text-xl font-black text-[#5d4603] mb-3 flex items-center gap-2">
                  🔮 2026년 총운
                </h4>
                <p className="text-[#3e2e02] text-lg leading-[1.8] break-keep">
                  {fortune?.total}
                </p>
              </section>

              <section className="bg-white/60 p-5 rounded-2xl border-2 border-dashed border-[#856404]/30">
                <h4 className="text-lg font-bold text-[#856404] mb-2 font-black">
                  ✨ 올해의 {themeName[data.theme] || '상세 운세'}
                </h4>
                <p className="text-[#3e2e02] leading-[1.7] break-keep font-medium">
                  {fortune ? (fortune as any)[data.theme] : '데이터 로딩 중...'}
                </p>
              </section>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 mb-12">
            <button
              onClick={() => router.push('/input')}
              className="py-4 bg-black text-white font-bold rounded-2xl text-lg shadow-lg hover:bg-gray-800 cursor-pointer transition-colors"
            >
              다시 뽑기
            </button>
            <button
              onClick={onDownloadBtn}
              className="py-4 bg-white border-4 border-black text-black font-bold rounded-2xl text-lg shadow-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              부적 저장
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
