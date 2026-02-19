'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    category: 'total',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 나중에 백엔드 연동 시 여기에 API 호출 로직이 들어갑니다.
    router.push('/question');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-6">
      <h1 className="text-4xl font-black mb-8 text-amber-900 tracking-tighter">
        🔮 사주몬
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 border-2 border-amber-100"
      >
        <div>
          <label className="block text-sm font-bold text-amber-800 mb-2">
            이름
          </label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            required
            className="w-full border-2 border-amber-50 p-3 rounded-xl focus:outline-none focus:border-amber-400 transition-colors"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-amber-800 mb-2">
            생년월일
          </label>
          <input
            type="date"
            required
            className="w-full border-2 border-amber-50 p-3 rounded-xl focus:outline-none focus:border-amber-400 transition-colors"
            onChange={(e) =>
              setFormData({ ...formData, birthDate: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-amber-800 mb-2">
            고민 영역
          </label>
          <select
            className="w-full border-2 border-amber-50 p-3 rounded-xl focus:outline-none focus:border-amber-400 transition-colors appearance-none"
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="total">🌟 전체 총운</option>
            <option value="money">💰 재물운 (돈벼락 가능?)</option>
            <option value="love">💖 연애운 (솔로탈출?)</option>
            <option value="work">👔 직장/성공</option>
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
