'use client';

import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleStart = () => {
    router.push(`/input?`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-6">
      <h1 className="text-4xl font-black mb-8 text-amber-900 tracking-tighter">
        사주몬
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleStart();
        }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 border-2 border-amber-100"
      >
        <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg transform active:scale-95 transition-all">
          내 사주몬 부적 뽑기
        </button>
      </form>

      <p className="mt-8 text-amber-700/50 text-sm font-medium">
        © 2026 SAJUMON. All rights reserved.
      </p>
    </main>
  );
}
