'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuestionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 현재 질문 단계 (0~5)
  const [answers, setAnswers] = useState<string[]>([]); // 사용자의 선택 저장

  // 6개의 질문 데이터
  const questions = [
    {
      q: '새로운 일을 시작할 때 당신은?',
      a1: '철저한 계획부터 세운다',
      a2: '일단 몸으로 부딪혀본다',
    },
    {
      q: '어려운 난관에 봉착했을 때?',
      a1: '나 자신을 믿고 돌파한다',
      a2: '주변의 조언을 구한다',
    },
    {
      q: '당신이 선호하는 보상은?',
      a1: '확실한 금전적 이득',
      a2: '명예와 사람들의 인정',
    },
    {
      q: '스트레스를 푸는 방법은?',
      a1: '정적인 휴식과 명상',
      a2: '활동적인 운동이나 취미',
    },
    {
      q: '결정을 내릴 때 중요한 것은?',
      a1: '냉철한 논리와 이성',
      a2: '따뜻한 공감과 직관',
    },
    {
      q: '당신의 미래 모습은?',
      a1: '안정적인 삶의 주인공',
      a2: '끊임없이 도전하는 모험가',
    },
  ];

  const handleChoice = (choice: string) => {
    const newAnswers = [...answers, choice];

    if (step < questions.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      // 모든 질문 완료 시 결과 페이지로 이동 (데이터를 가지고 감)
      console.log('최종 답변:', newAnswers);
      router.push('/result');
    }
  };

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      {/* 상단 프로그레스 바 */}
      <div className="w-full max-w-md bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-amber-500 h-full transition-all duration-300"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="w-full max-w-md text-center">
        <span className="text-amber-600 font-bold text-sm">
          질문 {step + 1} / 6
        </span>
        <h2 className="text-2xl font-bold text-amber-900 mt-2 mb-10 min-h-[4rem]">
          {questions[step].q}
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => handleChoice(questions[step].a1)}
            className="w-full bg-white border-2 border-amber-200 p-6 rounded-2xl text-lg font-medium hover:border-amber-500 hover:bg-amber-100 transition-all shadow-sm"
          >
            {questions[step].a1}
          </button>

          <button
            onClick={() => handleChoice(questions[step].a2)}
            className="w-full bg-white border-2 border-amber-200 p-6 rounded-2xl text-lg font-medium hover:border-amber-500 hover:bg-amber-100 transition-all shadow-sm"
          >
            {questions[step].a2}
          </button>
        </div>
      </div>
    </main>
  );
}
