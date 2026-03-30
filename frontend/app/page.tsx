'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageTracker from './_components/PageTracker';

export default function Page() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setTotalUsers(data.totalUsers))
      .catch(() => {});
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#4b3ba0]"
      style={{
        backgroundImage: "url('/images/pixel-sky.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    >
      <PageTracker page="/" />
      <Image
        src="/images/sajumon_logo.webp"
        alt="사주몬 로고"
        width={300}
        height={300}
        className="mb-12"
      />

      <Link href="/input" className="menu-wrap">
        <span className="pixel-btn">
          <span className="pixel-btn-inner font-[Galmuri11]">부적 뽑기</span>
        </span>
      </Link>

      {totalUsers !== null && totalUsers > 0 && (
        <div className="mt-12 w-full max-w-md px-4 py-3 rounded-lg bg-gradient-to-r from-purple-900/80 to-indigo-900/80">
          <p className="font-bold font-[Galmuri11] text-white tracking-wide whitespace-nowrap text-center text-[clamp(1rem,5vw,1.5rem)]">
            누적 방문자 수 {totalUsers.toLocaleString()}명
          </p>
        </div>
      )}

      <p className="mt-8 text-white/50 text-sm font-medium">
        © 2026 TTSY. All rights reserved.
      </p>
    </main>
  );
}
