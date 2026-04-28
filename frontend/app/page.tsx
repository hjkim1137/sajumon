'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageTracker from './_components/PageTracker';

function SlotDigit({ digit, duration }: { digit: number; duration: number }) {
  const [animated, setAnimated] = useState(false);
  const cycles = 2;
  const finalOffset = (cycles - 1) * 10 + digit;

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ height: '1em', lineHeight: '1em', verticalAlign: 'baseline' }}
    >
      <span aria-hidden="true" style={{ visibility: 'hidden' }}>
        0
      </span>
      <span
        className="absolute left-0 top-0 flex flex-col"
        style={{
          transform: `translateY(-${animated ? finalOffset : 0}em)`,
          transition: animated
            ? `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`
            : 'none',
        }}
      >
        {Array.from({ length: cycles * 10 }, (_, i) => (
          <span key={i} style={{ height: '1em', lineHeight: '1em' }}>
            {i % 10}
          </span>
        ))}
      </span>
    </span>
  );
}

function SlotNumber({ value }: { value: number }) {
  const chars = value.toLocaleString().split('');
  let lastDigitIdx = -1;
  for (let i = chars.length - 1; i >= 0; i--) {
    if (/\d/.test(chars[i])) {
      lastDigitIdx = i;
      break;
    }
  }
  return (
    <span className="tabular-nums">
      {chars.map((c, i) =>
        i === lastDigitIdx ? (
          <SlotDigit key={i} digit={parseInt(c, 10)} duration={5000} />
        ) : (
          <span key={i}>{c}</span>
        ),
      )}
    </span>
  );
}

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
            누적 방문자 수 <SlotNumber value={totalUsers} />명
          </p>
        </div>
      )}

      <p className="mt-8 text-white/50 text-sm font-medium">
        © 2026 TTSY. All rights reserved.
      </p>
    </main>
  );
}
