"use client";

import { Suspense } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Admin Panel...</div>}>
      {children}
    </Suspense>
  );
}
