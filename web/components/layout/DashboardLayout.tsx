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
  const [profileData, setProfileData] = useState<{ is_approved: boolean; grade_level: string | null; section: string | null } | null>(null);
  const [hasAttended, setHasAttended] = useState<boolean | null>(
    role !== "teacher" || pathname === "/teacher/attendance" ? true : null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [prevPath, setPrevPath] = useState(pathname);
  const [prevRole, setPrevRole] = useState(role);

  // Sync state if role or path changes
  if (pathname !== prevPath || role !== prevRole) {
    setPrevPath(pathname);
    setPrevRole(role);
    setIsLoading(true);
  }

  useEffect(() => {
    async function checkStatus() {
      try {
        // 1. Fetch Profile Status (Approval & Class)
        const profileRes = await fetch("/api/profile");
        const profile = await profileRes.json();
        setProfileData(profile);

        // 2. Fetch Attendance for Teachers
        if (role === "teacher" && pathname !== "/teacher/attendance") {
          const attRes = await fetch("/api/attendance");
          const attData = await attRes.json();
          setHasAttended(attData.hasAttended);
        } else {
          setHasAttended(true);
        }
      } catch (err) {
        console.error("Dashboard status check failed", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkStatus();
  }, [role, pathname]);

  // Logic for different lock states
  const isUnapproved = profileData && role !== "admin" && !profileData.is_approved;
  const isMissingAssignment = role === "student" && profileData?.is_approved && (!profileData.grade_level || !profileData.section);
  const showAttendanceLock = role === "teacher" && hasAttended === false && pathname !== "/teacher/attendance";

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
            ) : isUnapproved ? (
              <div className="fixed inset-0 z-[60] ml-64 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-8">
                <Card className="max-w-md w-full border-2 border-orange-100 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="h-2 bg-orange-500" />
                  <CardContent className="p-10 text-center space-y-8">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-600">
                      <ShieldCheck className="w-10 h-10 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-black text-slate-900">Approval Pending</h2>
                      <p className="text-slate-500 text-sm font-medium">
                        Welcome to OpenSchool! Your account is currently under review by the administration. You will receive access once your credentials are verified.
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl text-orange-700 text-xs font-bold uppercase tracking-widest">
                      Expected Wait: 12-24 Hours
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : isMissingAssignment ? (
              <div className="fixed inset-0 z-[60] ml-64 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-8">
                <Card className="max-w-md w-full border-2 border-indigo-100 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="h-2 bg-indigo-500" />
                  <CardContent className="p-10 text-center space-y-8">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                      <MapPin className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-black text-slate-900">Class Assignment Required</h2>
                      <p className="text-slate-500 text-sm font-medium">
                        Your account is approved, but you haven&apos;t been assigned to a Class or Section yet. Please contact your administrator to complete your setup.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : showAttendanceLock ? (
              <div className="fixed inset-0 z-[60] ml-64 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-8">
                <Card className="max-w-md w-full border-2 border-indigo-100 dark:border-indigo-900/30 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900 scale-100">
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

