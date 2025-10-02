'use server';

import { createServerSupabaseClient } from '@/utils/supabase/server';

export type AuthResult = {
  isLoggedIn: boolean;
  user: { id: string; email: string | null } | null;
};

export async function getAuth(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient(); // ✅ await 추가

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isLoggedIn: false, user: null };

  return { isLoggedIn: true, user: { id: user.id, email: user.email ?? null } };
}
