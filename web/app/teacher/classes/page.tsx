"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface TimetableSlot {
  id: string;
  class_grade: string;
  section: string;
  subject: string;
  period_number: number;
  start_time: string;
  end_time: string;
}

interface TimetableSlotWithDay extends TimetableSlot {
  day_of_week: string;
}

const ClassItem = ({ slot }: { slot: TimetableSlot }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-5">
        <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <GraduationCap className="h-7 w-7" />
        </div>
        <div>
          <h4 className="font-black text-slate-900 text-lg">{slot.subject}</h4>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-600">
              Class {slot.class_grade}-{slot.section}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Period {slot.period_number} • {slot.start_time || "N/A"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
        <Link href={`/teacher/attendance?grade=${slot.class_grade}&section=${slot.section}`} className="w-full md:w-auto">
          <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest px-6 h-11 rounded-xl shadow-lg shadow-indigo-100">
            Take Attendance
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default function TeacherClasses() {
  const { data: session, status } = useSession();
  const [classes, setClasses] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchTodayClasses = async () => {
      if (status !== "authenticated" || !session?.user?.id) return;

      try {
        setLoading(true);
        const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
        const res = await fetch(`/api/timetable?teacher_id=${session.user.id}`);

        if (!res.ok) throw new Error("Failed to fetch schedule.");

        const data: TimetableSlotWithDay[] = await res.json();
        const todayData = data.filter(slot => slot.day_of_week === today);

        setClasses(todayData.sort((a, b) => a.period_number - b.period_number));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchTodayClasses();
  }, [session, status]);

  return (
    <DashboardLayout title="My Classes" role="teacher">
      <div className="max-w-5xl mx-auto space-y-8 mt-6">
        {/* PAGE HEADER */}
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-indigo-600 rounded-full shadow-glow" />
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Today&apos;s Sessions</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* CLASSES LIST */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Scheduled Periods</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {loading ? (
                <>
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </>
              ) : error ? (
                <div className="text-center py-12 text-rose-600 bg-rose-50 rounded-3xl border-2 border-dashed border-rose-100">
                  <p className="font-bold">Error: {error}</p>
                </div>
              ) : classes.length > 0 ? (
                classes.map((slot) => <ClassItem key={slot.id} slot={slot} />)
              ) : (
                <div className="text-center py-20 text-slate-400 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No classes scheduled for today.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
