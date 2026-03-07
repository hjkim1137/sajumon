'use client';

import Image from 'next/image';
import Link from 'next/link';
import PageTracker from './_components/PageTracker';

export default function Page() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#4b3ba0]"
      style={{
        backgroundImage: "url('/images/pixel-sky.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    >
      <PageTracker page="/" />
      <Image
        src="/images/sajumon_logo.png"
        alt="사주몬 로고"
        width={400}
        height={400}
        className="mb-8"
      />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl space-y-6 border-2 border-purple-200">
        <Link
          href="/input"
          className="block w-full bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg transform active:scale-95 transition-all text-center"
        >
          내 사주몬 데려오기
        </Link>
      </div>

      <p className="mt-8 text-white/50 text-sm font-medium">
        © 2026 TTSY. All rights reserved.
      </p>
    </main>
  );
}
