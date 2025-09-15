import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 요청에 대해 Supabase 클라이언트를 생성하고
 * 만료될 뻔한 세션 토큰을 자동 갱신해주는 미들웨어 로직
 */
export const applyMiddlewareSupabaseClient = async (request: NextRequest) => {
  // 초기 응답 객체 (현재 요청을 그대로 통과시킴)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // SSR 전용 Supabase 클라이언트 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        /** 쿠키 설정 (요청·응답 모두에 반영) */
        set(name: string, value: string, options: CookieOptions) {
          // ① Request의 쿠키 값 갱신
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // ② Response 새로 만들고 쿠키 반영
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        /** 쿠키 제거 (요청·응답 모두에서 삭제) */
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 현재 세션 토큰이 유효한지 확인 → 만료되었으면 자동으로 새 토큰 발급
  await supabase.auth.getUser();

  return response;
};

/** Next.js 미들웨어 진입점 */
export async function middleware(request: NextRequest) {
  return await applyMiddlewareSupabaseClient(request);
}

/** 
 * matcher: 미들웨어를 적용할 URL 패턴 지정
 * - _next/static, _next/image, favicon.ico, 이미지 파일 등은 제외
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
