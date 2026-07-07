import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh md:h-screen md:overflow-hidden">
      <Header />
      <div className="flex flex-1 md:min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto bg-canvas pb-16 md:pb-0">
          <div className="p-4 max-w-[1500px] mx-auto w-full md:h-full">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
