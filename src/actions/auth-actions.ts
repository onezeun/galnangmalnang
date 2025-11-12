'use server';

import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export type AuthResult = {
  isLoggedIn: boolean;
  user: { id: string; email: string | null } | null;
};

// 유저정보조회(로그인상태확인)
export async function getAuthAction(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isLoggedIn: false, user: null };

  return { isLoggedIn: true, user: { id: user.id, email: user.email ?? null } };
}

// 로그인 요청
export async function signInAction(formData: FormData) {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  } else {
    redirect('/admin/place-list');
  }
}