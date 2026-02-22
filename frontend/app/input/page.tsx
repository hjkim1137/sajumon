'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    birthDate: '', // YYYYMMDD 형식 입력 유도
    birthTime: 'unknown', // 기본값: 모름
    theme: 'health',
  });

  const handleStart = () => {
    // 생년월일, 시, 테마 정보를 URL 파라미터로 담아 이동
    const params = new URLSearchParams({
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      theme: formData.theme,
    });
    router.push(`/question?${params.toString()}`);
  };

  // 생년월일 입력 시 숫자만 들어가도록 제한하는 함수
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자 이외 제거
    if (value.length <= 8) {
      setFormData({ ...formData, birthDate: value });
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-6">
      <h1 className="text-4xl font-black mb-8 text-amber-900 tracking-tighter">
        🔮 사주몬
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (formData.birthDate.length !== 8) {
            alert('생년월일 8자리를 입력해주세요. (예: 19950505)');
            return;
          }
          handleStart();
        }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 border-2 border-amber-100"
      >
        {/* 1) 생년월일 입력 (텍스트 형식) */}
        <div>
          <label className="block text-sm font-bold text-amber-800 mb-2">
            생년월일 (8자리)
          </label>
          <input
            type="text"
            placeholder="예: 19950505"
            required
            value={formData.birthDate}
            className="w-full border-2 border-amber-50 p-3 rounded-xl focus:outline-none focus:border-amber-400 transition-colors"
            onChange={handleBirthDateChange}
          />
        </div>

        {/* 2) 태어난 시 선택 (토글/셀렉트 형식) */}
        <div>
          <label className="block text-sm font-bold text-amber-800 mb-2">
            태어난 시
          </label>
          <select
            className="w-full border-2 border-amber-50 p-3 rounded-xl focus:outline-none focus:border-amber-400 transition-colors appearance-none"
            value={formData.birthTime}
            onChange={(e) =>
              setFormData({ ...formData, birthTime: e.target.value })
            }
          >
            <option value="unknown">모름</option>
            <option value="00">자시 (23:30 ~ 01:29)</option>
            <option value="02">축시 (01:30 ~ 03:29)</option>
            <option value="04">인시 (03:30 ~ 05:29)</option>
            <option value="06">묘시 (05:30 ~ 07:29)</option>
            <option value="08">진시 (07:30 ~ 09:29)</option>
            <option value="10">사시 (09:30 ~ 11:29)</option>
            <option value="12">오시 (11:30 ~ 13:29)</option>
            <option value="14">미시 (13:30 ~ 15:29)</option>
            <option value="16">신시 (15:30 ~ 17:29)</option>
            <option value="18">유시 (17:30 ~ 19:29)</option>
            <option value="20">술시 (19:30 ~ 21:29)</option>
            <option value="22">해시 (21:30 ~ 23:29)</option>
          </select>
        </div>

        {/* 고민 영역 선택 */}
        <div>
          <label className="block text-sm font-bold text-amber-800 mb-2">
            고민 영역
          </label>
          <select
            className="w-full border-2 border-amber-50 p-3 rounded-xl focus:outline-none focus:border-amber-400 transition-colors appearance-none"
            value={formData.theme}
            onChange={(e) =>
              setFormData({ ...formData, theme: e.target.value })
            }
          >
            <option value="health">🌟 건강운</option>
            <option value="money">💰 재물운</option>
            <option value="love">💖 연애운</option>
            <option value="work">👔 직장운</option>
            <option value="study">📚 학업운</option>
          </select>
        </div>

        <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg transform active:scale-95 transition-all">
          내 운세 부적 뽑기
        </button>
      </form>

      <p className="mt-8 text-amber-700/50 text-sm font-medium">
        © 2026 SAJUMON. All rights reserved.
      </p>
    </main>
  );
}
