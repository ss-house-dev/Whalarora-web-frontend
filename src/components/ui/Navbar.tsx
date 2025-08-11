"use client";
import Image from "next/image";
import { ChevronDown, Wallet, Download, RotateCcw, Router } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown menu
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
          src="/image/logo.png"
          alt="Logo"
          width={45}
          height={45}
          className="rounded-full cursor-pointer"
        />
        <div className="text-lg cursor-pointer">Trade</div>
      </div>

      {/* Right Side - Balance */}
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

        {/* Dropdown Menu */}
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
    </div>
  );
}
