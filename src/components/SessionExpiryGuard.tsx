'use client';

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const PROTECTED_PREFIXES = ['/main/trading', '/main/my-assets'];

const decodeJwtExpiry = (token?: string): number | null => {
  if (!token) return null;
  const segments = token.split('.');
  if (segments.length < 2) return null;
  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    if (payload && typeof payload.exp === 'number') {
      return payload.exp * 1000;
    }
  } catch {
    // fall through when token is not a JWT
  }
  return null;
};

export default function SessionExpiryGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const hadSessionRef = useRef(false);

  const shouldGuard = useMemo(() => {
    if (!pathname) return false;
    return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  }, [pathname]);

  const expiresAt = useMemo(() => {
    if (!session) return null;
    const tokenExpiry = decodeJwtExpiry(session.accessToken);
    if (typeof tokenExpiry === 'number') return tokenExpiry;
    if (session.expires) {
      const ts = new Date(session.expires).getTime();
      return Number.isFinite(ts) ? ts : null;
    }
    return null;
  }, [session]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleExpiry = useCallback(
    (cause: 'timer' | 'status') => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      hadSessionRef.current = false;
      clearTimer();
      if (cause === 'timer') {
        signOut({ redirect: false }).finally(() => {
          router.push('/');
        });
        return;
      }
      router.push('/');
    },
    [clearTimer, router]
  );

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  useEffect(() => {
    if (!shouldGuard) {
      clearTimer();
      triggeredRef.current = false;
      if (status === 'unauthenticated') {
        hadSessionRef.current = false;
      }
      if (status === 'authenticated' && session) {
        hadSessionRef.current = true;
      }
      return;
    }

    if (status === 'loading') {
      return;
    }

    if (status === 'authenticated' && session) {
      triggeredRef.current = false;
      hadSessionRef.current = true;
      if (!expiresAt) {
        clearTimer();
        return;
      }
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        handleExpiry('timer');
        return;
      }
      clearTimer();
      timerRef.current = setTimeout(() => handleExpiry('timer'), remaining);
      return;
    }

    if (status === 'unauthenticated' && hadSessionRef.current) {
      handleExpiry('status');
    }
  }, [shouldGuard, status, session, expiresAt, clearTimer, handleExpiry]);

  return <>{children}</>;
}
