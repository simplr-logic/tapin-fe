import AuthProvider from "@/components/providers/AuthProvider";
import { ProjectsProvider } from "@/components/providers/ProjectsProvider";
import { TimesheetProvider } from "@/components/providers/TimesheetProvider";
import { APP_NAME } from "@/config/constants";

import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: APP_NAME,
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
          <ProjectsProvider>
            <TimesheetProvider>{children}</TimesheetProvider>
          </ProjectsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
