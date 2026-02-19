'use client';

export default function ResultPage() {
  return (
    <main className="min-h-screen bg-orange-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-sm bg-white border-4 border-red-600 p-6 rounded-sm shadow-2xl text-center">
        <h2 className="text-xl font-black text-red-600 mb-4">행운 부적</h2>
        <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
          <span className="text-gray-400">서툴게 그려진 동물 이미지</span>
        </div>
        <p className="font-bold text-lg">"잠만 자도 돈이 들어오는 운세"</p>
      </div>

      <button
        onClick={() => (window.location.href = '/')}
        className="mt-8 text-gray-600 underline"
      >
        다시 입력하기
      </button>
    </main>
  );
}
