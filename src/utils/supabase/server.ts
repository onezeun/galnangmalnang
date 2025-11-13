'use server';

import { cookies } from 'next/headers';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { SUPABASE } from '@/config';
import { Database } from '@/types_db';

/**
 * 서버 환경(Server Component, Server Action 등)에서 사용할 Supabase 클라이언트 생성 함수
 * - SSR 전용 createServerClient 사용
 * - next/headers의 cookies()와 연동하여 세션 쿠키 자동 관리
 *
 * @param admin - true면 서비스 역할 키(SERVICE_ROLE)로 인증된 관리자 권한 클라이언트를 생성
 */
export const createServerSupabaseClient = async (admin: boolean = false) => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE.URL!,
    admin ? SUPABASE.SERVICE_ROLE! : SUPABASE.ANON!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        /** 쿠키 설정
         * ⚠️ Server Component에서 실행될 수 있으므로 오류를 무시 (세션 미들웨어가 처리)
         */
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Component에서는 set()이 실패할 수 있음 → 무시
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Server Component에서는 delete가 실패할 수 있음 → 무시
          }
        },
      },
    }
  );
};
