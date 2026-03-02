'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fortuneData, FortuneContent } from '@/lib/fortuneData';
import { getSpeechText } from '@/lib/speechTexts';
// 1. 캐릭터 해석 로직 임포트 (파일 경로 확인 필요)
import { getCharacterInterpretation } from '@/lib/characterInterpretations';

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [fortune, setFortune] = useState<FortuneContent | null>(null);
  const [luckySpeech, setluckySpeech] = useState('');
  const [interpretation, setInterpretation] = useState(''); // 캐릭터 해석 상태

  useEffect(() => {
    const saved = localStorage.getItem('sajuResult');
    if (saved) {
      const result = JSON.parse(saved);

      const animal = result.animal || 'dog';
      const theme = result.theme || 'health';
      const ilju = result.ilju || '갑자';

      // 데이터 매핑
      const matchedFortune = fortuneData[ilju] || null;

      // 2. 테마별 말풍선 & 캐릭터 해석 확정
      setluckySpeech(getSpeechText(theme));
      setInterpretation(getCharacterInterpretation(theme, animal));

      setFortune(matchedFortune);
      setData({ ...result, animal, theme, ilju });
    }
  }, []);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono bg-[#ddd]">
        사주몬을 소환하는 중...
      </div>
    );

  const localImageUrl = `/images/${data.theme}-${data.animal}.png`;

  const themeName: Record<string, string> = {
    love: '애정운',
    money: '금전운',
    health: '건강운',
    study: '학업운',
    work: '커리어운',
    career: '커리어운',
  };

  // --- 핵심: 수식어 + 사용자이름 조합 ---
  // data.title: QuestionPage에서 저장한 '적극적인', '재물복 넘치는' 등의 수식어
  // data.name: 사용자가 입력한 이름
  const displayTitle = `${data.title || '영험한'} ${data.userName || '사주몬'}`;

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
        }
      `}</style>

      <main className="min-h-screen bg-[#ddd] flex flex-col items-center p-4 sm:p-8 overflow-y-auto">
        {/* 부적 상단 타이틀 영역 */}
        <div className="w-full max-w-[480px] bg-white border-[6px] border-black p-6 sm:p-8 flex flex-col relative shadow-[10px_10px_0_rgba(0,0,0,0.1)] mb-10">
          <div className="text-center text-2xl sm:text-3xl font-bold text-black mb-6 pb-2 border-b-4 border-black leading-tight">
            {displayTitle} {/* 예: "적극적인 홍길동" */}
          </div>

          <div className="relative w-full flex flex-col sm:flex-row items-center sm:items-end mb-6 gap-4">
            <div className="w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 z-[1]">
              <img
                src={localImageUrl}
                alt={data.animal}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default.png';
                }}
              />
            </div>

            <div className="w-full sm:absolute sm:top-0 sm:right-[-10px] sm:w-[200px] border-4 border-dashed border-black bg-white p-3 flex items-center justify-center z-[2] shadow-sm">
              <div className="text-sm sm:text-base leading-[1.4] text-center break-keep font-bold">
                {luckySpeech}
              </div>
            </div>
          </div>

          {/* 부적 하단 캐릭터 해석 영역 */}
          <div className="border-t-4 border-black pt-4 flex justify-between items-center gap-2">
            <div className="text-base sm:text-lg font-bold text-black text-right break-keep leading-tight">
              {interpretation}
            </div>
          </div>
        </div>

        {/* --- 2. 부적 바깥 상세 운세 --- */}
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
              onClick={() => router.push('/')}
              className="py-4 bg-black text-white font-bold rounded-2xl text-lg shadow-lg"
            >
              다시 뽑기
            </button>
            <button
              onClick={() => alert('이미지가 복사되었습니다!')}
              className="py-4 bg-white border-4 border-black text-black font-bold rounded-2xl text-lg shadow-lg"
            >
              결과 공유
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
