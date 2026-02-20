import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenSchool LMS",
  description: "Modern open-source school management system",
};

import { SessionProvider } from "@/components/providers/SessionProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
