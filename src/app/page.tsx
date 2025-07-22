'use client';
import { useState } from "react";

export default function Home() {
  const [isHover, setIsHover] = useState(false);
  const [isHoverDemo, setIsHoverDemo] = useState(false);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat pt-5"
      style={{
        backgroundImage: `linear-gradient(173.39deg, rgba(0, 0, 0, 0.5) 4.96%, rgba(0, 0, 0, 0) 95.04%), url(/bg.png)`,
      }}
    >
      <header
        style={{
          boxShadow: "0 4px 30px rgba(0,0,0,0.3), 2px -2px 20px 0px #FFFFFF40 inset",
        }}
        className="relative z-10 flex justify-between items-center px-6 py-4 mx-10 rounded-2xl bg-white/5 backdrop-blur-none border border-white/10"
      >
        <div className="flex items-center space-x-3">
          <img
            src="logo.png"
            alt="Logo"
            className="w-15 h-15 object-cover rounded-full"
          />
        </div>
        <button
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          className={`text-white px-10 py-2 rounded-lg font-medium transition-all duration-300 transform cursor-pointer border border-white/25 ${isHover
              ? "bg-gradient-to-b from-[#1F4293] via-[#276F88] to-[#26F6BA] shadow-[0px_4px_20px_0px_rgba(29,125,255,1.00)] scale-[1.01]"
              : "bg-gradient-to-b from-[#1F4293] to-[#246AEC]"
            }`}
        >
          Get start !
        </button>

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
        <div className="text-center text-white text-8xl font-black leading-[117.6px] [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
          Where Giants Rise <br /> Under the Lights
        </div>
        <div className="text-center text-zinc-300 text-lg font-medium leading-6 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] mt-5">
          Enter the world of crypto trading. Practice your strategies <br /> and prepare with a demo account
        </div>

        <div className="flex items-center justify-center mt-5">
          <div
            onMouseEnter={() => setIsHoverDemo(true)}
            onMouseLeave={() => setIsHoverDemo(false)}
            className={`w-72 h-16 px-5 py-3 ${isHoverDemo
              ? "bg-gradient-to-b from-fuchsia-700 to-blue-900 shadow-[0px_4px_20px_0px_rgba(29,125,255,1.00)]"
              : "bg-gradient-to-b from-blue-900 via-cyan-700 to-teal-400 shadow-[0px_4px_20px_0px_rgba(4,4,4,0.50)]"
              } rounded-tl-xl rounded-tr-[60px] rounded-bl-[60px] rounded-br-xl flex justify-center items-center gap-2.5 cursor-pointer transition-all duration-300`}
          >
            <div
              className={`text-white ${isHoverDemo ? "text-xl font-bold" : "text-xl font-bold"
                } leading-loose`}
            >
              Demo your trading
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
