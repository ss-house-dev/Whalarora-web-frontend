'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/ui/header';

export default function Home() {
  const [isHoverDemo, setIsHoverDemo] = useState(false);
  const Router = useRouter();
  const { data: session } = useSession();

  const handleTradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    Router.push('/main/trading');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 0.50) 27.31%, rgba(0, 0, 0, 0.00) 104.62%), url(/assets/landing-page-background.png) lightgray 50% / cover no-repeat',
      }}
    >
      <Header />

      <div className="flex items-center justify-center bg-clip-text mt-[44px] [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] text-[#52BAB2] text-[36px] font-[700] leading-relaxed">
        Whalarora
      </div>

      <div className="flex flex-col items-center mt-3">
        <div
          className="text-center font-black"
          style={{
            textShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '84px',
            fontWeight: '900',
            lineHeight: '140%',
            background:
              'radial-gradient(69.07% 69.07% at 50.05% 69.07%, #FFF 0%, #FFF 49.52%, #717171 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Where Giants Rise <br /> Under the Lights
        </div>
        <div className="text-center text-zinc-300 text-[20px] font-[400] leading-6 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] mt-5">
          Enter the world of crypto trading. Practice your strategies and <br />
          prepare with a demo account
        </div>

        <div className="flex items-center justify-center mt-[44px]">
          <div
            onMouseEnter={() => setIsHoverDemo(true)}
            onMouseLeave={() => setIsHoverDemo(false)}
            className={`relative w-72 h-16 cursor-pointer transition-all duration-300`}
            style={{
              borderRadius: '60px',
              background: 'linear-gradient(180deg, #1F4293 0%, #2FACA2 100%)',
              padding: '4px',
            }}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                borderRadius: '56px',
                background: 'linear-gradient(177deg, #2FACA2 2.14%, #1F4293 97.86%)',
              }}
            >
              <div
                onClick={handleTradeClick}
                className={`text-white ${
                  isHoverDemo ? 'text-[20px] font-[400]' : 'text-[20px] font-[400]'
                } leading-loose`}
              >
                {session ? 'Demo your trading' : 'Demo your trading'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
