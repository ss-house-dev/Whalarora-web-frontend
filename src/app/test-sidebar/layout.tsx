import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="w-full h-20 bg-red-200 fixed z-20">Test</div>
      {/* <NavbarContainer /> */}
      <AppSidebar />
      <main>
        {/* <SidebarTrigger /> */}
        <p>Test</p>

        {children}
      </main>
    </SidebarProvider>
  );
}
