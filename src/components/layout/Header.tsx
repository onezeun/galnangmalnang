'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LuMenu, LuX } from 'react-icons/lu';
import Logo from '@/components/common/Logo';
import { getAuth, type AuthResult } from '@/actions/auth-actions';
import { getSupabase } from '@/utils/supabase/client';
import { useAuthStore } from '@/stores/authStore';

type Item = { href: string; label: string; onClick?: () => void };

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, isLoggedIn, setAuth, reset } = useAuthStore();
  const supabase = useRef(getSupabase()).current;

  useEffect(() => {
    (async () => {
      try {
        const { isLoggedIn, user } = await getAuth();
        isLoggedIn ? setAuth(user) : reset();
      } catch {
        reset();
      }
    })();
  }, [setAuth, reset]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setAuth({ id: session.user.id, email: session.user.email ?? null });
      } else {
        reset();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, setAuth, reset]);

  // 메뉴 아이템 (deps에 isLoggedIn만 두면 충분)
  const items: Item[] = useMemo(() => {
    if (!isLoggedIn) {
      return [{ href: '/login', label: '관리자 로그인' }];
    }

    const logout: Item = {
      href: '#logout',
      label: '로그아웃',
      onClick: async () => {
        reset();
        await supabase.auth.signOut();
        if (pathname.startsWith('/admin')) router.push('/');
      },
    };

    return [
      { href: '/', label: '홈' },
      { href: '/admin/place-new', label: '장소 신규 등록' },
      { href: '/admin/place-list', label: '등록된 리스트 확인' },
      logout,
    ];
  }, [isLoggedIn, pathname, router, supabase, reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* 헤더 */}
      <header className="sticky top-0 z-[1100] border-b border-b-neutral-100 bg-white/80 backdrop-blur">
        <div className="flex h-12 items-center justify-between px-4">
          <h1 className="shrink-0">
            <Link href="/">
              <Logo variant="mark" size={25} />
            </Link>
          </h1>

          <button
            type="button"
            className="text-brand-500 inline-flex items-center justify-center rounded-md p-2 hover:bg-neutral-100"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? <LuX size={22} /> : <LuMenu size={22} />}
          </button>
        </div>
      </header>

      {/* 오버레이 */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className={`fixed top-12 right-0 bottom-0 left-0 z-[900] transition-opacity ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* 드롭다운 패널 */}
      <nav
        id="mobile-nav"
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-12 right-0 left-0 z-[1000] mx-auto max-w-[800px] border border-neutral-100 bg-white px-4 pb-4 transition duration-200 ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-3 pt-3">
          {items.map((item) => (
            <li
              key={item.href}
              className={`rounded-md px-3 py-2 ${
                pathname === item.href
                  ? 'text-brand-500'
                  : 'hover:text-primary text-neutral-700 transition-colors hover:bg-neutral-50'
              }`}
            >
              {item.onClick ? (
                <button
                  className="block w-full text-left"
                  onClick={async () => {
                    await item.onClick?.();
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ) : (
                <Link href={item.href} onClick={() => setOpen(false)} className="block">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
