import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAddCashToTrade } from '@/features/wallet/hooks/useCreateCash';

export const useNavbar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mobileBalanceMenuRef = useRef<HTMLDivElement>(null);
  const desktopBalanceMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const desktopUserMenuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const addCashMutation = useAddCashToTrade({
    onSuccess: (data) => {
      console.log('Updated balance:', data);
    },
    onError: (error) => {
      console.error('Deposit error:', error.message);
    },
  });

  // Handle click outside and escape key
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;

      const clickedInsideBalanceMenu =
        (mobileBalanceMenuRef.current && mobileBalanceMenuRef.current.contains(target)) ||
        (desktopBalanceMenuRef.current && desktopBalanceMenuRef.current.contains(target));

      if (!clickedInsideBalanceMenu) {
        setOpen(false);
      }

      const clickedInsideUserMenu =
        (mobileUserMenuRef.current && mobileUserMenuRef.current.contains(target)) ||
        (desktopUserMenuRef.current && desktopUserMenuRef.current.contains(target));

      if (!clickedInsideUserMenu) {
        setUserMenuOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleSignOut = () => {
    signOut({
      redirect: false,
    }).then(() => {
      setUserMenuOpen(false);
    });
  };

  const handleAddCash = () => {
    addCashMutation.mutate();
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleSignInClick = () => {
    router.push('/auth/sign-in');
  };

  const handleSignUpClick = () => {
    router.push('/auth/sign-up');
  };

  const closeDrawers = () => {
    if (typeof window === 'undefined') {
      return;
    }
    window.dispatchEvent(new Event('auth-drawer:close'));
    window.dispatchEvent(new Event('guest-drawer:close'));
  };

  useEffect(() => {
    if (open) {
      closeDrawers();
    }
  }, [open]);

  const toggleBalanceMenu = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const closeBalanceMenu = () => {
    setOpen(false);
  };

  const toggleUserMenu = () => {
    closeDrawers();
    setUserMenuOpen((v) => !v);
  };

  return {
    open,
    userMenuOpen,
    session,
    mobileBalanceMenuRef,
    desktopBalanceMenuRef,
    mobileUserMenuRef,
    desktopUserMenuRef,
    handleSignOut,
    handleAddCash,
    handleLogoClick,
    handleSignInClick,
    handleSignUpClick,
    toggleBalanceMenu,
    closeBalanceMenu,
    toggleUserMenu,
    isAddingCash: addCashMutation.isPending,
  };
};
