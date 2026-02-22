'use client';

import { useEffect, useState } from 'react';

export default function ResultPage() {
  const [data, setData] = useState<{
    text: string;
    theme: string;
    animal: string;
    title?: string;
    speechText?: string;
    interpret?: string;
    effect?: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sajuResult');
    if (saved) {
      const data = JSON.parse(saved);

      // 여러 층에 있을 수 있는 animal 값을 찾음
      const animal = data.animal || data.sajuAnalysis?.animal || 'dog';
      const theme = data.theme || 'health'; // theme가 비었을 경우 기본값

      const imageUrl = `/images/${theme}-${animal}.png`;
      console.log('최종 이미지 경로:', imageUrl); // 브라우저 콘솔에서 확인 가능

      setData({ ...data, imageUrl });
    }
  }, []);

  if (!data)
    return (
      <div className="p-10 text-center font-mono">운명을 읽어오는 중...</div>
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

      <main className="min-h-screen bg-[#ddd] flex items-center justify-center p-4">
        <div className="w-[540px] aspect-[3/4] p-5">
          <div className="w-full h-full bg-white border-[6px] border-black p-[30px] flex flex-col relative shadow-[10px_10px_0_rgba(0,0,0,0.1)]">
            <div className="text-center text-[42px] font-bold text-black mb-5 pb-2 border-b-4 border-black leading-tight">
              {data.title}
            </div>

            <div className="relative w-full h-[280px] mb-[10px] flex items-end">
              {/* ✅ 변경된 부분: 로컬 이미지 경로 사용 */}
              <img
                src={localImageUrl}
                alt={`${data.theme} ${data.animal}`}
                className="w-[260px] h-[260px] object-contain relative z-[1] -ml-[25px] -mb-[10px]"
                style={{ imageRendering: 'pixelated' }}
                // 이미지 로드 실패 시 기본 이미지로 대체 (선택사항)
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default.png';
                }}
              />

              <div className="absolute top-0 right-[-5px] w-[220px] h-[100px] border-4 border-dashed border-black bg-white p-[10px] flex items-center justify-center z-[2]">
                <div className="text-[18px] leading-[1.3] text-center break-keep">
                  {data.speechText}
                </div>
              </div>
            </div>

            <div className="border-4 border-black p-5 flex-grow flex flex-col justify-between bg-white overflow-hidden">
              <div className="text-[18px] text-black underline-offset-4 leading-[1.5] mt-[5px] break-all overflow-y-auto">
                {data.interpret}
              </div>

              <div className="text-[24px] font-bold text-black text-right mb-[5px]">
                {data.effect}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
