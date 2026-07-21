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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ProjectsProvider>
          <TimesheetProvider>{children}</TimesheetProvider>
        </ProjectsProvider>
      </body>
    </html>
  );
}
