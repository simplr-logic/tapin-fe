import { ThemeProvider } from "next-themes";

import { ProjectsProvider } from "@/components/providers/ProjectsProvider";
import { TimesheetProvider } from "@/components/providers/TimesheetProvider";
import { buildRootMetadata } from "@/lib/seo/metadata";

import "./globals.css";

export const metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProjectsProvider>
            <TimesheetProvider>{children}</TimesheetProvider>
          </ProjectsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
