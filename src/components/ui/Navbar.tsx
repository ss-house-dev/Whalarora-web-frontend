'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Wallet } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBalance } from "@/components/contexts/BalanceContext";

export default function Navbar() {
    const Router = useRouter();
    const { balance, setBalance } = useBalance();

    return (
        <div
            className="navbar shadow-sm rounded-b-2xl px-30 py-3"
            style={{
                background:
                    "linear-gradient(90deg, #49B6AE 1.44%, #246AEC 54.81%, #8A38F5 100%)",
                borderRadius: "0px 0px 16px 16px",
            }}
        >
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h8m-8 6h16"
                            />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                    >
                        <li>
                            <a>Item 1</a>
                        </li>
                        <li>
                            <a>Parent</a>
                            <ul className="p-2">
                                <li>
                                    <a>Submenu 1</a>
                                </li>
                                <li>
                                    <a>Submenu 2</a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a>Item 3</a>
                        </li>
                    </ul>
                </div>
                <div
                    onClick={() => Router.push("/")}
                    className="flex items-center space-x-3 cursor-pointer"
                >
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-12 h-12 object-cover rounded-full"
                    />
                </div>
            </div>
            <div className="navbar-end space-x-5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="px-4 py-2 gap-10 text-white rounded-[12px] border border-white/50 transition-transform duration-200 cursor-pointer flex items-center justify-between"
                            style={{
                                background: "rgba(31, 66, 147, 1)",
                                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <Wallet size={18} />
                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap">
                                    {balance.toLocaleString(undefined, {
                                        minimumFractionDigits: 4,
                                    })} USD
                                </span>
                                <ChevronDown size={18} />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#ffffff] border-0 rounded-lg shadow-lg text-left min-w-[150px]">
                        <DropdownMenuItem
                            className="px-4 py-2 bg-white cursor-pointer transition-colors duration-200 font-semibold text-left justify-start"
                            style={{ color: "#1F4293" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#1F4293";
                                e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.color = "#1F4293";
                            }}
                        >
                            My Wallet
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="px-4 py-2 bg-white cursor-pointer transition-colors duration-200 font-semibold text-left justify-start"
                            style={{ color: "#1F4293" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#1F4293";
                                e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.color = "#1F4293";
                            }}
                        >
                            Transaction History
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    onClick={() => setBalance(10000)}
                    className="px-15 py-2 cursor-pointer rounded-[12px] border border-white/50 text-white transition-transform duration-200 hover:scale-101 hover:shadow-[0_0_8px_1px_rgba(255,255,255,0.4)]"
                    style={{ background: "#D84C4C" }}
                >
                    Reset
                </Button>

                <Button
                    onClick={() => setBalance(balance + 10000)}
                    className="px-15 py-2 cursor-pointer rounded-[12px] border border-white/50 text-white transition-transform duration-200 hover:scale-101 hover:shadow-[0_0_8px_1px_rgba(255,255,255,0.4)]"
                    style={{
                        background:
                            "linear-gradient(180deg, #1F4293 17.87%, #246AEC 100%)",
                    }}
                >
                    Deposit
                </Button>
            </div>
        </div>
    );
}
