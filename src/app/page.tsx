'use client';
import { useRouter } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/header';

export default function Home() {
  const [isHoverDemo, setIsHoverDemo] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleTradeClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    router.push('/main/trading');
  };

  const DemoButton = ({
    containerClassName,
    textClassName,
  }: {
    containerClassName: string;
    textClassName: string;
  }) => (
    <div
      onMouseEnter={() => setIsHoverDemo(true)}
      onMouseLeave={() => setIsHoverDemo(false)}
      className={`
        group relative flex cursor-pointer transition-all duration-300
        ${containerClassName}
        rounded-[60px] p-1
        ${isHoverDemo ? 'bg-gradient-to-b from-[#F7F7F7] to-[#215EEC]' : 'bg-[#225FED]'}
        shadow-[0_0_12px_0_rgba(34,95,237,1)]
        outline outline-4 outline-offset-[-4px] outline-[#215EEC]
      `}
      style={{
        borderRadius: 60,
        padding: 4,
      }}
    >
      <div
        onClick={handleTradeClick}
        className={`
          relative flex h-full w-full items-center justify-center
          rounded-[56px]
          ${
            isHoverDemo
              ? 'ring-4 ring-[#215EEC]/70 drop-shadow-[0_0_22px_rgba(33,94,236,0.75)]'
              : 'ring-2 ring-[#225EEC]/60 drop-shadow-[0_0_18px_rgba(34,94,236,0.60)]'
          }
          bg-[#1F2029] hover:bg-gradient-to-b hover:from-[#1F2029] hover:to-[#225FED]
          shadow-[0_0_4px_4px_rgba(14,33,75,0.45)]
          after:content-[''] after:absolute after:inset-[-2px] after:rounded-[64px]
          after:border after:border-[#215EEC]/70 after:blur-xl after:opacity-70 after:-z-10
        `}
        style={{
          borderRadius: 56,
          transition: 'background 200ms ease, box-shadow 200ms ease, opacity 200ms ease',
        }}
      >
        <div
          className={`
            transition-opacity duration-300
            ${isHoverDemo ? 'opacity-90' : 'opacity-100'}
            ${textClassName}
            ${isHoverDemo ? 'text-neutral-100' : 'text-white'}
            text-base font-semibold font-['Alexandria'] leading-tight
          `}
        >
          {session ? 'Demo your trading' : 'Demo your trading'}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat"
      style={{
        minHeight: '100dvh',
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 0.50) 27.31%, rgba(0, 0, 0, 0.00) 104.62%), url(/assets/landing-page-background.png) lightgray 50% / cover no-repeat',
      }}
    >
      <header className="flex-shrink-0">
        <Header />
      </header>

      <main className="flex flex-1 flex-col min-h-0">
        {/* Mobile / Small */}
        <div className="flex flex-1 flex-col items-center px-6 pb-16 pt-6 sm:px-8 sm:pt-8 md:hidden">
          <div className="hidden md:flex mt-4 items-center justify-center bg-clip-text text-[22px] font-semibold leading-7 text-[#52BAB2] [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
            Whalarora
          </div>

          <div className="mt-8 flex w-full max-w-[320px] flex-col items-center text-center sm:max-w-[360px]">
            <h1
              className="mt-20 font-black text-[32px] leading-[40px] sm:text-[36px] sm:leading-[46px]"
              style={{
                textShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
                background:
                  'radial-gradient(69.07% 69.07% at 50.05% 69.07%, #FFF 0%, #FFF 49.52%, #717171 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <span className="block">Where</span>
              <span className="block">Giants Rise</span>
              <span className="block">Under the</span>
              <span className="block">Lights</span>
            </h1>

            <p
              className="mt-6 text-center text-base font-normal leading-6 text-zinc-300 sm:text-lg sm:leading-7"
              style={{ textShadow: '0 4px 4px rgba(0, 0, 0, 0.25)' }}
            >
              Enter the world of crypto trading. Practice your strategies and prepare with a demo
              account
            </p>
          </div>

          <div className="mt-10 flex w-full justify-center sm:mt-12">
            <DemoButton
              containerClassName="h-14 w-full max-w-[240px] shadow-[0_0_12px_rgba(34,95,237,1)] outline outline-4 outline-offset-[-4px] outline-[#225EEC] sm:h-16 sm:max-w-[260px]"
              textClassName="text-base font-semibold leading-tight"
            />
          </div>
        </div>

        {/* Desktop / Medium+ */}
        <div className="hidden flex-1 flex-col md:flex">
          <div className="flex mt-24 items-center justify-center bg-clip-text text-[24px] font-[700] leading-relaxed text-[#52BAB2] [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] md:text-[28px] lg:text-[32px] xl:text-[36px]">
            Whalarora
          </div>

          <div className="mt-3 flex flex-col items-center">
            <div
              className="text-center font-black text-[48px] leading-[120%] md:text-[56px] lg:text-[72px] xl:text-[84px]"
              style={{
                textShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
                background:
                  'radial-gradient(69.07% 69.07% at 50.05% 69.07%, #FFF 0%, #FFF 49.52%, #717171 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
              }}
            >
              Where Giants Rise <br /> Under the Lights
            </div>

            <div
              className="mt-5 text-center text-[16px] font-[400] font-['Alexandria'] leading-6 text-zinc-300 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] md:text-[18px] md:leading-7 lg:text-[20px]"
              style={{ textShadow: '0 4px 4px rgba(0, 0, 0, 0.25)' }}
            >
              Enter the world of crypto trading. Practice your strategies and <br /> prepare with a
              demo account
            </div>

            <div className="flex items-center justify-center mt-[44px]">
              <DemoButton
                containerClassName="h-16 w-72"
                textClassName="text-[20px] font-[400] leading-loose"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
