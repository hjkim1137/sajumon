'use client';

import { useState, useEffect } from 'react';
import LoginForm from './_components/LoginForm';
import Dashboard from './_components/Dashboard';

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if already authenticated by hitting the stats endpoint
    fetch('/api/admin/stats')
      .then((res) => setAuthed(res.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 font-mono animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard />;
}
