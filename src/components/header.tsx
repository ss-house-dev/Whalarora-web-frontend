'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGetStartClick = () =>
    session ? router.push('/main/trading') : router.push('/auth/sign-in');
  const handleLogoClick = () => router.push('/');
  const handleSignUpClick = () => router.push('/auth/sign-up');
  const handleMobileMenuToggle = () => {
    const eventName = session ? 'auth-drawer:toggle' : 'guest-drawer:toggle';
    window.dispatchEvent(new Event(eventName));
  };

  useEffect(() => {
    const closeMobileMenus = () => {
      window.dispatchEvent(new Event('guest-drawer:close'));
      window.dispatchEvent(new Event('auth-drawer:close'));
    };

    const onSignin = () => {
      closeMobileMenus();
      router.push('/auth/sign-in');
    };

    const onSignup = () => {
      closeMobileMenus();
      router.push('/auth/sign-up');
    };

    window.addEventListener('auth:signin', onSignin);
    window.addEventListener('auth:signup', onSignup);

    return () => {
      window.removeEventListener('auth:signin', onSignin);
      window.removeEventListener('auth:signup', onSignup);
    };
  }, [router]);
  return (
    <>
      {/* พื้นหลังเต็มจอ */}
      <header className="relative z-10 w-full md:w-10/12 border-b border-white/5 bg-[#16171D] backdrop-blur-md mx-auto md:rounded-b-lg">
        <div className="mx-auto w-full px-4 md:px-7">
          {/* DESKTOP (>= md) */}
          <div className="hidden h-14 w-full items-center justify-between md:flex">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogoClick}
                className="flex items-center rounded-full transition hover:opacity-80"
                aria-label="Go to homepage"
              >
                <Image
                  src="/assets/whalarora-logo.svg"
                  alt="Whalarora logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full"
                  priority
                />
              </button>
              <Image
                src="/assets/whalarora-text-logo.svg"
                alt="Whalarora Text Logo"
                width={120}
                height={120}
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleGetStartClick}
                className="flex h-9 items-center justify-center rounded-lg border-2 border-[#A4A4A4] px-4 text-lg font-normal leading-7 text-[#E9E9E9] transition hover:bg-white/10 cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={handleSignUpClick}
                className="flex h-9 items-center justify-center rounded-lg bg-[#225FED] px-6 text-lg font-normal leading-7 text-white transition hover:bg-[#1B4FCC] cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </div>

          {/* MOBILE (< md) */}
          <div className="flex h-14 w-full items-center justify-between md:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMobileMenuToggle}
                className="flex items-center justify-center text-white"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6 text-white" />
              </button>
              <button
                type="button"
                onClick={handleLogoClick}
                className="flex items-center rounded-full transition hover:opacity-80"
                aria-label="Go to homepage"
              >
                <Image
                  src="/assets/whalarora-logo.svg"
                  alt="Whalarora logo"
                  width={28}
                  height={28}
                  className="rounded-full cursor-pointer"
                  priority
                />
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="md:hidden">
        <Sidebar />
      </div>
    </>
  );
}
