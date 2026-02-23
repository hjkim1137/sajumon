"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingSajuRequest");
    if (!pending) {
      router.replace("/");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center">
      <div className="relative w-16 h-16 mb-24">
        <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-ping opacity-25" />
        <div className="absolute inset-0 border-4 border-t-amber-500 border-transparent rounded-full animate-spin" />
      </div>
      <p className="text-xl font-bold text-amber-800">
        사주몬을 소환하고 있습니다
      </p>
    </main>
  );
}
