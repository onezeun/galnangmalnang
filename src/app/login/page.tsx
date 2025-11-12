'use client';

import { signInAction } from '@/actions/auth-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formAction = async (formData: FormData) => {
    const res = await signInAction(formData);
    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }
    if (res.redirect) {
      router.replace(res.redirect);
      return;
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
      <h1 className="font-mitme mb-6 text-4xl">로그인</h1>
      <form
        action={formAction}
        className="w-full space-y-4 rounded-md border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium">이메일</label>
          <input
            name="email"
            type="email"
            required
            className="focus:ring-brand-500 mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">비밀번호</label>
          <input
            name="password"
            type="password"
            required
            className="focus:ring-brand-500 mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        {errorMsg && <p className="text-sm text-rose-600">{errorMsg}</p>}

        <button
          type="submit"
          className="bg-brand-500 hover:bg-brand-600 w-full rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          로그인
        </button>
      </form>
    </main>
  );
}
