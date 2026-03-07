'use client';

import Image from 'next/image';
import Link from 'next/link';
import PageTracker from './_components/PageTracker';

export default function Page() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#4b3ba0]"
      style={{
        backgroundImage: "url('/images/pixel-sky.webp')",
        backgroundSize: 'auto',
        backgroundPosition: 'center center',
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

      <p className="mt-8 text-white/50 text-sm font-medium">
        © 2026 TTSY. All rights reserved.
      </p>
    </main>
  );
}
