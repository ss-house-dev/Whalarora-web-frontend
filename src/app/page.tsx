"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [isHoverDemo, setIsHoverDemo] = useState(false);
  const Router = useRouter();

  const { data: session } = useSession();

  const handleGetStartClick = () => {
    if (session) {
      // ถ้าล็อกอินแล้วให้ไปหน้า trading
      Router.push("/main/trading");
    } else {
      // ถ้ายังไม่ได้ล็อกอินให้ทำการล็อกอิน
      signIn();
    }
  };
  
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(173.39deg, rgba(0, 0, 0, 0.5) 4.96%, rgba(0, 0, 0, 0) 95.04%), url(/assets/landing-page-background.png)`,
      }}
    >
      <header
        style={{
          boxShadow:
            "0 4px 30px rgba(0,0,0,0.3), 2px -2px 20px 0px #FFFFFF30 inset",
        }}
        className="relative z-10 flex justify-between items-center px-10 py-2 mx-25 rounded-b-2xl bg-white/5 backdrop-blur-none border border-white/10"
      >
        <div
          onClick={() => Router.push("/")}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <img
            src="/assets/whalarora-logo.png"
            alt="Whalarora Logo"
            className="w-10 h-10 object-cover rounded-full"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGetStartClick}
            className="rounded-[12px] border border-white/25 text-white px-10 py-2 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] transition-all duration-300 ease-in-out cursor-pointer"
            style={{
              background: "linear-gradient(180deg, #1F4293 17.87%, #246AEC 100%)",
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.background =
                "linear-gradient(180deg, #1F4293 0%, #276F88 49.52%, #26F6BA 100%)";
              target.style.boxShadow = "0px 4px 15px 0px #1D7DFF";
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.background =
                "linear-gradient(180deg, #1F4293 17.87%, #246AEC 100%)";
              target.style.boxShadow = "0px 4px 4px rgba(0, 0, 0, 0.25)";
            }}
          >
            {session ? "Get start !" : "Get start !"}
          </button>
        </div>
      </header>

      <div
        className="flex items-center justify-center text-5xl font-bold bg-clip-text text-transparent mt-10 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #1F4293 0%, #276F88 35.02%, #00FFB6 100%)",
        }}
      >
        Whalalora
      </div>

      <div className="flex flex-col items-center mt-3">
        <div
          className="text-center font-black"
          style={{
            textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
            WebkitTextStrokeWidth: "0.5px",
            WebkitTextStrokeColor: "#FFF",
            fontFamily: "Inter, sans-serif",
            fontSize: "84px",
            fontWeight: "900",
            lineHeight: "140%",
            background:
              "radial-gradient(69.07% 69.07% at 50.05% 69.07%, #FFF 0%, #FFF 49.52%, #717171 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Where Giants Rise <br /> Under the Lights
        </div>
        <div className="text-center text-zinc-300 text-lg font-medium leading-6 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] mt-5">
          Enter the world of crypto trading. Practice your strategies <br /> and
          prepare with a demo account
        </div>

        <div className="flex items-center justify-center mt-5">
          <div
            onMouseEnter={() => setIsHoverDemo(true)}
            onMouseLeave={() => setIsHoverDemo(false)}
            className={`w-72 h-16 px-5 py-3 ${
              isHoverDemo
                ? "bg-gradient-to-b from-fuchsia-700 to-blue-900 shadow-[0px_4px_20px_0px_rgba(29,125,255,1.00)]"
                : "bg-gradient-to-b from-blue-900 via-cyan-700 to-teal-400 shadow-[0px_4px_20px_0px_rgba(4,4,4,0.50)]"
            } rounded-tl-xl rounded-tr-[60px] rounded-bl-[60px] rounded-br-xl flex justify-center items-center gap-2.5 cursor-pointer transition-all duration-300`}
          >
            <div
              onClick={handleGetStartClick}
              className={`text-white ${
                isHoverDemo ? "text-xl font-bold" : "text-xl font-bold"
              } leading-loose`}
            >
              {session ? "Demo your trading" : "Demo your trading"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}