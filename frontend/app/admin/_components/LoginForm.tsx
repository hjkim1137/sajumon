'use client';

import { useState } from 'react';

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 500) {
          setError('서버 설정 오류: 환경변수를 확인하세요.');
        } else {
          setError(
            data.error === 'Invalid credentials'
              ? '이메일 또는 비밀번호가 올바르지 않습니다.'
              : '인증 오류가 발생했습니다.',
          );
        }
      }
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-t-page flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-t-card p-8 rounded-2xl border border-t-card-border"
      >
        <h1 className="text-xl font-bold text-t-heading mb-6 font-mono">
          사주몬 관리자 로그인
        </h1>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-t-input text-t-heading p-3 rounded-lg mb-3 border border-t-input-border focus:outline-none focus:border-blue-500"
          autoFocus
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-t-input text-t-heading p-3 rounded-lg mb-4 border border-t-input-border focus:outline-none focus:border-blue-500"
          required
        />
        {error && <p className="text-t-danger text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-t-bar text-white py-3 rounded-lg font-bold transition-colors cursor-pointer"
        >
          {loading ? '확인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
