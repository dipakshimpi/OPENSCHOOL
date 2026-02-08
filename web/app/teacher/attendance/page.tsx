"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { calculateDistance } from "@/lib/geo";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function TeacherAttendance() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const [loadingLegacy, setLoadingLegacy] = useState(true);
  const [attendanceTime, setAttendanceTime] = useState<string | null>(null);

  useEffect(() => {
    // Check if already attended today
    fetch("/api/attendance")
      .then(res => res.json())
      .then(data => {
        if (data.hasAttended) {
          setHasAttendedToday(true);
          setAttendanceTime(data.lastAttendance?.timestamp);
        }
      })
      .catch(err => console.error("Error checking attendance:", err))
      .finally(() => setLoadingLegacy(false));
  }, []);

  const handleVerifyAndSubmit = () => {
    setIsVerifying(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsVerifying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          // Check location against fences
          const fenceRes = await fetch("/api/geo-fences");
          const fences = await fenceRes.json();

          let inside = false;
          if (Array.isArray(fences) && fences.length > 0) {
            for (const fence of fences) {
              const dist = calculateDistance(latitude, longitude, fence.center_lat, fence.center_lng);
              if (dist <= fence.radius_meters) {
                inside = true;
                break;
              }
            }
          } else {
            // Demo mode/First school setup
            inside = true;
          }

          if (!inside) {
            setError("You are currently outside the school boundary. Please move within school premises.");
            setIsVerifying(false);
            return;
          }

          // Submit attendance
          const submitRes = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude,
              longitude,
              accuracy,
              deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform
              }
            })
          });

          if (submitRes.ok) {
            const data = await submitRes.json();
            setHasAttendedToday(true);
            setAttendanceTime(data.data.timestamp);
            // Brief delay then redirect to dashboard
            setTimeout(() => router.push("/teacher"), 2000);
          } else {
            const errData = await submitRes.json();
            setError(errData.error || "Failed to submit attendance");
          }
        } catch {
          setError("Failed to connect to the server. Please try again.");
        } finally {
          setIsVerifying(false);
        }
      },
      () => {
        setError("Location permission denied. Please enable GPS and allow location access.");
        setIsVerifying(false);
      },
      { enableHighAccuracy: true }
    );
  };

  if (loadingLegacy) {
    return (
      <DashboardLayout title="Attendance" role="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Daily Attendance" role="teacher">
      <div className="max-w-2xl mx-auto space-y-8 pb-20 mt-10">
        <AnimatePresence mode="wait">
          {hasAttendedToday ? (
            <motion.div
              key="attended"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-2xl bg-emerald-600 text-white overflow-hidden rounded-3xl">
                <CardContent className="p-12 text-center space-y-6 relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h2 className="text-4xl font-black">Attendance Marked!</h2>
                    <p className="text-emerald-100 font-medium opacity-90">
                      Your presence for today has been recorded.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 inline-block mx-auto">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                      <Clock className="w-4 h-4" />
                      Marked At
                    </div>
                    <div className="text-2xl font-black mt-1">
                      {attendanceTime ? new Date(attendanceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      onClick={() => router.push("/teacher")}
                      className="bg-white text-emerald-600 hover:bg-emerald-50 font-black px-10 h-14 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="not-attended"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
                <CardHeader className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                  <CardTitle className="text-3xl font-black text-slate-800 dark:text-white mb-2">Punch In</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Please verify your location to start your workday.</CardDescription>
                </CardHeader>
                <CardContent className="p-12 text-center space-y-10">
                  <div className="relative">
                    <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                      <MapPin className="w-16 h-16 animate-pulse" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-full animate-spin-slow" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-4 py-1.5 font-bold uppercase tracking-wider text-[10px]">Pending Verification</Badge>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                      Verify your identity and location within the school premises to access your teaching dashboard.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-rose-100 dark:border-rose-900/50">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleVerifyAndSubmit}
                    disabled={isVerifying}
                    className="w-full h-18 text-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 dark:shadow-none rounded-2xl transition-all hover:scale-[1.02] active:scale-95 group"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Scanning Location...
                      </>
                    ) : (
                      <span className="flex items-center gap-3 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6" /> Verify & Mark Attendance
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
    </DashboardLayout>
  );
}
