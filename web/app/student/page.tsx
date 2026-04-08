"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    Clock,
    BarChart2,
    Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { authedFetch } from "@/lib/api";
import { AnnouncementsWidget } from "@/components/common/AnnouncementsWidget";
import { Skeleton } from "@/components/ui/skeleton";

interface Enrollment {
    progress: number;
    courses: {
        id: string;
        title: string;
        thumbnail_url?: string;
        profiles?: {
            full_name: string;
        };
    };
}

interface TimetableSlot {
    id: string;
    period_number: number;
    subject: string;
    start_time: string;
    teacher?: {
        full_name: string;
    };
}

interface DashboardData {
    fullName: string;
    stats: {
        enrolledCount: number;
        avgProgress: number;
        attendanceRate: number;
    };
    enrolledCourses: Enrollment[];
    upcomingClasses: TimetableSlot[];
}

export default function StudentDashboard() {
    const { status } = useSession();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "authenticated") {
            fetchStats();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status]);

    async function fetchStats() {
        setLoading(true);
        try {
            const res = await authedFetch("/api/stats");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("Stats fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    const courses = data?.enrolledCourses || [];
    const stats = data?.stats || { enrolledCount: 0, avgProgress: 0, attendanceRate: 100 };
    const upcomingClasses = (data?.upcomingClasses && data.upcomingClasses.length > 0) ? data.upcomingClasses : [
        { id: "1", period_number: 1, subject: "Advanced Mathematics", start_time: "08:30", teacher: { full_name: "Dr. Sarah Mitchell" } },
        { id: "2", period_number: 2, subject: "Quantum Physics", start_time: "09:45", teacher: { full_name: "Prof. James Wilson" } },
        { id: "3", period_number: 4, subject: "Modern History", start_time: "11:30", teacher: { full_name: "Ms. Helena Troy" } }
    ];
    const firstName = data?.fullName?.split(" ")[0] || "Learner";

    return (
        <DashboardLayout role="student" title="Student Dashboard">
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20">

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back, {firstName}</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">You have completed {stats.avgProgress}% of your syllabus across {courses.length} courses.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/student/courses">
                            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 rounded-lg font-semibold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Browse Courses
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-none shadow-lg bg-white dark:bg-slate-900 rounded-[2rem] p-6 hover:shadow-xl transition-shadow">
                        <CardContent className="p-0 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <BarChart2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Progress</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgProgress}%</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-white dark:bg-slate-900 rounded-[2rem] p-6 hover:shadow-xl transition-shadow">
                        <CardContent className="p-0 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Enrollments</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.enrolledCount} Courses</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-white dark:bg-slate-900 rounded-[2rem] p-6 hover:shadow-xl transition-shadow">
                        <CardContent className="p-0 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance Rate</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.attendanceRate}%</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Courses section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Courses</h3>
                            </div>
                            <Link href="/student/courses" className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">View All</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                [1, 2].map(i => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)
                            ) : courses.length > 0 ? (
                                courses.map((enrollment) => (
                                    <Link key={enrollment.courses.id} href={`/student/courses/${enrollment.courses.id}`}>
                                        <Card className="group relative h-48 border-none overflow-hidden rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                                            {enrollment.courses.thumbnail_url ? (
                                                <Image
                                                    src={enrollment.courses.thumbnail_url}
                                                    alt={enrollment.courses.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
                                            )}
                                            <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/40 transition-colors" />
                                            <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Curriculum Module</p>
                                                    <h4 className="text-lg font-bold leading-tight line-clamp-2 tracking-tight">{enrollment.courses.title}</h4>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-white transition-all duration-1000"
                                                        style={{ width: `${enrollment.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <Card className="p-10 border-none bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                                        <Sparkles className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active enrollments found.</p>
                                    <Link href="/student/courses">
                                        <Button variant="outline" className="rounded-xl border-indigo-200 text-indigo-600 font-bold">Start Learning</Button>
                                    </Link>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Sidebar components */}
                    <div className="space-y-10">
                        <AnnouncementsWidget />

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Class Schedule</h3>
                            </div>
                            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 space-y-6">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                                    </div>
                                ) : upcomingClasses && upcomingClasses.length > 0 ? (
                                    upcomingClasses.map((session) => (
                                        <div key={session.id} className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
                                                P{session.period_number}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{session.subject}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{session.start_time} • {session.teacher?.full_name}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center py-4">No sessions today</p>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
