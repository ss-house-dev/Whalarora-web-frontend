'use client';
import { NavbarUI } from '@/components/Navbar';
import { useNavbar } from '@/features/wallet/hooks/useNavbar';

export default function NavbarContainer() {
  const navbarProps = useNavbar();

  return <NavbarUI {...navbarProps} />;
}
