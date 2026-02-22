'use client';

import { useEffect, useState } from 'react';

export default function ResultPage() {
  const [data, setData] = useState<{
    text: string;
    imageUrl: string;
    title?: string;
    speechText?: string;
    interpret?: string;
    effect?: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sajuResult');
    if (saved) {
      const parsed = JSON.parse(saved);

      // GPT 응답(text)을 파싱하여 카드 각 부분에 분배하는 로직 (예시)
      setData({
        ...parsed,
        title: parsed.title || '오늘의 수호 동물',
        speechText: parsed.speechText || '행운을 빌어주마!',
        interpret: parsed.text || '사주 풀이 내용을 불러오는 중입니다.',
        effect: parsed.effect || '효과: 운수대통 +100',
      });
    }
  }, []);

  if (!data)
    return (
      <div className="p-10 text-center font-mono">운명을 읽어오는 중...</div>
    );

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
        {/* 3️⃣ 카드 디자인 영역 (540px 폭 유지) */}
        <div className="w-[540px] aspect-[3/4] p-5">
          <div className="w-full h-full bg-white border-[6px] border-black p-[30px] flex flex-col relative shadow-[10px_10px_0_rgba(0,0,0,0.1)]">
            {/* 타이틀 */}
            <div className="text-center text-[42px] font-bold text-black mb-5 pb-2 border-b-4 border-black leading-tight">
              {data.title}
            </div>

            {/* 상단 영역: 이미지 & 말풍선 */}
            <div className="relative w-full h-[280px] mb-[10px] flex items-end">
              {/* 캐릭터 이미지 */}
              <img
                src={data.imageUrl}
                alt="수호 동물"
                className="w-[260px] h-[260px] object-contain relative z-[1] -ml-[25px] -mb-[10px]"
                style={{ imageRendering: 'pixelated' }}
              />

              {/* 말풍선 */}
              <div className="absolute top-0 right-[-5px] w-[220px] h-[100px] border-4 border-dashed border-black bg-white p-[10px] flex items-center justify-center z-[2]">
                <div className="text-[18px] leading-[1.3] text-center break-keep">
                  {data.speechText}
                </div>
              </div>
            </div>

            {/* 하단 영역: 풀이 및 효과 */}
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
