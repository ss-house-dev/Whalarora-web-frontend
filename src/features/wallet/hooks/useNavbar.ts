import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAddCashToTrade } from '@/features/wallet/hooks/useCreateCash';

export const useNavbar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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

      if (menuRef.current && !menuRef.current.contains(target)) {
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

  const toggleBalanceMenu = () => {
    setOpen((v) => !v);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen((v) => !v);
  };

  return {
    open,
    userMenuOpen,
    session,
    menuRef,
    mobileUserMenuRef,
    desktopUserMenuRef,
    handleSignOut,
    handleAddCash,
    handleLogoClick,
    handleSignInClick,
    handleSignUpClick,
    toggleBalanceMenu,
    toggleUserMenu,
    isAddingCash: addCashMutation.isPending,
  };
};
