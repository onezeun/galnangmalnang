// middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { SUPABASE } from './config';

/** Supabase 클라이언트 + 쿠키 동기화 */
function createSupabaseForMiddleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(SUPABASE.URL!, SUPABASE.ANON!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  return { supabase, response };
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseForMiddleware(request);
  const { pathname } = new URL(request.url);

  if (!pathname.startsWith('/admin')) return response;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return response;
}

/** /admin 아래만 미들웨어 적용 */
export const config = {
  matcher: ['/admin/:path*'],
};
