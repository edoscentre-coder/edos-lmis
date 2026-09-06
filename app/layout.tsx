import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SwUpdateBanner } from "@/components/sw-update-banner";

export const metadata: Metadata = {
  title: "EDOS LMIS",
  description: "Laboratory Management Information System",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f6e5f",
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('edoslmis-theme');
    var theme = stored || 'dark';
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SwUpdateBanner />
        {children}
      </body>
    </html>
  );
}
