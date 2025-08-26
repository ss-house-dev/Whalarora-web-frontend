"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Header from "@/components/ui/header";

export default function Home() {
  const [isHoverDemo, setIsHoverDemo] = useState(false);
  const Router = useRouter();
  const { data: session } = useSession();

  const handleGetStartClick = () => {
    if (session) {
      Router.push("/main/trading");
    } else {
      signIn();
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        background:
          "linear-gradient(180deg, rgba(0, 0, 0, 0.50) 27.31%, rgba(0, 0, 0, 0.00) 104.62%), url(/assets/landing-page-background.png) lightgray 50% / cover no-repeat",
      }}
    >
      <Header />

      <div
        className="flex items-center justify-center bg-clip-text mt-10 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] text-[#52BAB2] text-[36px] font-[700] leading-relaxed"
        style={{
          fontFamily: "Alexandria, sans-serif",
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