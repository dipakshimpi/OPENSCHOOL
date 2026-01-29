"use client";

import { Suspense } from "react";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { dataProvider } from "@refinedev/supabase";
import { supabaseClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading Admin Panel...</div>}>
      <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider(supabaseClient)}
        resources={[
          {
            name: "courses",
            list: "/admin/courses",
          },
        ]}
      >
        {children}
      </Refine>
    </Suspense>
  );
}
