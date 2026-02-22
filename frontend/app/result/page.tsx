'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    text: string;
    theme: string;
    animal: string;
    title?: string;
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
      const imageUrl = `/images/${theme}-${animal}.png`;

      setData({ ...data, imageUrl, theme, animal });
    }
  }, []);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono bg-[#ddd]">
        운명을 읽어오는 중...
      </div>
    );

  const localImageUrl = `/images/${data.theme}-${data.animal}.png`;

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
        <div className="w-full max-w-[480px] bg-white border-[4px] sm:border-[6px] border-black p-4 sm:p-8 flex flex-col relative shadow-[8px_8px_0_rgba(0,0,0,0.1)]">
          {/* 제목 영역: 텍스트 크기를 반응형(vw) 또는 단계별로 조절 */}
          <div className="text-center text-2xl sm:text-4xl font-bold text-black mb-4 sm:mb-6 pb-2 border-b-4 border-black leading-tight break-keep">
            {data.title}
          </div>

          {/* 이미지 및 말풍선 영역 */}
          <div className="relative w-full flex flex-col sm:flex-row items-center sm:items-end mb-4 gap-4">
            {/* 캐릭터 이미지: flex-shrink-0으로 크기 고정 및 비율 유지 */}
            <div className="w-48 h-48 sm:w-60 sm:h-60 flex-shrink-0 z-[1]">
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

            {/* 말풍선: 모바일에서는 이미지 아래에, PC에서는 옆에 뜸 */}
            <div className="w-full sm:absolute sm:top-0 sm:right-[-10px] sm:w-[200px] border-4 border-dashed border-black bg-white p-3 flex items-center justify-center z-[2]">
              <div className="text-sm sm:text-base leading-[1.4] text-center break-keep">
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
