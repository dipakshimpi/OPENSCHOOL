import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenSchool LMS",
  description: "Modern open-source school management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
