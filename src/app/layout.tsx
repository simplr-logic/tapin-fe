import Script from "next/script";
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
        {/* Sets palette/font attributes before paint, same reasoning as
            next-themes' own inline script for the .dark class — avoids a
            flash of the default theme on load. next/script's
            beforeInteractive strategy (not a raw <script> tag — React 19
            warns and never executes inline <script> JSX) is the supported
            way to run this ahead of hydration. */}
        <Script id="appearance-boot" strategy="beforeInteractive">
          {`try{var d=document.documentElement,l=localStorage;d.setAttribute('data-palette',l.getItem('tapin:palette')||'garden');d.setAttribute('data-font',l.getItem('tapin:font')||'sans');d.setAttribute('data-font-size',l.getItem('tapin:font-size')||'comfortable')}catch(e){}`}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProjectsProvider>
            <TimesheetProvider>{children}</TimesheetProvider>
          </ProjectsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
