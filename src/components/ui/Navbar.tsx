"use client";
import Image from "next/image";
import { ChevronDown, Wallet, Download, RotateCcw, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Toggle dropdown menu
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="bg-[rgba(255,255,255,0.10)] h-14 flex justify-between items-center mx-[120px] rounded-b-2xl shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] px-6 py-3">
      {/* Left Side - Logo and Navigation */}
      <div className="flex flex-row items-center gap-10">
        <Image
          onClick={() => router.push("/")}
          src="/assets/whalarora-logo.png"
          alt="Whalarora Logo"
          width={45}
          height={45}
          className="rounded-full cursor-pointer"
        />
        <div className="text-lg cursor-pointer">Trade</div>
      </div>

      {/* Right Side - Balance and User Menu */}
      <div className="flex items-center gap-4">
        {/* Balance Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex flex-row items-center justify-between text-base bg-[#1F4293] rounded-lg w-[336px] h-8 px-4 cursor-pointer"
          >
            {/* Wallet Icon */}
            <Wallet className="h-5 w-5" />
            {/* Balance Amount */}
            <div className="flex items-center gap-2">
              <div>10,000.00 USD</div>
              <ChevronDown className="h-5 w-5" />
            </div>
          </button>
          {/* Balance Dropdown Menu */}
          {open && (
            <div className="absolute right-0 mt-2 w-[184px] bg-[#1F4293] rounded-lg shadow-lg overflow-hidden z-50">
              {/* Deposit Option */}
              <div className="h-10 px-[14px] flex items-center justify-between hover:bg-[#17306B] text-base cursor-pointer border-b border-[#9AAACE] group">
                <span>Deposit</span>
                <Download className="h-5 w-5 text-white group-hover:text-[#2FACA2]" />
              </div>
              {/* Withdraw Option */}
              <div className="h-10 px-[14px] flex items-center justify-between hover:bg-[#17306B] text-base cursor-pointer">
                <span>Reset Balance</span>
                <RotateCcw className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>

        {/* User Authentication Section */}
        {session ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 text-white text-sm px-3 py-2 rounded-lg bg-[#1F4293] hover:bg-[#17306B] transition-all duration-300 cursor-pointer"
            >
              <span>Welcome, {session.user?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-[160px] bg-[#1F4293] rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={() => {
                    signOut();
                    setUserMenuOpen(false);
                    router.push("/");
                  }}
                  className="w-full h-10 px-4 flex items-center justify-between hover:bg-[#17306B] text-base cursor-pointer group"
                >
                  <span>Sign Out</span>
                  <LogOut className="h-4 w-4 text-white group-hover:text-[#2FACA2]" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}