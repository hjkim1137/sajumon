'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCharacterInterpretation } from '@/lib/characterInterpretations';
import { getSpeechText } from '@/lib/speechTexts';
import localFont from 'next/font/local';

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    text: string;
    theme: string;
    animal: string;
    title?: string;
    userName?: string;
    speechText?: string;
    interpret?: string;
    effect?: string;
    imageUrl?: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sajuResult');
    if (saved) {
      const data = JSON.parse(saved);
      const animal = data.animal || data.sajuAnalysis?.animal || 'dog';
      const theme = data.theme || 'health';
      // 이미지 파일명은 'career'로 저장되어 있으므로 work → career 변환
      const imageTheme = theme === 'work' ? 'career' : theme;
      const imageUrl = `/images/${imageTheme}-${animal}.png`;

      // 로컬 상세풀이·말풍선 문구 사용 (테마+동물 기반)
      const effectiveTheme = theme === 'total' ? 'health' : theme;
      const interpret = getCharacterInterpretation(effectiveTheme, animal);
      const speechText = getSpeechText(effectiveTheme);

      setData({ ...data, imageUrl, theme, animal, interpret, speechText });
    }
  }, []);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono bg-[#ddd]">
        운명을 읽어오는 중...
      </div>
    );

  // 이미지 파일명은 'career'로 저장되어 있으므로 work → career 변환
  const imageTheme = data.theme === 'work' ? 'career' : data.theme;
  const localImageUrl = `/images/${imageTheme}-${data.animal}.png`;

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: 'Galmuri11';
          src: url('/fonts/Galmuri11.ttf') format('truetype');
          font-weight: 400;
        }
        * {
          font-family: 'Galmuri11', sans-serif;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      <main className="min-h-screen bg-[#ddd] flex items-start sm:items-center justify-center p-4 sm:p-8">
        {/* 컨테이너: 모바일 대응을 위해 너비를 100%로 하고 최대 너비를 제한함 */}
        <div className="w-full max-w-[480px] bg-white border-[4px] sm:border-[6px] border-black p-4 sm:p-8 flex flex-col relative shadow-[8px_8px_0_rgba(0,0,0,0.1)] overflow-hidden">
          {/* 제목 영역: 동물 수식어 + 사용자 이름 (예: 돈벼락에 앉는 홍길동) */}
          <div className="text-center text-2xl sm:text-4xl font-bold text-black mb-4 sm:mb-6 pb-2 border-b-4 border-black leading-tight break-keep">
            {data.title
              ? `${data.title} ${data.userName || ''}`.trim()
              : data.userName || ''}
          </div>

          {/* 이미지 및 말풍선 영역: 항상 이미지 옆에 말풍선 표시, 틀 내부에 유지 */}
          <div className="relative w-full flex flex-row items-center mb-4 gap-3 sm:gap-4 min-w-0">
            {/* 캐릭터 이미지: flex-shrink-0으로 크기 고정 및 비율 유지 */}
            <div className="w-32 h-32 sm:w-60 sm:h-60 flex-shrink-0 z-[1]">
              <img
                src={localImageUrl}
                alt={`${data.theme} ${data.animal}`}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default.png';
                }}
              />
            </div>

            {/* 말풍선: 항상 이미지 옆에 표시, min-w-0으로 축소 가능 */}
            <div className="min-w-0 flex-1 border-4 border-dashed border-black bg-white p-3 flex items-center justify-center z-[2] max-w-[200px] overflow-hidden">
              <div className="text-sm sm:text-base leading-[1.4] text-center break-words min-w-0 w-full">
                {data.speechText}
              </div>
            </div>
          </div>

          {/* 상세 풀이 영역 */}
          <div className="border-4 border-black p-4 flex-grow flex flex-col bg-white min-h-[200px]">
            <div className="text-sm sm:text-base text-black leading-[1.6] mb-4 break-keep whitespace-pre-wrap overflow-y-auto">
              {data.interpret}
            </div>

            <div className="text-xl sm:text-2xl font-bold text-black text-right mt-auto border-t-2 border-black pt-2">
              {data.effect}
            </div>
          </div>

          {/* 다시하기 버튼 추가 (반응형 대응 필수 요소) */}
          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full py-3 bg-black text-white font-bold hover:bg-zinc-800 transition-colors"
          >
            다시 뽑기
          </button>
        </div>
      </main>
    </>
  );
}
