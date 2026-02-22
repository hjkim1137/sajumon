'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuestionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [theme, setTheme] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 1. 로딩 상태 추가

  // 총 6개의 질문, 각 질문당 2개의 답변
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
    setName(localStorage.getItem('userName') || '');
    setBirthDate(localStorage.getItem('userBirth') || '');
    setTheme(localStorage.getItem('userTheme') || '');
  }, []);

  const handleChoice = async (choice: string) => {
    const newAnswers = [...answers, choice];

    if (step < questions.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      // 2. 마지막 질문 클릭 시 즉시 로딩 시작
      setIsLoading(true);
      console.log('최종 답변 완료, 백엔드로 전송 시작:', newAnswers);

      const userData = {
        name: name,
        birthDate: birthDate,
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
          localStorage.setItem('sajuResult', JSON.stringify(resultData));
          router.push('/result');
        } else {
          setIsLoading(false); // 에러 시 로딩 해제
          console.error('백엔드 서버 에러');
          alert('도사님이 잠시 자리를 비우셨습니다. (서버 에러)');
        }
      } catch (error) {
        setIsLoading(false); // 에러 시 로딩 해제
        console.error('네트워크 에러:', error);
        alert('서버와 연결할 수 없습니다. 백엔드가 켜져있는지 확인하세요!');
      }
    }
  };

  // 3. 로딩 중일 때 보여줄 화면 (천기누설 연출)
  if (isLoading) {
    return (
      <main className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-center p-6">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-ping opacity-25"></div>
          <div className="absolute inset-0 border-4 border-t-amber-500 border-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-amber-200 mb-4 animate-pulse">
          천기누설 중...
        </h2>
        <p className="text-stone-400 leading-relaxed">
          도사님이 당신의 운명을 읽고
          <br />
          수호 동물을 직접 그리고 있습니다.
          <br />
          <span className="text-sm mt-4 block text-stone-500">
            (약 15초 정도 소요됩니다)
          </span>
        </p>
      </main>
    );
  }

  // 4. 질문 화면 (기존 UI)
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
