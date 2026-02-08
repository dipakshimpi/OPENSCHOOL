"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { UrgentNotice } from "./UrgentNotice";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ShieldCheck, Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "teacher" | "student";
  title?: string;
}

export function DashboardLayout({ children, role, title = "Dashboard" }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasAttended, setHasAttended] = useState<boolean | null>(
    role !== "teacher" || pathname === "/teacher/attendance" ? true : null
  );
  const [isLoading, setIsLoading] = useState(
    role === "teacher" && pathname !== "/teacher/attendance"
  );
  const [prevPath, setPrevPath] = useState(pathname);
  const [prevRole, setPrevRole] = useState(role);

  // Sync state if role or path changes (React recommended pattern for state dependent on props)
  if (pathname !== prevPath || role !== prevRole) {
    setPrevPath(pathname);
    setPrevRole(role);
    if (role === "teacher" && pathname !== "/teacher/attendance") {
      setIsLoading(true);
      setHasAttended(null);
    } else {
      setIsLoading(false);
      setHasAttended(true);
    }
  }

  useEffect(() => {
    // Only fetch if we are a teacher, not on attendance page, and haven't checked yet
    if (role === "teacher" && pathname !== "/teacher/attendance" && hasAttended === null) {
      fetch("/api/attendance")
        .then(res => res.json())
        .then(data => {
          setHasAttended(data.hasAttended);
        })
        .catch(() => setHasAttended(false))
        .finally(() => setIsLoading(false));
    }
  }, [role, pathname, hasAttended]);

  // If teacher hasn't attended and is not on the attendance page, show the lock screen
  const showLock = role === "teacher" && hasAttended === false && pathname !== "/teacher/attendance";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      <Sidebar role={role} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <UrgentNotice />
        <Header title={title} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : showLock ? (
              <div className="fixed inset-0 z-[60] ml-64 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-8 transition-all duration-500 animate-in fade-in">
                <Card className="max-w-md w-full border-2 border-indigo-100 dark:border-indigo-900/30 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900 scale-100 hover:scale-[1.01] transition-transform">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
                  <CardContent className="p-10 text-center space-y-8">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                      <MapPin className="w-10 h-10 animate-bounce" />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Geo-Verification Required</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                        To maintain high-integrity attendance records, we require a quick location verification before you access the workspace.
                      </p>
                    </div>

                    <Button
                      onClick={() => router.push("/teacher/attendance")}
                      className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-xl shadow-indigo-200 dark:shadow-none rounded-2xl group transition-all"
                    >
                      <ShieldCheck className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Punch In Now
                    </Button>

                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Session Locked • Traditional Indian School Protocol
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

