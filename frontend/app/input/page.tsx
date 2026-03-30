'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageTracker from '../_components/PageTracker';

export default function Page() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    userName: '',
    birthDate: '',
    birthTime: 'unknown',
    theme: 'health',
  });

  const handleStart = () => {
    const params = new URLSearchParams({
      userName: formData.userName.trim(),
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      theme: formData.theme,
    });
    router.push(`/question?${params.toString()}`);
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 8) {
      setFormData({ ...formData, birthDate: value });
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#4b3ba0] font-[Galmuri11]"
      style={{
        backgroundImage: "url('/images/pixel-sky.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    >
      <PageTracker page="/input" />
      <h1 className="text-4xl font-black mb-8 text-white tracking-tighter drop-shadow-lg">
        내 사주몬 데려오기
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!formData.userName.trim()) {
            alert('이름을 입력해주세요.');
            return;
          }
          if (formData.birthDate.length !== 8) {
            alert('생년월일 8자리를 입력해주세요. (예: 19990101)');
            return;
          }
          const year = parseInt(formData.birthDate.substring(0, 4), 10);
          const month = parseInt(formData.birthDate.substring(4, 6), 10);
          const day = parseInt(formData.birthDate.substring(6, 8), 10);
          if (
            year < 1900 ||
            year > 2026 ||
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > 31
          ) {
            alert('올바른 생년월일을 입력해주세요.');
            return;
          }
          const date = new Date(year, month - 1, day);
          if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
          ) {
            alert('올바른 생년월일을 입력해주세요.');
            return;
          }
          handleStart();
        }}
        className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl space-y-6 border-2 border-purple-200"
      >
        <div>
          <label className="block text-sm font-bold text-purple-700 mb-2  ">
            이름
          </label>
          <input
            type="text"
            placeholder="예: 홍길동"
            required
            value={formData.userName}
            className=" w-full border-2 border-purple-100 p-3 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
            onChange={(e) =>
              setFormData({ ...formData, userName: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-purple-700 mb-2  ">
            생년월일 (8자리)
          </label>
          <input
            type="text"
            placeholder="예: 20010101"
            required
            value={formData.birthDate}
            className=" w-full border-2 border-purple-100 p-3 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
            onChange={handleBirthDateChange}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-purple-700 mb-2">
            태어난 시
          </label>
          <select
            className=" w-full border-2 border-purple-100 p-3 rounded-xl focus:outline-none focus:border-purple-400 transition-colors appearance-none"
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

        <div>
          <label className="block text-sm font-bold text-purple-700 mb-2 ">
            고민 영역
          </label>
          <select
            className="w-full border-2 border-purple-100 p-3 rounded-xl focus:outline-none focus:border-purple-400 transition-colors appearance-none"
            value={formData.theme}
            onChange={(e) =>
              setFormData({ ...formData, theme: e.target.value })
            }
          >
            <option value="health">🌟 건강운</option>
            <option value="money">💰 재물운</option>
            <option value="love">💖 연애운</option>
            <option value="career">👔 직장운</option>
            <option value="study">📚 학업운</option>
          </select>
        </div>

        <button className="cursor-pointer w-full bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg transform active:scale-95 transition-all">
          내 사주몬 데려오기
        </button>
      </form>

      <p className="mt-8 text-white/50 text-sm font-medium">
        © 2026 TTSY. All rights reserved.
      </p>
    </main>
  );
}
