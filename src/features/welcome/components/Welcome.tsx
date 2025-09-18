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
  const username = session?.user?.name || searchParams.get('username') || 'User';

  const handleGoBack = () => {
    // ใช้ browser history API แทน Next.js router
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
    <div className="fixed inset-0 flex justify-center mt-[28px] overflow-hidden">
      <div className="w-[492px] h-[560px] rounded-[12px] bg-[#16171D] border border-[#474747] px-8 py-5">
        <div className="flex flex-col space-y-4 text-white">
          <div className="mb-[24px]">
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
          <div className="flex flex-col items-center justify-center text-center space-y-[21px]">
            {/* Circular background with checkmark */}
            <div className="flex items-center justify-center">
              <Image
                src="/assets/register-success.png"
                alt="Register success"
                width={172}
                height={172}
                className="w-[172px] h-[172px] rounded-full"
              />
            </div>

            <div className="space-y-[10px]">
              <div className="text-[30px] text-[#EDEDED] font-[600]">Welcome to Whalarora !</div>
              <div className="text-[30px] font-[600] text-[#225FED]">{username}</div>
            </div>
          </div>
          <div className="space-y-[47px]">
            <div className="text-[16px] text-center font-[400] text-[#7E7E7E]">
              Your account has been successfully created. <br />
              Get $10,000 in your demo account now and start trading with no risk free!
            </div>

            <Button
              className="w-[428px] h-[48px] rounded-[12px] cursor-pointer text-[18px] disabled:opacity-50 disabled:cursor-not-allowed bg-[#225FED] flex items-center justify-center"
              onClick={handleGetStarted}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" />
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
