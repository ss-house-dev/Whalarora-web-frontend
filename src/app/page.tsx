'use client';
import { useRouter } from 'next/navigation';
import { useState, type CSSProperties, type MouseEvent } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/header';

const heroHeadingStyles: CSSProperties = {
  textShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
  background: 'radial-gradient(69.07% 69.07% at 50.05% 69.07%, #FFF 0%, #FFF 49.52%, #717171 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const heroBodyStyles: CSSProperties = {
  textShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
};

const demoButtonOuterStyle: CSSProperties = {
  borderRadius: '60px',
  // background: 'linear-gradient(180deg, #1F4293 0%, #2FACA2 100%)',
  background: '#225FED',
  padding: '4px',
};

const demoButtonInnerStyle: CSSProperties = {
  borderRadius: '56px',
  //background: 'linear-gradient(177deg, #2FACA2 2.14%, #1F4293 97.86%)',
  background: '#1F2029',
};

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
      className={`relative flex cursor-pointer transition-all duration-300 ${containerClassName}`}
      style={demoButtonOuterStyle}
    >
      <div
        className="
    relative flex h-full w-full items-center justify-center
    rounded-[60px]
    ring-2 ring-[#225EEC]/60
    shadow-[0_0_4px_4px_rgba(14, 33, 75, 0.45)]
    after:content-[''] after:absolute
    after:inset-[-1px]
    after:rounded-[70px]
    after:border after:border-[#225EEC]/70
    after:blur-xl after:opacity-70
    after:-z-10
    drop-shadow-[0_0_18px_rgba(34,94,236,0.6)]
  "
        style={demoButtonInnerStyle}
      >
        <div
          onClick={handleTradeClick}
          className={`text-white transition-opacity duration-300 ${
            isHoverDemo ? 'opacity-90' : 'opacity-100'
          } ${textClassName}`}
        >
          {session ? 'Demo your trading' : 'Demo your trading'}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 0.50) 27.31%, rgba(0, 0, 0, 0.00) 104.62%), url(/assets/landing-page-background.png) lightgray 50% / cover no-repeat',
      }}
    >
      <Header />

      <div className="flex flex-col items-center px-6 pb-16 pt-6 sm:px-8 sm:pt-8 lg:hidden">
        <div className="hidden md:flex mt-4 items-center justify-center bg-clip-text text-[22px] font-semibold leading-7 text-[#52BAB2] [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
          Whalarora
        </div>

        <div className="mt-8 flex w-full max-w-[320px] flex-col items-center text-center sm:max-w-[360px]">
          <h1
            className="font-black text-[32px] leading-[40px] sm:text-[36px] sm:leading-[46px]"
            style={heroHeadingStyles}
          >
            <span className="block">Where</span>
            <span className="block">Giants Rise</span>
            <span className="block">Under the</span>
            <span className="block">Lights</span>
          </h1>

          <p
            className="mt-6 text-center text-base font-normal leading-6 text-zinc-300 sm:text-lg sm:leading-7"
            style={heroBodyStyles}
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

      <div className="hidden md:block">
        <div className="mt-[44px] flex items-center justify-center bg-clip-text text-[36px] font-[700] leading-relaxed text-[#52BAB2] [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
          Whalarora
        </div>

        <div className="mt-3 flex flex-col items-center">
          <div
            className="text-center font-black"
            style={{
              ...heroHeadingStyles,
              fontFamily: 'Inter, sans-serif',
              fontSize: '84px',
              fontWeight: '900',
              lineHeight: '140%',
            }}
          >
            Where Giants Rise <br /> Under the Lights
          </div>
          <div
            className="mt-5 text-center text-[20px] font-[400] font-['Alexandria'] leading-6 text-zinc-300 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]"
            style={heroBodyStyles}
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
    </div>
  );
}
