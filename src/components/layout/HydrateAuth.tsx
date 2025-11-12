'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getSupabase } from '@/utils/supabase/client';
type User = { id: string; email: string | null };

export default function HydrateAuth({ initial }: { initial: User | null }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const reset = useAuthStore((s) => s.reset);
  const supabase = useRef(getSupabase()).current;
  
  // 1) 서버에서 받은 초기 세션 반영
  useEffect(() => {
    initial ? setAuth(initial) : reset();
  }, [initial, setAuth, reset]);

  // 2) 이후는 이벤트만 구독 (로그인/로그아웃/토큰갱신 등)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      session?.user ? setAuth({ id: session.user.id, email: session.user.email ?? null }) : reset();
    });
    return () => sub.subscription.unsubscribe();
  }, [setAuth, reset]);

  return null;
}
