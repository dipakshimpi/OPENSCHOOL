"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Scan,
  ShieldCheck
} from "lucide-react";
import { Suspense, useState, useEffect, useCallback } from "react";
import { calculateDistance } from "@/lib/geo";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { authedFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function TeacherAttendancePage() {
  return (
    <Suspense fallback={
      <DashboardLayout title="Attendance" role="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    }>
      <TeacherAttendance />
    </Suspense>
  );
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  status: 'present' | 'absent' | 'pending';
}

function TeacherAttendance() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState<string | null>(null);
  const [loadingLegacy, setLoadingLegacy] = useState(true);

  useEffect(() => {
    authedFetch("/api/attendance")
      .then((res) => res.json())
      .then((data: { hasAttended: boolean; lastAttendance?: { timestamp: string } }) => {
        if (data.hasAttended) {
          setHasAttendedToday(true);
          setAttendanceTime(data.lastAttendance?.timestamp || null);
        }
      })
      .catch((err) => console.error("Error checking attendance:", err))
      .finally(() => setLoadingLegacy(false));
  }, []);

  const handleVerifyAndSubmit = () => {
    setIsVerifying(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsVerifying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
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
            inside = true;
          }

          if (!inside) {
            setError("You are currently outside the school campus.");
            setIsVerifying(false);
            return;
          }

          const submitRes = await authedFetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude,
              longitude,
              accuracy,
              deviceInfo: { userAgent: navigator.userAgent, platform: navigator.platform }
            })
          });

          if (submitRes.ok) {
            const data = await submitRes.json();
            setHasAttendedToday(true);
            setAttendanceTime(data.data.timestamp);
          } else {
            const errData = await submitRes.json();
            setError(errData.error || "Failed to record attendance.");
          }
        } catch {
          setError("Network error. Please try again.");
        } finally {
          setIsVerifying(false);
        }
      },
      () => {
        setError("Location access denied.");
        setIsVerifying(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const [studentSyncing, setStudentSyncing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(searchParams.get('grade') || "");
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || "");
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

  const toggleStudentStatus = (studentId: string, current: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, status: current === 'present' ? 'absent' : 'present' };
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
          router.push('/teacher');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStudentSyncing(false);
    }
  };

  if (loadingLegacy) {
    return (
      <DashboardLayout title="Attendance" role="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Attendance" role="teacher">
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20 px-4">
        
        {/* 🌟 CLEAN HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Attendance</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Record and track student participation in scheduled educational sessions.</p>
            </div>
            {hasAttendedToday ? (
               <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                     Punch-in Recorded: {attendanceTime ? new Date(attendanceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "ACTIVE"}
                  </span>
               </div>
            ) : (
               <Button 
                   onClick={handleVerifyAndSubmit} 
                   disabled={isVerifying}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 shadow-lg active:scale-95 transition-all"
               >
                   {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                   Mark My Attendance
               </Button>
            )}
        </div>

        <AnimatePresence mode="wait">
          {hasAttendedToday ? (
            <motion.div
              key="attended"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-3xl p-8">
                 <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Class Grade</p>
                        <select
                          className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-950 px-4 font-bold text-xs outline-none border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-indigo-600/20"
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                        >
                          <option value="">SELECT GRADE</option>
                          {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Section</p>
                        <select
                          className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-950 px-4 font-bold text-xs outline-none border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-indigo-600/20"
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                        >
                          <option value="">SELECT SECTION</option>
                          {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                 </div>
              </Card>

              {selectedGrade && selectedSection && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight italic uppercase">Student Roster</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{students.length} Total Nodes</p>
                    </div>

                    <Card className="border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl overflow-hidden border border-white dark:border-white/5">
                        {loadingStudents ? (
                          <div className="p-20 text-center flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500/30" />
                            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Loading registry...</p>
                          </div>
                        ) : students.length > 0 ? (
                          <div className="p-6 md:p-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleStudentStatus(student.id, student.status)}
                                        className={cn(
                                            "p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border-2 select-none",
                                            student.status === 'present' 
                                                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20 shadow-sm" 
                                                : student.status === 'absent'
                                                    ? "bg-rose-50 dark:bg-rose-950/20 border-rose-500/20 shadow-sm"
                                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                                                student.status === 'present' ? "bg-emerald-600 text-white shadow-xl" : student.status === 'absent' ? "bg-rose-600 text-white shadow-xl" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}>
                                                {student.full_name?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{student.full_name}</p>
                                                <p className="text-[9px] text-slate-400 truncate">{student.email}</p>
                                            </div>
                                        </div>
                                        {student.status !== 'pending' && (
                                            student.status === 'present' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />
                                        )}
                                    </div>
                                ))}
                             </div>

                             <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-950/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100 dark:border-white/5">
                                 <div className="flex gap-10">
                                     <div className="flex flex-col">
                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Present Units</span>
                                         <span className="text-xl font-bold text-emerald-600 tracking-tight">{students.filter(s => s.status === 'present').length}</span>
                                     </div>
                                     <div className="flex flex-col">
                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Absent Units</span>
                                         <span className="text-xl font-bold text-rose-600 tracking-tight">{students.filter(s => s.status === 'absent').length}</span>
                                     </div>
                                 </div>
                                 <Button 
                                     onClick={saveStudentAttendance}
                                     disabled={studentSyncing}
                                     className="w-full md:w-auto bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white h-12 px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-3 shadow-lg transition-all"
                                 >
                                     {studentSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                     Submit Registry
                                 </Button>
                             </div>
                          </div>
                        ) : (
                          <div className="p-20 text-center">
                             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-[9px]">Select a class to view roster.</p>
                          </div>
                        )}
                    </Card>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="not-attended"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 flex flex-col items-center justify-center text-center space-y-6"
            >
               <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300">
                   <Scan className="w-10 h-10" />
               </div>
               <div className="space-y-1">
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Check-in Required</h2>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Please verify your location on campus to record attendance.</p>
               </div>
               <Button 
                   onClick={handleVerifyAndSubmit} 
                   disabled={isVerifying}
                   size="lg"
                   className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-10 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-xl group transition-all"
               >
                   {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                   Mark My Attendance
               </Button>
               {error && (
                 <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-4 bg-rose-50 dark:bg-rose-950/20 px-4 py-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                   {error}
                 </p>
               )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
