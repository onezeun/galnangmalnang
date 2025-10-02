'use client';

import { useState } from 'react';
import { getSupabase } from '@/utils/supabase/client';

const supabase = getSupabase();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // 로그인 성공
      window.location.href = '/admin/place-list';
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
      <h1 className="mb-6 text-4xl font-mitme">로그인</h1>
      <form
        onSubmit={handleLogin}
        className="w-full space-y-4 rounded-md border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus:ring-brand-500 mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">비밀번호</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus:ring-brand-500 border-neutral-300 border mt-1 w-full rounded-md px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-500 hover:bg-brand-600 w-full rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </main>
  );
}
