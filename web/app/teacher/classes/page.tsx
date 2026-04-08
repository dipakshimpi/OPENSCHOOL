"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { 
    Calendar, 
    Clock, 
    BookOpen, 
    ShieldCheck
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { authedFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface TimetableSlot {
    id: string;
    period_number: number;
    subject: string;
    start_time: string;
    end_time: string;
    class_grade: string;
    section: string;
}

export default function FacultyClasses() {
    const { status } = useSession();
    const [classes, setClasses] = useState<TimetableSlot[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTodayClasses = useCallback(async () => {
        try {
            const res = await authedFetch("/api/teacher/today-classes");
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
            }
        } catch (error) {
            console.error("Schedule fetch error", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchTodayClasses();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status, fetchTodayClasses]);

    return (
        <DashboardLayout role="teacher" title="Faculty Schedule">
            <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4">
                
                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Schedule</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Review and manage your educational sessions for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.</p>
                    </div>
                </div>

                {/* 📊 CLEAN STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today&apos;s Sessions</p>
                           <div className="text-xl font-bold">{classes.length} Classes</div>
                        </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Institutional Role</p>
                           <div className="text-xl font-bold">Verified Faculty</div>
                        </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Module Status</p>
                           <div className="text-xl font-bold">Active</div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight italic uppercase">Timeline</h3>
                        <div className="h-[1px] flex-1 bg-slate-100 dark:bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-[2rem]" />)
                        ) : classes.length > 0 ? (
                            classes.map((cls, idx) => (
                                <motion.div
                                    key={cls.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all border border-transparent hover:border-indigo-500/10 group cursor-default">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-sm font-black text-indigo-600 border border-slate-100 dark:border-white/5 shadow-sm group-hover:scale-110 transition-transform">
                                                P{cls.period_number}
                                            </div>
                                            <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 border-none rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                                                Scheduled
                                            </Badge>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">{cls.subject}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Class {cls.class_grade}-{cls.section}</p>
                                        </div>
                                        <div className="mt-8 flex items-center gap-4 text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{cls.start_time} - {cls.end_time}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em]">No classes scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </div>
    );
}
