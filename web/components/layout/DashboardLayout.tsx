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

import { authedFetch } from "@/lib/api";

export function DashboardLayout({ children, role, title = "Dashboard" }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileData, setProfileData] = useState<{
    is_approved: boolean;
    is_admin_approved?: boolean;
    is_teacher_approved?: boolean;
    grade_level: string | null;
    section: string | null;
    role: string
  } | null>(null);

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
      console.log("[DashboardLayout] Checking user status for role:", role);
      try {
        // 1. Fetch Profile Status (Approval & Class)
        const profileRes = await authedFetch(`/api/profile?intendedRole=${role}`);
        console.log("[DashboardLayout] Profile fetch status:", profileRes.status);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setProfileData(profile);
          console.log("[DashboardLayout] Profile data loaded, role:", profile.role, "approved:", profile.is_approved);
        } else {
          console.warn("[DashboardLayout] Profile fetch failed, status:", profileRes.status);
        }


      } catch (err) {
        console.error("[DashboardLayout] Status check error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkStatus();
  }, [role, pathname]);

  // Logic for different lock states (BYPASSED FOR TESTING)
  const isUnapproved = false;
  const isMissingAssignment = false;
  const showAttendanceLock = false;

  return (
    <div className="min-h-screen bg-background flex font-sans selection:bg-primary/20 selection:text-primary">
      <Sidebar role={role} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative">
        {/* Gradient Grid Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(229,231,235,0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(229,231,235,0.5) 1px, transparent 1px),
              radial-gradient(circle 600px at 0% 0%, rgba(139,92,246,0.15), transparent),
              radial-gradient(circle 600px at 100% 100%, rgba(59,130,246,0.12), transparent)
            `,
            backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
          }}
        />
        {/* Dark mode overlay - hides grid in dark mode */}
        <div
          className="absolute inset-0 z-0 pointer-events-none hidden dark:block"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(30,30,40,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(30,30,40,0.3) 1px, transparent 1px),
              radial-gradient(circle 600px at 0% 0%, rgba(139,92,246,0.08), transparent),
              radial-gradient(circle 600px at 100% 100%, rgba(59,130,246,0.06), transparent)
            `,
            backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
          }}
        />

        <div className="relative z-10 flex-1 flex flex-col">
          <UrgentNotice />
          <Header title={title} />
          <main className="flex-1 p-6 md:p-8 xl:p-10 overflow-y-auto custom-scrollbar">
            <div className="max-w-[1600px] mx-auto space-y-8">
              {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : isUnapproved ? (
              <div className="fixed inset-0 z-[60] ml-64 bg-background/80 backdrop-blur-md flex items-center justify-center p-8">
                <Card className="max-w-md w-full border-2 border-border shadow-2xl rounded-3xl overflow-hidden bg-card text-card-foreground">
                  <div className="h-2 bg-orange-500" />
                  <CardContent className="p-10 text-center space-y-8">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-600">
                      <ShieldCheck className="w-10 h-10 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-black text-card-foreground">
                        {role === 'student' && !profileData?.is_admin_approved ? "Admin Verification Pending" :
                          role === 'student' && !profileData?.is_teacher_approved ? "Teacher Approval Pending" :
                            "Approval Pending"}
                      </h2>
                      <p className="text-muted-foreground text-sm font-medium">
                        {role === 'student' && !profileData?.is_admin_approved
                          ? "Welcome! Your registration is being verified by the school administration. This is the first step of your onboarding."
                          : role === 'student' && !profileData?.is_teacher_approved
                            ? "Great news! Admin has verified you. Now, your assigned Class Teacher just needs to approve your dashboard access."
                            : "Welcome to OpenSchool! Your account is currently under review by the administration. You will receive access once your credentials are verified."
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl text-orange-700 text-xs font-bold uppercase tracking-widest leading-6">
                      Status: {role === 'student' && profileData?.is_admin_approved ? "Admin Verified ✓" : "Waiting for Admin"} <br />
                      {role === 'student' && <span>Onboarding: {profileData?.is_admin_approved ? "Step 2 of 2" : "Step 1 of 2"}</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : isMissingAssignment ? (
              <div className="fixed inset-0 z-[60] ml-64 bg-background/80 backdrop-blur-md flex items-center justify-center p-8">
                <Card className="max-w-md w-full border-2 border-border shadow-2xl rounded-3xl overflow-hidden bg-card text-card-foreground">
                  <div className="h-2 bg-primary" />
                  <CardContent className="p-10 text-center space-y-8">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                      <MapPin className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-black text-card-foreground">Class Assignment Required</h2>
                      <p className="text-muted-foreground text-sm font-medium">
                        Your account is approved, but you haven&apos;t been assigned to a Class or Section yet. Please contact your administrator to complete your setup.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : showAttendanceLock ? (
              <div className="fixed inset-0 z-[60] ml-64 bg-background/80 backdrop-blur-md flex items-center justify-center p-8">
                <Card className="max-w-md w-full border-2 border-border shadow-2xl rounded-3xl overflow-hidden bg-card text-card-foreground scale-100">
                  <div className="h-2 bg-gradient-to-r from-primary to-primary/80" />
                  <CardContent className="p-10 text-center space-y-8">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                      <MapPin className="w-10 h-10 animate-bounce" />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-2xl font-black text-card-foreground tracking-tight">Geo-Verification Required</h2>
                      <p className="text-muted-foreground text-sm font-medium leading-relaxed">
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

                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
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
    </div>
  );
}

