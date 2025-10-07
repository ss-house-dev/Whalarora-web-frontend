'use client';
import Image from 'next/image';
import { LogOut, Menu } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useGetCashBalance } from '@/features/wallet/hooks/useGetCash';
import { useAddCashToTrade } from '@/features/wallet/hooks/useCreateCash';
import { useResetPortfolio } from '@/features/wallet/hooks/useUpdateCash';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog-reset';
import { useNavbar } from '@/features/wallet/hooks/useNavbar';
import Sidebar from '@/components/Sidebar';

export default function Header() {
  const {
    open,
    userMenuOpen,
    session,
    mobileBalanceMenuRef,
    desktopBalanceMenuRef,
    mobileUserMenuRef,
    desktopUserMenuRef,
    handleSignOut,
    handleLogoClick,
    handleSignInClick,
    handleSignUpClick,
    toggleBalanceMenu,
    closeBalanceMenu,
    toggleUserMenu,
  } = useNavbar();
  // State สำหรับ AlertDialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ใช้ hook เพื่อดึงยอดเงินจริง
  const { data: cashBalance, error } = useGetCashBalance({
    enabled: !!session, // เรียก API เฉพาะเมื่อมี session
  });

  // ใช้ mutation สำหรับเพิ่มเงิน
  const addCashMutation = useAddCashToTrade();

  // ใช้ mutation สำหรับรีเซ็ตพอร์ต
  const resetPortfolioMutation = useResetPortfolio();

  // Handle add cash
  const handleAddCash = () => {
    if (!addCashMutation.isPending) {
      addCashMutation.mutate();
    }
  };

  // Handle reset portfolio - เปิด AlertDialog
  const handleResetPortfolio = () => {
    if (resetPortfolioMutation.isPending) {
      return; // ป้องกันการเรียกซ้ำ
    }
    setShowResetConfirm(true);
  };

  // Handle confirm reset
  const handleConfirmReset = () => {
    resetPortfolioMutation.mutate(undefined, {
      onSuccess: () => {
        // ปิด dropdown menu หลังจาก reset สำเร็จ
        if (open) {
          closeBalanceMenu();
        }
        setShowResetConfirm(false);
      },
      onError: () => {
        setShowResetConfirm(false);
      },
    });
  };

  // Handle cancel reset
  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  // Format จำนวนเงิน
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined) return '0.00';
    const truncated = Math.floor(amount * 100) / 100;

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(truncated);
  };

  // ในฟังก์ชัน handleSignOut ของ NavbarUI
  const enhancedHandleSignOut = () => {
    // Clear CoinContext localStorage
    localStorage.removeItem('selectedCoin');
    console.log('🟢 Cleared selectedCoin from localStorage on sign out');

    // เรียก handleSignOut เดิม
    handleSignOut();
  };

  // อักษรย่อสำหรับปุ่ม avatar บน mobile
  const userInitials = useMemo(() => {
    const name = session?.user?.name || '';
    if (!name) return '..';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts[1]?.[0] ?? '';
    return (first + last).toUpperCase() || first.toUpperCase() || 'U';
  }, [session]);

  const displayName = session?.user?.name?.trim() || 'Trader';

  // ข้อความยอดเงิน
  const balanceText = useMemo(() => {
    if (!session) {
      return '0.00 USDT';
    }

    if (error) {
      return 'Error';
    }

    return `${formatCurrency(cashBalance?.amount)} USDT`;
  }, [session, error, cashBalance?.amount]);

  // เชื่อม SignIn/SignUp ให้ถูกเรียกเมื่อ Sidebar ส่งอีเวนต์มา (ปุ่มใน drawer)
  useEffect(() => {
    const onSignin = () => handleSignInClick();
    const onSignup = () => handleSignUpClick();
    window.addEventListener('auth:signin', onSignin as EventListener);
    window.addEventListener('auth:signup', onSignup as EventListener);
    return () => {
      window.removeEventListener('auth:signin', onSignin as EventListener);
      window.removeEventListener('auth:signup', onSignup as EventListener);
    };
  }, [handleSignInClick, handleSignUpClick]);

  // Handle mobile logout with proper menu closing
  const handleMobileLogout = () => {
    console.log('🔴 Logout clicked (mobile)');

    // ปิด user menu ก่อน
    if (userMenuOpen) {
      toggleUserMenu();
    }

    // Clear localStorage
    localStorage.removeItem('selectedCoin');
    console.log('🟢 Cleared selectedCoin from localStorage on sign out');

    // ใช้ timeout เล็กน้อยเพื่อให้ UI อัพเดท
    setTimeout(() => {
      enhancedHandleSignOut();
    }, 100);
  };

  return (
    <>
      {/* NAVBAR CONTAINER */}
      <div className="fixed top-0 left-0 right-0 bg-[#16171D] h-14 flex items-center px-4 md:px-6 py-3 w-full z-[70]">
        <div className="flex w-full items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle menu"
              onClick={() => {
                const eventName = session ? 'auth-drawer:toggle' : 'guest-drawer:toggle';
                window.dispatchEvent(new Event(eventName));
              }}
            >
              <Menu className="text-white w-6 h-6" />
            </button>

            <Image
              onClick={handleLogoClick}
              src="/assets/whalarora-logo.svg"
              alt="Whalarora Logo"
              width={28}
              height={28}
              className="rounded-full cursor-pointer"
              priority
            />
          </div>

          {session ? (
            <div className="flex items-center gap-3">
              {/* Wallet icon = เปิดเมนู balance เดิม */}
              <div className="relative" ref={mobileBalanceMenuRef}>
                <button
                  onClick={toggleBalanceMenu}
                  aria-label="Wallet"
                  className="w-8 h-8 rounded-md flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="17"
                    viewBox="0 0 18 17"
                    fill="none"
                  >
                    <path
                      d="M14.8164 0.77002C15.8004 0.770255 16.6055 1.54318 16.6055 2.48779V4.4458C17.1334 4.74641 17.5 5.28778 17.5 5.92334V11.0767C17.4999 11.7121 17.1333 12.2536 16.6055 12.5542V14.5122C16.6053 15.4567 15.8003 16.2297 14.8164 16.23H2.28906C1.29618 16.2298 0.500141 15.4567 0.5 14.5122V2.48779C0.5 1.54317 1.29609 0.770244 2.28906 0.77002H14.8164ZM2.28906 2.48779V14.5122H14.8164V12.7944H9.44727C8.4632 12.7943 7.65831 12.0213 7.6582 11.0767V5.92334C7.6582 4.97865 8.46314 4.20567 9.44727 4.20557H14.8164V2.48779H2.28906ZM9.44727 5.92334V11.0767H15.7109V5.92334H9.44727ZM13.8252 7.77002C14.4005 7.77002 14.8672 8.21773 14.8672 8.77002C14.8672 9.3223 14.4005 9.77002 13.8252 9.77002C13.2499 9.76995 12.7832 9.32226 12.7832 8.77002C12.7832 8.21777 13.2499 7.77008 13.8252 7.77002Z"
                      fill="white"
                    />
                  </svg>
                </button>

                {/* เมนูยอดเงินเดิม (mobile) */}
                {open && (
                  <div className="absolute right-0 mt-2 top-full w-80 max-w-[calc(100vw-32px)] rounded-xl bg-[#16171D] outline-offset-[-1px] outline-[#474747] shadow-lg z-50">
                    <div className="flex flex-col gap-4 p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-normal leading-tight text-[#A4A4A4]">
                            Available Balance
                          </span>
                          <button
                            type="button"
                            aria-label="Close balance menu"
                            onClick={closeBalanceMenu}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[#E9E9E9] transition hover:text-white"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M10.5 1.5L1.5 10.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M1.5 1.5L10.5 10.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center">
                          <div className="flex flex-1 items-center gap-3 rounded-lg bg-[#1F2029] px-4 py-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md text-[#215EEC]">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="17"
                                viewBox="0 0 18 17"
                                fill="none"
                              >
                                <path
                                  d="M14.8164 0.77002C15.8004 0.770255 16.6055 1.54318 16.6055 2.48779V4.4458C17.1334 4.74641 17.5 5.28778 17.5 5.92334V11.0767C17.4999 11.7121 17.1333 12.2536 16.6055 12.5542V14.5122C16.6053 15.4567 15.8003 16.2297 14.8164 16.23H2.28906C1.29618 16.2298 0.500141 15.4567 0.5 14.5122V2.48779C0.5 1.54317 1.29609 0.770244 2.28906 0.77002H14.8164ZM2.28906 2.48779V14.5122H14.8164V12.7944H9.44727C8.4632 12.7943 7.65831 12.0213 7.6582 11.0767V5.92334C7.6582 4.97865 8.46314 4.20567 9.44727 4.20557H14.8164V2.48779H2.28906ZM9.44727 5.92334V11.0767H15.7109V5.92334H9.44727ZM13.8252 7.77002C14.4005 7.77002 14.8672 8.21773 14.8672 8.77002C14.8672 9.3223 14.4005 9.77002 13.8252 9.77002C13.2499 9.76995 12.7832 9.32226 12.7832 8.77002C12.7832 8.21777 13.2499 7.77008 13.8252 7.77002Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                            <span className="ml-auto text-base font-normal leading-normal text-white">
                              {balanceText}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleAddCash}
                          disabled={addCashMutation.isPending}
                          className={`flex flex-1 items-center justify-between rounded-lg border-b border-b-[#215EEC] bg-[#1F2029] px-4 py-2 text-sm font-normal leading-tight text-[#E9E9E9] transition ${
                            addCashMutation.isPending
                              ? 'cursor-not-allowed opacity-60'
                              : 'hover:bg-[#31323A] active:bg-[#3A3B43]'
                          }`}
                        >
                          <span>Deposit</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="14"
                            viewBox="0 0 18 14"
                            fill="none"
                          >
                            <path
                              d="M5.53711 4.2002H2.97266C2.28995 4.20023 1.73646 4.73777 1.73633 5.40039V11.5996C1.73633 12.2623 2.28987 12.7998 2.97266 12.7998H15.0273C15.7101 12.7998 16.2637 12.2623 16.2637 11.5996V5.40039C16.2635 4.73777 15.7101 4.20023 15.0273 4.2002H13.0928V3H15.0273C16.3929 3.00004 17.4999 4.07502 17.5 5.40039V11.5996C17.5 12.9251 16.393 14 15.0273 14H2.97266L2.8457 13.9971C1.53926 13.9327 0.5 12.8836 0.5 11.5996V5.40039C0.500132 4.07502 1.60712 3.00004 2.97266 3H5.53711V4.2002ZM9 0C9.33749 -2.9023e-10 9.61133 0.290099 9.61133 0.647461V8.79102L12.457 5.77734C12.6957 5.5249 13.0827 5.52473 13.3213 5.77734C13.5598 6.02994 13.5596 6.43968 13.3213 6.69238L9.43164 10.8105C9.19306 11.0629 8.80694 11.0629 8.56836 10.8105L4.67871 6.69238C4.44037 6.43968 4.44021 6.02994 4.67871 5.77734C4.91727 5.52473 5.30431 5.5249 5.54297 5.77734L8.38867 8.79102V0.647461C8.38867 0.290099 8.66251 3.56725e-08 9 0Z"
                              fill="#ffffff"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          disabled
                          className="flex flex-1 items-center justify-between rounded-lg bg-[#121119] px-4 py-2 text-sm font-normal leading-tight text-[#7E7E7E] opacity-70 cursor-not-allowed"
                        >
                          <span>Withdraw</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <g clipPath="url(#clip0_5594_61778)">
                              <path
                                d="M14.6666 8.00004C14.6666 9.31858 14.2756 10.6075 13.5431 11.7038C12.8105 12.8002 11.7693 13.6547 10.5511 14.1592C9.33297 14.6638 7.99253 14.7958 6.69932 14.5386C5.40611 14.2814 4.21823 13.6464 3.28588 12.7141C2.35353 11.7817 1.71859 10.5938 1.46135 9.30064C1.20412 8.00744 1.33614 6.66699 1.84072 5.44882C2.34531 4.23064 3.19979 3.18945 4.29612 2.45691C5.39245 1.72437 6.68138 1.33337 7.99992 1.33337M14.6666 1.33337L7.99992 8.00004M14.6666 1.33337H10.6666M14.6666 1.33337V5.33337"
                                stroke="#7E7E7E"
                                strokeWidth="1.24"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_5594_61778">
                                <rect width="16" height="16" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* profile */}
              <div className="relative" ref={mobileUserMenuRef}>
                <button
                  onClick={() => {
                    toggleUserMenu();
                    console.log('✅ Avatar clicked, userMenuOpen:', !userMenuOpen);
                  }}
                  className="w-8 h-8 rounded-full bg-[#3A8AF7] text-white text-xs font-semibold flex items-center justify-center"
                >
                  {userInitials}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-[232px] rounded-xl bg-[#16171D] outline-offset-[-1px] outline-[#474747] shadow-lg z-[99999]">
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A8AF7]">
                        <span className="text-sm font-normal leading-tight text-white">
                          {userInitials}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-normal leading-none text-[#A4A4A4]">
                          Welcome !
                        </span>
                        <span className="text-xs font-normal leading-none text-white">
                          {displayName}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 px-2 pb-2">
                      <button
                        type="button"
                        onClick={handleResetPortfolio}
                        disabled={showResetConfirm || resetPortfolioMutation.isPending}
                        className={`flex w-full items-center justify-between rounded-lg bg-[#1F2029] px-4 py-2 text-sm font-normal leading-tight text-[#D84C4C] transition ${
                          showResetConfirm || resetPortfolioMutation.isPending
                            ? 'cursor-not-allowed opacity-60'
                            : 'hover:bg-[#22232F]'
                        }`}
                      >
                        <span>Reset account</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="h-4 w-4"
                        >
                          <path
                            d="M14 7C14 10.8661 10.8661 14 7 14C3.1339 14 0 10.8661 0 7C0 3.25125 2.94654 0.190921 6.65005 0.00859467C6.84311 -0.000910107 7 0.1567 7 0.35V1.05003C7 1.24332 6.84315 1.39887 6.65023 1.41096C5.45878 1.48558 4.31883 1.93949 3.39984 2.71098C2.39126 3.55768 1.71332 4.73273 1.48514 6.02968C1.25697 7.32663 1.49315 8.6625 2.15219 9.80259C2.81123 10.9427 3.85098 11.814 5.08874 12.2636C6.32649 12.7131 7.68309 12.7121 8.92016 12.2607C10.1572 11.8092 11.1956 10.9363 11.8529 9.7952C12.5103 8.65411 12.7444 7.31788 12.5142 6.02128C12.2841 4.72468 11.6044 3.55066 10.5945 2.7055L9.69748 3.60251C9.477 3.823 9.1 3.66684 9.1 3.35503V0H12.455C12.7668 0 12.923 0.377 12.7025 0.597487L11.5871 1.7129C12.3452 2.36935 12.9531 3.18133 13.3694 4.09363C13.7858 5.00593 14.0008 5.99718 14 7Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleMobileLogout}
                        className="flex w-full items-center justify-between rounded-lg bg-[#1F2029] px-4 py-2 text-sm font-normal leading-tight text-[#E9E9E9] transition hover:bg-[#22232F]"
                      >
                        <span>Log out</span>
                        <LogOut className="h-4 w-4 text-[#E9E9E9]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* ============== DESKTOP ( >= md ) ============== */}
        <div className="hidden md:flex w-full items-center justify-between">
          <div className="flex items-center gap-5">
            <Image
              onClick={handleLogoClick}
              src="/assets/whalarora-logo.svg"
              alt="Whalarora Logo"
              width={40}
              height={40}
              className="rounded-full cursor-pointer"
              priority
            />
            <Image
              src="/assets/whalarora-text-logo.svg"
              alt="Whalarora Text Logo"
              width={120}
              height={120}
              className="cursor-pointer"
            />
          </div>

          {/* balance + user / sign in */}
          <div className="flex items-center gap-4">
            {/* Balance dropdown (desktop) */}
            {session && (
              <div className="relative" ref={desktopBalanceMenuRef}>
                <button
                  type="button"
                  onClick={toggleBalanceMenu}
                  aria-label="Wallet balance"
                  aria-expanded={open}
                  aria-haspopup="menu"
                  className="flex h-9 min-w-[230px] items-center gap-3 rounded-md bg-[rgba(255,255,255,0.12)] px-4 text-white shadow-sm transition-colors hover:border-[#3A3E4F] cursor-pointer"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md text-[#225FED]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="17"
                      viewBox="0 0 18 17"
                      fill="none"
                    >
                      <path
                        d="M14.8164 0.77002C15.8004 0.770255 16.6055 1.54318 16.6055 2.48779V4.4458C17.1334 4.74641 17.5 5.28778 17.5 5.92334V11.0767C17.4999 11.7121 17.1333 12.2536 16.6055 12.5542V14.5122C16.6053 15.4567 15.8003 16.2297 14.8164 16.23H2.28906C1.29618 16.2298 0.500141 15.4567 0.5 14.5122V2.48779C0.5 1.54317 1.29609 0.770244 2.28906 0.77002H14.8164ZM2.28906 2.48779V14.5122H14.8164V12.7944H9.44727C8.4632 12.7943 7.65831 12.0213 7.6582 11.0767V5.92334C7.6582 4.97865 8.46314 4.20567 9.44727 4.20557H14.8164V2.48779H2.28906ZM9.44727 5.92334V11.0767H15.7109V5.92334H9.44727ZM13.8252 7.77002C14.4005 7.77002 14.8672 8.21773 14.8672 8.77002C14.8672 9.3223 14.4005 9.77002 13.8252 9.77002C13.2499 9.76995 12.7832 9.32226 12.7832 8.77002C12.7832 8.21777 13.2499 7.77008 13.8252 7.77002Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-medium tracking-wide text-white/90 ms-12">
                    {balanceText}
                  </span>
                  <span className=" text-[#ffffff]">
                    {open ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M6.464 4.99998L1.616 9.84912L-7.06876e-08 8.23198L3.232 4.99998L-3.53238e-07 1.76798L1.616 0.150835L6.464 4.99998Z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M5.00002 7.23194L0.150879 2.38394L1.76802 0.767944L5.00002 3.99994L8.23202 0.767944L9.84916 2.38394L5.00002 7.23194Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 top-full w-[184px] bg-[#474747] rounded-lg shadow-lg overflow-hidden z-50">
                    <div
                      onClick={handleAddCash}
                      className={`h-10 px-[14px] flex items-center justify-between bg-[#1F2029] text-base cursor-pointer border-b border-[#225FED] group transition-colors ${
                        addCashMutation.isPending
                          ? 'cursor-not-allowed'
                          : 'hover:bg-[#31323A] active:bg-[#3A3B43]'
                      }`}
                    >
                      <span className="text-[16px] font-normal">Deposit</span>
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

                    <div
                      className={`h-10 px-[14px] flex items-center justify-between text-base cursor-pointer group ${
                        showResetConfirm || resetPortfolioMutation.isPending
                          ? 'bg-[#17306B] cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <span className="text-[16px] text-[#7E7E7E] font-normal">Withdraw</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_5594_61778)">
                          <path
                            d="M14.6666 8.00004C14.6666 9.31858 14.2756 10.6075 13.5431 11.7038C12.8105 12.8002 11.7693 13.6547 10.5511 14.1592C9.33297 14.6638 7.99253 14.7958 6.69932 14.5386C5.40611 14.2814 4.21823 13.6464 3.28588 12.7141C2.35353 11.7817 1.71859 10.5938 1.46135 9.30064C1.20412 8.00744 1.33614 6.66699 1.84072 5.44882C2.34531 4.23064 3.19979 3.18945 4.29612 2.45691C5.39245 1.72437 6.68138 1.33337 7.99992 1.33337M14.6666 1.33337L7.99992 8.00004M14.6666 1.33337H10.6666M14.6666 1.33337V5.33337"
                            stroke="#7E7E7E"
                            strokeWidth="1.24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_5594_61778">
                            <rect width="16" height="16" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User section */}
            {session ? (
              <div className="relative" ref={desktopUserMenuRef}>
                <button
                  type="button"
                  aria-label="User menu"
                  onClick={toggleUserMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A8AF7] text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.45)] transition-transform cursor-pointer"
                >
                  {userInitials}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-[175px] rounded-xl bg-[#16171D] outline-offset-[-1px] outline-[#474747] shadow-lg z-50">
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A8AF7]">
                        <span className="text-sm font-normal leading-tight text-white">
                          {userInitials}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-normal leading-none text-[#A4A4A4]">
                          Welcome !
                        </span>
                        <span className="text-xs font-normal leading-none text-white">
                          {displayName}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 px-2 pb-2">
                      <button
                        type="button"
                        onClick={handleResetPortfolio}
                        disabled={showResetConfirm || resetPortfolioMutation.isPending}
                        className={`flex w-full items-center justify-between rounded-lg bg-[#1F2029] px-4 py-2 text-sm font-normal leading-tight text-[#D84C4C] transition cursor-pointer ${
                          showResetConfirm || resetPortfolioMutation.isPending
                            ? 'cursor-not-allowed opacity-60'
                            : 'hover:bg-[#22232F]'
                        }`}
                      >
                        <span>Reset account</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="h-4 w-4"
                        >
                          <path
                            d="M14 7C14 10.8661 10.8661 14 7 14C3.1339 14 0 10.8661 0 7C0 3.25125 2.94654 0.190921 6.65005 0.00859467C6.84311 -0.000910107 7 0.1567 7 0.35V1.05003C7 1.24332 6.84315 1.39887 6.65023 1.41096C5.45878 1.48558 4.31883 1.93949 3.39984 2.71098C2.39126 3.55768 1.71332 4.73273 1.48514 6.02968C1.25697 7.32663 1.49315 8.6625 2.15219 9.80259C2.81123 10.9427 3.85098 11.814 5.08874 12.2636C6.32649 12.7131 7.68309 12.7121 8.92016 12.2607C10.1572 11.8092 11.1956 10.9363 11.8529 9.7952C12.5103 8.65411 12.7444 7.31788 12.5142 6.02128C12.2841 4.72468 11.6044 3.55066 10.5945 2.7055L9.69748 3.60251C9.477 3.823 9.1 3.66684 9.1 3.35503V0H12.455C12.7668 0 12.923 0.377 12.7025 0.597487L11.5871 1.7129C12.3452 2.36935 12.9531 3.18133 13.3694 4.09363C13.7858 5.00593 14.0008 5.99718 14 7Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={enhancedHandleSignOut}
                        className="flex w-full items-center justify-between rounded-lg bg-[#1F2029] px-4 py-2 text-sm font-normal leading-tight text-[#E9E9E9] transition hover:bg-[#22232F] cursor-pointer"
                      >
                        <span>Log out</span>
                        <LogOut className="h-4 w-4 text-[#E9E9E9]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSignInClick}
                  className="flex h-9 items-center justify-center rounded-lg border-2 border-[#A4A4A4] px-4 text-lg font-normal leading-7 text-[#E9E9E9] transition hover:bg-white/10 cursor-pointer"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="flex h-9 items-center justify-center rounded-lg bg-[#225FED] px-6 text-lg font-normal leading-7 text-white transition hover:bg-[#1B4FCC] cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="py-3 px-4 w-[300px] h-[268px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-center flex-col text-[#E8A512] gap-2 text-[14px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
              >
                <path
                  d="M24 48C10.7448 48 0 37.2552 0 24C0 10.7448 10.7448 0 24 0C37.2552 0 48 10.7448 48 24C48 37.2552 37.2552 48 24 48ZM21.6 31.2V36H26.4V31.2H21.6ZM21.6 12V26.4H26.4V12H21.6Z"
                  fill="#FFB514"
                />
              </svg>
              Reset your wallet ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center mt-4 text-[14px] text-white font-normal">
              If you continue, all settings and <br /> trading history and holding assets will{' '}
              <br /> be removed. Your Demo Account will <br /> restart with default balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 text-white">
            <AlertDialogCancel
              className="cursor-pointer w-[64px] h-[36px] rounded-[8px] hover:bg-transparent hover:text-white"
              onClick={handleCancelReset}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer text-white bg-[#D84C4C] hover:bg-[#D84C4C] w-[64px] h-[36px] rounded-[8px]"
              onClick={handleConfirmReset}
              disabled={resetPortfolioMutation.isPending}
            >
              {resetPortfolioMutation.isPending ? 'Reset' : 'Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="md:hidden">
        <Sidebar />
      </div>
    </>
  );
}
