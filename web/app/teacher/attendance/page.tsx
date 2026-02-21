"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { calculateDistance } from "@/lib/geo";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { authedFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function TeacherAttendance() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const [loadingLegacy, setLoadingLegacy] = useState(true);
  const [attendanceTime, setAttendanceTime] = useState<string | null>(null);

  useEffect(() => {
    // Check if already attended today
    authedFetch("/api/attendance")
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
          const fenceRes = await authedFetch("/api/geo-fences");
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
          const submitRes = await authedFetch("/api/attendance", {
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

  interface Student {
    id: string;
    full_name: string;
    email: string;
    status: 'present' | 'absent' | 'pending';
  }

  const [studentSyncing, setStudentSyncing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const GRADES = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const SECTIONS = ["A", "B", "C", "D", "E"];

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await authedFetch(`/api/teacher/students-by-class?grade=${selectedGrade}&section=${selectedSection}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedGrade, selectedSection]);

  useEffect(() => {
    if (hasAttendedToday && selectedGrade && selectedSection) {
      fetchStudents();
    }
  }, [hasAttendedToday, selectedGrade, selectedSection, fetchStudents]);

  const toggleStudentStatus = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const nextStatus = s.status === 'present' ? 'absent' : 'present';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const saveStudentAttendance = async () => {
    setStudentSyncing(true);
    try {
      const attendanceData = students
        .filter(s => s.status !== 'pending')
        .map(s => ({ id: s.id, present: s.status === 'present' }));

      const res = await authedFetch("/api/attendance/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeLevel: selectedGrade,
          section: selectedSection,
          students: attendanceData
        })
      });

      if (res.ok) {
        alert("Attendance records synchronized successfully!");
      } else {
        alert("Failed to sync records.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving attendance.");
    } finally {
      setStudentSyncing(false);
    }
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
      <div className="max-w-4xl mx-auto space-y-8 pb-20 mt-10 px-4">
        <AnimatePresence mode="wait">
          {hasAttendedToday ? (
            <motion.div
              key="attended"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Status Card */}
                <Card className="flex-1 border-none shadow-2xl bg-emerald-600 text-white overflow-hidden rounded-3xl h-fit">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black">Verified!</h2>
                      <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest opacity-80">
                        {attendanceTime ? new Date(attendanceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Class Selection Card */}
                <Card className="flex-[2] border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-black uppercase tracking-tighter">Student Roll Call</CardTitle>
                    <CardDescription>Select class to start marking students</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Class</label>
                        <select
                          className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 font-bold text-sm outline-none focus:border-indigo-600 appearance-none"
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                        >
                          <option value="">Select Grade</option>
                          {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Section</label>
                        <select
                          className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 font-bold text-sm outline-none focus:border-indigo-600 appearance-none"
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                        >
                          <option value="">Select Section</option>
                          {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Students List */}
              <AnimatePresence>
                {(selectedGrade && selectedSection) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-800">Student List: {selectedGrade}-{selectedSection}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{students.length} Enlisted</p>
                    </div>

                    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md">
                      <CardContent className="p-0">
                        {loadingStudents ? (
                          <div className="p-12 text-center flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Synchronizing Registry...</p>
                          </div>
                        ) : students.length > 0 ? (
                          <>
                            <div className="divide-y divide-slate-50">
                              {students.map((student) => (
                                <div key={student.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600">
                                      {student.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{student.full_name}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => toggleStudentStatus(student.id)}
                                      className={cn(
                                        "h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                        student.status === 'present'
                                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
                                          : student.status === 'absent'
                                            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-100"
                                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                      )}
                                    >
                                      {student.status === 'present' ? 'Present' : student.status === 'absent' ? 'Absent' : 'Not Marked'}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                              <Button
                                onClick={saveStudentAttendance}
                                disabled={studentSyncing}
                                className="bg-slate-900 hover:bg-black text-white px-10 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2"
                              >
                                {studentSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Roll Call"}
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="p-20 text-center space-y-4">
                            <UsersIcon className="w-12 h-12 text-slate-200 mx-auto" strokeWidth={3} />
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No students found in this section.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  <CardTitle className="text-3xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter italic">Security Punch-In</CardTitle>
                  <CardDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest">Verify your location to unlock student roll-call.</CardDescription>
                </CardHeader>
                <CardContent className="p-12 text-center space-y-10">
                  <div className="relative">
                    <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                      <MapPin className="w-16 h-16 animate-pulse" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-full animate-spin-slow" />
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
                    className="w-full h-20 text-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 dark:shadow-none rounded-3xl transition-all hover:scale-[1.02] active:scale-95 group uppercase tracking-tighter"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <span className="flex items-center gap-3 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-8 h-8" strokeWidth={3} /> Verify & Unlock
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

function UsersIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M23 7a4 4 0 0 0-4-4 4 4 0 0 0-1.55.3" />
    </svg>
  )
}

