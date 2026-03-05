'use client';

import { useState, useEffect } from 'react';
import LoginForm from './_components/LoginForm';
import Dashboard from './_components/Dashboard';

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem('dashboard-theme') === 'dark');
    fetch('/api/admin/stats')
      .then((res) => setAuthed(res.ok))
      .catch(() => setAuthed(false));
  }, []);

  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      {authed === null ? (
        <div className="min-h-screen bg-t-page flex items-center justify-center">
          <p className="text-t-muted font-mono animate-pulse">로딩 중...</p>
        </div>
      ) : !authed ? (
        <LoginForm onSuccess={() => setAuthed(true)} />
      ) : (
        <Dashboard darkMode={darkMode} onToggleDark={toggleDark} />
      )}
    </div>
  );
}
