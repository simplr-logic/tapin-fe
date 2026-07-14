import AppShell from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh lg:h-screen lg:overflow-hidden">
      <AppShell>{children}</AppShell>
    </div>
  );
}
