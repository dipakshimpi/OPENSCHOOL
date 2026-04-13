"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Plus,
    BookOpen,
    Users,
    TrendingUp,
    Calendar,
    Clock,
    CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

interface TimetableSlot {
    id: string;
    class_grade: string;
    section: string;
    subject: string;
    period_number: number;
    start_time: string;
    end_time: string;
}

interface TeacherStats {
    fullName: string;
    stats: {
        activeCourses: number;
        totalStudents: number;
        attendanceRate: number;
    };
    upcomingClasses: TimetableSlot[];
}

export default function TeacherDashboard() {
    const { status } = useSession();
    const [data, setData] = useState<TeacherStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status]);

    async function fetchData() {
        setLoading(true);
        try {
            const statsRes = await authedFetch("/api/stats");
            if (statsRes.ok) {
                setData(await statsRes.json());
            } else {
                console.error("Stats fetch failed");
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    const stats = data?.stats || { activeCourses: 0, totalStudents: 0, attendanceRate: 100 };
    const upcomingClasses = (data?.upcomingClasses && data.upcomingClasses.length > 0) ? data.upcomingClasses : [
        { id: "1", class_grade: "10", section: "A", subject: "Theoretical Physics", period_number: 1, start_time: "08:30", end_time: "09:30" },
        { id: "2", class_grade: "11", section: "B", subject: "Organic Chemistry", period_number: 2, start_time: "09:45", end_time: "10:45" },
        { id: "3", class_grade: "12", section: "C", subject: "Applied Calculus", period_number: 4, start_time: "11:30", end_time: "12:30" },
        { id: "4", class_grade: "9", section: "D", subject: "Literature Analysis", period_number: 5, start_time: "13:30", end_time: "14:30" }
    ];

    return (
        <DashboardLayout role="teacher" title="Teacher Dashboard">
            <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4">
                
                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Teacher Overview</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Managing {stats.activeCourses} active courses and {stats.totalStudents} students today.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/teacher/attendance">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 rounded-lg font-semibold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Daily Attendance
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 📊 KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-800/50">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Modules</p>
                           <div className="text-xl font-black">{stats.activeCourses}</div>
                        </div>
                    </Card>
                    <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Students</p>
                           <div className="text-xl font-black">{stats.totalStudents}</div>
                        </div>
                    </Card>
                    <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100 dark:border-amber-800/50">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Success Rate</p>
                           <div className="text-xl font-black">{stats.attendanceRate}%</div>
                        </div>
                    </Card>
                </div>

                {/* 📋 SESSIONS GRID */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Today&apos;s Sessions</h3>
                        <div className="h-[1px] flex-1 bg-slate-100 dark:bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)
                        ) : upcomingClasses && upcomingClasses.length > 0 ? (
                            upcomingClasses.map((slot, idx) => (
                                <motion.div
                                    key={slot.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white dark:bg-slate-900 rounded-2xl p-5 hover:shadow-md transition-all border border-transparent hover:border-indigo-500/10">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-white/5">
                                                P{slot.period_number}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{slot.start_time}</div>
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight truncate">{slot.subject}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Class {slot.class_grade}-{slot.section}</p>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest italic">No classes scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <Card className="lg:col-span-2 border border-slate-200 dark:border-white/5 shadow-sm bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl overflow-hidden p-8 md:p-10 relative group">
                        {/* Subtle background glow for the dark card */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-1.5">
                                <h3 className="text-xl font-black tracking-tight">Instructional Portal</h3>
                                <p className="text-indigo-200/50 text-[11px] font-bold uppercase tracking-widest">Access and manage your assigned educational modules.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link href="/teacher/classes">
                                    <Button className="w-full h-12 bg-white text-slate-900 hover:bg-slate-50 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] gap-2 shadow-lg shadow-white/5 border-none">
                                        <Calendar className="w-4 h-4" />
                                        Full Schedule
                                    </Button>
                                </Link>
                                <Link href="/teacher/attendance">
                                    <Button variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Record Attendance
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 hover:shadow-md transition-all">
                         <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 shadow-inner">
                             <Plus className="w-7 h-7" />
                         </div>
                         <div className="space-y-1.5">
                             <h4 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Create Module</h4>
                             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Design new curriculum nodes.</p>
                         </div>
                         <Link href="/teacher/courses/create" className="w-full">
                            <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase text-[9px] tracking-[0.2em] shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all">
                                Initialize Architect
                            </Button>
                         </Link>
                    </Card>
                </div>

            </div>
        </DashboardLayout>
    );
}
