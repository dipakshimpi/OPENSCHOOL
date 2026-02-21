"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    AcademicCapIcon,
    VideoCameraIcon,
    CalendarIcon,
    ChartBarIcon,
    ClockIcon,
    SparklesIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AnnouncementsWidget } from "@/components/common/AnnouncementsWidget";
import { motion } from "framer-motion";

interface EnrolledCourse {
    id: string;
    progress: number;
    courses: {
        id: string;
        title: string;
        thumbnail_url?: string;
        profiles: { full_name: string } | null;
    }
}

interface TimetableSlot {
    id: string;
    class_grade: string;
    section: string;
    subject: string;
    period_number: number;
    start_time: string;
    end_time: string;
    teacher: { full_name: string } | null;
}

interface DashboardData {
    fullName: string;
    enrolledCourses: EnrolledCourse[];
    stats: {
        enrolledCount: number;
        avgProgress: number;
        attendanceRate?: number;
    };
    upcomingClasses: TimetableSlot[];
}

import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

export default function StudentDashboard() {
    const { status } = useSession();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            setError("Authentication required.");
            setLoading(false);
            return;
        }

        if (status === "authenticated") {
            fetchStats();
        }
    }, [status]);

    async function fetchStats() {
        setLoading(true);
        setError(null);
        try {
            const res = await authedFetch("/api/stats");
            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.error || `Failed to fetch stats: ${res.statusText}`);
            }
            const json = await res.json();
            setData(json);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            console.error("Stats fetch error:", errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const courses = data?.enrolledCourses || [];
    const stats = data?.stats || { enrolledCount: 0, avgProgress: 0, attendanceRate: 100 };
    const firstName = data?.fullName?.split(" ")[0] || "Student";

    return (
        <DashboardLayout role="student" title="Student Hub">
            <div className="max-w-7xl mx-auto space-y-8 pb-12">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[2rem] overflow-hidden bg-slate-900 text-white p-8 md:p-12 shadow-2xl border border-slate-800"
                >
                    <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-2 px-4 py-1.5 rounded-full font-bold tracking-wide backdrop-blur-md">
                                <SparklesIcon className="w-4 h-4 mr-2 inline" />
                                ACADEMIC YEAR 2026
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                {loading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-10 w-64 bg-slate-800" />
                                        <Skeleton className="h-10 w-48 bg-slate-800" />
                                    </div>
                                ) : (
                                    <>Welcome back, <br /><span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{firstName}!</span></>
                                )}
                            </h2>
                            {!loading && !error && (
                                <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                                    You&apos;ve completed <span className="text-white font-bold">{stats.avgProgress}%</span> of your journey this term.
                                    Your next lesson starts in <span className="text-indigo-400 font-bold underline underline-offset-4">45 minutes</span>.
                                </p>
                            )}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link href="/student/courses">
                                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                                        <AcademicCapIcon className="w-5 h-5 mr-2" />
                                        Enter Classroom
                                    </Button>
                                </Link>
                                <Link href="/student/classes">
                                    <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 font-black px-8 rounded-2xl transition-all">
                                        <CalendarIcon className="w-5 h-5 mr-2 text-indigo-400" />
                                        View Schedule
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[1.5rem] shadow-sm">
                                <ChartBarIcon className="w-8 h-8 text-emerald-400 mb-4" />
                                <div className="text-3xl font-black">{stats.avgProgress}%</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">GPA Target</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[1.5rem] shadow-sm">
                                <ClockIcon className="w-8 h-8 text-indigo-400 mb-4" />
                                <div className="text-3xl font-black">{stats.attendanceRate}%</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Attendance</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                </motion.div>

                {/* 🔥 TODAY'S SCHEDULE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-glow" />
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">Today&apos;s Schedule</h3>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-[1.5rem]" />)}
                        </div>
                    ) : data?.upcomingClasses && data.upcomingClasses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {data.upcomingClasses.map((slot, idx) => (
                                <motion.div
                                    key={slot.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div className="relative border-none shadow-lg hover:shadow-xl transition-all rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden group">
                                        <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 -translate-y-8 translate-x-8 rounded-full ${slot.period_number <= 2 ? 'bg-indigo-500' : 'bg-purple-500'}`} />
                                        <div className="p-5 flex items-center gap-4">
                                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-500/20 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300">
                                                <span className="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest group-hover:text-white transition-colors">Period</span>
                                                <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400 group-hover:text-white transition-colors">{slot.period_number}</span>
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-black text-slate-800 dark:text-white truncate text-lg leading-tight">{slot.subject}</h4>
                                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 truncate">
                                                    with {slot.teacher?.full_name || "Assigned Teacher"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-black text-[9px] px-2">
                                                        {slot.start_time || "N/A"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 text-center">
                            <ClockIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-bold">No classes scheduled for today.</p>
                        </div>
                    )}
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-glow" />
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Active Courses</h3>
                            </div>
                            <Link href="/student/courses">
                                <span className="text-sm font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest cursor-pointer">View All</span>
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {loading ? (
                                [1, 2].map(i => <Skeleton key={i} className="h-[280px] rounded-[2rem]" />)
                            ) : error ? (
                                <div className="col-span-full py-16 text-center bg-rose-50 dark:bg-rose-950/20 rounded-[2rem] border-2 border-dashed border-rose-100 dark:border-rose-900/50">
                                    <p className="text-rose-600 dark:text-rose-400 font-bold text-lg mb-2">Sync Error</p>
                                    <p className="text-rose-400 text-sm">{error}</p>
                                </div>
                            ) : courses.length > 0 ? (
                                courses.slice(0, 4).map((enrollment, idx) => {
                                    const course = enrollment.courses;
                                    return (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Link href={`/student/courses/${course.id}`}>
                                                <Card className="border-none shadow-xl hover:shadow-2xl transition-all group rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                    <div className="h-32 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                                        {course.thumbnail_url ? (
                                                            <div
                                                                className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                                                                style={{ backgroundImage: `url(${course.thumbnail_url})` }}
                                                                aria-label={course.title}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                                                <AcademicCapIcon className="w-12 h-12 text-indigo-300" />
                                                            </div>
                                                        )}
                                                        <Badge className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur shadow-sm border-none font-bold">
                                                            {course.profiles?.full_name || "Instructor"}
                                                        </Badge>
                                                    </div>
                                                    <CardContent className="p-6">
                                                        <h4 className="font-black text-xl text-slate-800 dark:text-white mb-6 line-clamp-1">{course.title}</h4>
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                    <span>Learning Progress</span>
                                                                    <span className="text-indigo-600">{enrollment.progress}%</span>
                                                                </div>
                                                                <Progress value={enrollment.progress} className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 [&>div]:bg-indigo-600" />
                                                            </div>
                                                            <div className="pt-2 flex items-center gap-2 font-black text-xs text-indigo-500 group-hover:gap-4 transition-all uppercase tracking-widest">
                                                                Resume Lesson <SparklesIcon className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <SparklesIcon className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">No Active Courses</h3>
                                    <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">You haven&apos;t enrolled in any courses yet. Start your journey today!</p>
                                    <Link href="/student/courses">
                                        <Button className="bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl font-bold">Browse Catalog</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-purple-600 rounded-full shadow-glow" />
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Announcements</h3>
                        </div>

                        <div className="space-y-4">
                            <AnnouncementsWidget />
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="relative z-10 space-y-6">
                                <h4 className="text-2xl font-black leading-tight">Video Library</h4>
                                <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">
                                    Access over 200+ recorded lessons from top instructors across the globe.
                                </p>
                                <Link href="/student/videos">
                                    <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl h-14 font-black shadow-lg">
                                        <VideoCameraIcon className="w-5 h-5 mr-2" />
                                        Watch Lessons
                                    </Button>
                                </Link>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
