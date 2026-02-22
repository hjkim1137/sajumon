'use client';

import { useState, useEffect, Suspense } from 'react'; // Suspense 추가
import { useRouter, useSearchParams } from 'next/navigation';

// 1. 기존 로직을 별도의 컴포넌트로 분리
function QuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [theme, setTheme] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const questions = [
    { q: '현재 가장 고민인 분야는?', a: ['연애/결혼', '재물/직업'] },
    { q: '오늘 아침 기분은 어땠나요?', a: ['상쾌함', '평범함'] },
    {
      q: '중요한 결정을 내릴 때 당신은?',
      a: ['직관을 믿는다', '신중히 분석한다'],
    },
    {
      q: '새로운 변화가 찾아온다면?',
      a: ['즐겁게 받아들인다', '조금 더 지켜본다'],
    },
    { q: '당신이 더 선호하는 환경은?', a: ['활기찬 도심', '평온한 자연'] },
    {
      q: '지금 당신의 마음을 채우는 것은?',
      a: ['미래에 대한 희망', '현재의 안정'],
    },
  ];

  useEffect(() => {
    const bDate =
      searchParams.get('birthDate') || localStorage.getItem('userBirth') || '';
    const bTime =
      searchParams.get('birthTime') ||
      localStorage.getItem('userTime') ||
      'unknown';
    const bTheme =
      searchParams.get('category') ||
      searchParams.get('theme') ||
      localStorage.getItem('userTheme') ||
      'total';

    setBirthDate(bDate);
    setBirthTime(bTime);
    setTheme(bTheme);
  }, [searchParams]);

  const handleChoice = async (choice: string) => {
    const newAnswers = [...answers, choice];

    if (step < questions.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      setIsLoading(true);

      const userData = {
        birthDate: birthDate,
        birthTime: birthTime,
        theme: theme,
        answers: newAnswers,
      };

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/api/saju/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const resultData = await response.json();
          if (!resultData.theme) resultData.theme = theme;

          localStorage.setItem('sajuResult', JSON.stringify(resultData));
          router.push('/result');
        } else {
          setIsLoading(false);
          alert('도사님이 명상 중이십니다. 잠시 후 다시 시도해주세요.');
        }
      } catch (error) {
        setIsLoading(false);
        console.error('네트워크 에러:', error);
        alert('서버와 연결할 수 없습니다.');
      }
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-center p-6">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-ping opacity-25"></div>
          <div className="absolute inset-0 border-4 border-t-amber-500 border-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-amber-200 mb-4 animate-pulse">
          운명을 읽어내는 중...
        </h2>
        <p className="text-stone-400 leading-relaxed">
          당신의 생년월일시와 답변을 바탕으로
          <br />
          일주 동물을 불러오고 있습니다.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8">
        <div className="mb-8">
          <span className="text-amber-600 font-bold text-sm">
            질문 {step + 1} / {questions.length}
          </span>
          <div className="w-full bg-amber-100 h-2 rounded-full mt-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          {questions[step].q}
        </h2>

        <div className="space-y-4">
          {questions[step].a.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleChoice(option)}
              className="w-full py-4 px-6 text-left rounded-2xl border-2 border-amber-100 hover:border-amber-500 hover:bg-amber-50 transition-all font-medium text-gray-700"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

// 2. 최종 export 단계에서 Suspense로 감싸기
export default function QuestionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-amber-50 flex items-center justify-center">
          <p className="text-amber-800 animate-pulse font-bold">
            운명의 문을 여는 중...
          </p>
        </div>
      }
    >
      <QuestionContent />
    </Suspense>
  );
}
