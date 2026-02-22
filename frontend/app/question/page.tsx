'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // searchParams 추가

export default function QuestionPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // URL에서 직접 파라미터를 읽어오기 위해 사용

  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState(''); // 추가
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

  // 페이지 진입 시 URL 파라미터 혹은 로컬스토리지에서 데이터 로드
  useEffect(() => {
    // 1. URL 파라미터가 최우선 (첫 페이지에서 push할 때 넘긴 값)
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

      // 백엔드 DTO(SajuRequest) 구조와 100% 일치시켜야 함
      const userData = {
        birthDate: birthDate,
        birthTime: birthTime, // ✅ 반드시 포함
        theme: theme, // ✅ 'category'가 아닌 'theme'로 전송
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
          // 백엔드에서 준 theme가 비어있을 경우를 대비해 보정
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
