"use client";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

export default function Header() {
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
    <header
      style={{
        background: "rgba(255, 255, 255, 0.12)",
        boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.30)",
      }}
      className="relative z-10 flex justify-between items-center max-w-[1200px] mx-auto px-10 py-2 rounded-b-2xl"
    >
      <div
        onClick={() => Router.push("/")}
        className="flex items-center space-x-13 cursor-pointer"
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full"
        />
        <span
          style={{
            fontFamily: "Alexandria, sans-serif",
          }}
          className="text-white text-[18px] font-[400]"
        >
          Trade
        </span>
      </div>
      <div className="flex gap-[16px]">
        <button
          style={{
            fontFamily: "Alexandria, sans-serif",
          }}
          onClick={handleGetStartClick}
          className="w-[112px] h-[36px] px-[15px] py-[2px] border-2 border-[#A4A4A4] rounded-[12px] text-[18px] font-[400] text-[#E9ECF4] transition-all duration-200 cursor-pointer"
        >
          Log in
        </button>
        <button
          style={{
            fontFamily: "Alexandria, sans-serif",
          }}
          className="w-[100px] h-[36px] px-[15px] py-[2px] bg-[#225FED] rounded-[12px] text-[18px] font-[400] text-white transition-all duration-200 cursor-pointer"
        >
          Sign up
        </button>
      </div>
    </header>
  );
}
