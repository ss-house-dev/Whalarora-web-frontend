import Image from "next/image";
import { ChevronDown, Wallet, Download, RotateCcw, LogOut } from "lucide-react";
import { Session } from "next-auth";
import { useGetCashBalance } from "@/features/wallet/hooks/useGetCash";
import { useAddCashToTrade } from "@/features/wallet/hooks/useCreateCash";

interface NavbarUIProps {
  open: boolean;
  userMenuOpen: boolean;
  session: Session | null;
  menuRef: React.RefObject<HTMLDivElement | null>;
  userMenuRef: React.RefObject<HTMLDivElement | null>;
  handleSignOut: () => void;
  handleLogoClick: () => void;
  handleSignInClick: () => void;
  toggleBalanceMenu: () => void;
  toggleUserMenu: () => void;
}

export const NavbarUI: React.FC<NavbarUIProps> = ({
  open,
  userMenuOpen,
  session,
  menuRef,
  userMenuRef,
  handleSignOut,
  handleLogoClick,
  handleSignInClick,
  toggleBalanceMenu,
  toggleUserMenu,
}) => {
  // ใช้ hook เพื่อดึงยอดเงินจริง
  const {
    data: cashBalance,
    isLoading,
    error,
  } = useGetCashBalance({
    enabled: !!session, // เรียก API เฉพาะเมื่อมี session
  });

  // ใช้ mutation สำหรับเพิ่มเงิน
  const addCashMutation = useAddCashToTrade();

  // Handle add cash
  const handleAddCash = () => {
    if (!addCashMutation.isPending) {
      addCashMutation.mutate();
    }
  };

  // Format จำนวนเงิน
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined) return "0.00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-[rgba(255,255,255,0.10)] h-14 flex justify-between items-center mx-[120px] rounded-b-2xl shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] px-6 py-3">
      {/* Left Side - Logo and Navigation */}
      <div className="flex flex-row items-center gap-10">
        <Image
          onClick={handleLogoClick}
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
            onClick={toggleBalanceMenu}
            className="flex flex-row items-center justify-between text-base bg-[#1F4293] rounded-lg w-[336px] h-8 px-4 cursor-pointer"
          >
            {/* Wallet Icon */}
            <Wallet className="h-5 w-5" />
            {/* Balance Amount */}
            <div className="flex items-center gap-2">
              <div>
                {session
                  ? error
                    ? "Error"
                    : `${formatCurrency(cashBalance?.amount)} USD`
                  : "0.00 USD"}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
              >
                <path
                  d="M5.00002 7.23194L0.150879 2.38394L1.76802 0.767944L5.00002 3.99994L8.23202 0.767944L9.84916 2.38394L5.00002 7.23194Z"
                  fill="white"
                />
              </svg>
            </div>
          </button>

          {/* Balance Dropdown Menu */}
          {open && (
            <div className="absolute right-0 mt-2 w-[184px] bg-[#1F4293] rounded-lg shadow-lg overflow-hidden z-50">
              {/* Deposit Option */}
              <div
                onClick={handleAddCash}
                className={`h-10 px-[14px] flex items-center justify-between hover:bg-[#17306B] text-base cursor-pointer border-b border-[#9AAACE] group ${
                  addCashMutation.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="text-[16px] font-normal">
                  Deposit
                  {/* {addCashMutation.isPending ? "Adding..." : "Deposit"} */}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                >
                  <path
                    d="M5.53711 4.2002H2.97266C2.28995 4.20023 1.73646 4.73777 1.73633 5.40039V11.5996C1.73633 12.2623 2.28987 12.7998 2.97266 12.7998H15.0273C15.7101 12.7998 16.2637 12.2623 16.2637 11.5996V5.40039C16.2635 4.73777 15.7101 4.20023 15.0273 4.2002H13.0928V3H15.0273C16.3929 3.00004 17.4999 4.07502 17.5 5.40039V11.5996C17.5 12.9251 16.393 14 15.0273 14H2.97266L2.8457 13.9971C1.53926 13.9327 0.5 12.8836 0.5 11.5996V5.40039C0.500132 4.07502 1.60712 3.00004 2.97266 3H5.53711V4.2002ZM9 0C9.33749 -2.9023e-10 9.61133 0.290099 9.61133 0.647461V8.79102L12.457 5.77734C12.6957 5.5249 13.0827 5.52473 13.3213 5.77734C13.5598 6.02994 13.5596 6.43968 13.3213 6.69238L9.43164 10.8105C9.19306 11.0629 8.80694 11.0629 8.56836 10.8105L4.67871 6.69238C4.44037 6.43968 4.44021 6.02994 4.67871 5.77734C4.91727 5.52473 5.30431 5.5249 5.54297 5.77734L8.38867 8.79102V0.647461C8.38867 0.290099 8.66251 3.56725e-08 9 0Z"
                    fill="white"
                  />
                </svg>
              </div>
              {/* Withdraw Option */}
              <div className="h-10 px-[14px] flex items-center justify-between hover:bg-[#17306B] text-base cursor-pointer">
                <span className="text-[16px] font-normal">Reset Balance</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M14 7C14 10.8661 10.8661 14 7 14C3.1339 14 0 10.8661 0 7C0 3.25125 2.94654 0.190921 6.65005 0.00859467C6.84311 -0.000910107 7 0.1567 7 0.35V1.05003C7 1.24332 6.84315 1.39887 6.65023 1.41096C5.45878 1.48558 4.31883 1.93949 3.39984 2.71098C2.39126 3.55768 1.71332 4.73273 1.48514 6.02968C1.25697 7.32663 1.49315 8.6625 2.15219 9.80259C2.81123 10.9427 3.85098 11.814 5.08874 12.2636C6.32649 12.7131 7.68309 12.7121 8.92016 12.2607C10.1572 11.8092 11.1956 10.9363 11.8529 9.7952C12.5103 8.65411 12.7444 7.31788 12.5142 6.02128C12.2841 4.72468 11.6044 3.55066 10.5945 2.7055L9.69748 3.60251C9.477 3.823 9.1 3.66684 9.1 3.35503V0H12.455C12.7668 0 12.923 0.377 12.7025 0.597487L11.5871 1.7129C12.3452 2.36935 12.9531 3.18133 13.3694 4.09363C13.7858 5.00593 14.0008 5.99718 14 7Z"
                    fill="#DBDBDB"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* User Authentication Section */}
        {session ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center gap-2 text-white text-sm px-3 py-2 rounded-lg bg-[#1F4293] hover:bg-[#17306B] transition-all duration-300 cursor-pointer"
            >
              <span>Welcome, {session.user?.name}</span>
            </button> 
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
              >
                <path
                  d="M5.00002 7.23194L0.150879 2.38394L1.76802 0.767944L5.00002 3.99994L8.23202 0.767944L9.84916 2.38394L5.00002 7.23194Z"
                  fill="white"
                />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-[160px] bg-[#1F4293] rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleSignOut}
                  className="w-full h-10 px-4 flex items-center justify-between hover:bg-[#17306B] text-base cursor-pointer group"
                >
                  <span>Sign Out</span>
                  <LogOut className="h-4 w-4 text-white group-hover:text-[#2FACA2]" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleSignInClick}
            className="text-white text-sm px-4 py-2 rounded-lg bg-[#1F4293] hover:bg-[#17306B] transition-all duration-300"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};
