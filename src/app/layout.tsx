import type { Metadata } from "next";
import AuthProvider from "@/components/providers/AuthProvider";
import { ProjectsProvider } from "@/components/providers/ProjectsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TapIn",
  description: "Time Tracker & Attendance Ledger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ProjectsProvider>{children}</ProjectsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
