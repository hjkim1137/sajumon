'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getQuestionsByTheme } from '@/lib/themeQuestions';
import { getRandomModifier } from '@/lib/modifiers';
import PageTracker from '../_components/PageTracker';
import { getSessionId } from '@/lib/tracking';
import { LOADING_MESSAGES } from '@/lib/constants';

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
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const loadingMessages = LOADING_MESSAGES;

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 900);
    return () => clearInterval(interval);
  }, [isLoading, loadingMessages.length]);

  const questions = useMemo(
    () => getQuestionsByTheme(theme || 'health'),
    [theme],
  );

  useEffect(() => {
    const bUserName = searchParams.get('userName') || '';
    const bDate = searchParams.get('birthDate') || '';
    const bTime = searchParams.get('birthTime') || 'unknown';
    const bTheme = searchParams.get('theme') || 'health';

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

      fetch('/api/saju/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getSessionId(),
        },
        body: JSON.stringify(userData),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((resultData) => {
          const animal = resultData.animal || 'dog';
          const ilju = resultData.ilju || '갑자';

          const finalResult = {
            userName: userName,
            animal: animal,
            ilju: ilju,
            theme: theme,
            title: getRandomModifier(theme, animal),
          };

          localStorage.setItem('sajuResult', JSON.stringify(finalResult));
          router.push('/result');
        })
        .catch(() => {
          setIsLoading(false);
          alert('잠시 후 다시 시도해주세요.');
        });
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-[#4b3ba0]"
      style={{
        backgroundImage: "url('/images/pixel-sky.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    >
      <PageTracker page="/question" />
      {isLoading && (
        <div className="fixed inset-0 bg-purple-950/90 flex flex-col items-center justify-center z-50">
          <div className="relative w-16 h-16 mb-12">
            <div className="absolute inset-0 border-4 border-pink-400 rounded-full animate-ping opacity-25" />
            <div className="absolute inset-0 border-4 border-t-pink-400 border-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xl font-bold text-white transition-opacity duration-500">
            {loadingMessages[loadingMsgIndex]}
          </p>
        </div>
      )}

      <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
        <div className="mb-8">
          <span className="text-purple-600 font-bold text-sm">
            질문 {step + 1} / {questions.length}
          </span>
          <div className="w-full bg-purple-100 h-2 rounded-full mt-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
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
              className="cursor-pointer w-full py-4 px-6 text-left rounded-2xl border-2 border-purple-100 hover:border-purple-500 hover:bg-purple-50 transition-all font-medium text-gray-700"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-white/50 text-sm font-medium">
        © 2026 TTSY. All rights reserved.
      </p>
    </main>
  );
}

export default function QuestionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-purple-950 flex items-center justify-center">
          <p className="text-white animate-pulse font-bold">
            운명의 문을 여는 중...
          </p>
        </div>
      }
    >
      <QuestionContent />
    </Suspense>
  );
}
