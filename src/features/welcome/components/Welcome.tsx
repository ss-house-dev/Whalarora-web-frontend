'use client';
import { useState } from 'react';
import { Button } from '../../../components/button-sign-up';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Welcome() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Get username from session or URL params
  const usernameParam = searchParams?.get('username');
  const username = session?.user?.name || usernameParam || 'User';

  const handleGoBack = () => {
    // Use browser history API instead of Next.js router
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleGetStarted = async () => {
    setIsNavigating(true);
    try {
      await router.push('/main/trading');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-[492px] rounded-[12px] border border-[#474747] bg-[#16171D] px-6 py-6 sm:px-8 sm:py-5">
        <div className="flex flex-col text-white">
          <div className="mb-6 sm:mb-[24px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="20"
              viewBox="0 0 12 20"
              fill="none"
              className="cursor-pointer"
              onClick={handleGoBack}
            >
              <path
                d="M4.36308 9.99921L10.9292 16.6862C11.5238 17.2917 11.5239 18.2619 10.9296 18.8677C10.3193 19.4896 9.31748 19.4897 8.70706 18.868L0 9.99921L8.7078 1.13111C9.3179 0.509782 10.319 0.509781 10.9291 1.13111C11.5237 1.73662 11.5237 2.70678 10.9291 3.31228L4.36308 9.99921Z"
                fill="#A4A4A4"
              />
            </svg>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6 text-center sm:space-y-[21px]">
            <div className="flex items-center justify-center">
              <Image
                src="/assets/register-success.png"
                alt="Register success"
                width={172}
                height={172}
                className="h-32 w-32 rounded-full sm:h-[172px] sm:w-[172px]"
              />
            </div>

            <div className="space-y-2 sm:space-y-[10px]">
              <div className="text-2xl font-[600] text-[#EDEDED] sm:text-[30px]">
                Welcome to Whalarora !
              </div>
              <div className="text-2xl font-[600] text-[#225FED] sm:text-[30px]">
                {username}
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-6 sm:mt-[47px] sm:space-y-[47px]">
            <div className="space-y-2 text-center text-sm font-[400] text-[#7E7E7E] sm:space-y-0 sm:text-[16px]">
              <p>Your account has been successfully created.</p>
              <p>
                Get $10,000 in your demo account now and start trading with no risk free!
              </p>
            </div>

            <Button
              className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#225FED] text-[18px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:h-[48px]"
              onClick={handleGetStarted}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin sm:h-8 sm:w-8" />
                  Loading...
                </>
              ) : (
                'Get start'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

