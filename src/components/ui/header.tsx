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
        boxShadow:
          "0 4px 30px rgba(0,0,0,0.3), 2px -2px 20px 0px #FFFFFF30 inset",
      }}
      className="relative z-10 flex justify-between items-center max-w-[1200px] mx-auto px-10 py-2 rounded-b-2xl bg-white/5 backdrop-blur-none border border-white/10"
    >
      <div
        onClick={() => Router.push("/")}
        className="flex items-center space-x-3 cursor-pointer"
      >
        <Image
          src="/assets/whalarora-logo.png"
          alt="Whalarora Logo"
          width={10}
          height={10}
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
            const target = e.currentTarget;
            target.style.background =
              "linear-gradient(180deg, #1F4293 0%, #276F88 49.52%, #26F6BA 100%)";
            target.style.boxShadow = "0px 4px 15px 0px #1D7DFF";
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget;
            target.style.background =
              "linear-gradient(180deg, #1F4293 17.87%, #246AEC 100%)";
            target.style.boxShadow = "0px 4px 4px rgba(0, 0, 0, 0.25)";
          }}
        >
          {session ? "Get start !" : "Get start !"}
        </button>
      </div>
    </header>
  );
}