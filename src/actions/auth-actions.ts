'use server';
import { ERR } from '@/config/errors';
import { ActionResultType } from '@/types/action';
import { createServerSupabaseClient } from '@/utils/supabase/server';

// 유저정보조회(로그인상태확인)
export async function getAuthAction(): Promise<ActionResultType> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      ok: false,
      type: ERR.UNAUTHORIZED.type,
      message: '사용자 정보를 가져오지 못했습니다.',
    };

  return { ok: true, data: { isLoggedIn: true, user: { id: user.id, email: user.email } } };
}

// 로그인 요청
export async function signInAction(formData: FormData): Promise<ActionResultType> {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !user) {
      return {
        ok: false,
        type: ERR.UNAUTHORIZED.type,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        details: error!.message,
      };
    }

    return {
      ok: true,
      data: { id: user.id, email: user.email },
      redirect: '/admin/place-list',
    };
  } catch (e: any) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '로그인 중 오류가 발생했습니다. 다시 시도해주세요',
      details: e?.message,
    };
  }
}
