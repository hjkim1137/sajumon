'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getQuestionsByTheme } from '@/lib/themeQuestions';
import { getRandomModifier } from '@/lib/modifiers';
import { getCharacterInterpretation } from '@/lib/characterInterpretations';

function QuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [theme, setTheme] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 테마에 따라 질문 목록 결정 (theme이 없으면 health 기본값)
  const questions = useMemo(
    () => getQuestionsByTheme(theme || 'health'),
    [theme],
  );

  useEffect(() => {
    const bUserName = searchParams.get('userName') || '';
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

    setUserName(bUserName);
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
        name: userName,
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      fetch(`${API_URL}/api/saju/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((resultData) => {
          const effectiveTheme = theme === 'total' ? 'health' : theme;
          const animal =
            resultData.animal || resultData.sajuAnalysis?.animal || 'dog';
          resultData.theme = resultData.theme || theme;
          resultData.userName = userName;
          resultData.title = getRandomModifier(effectiveTheme, animal);
          resultData.interpret = getCharacterInterpretation(
            effectiveTheme,
            animal,
          );
          localStorage.setItem('sajuResult', JSON.stringify(resultData));
          router.push('/result');
        })
        .catch(() => {
          setIsLoading(false);
          alert('잠시 후 다시 시도해주세요.');
        });
    }
  };

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6 relative">
      {/* 로딩 시 전체 화면 흰색 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
          <div className="relative w-16 h-16 mb-12">
            <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-ping opacity-25" />
            <div className="absolute inset-0 border-4 border-t-amber-500 border-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xl font-bold text-amber-800">
            사주몬을 소환하고 있습니다
          </p>
        </div>
      )}

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
