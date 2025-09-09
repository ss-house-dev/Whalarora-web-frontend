import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import NavbarContainer from "@/features/wallet/containers/NavbarContainer";

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
