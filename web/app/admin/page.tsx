"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    GraduationCap,
    AlertTriangle,
    ShieldCheck,
    BookOpen,
    Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { authedFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AdminStats {
    stats: {
        studentCount: number;
        teacherCount: number;
        courseCount: number;
        attendanceRate: number;
        pendingStudents: number;
        pendingTeachers: number;
    };
    recentActivity: Array<{
        user: string;
        action: string;
        target: string;
        time: string;
    }>;
}

export default function AdminDashboard() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [data, setData] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authStatus === "authenticated") {
            if (session?.user?.role !== 'admin') {
                router.push('/student');
                return;
            }
            fetchStats();
        } else if (authStatus === "unauthenticated") {
            setLoading(false);
        }
    }, [authStatus, session, router]);

    async function fetchStats() {
        try {
            const res = await authedFetch("/api/stats");
            const json = await res.json();
            if (res.ok) {
                setData(json);
            }
        } catch (err) {
            console.error("Stats sync error", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading || !data) {
        return (
            <DashboardLayout role="admin" title="Loading Dashboard">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[400px] rounded-3xl" />
                    <Skeleton className="h-[400px] rounded-3xl" />
                </div>
            </DashboardLayout>
        );
    }

    const statsConfig = [
        { label: "Total Students", value: data.stats.studentCount, alert: data.stats.pendingStudents, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Total Teachers", value: data.stats.teacherCount, alert: data.stats.pendingTeachers, icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        { label: "Active Courses", value: data.stats.courseCount, icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Attendance", value: data.stats.attendanceRate + "%", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    return (
        <DashboardLayout role="admin" title="Admin Dashboard">
            <div className="space-y-10 pb-20">

                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border pb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Overview</h1>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Monitor institutional performance and manage platform assets.</p>
                    </div>
                </div>

                {/* 🛡️ SIMPLE ALERTS */}
                {(data.stats.pendingStudents > 0 || data.stats.pendingTeachers > 0) && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-3xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500 rounded-2xl">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Pending Approvals</h4>
                                <p className="text-sm text-muted-foreground">
                                    {data.stats.pendingStudents} students and {data.stats.pendingTeachers} teachers are waiting for verification.
                                </p>
                            </div>
                        </div>
                        <Link href="/admin/approvals">
                            <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl font-bold">
                                Review Now
                            </Button>
                        </Link>
                    </motion.div>
                )}

                {/* KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statsConfig.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl hover:shadow-md transition-all overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Chart */}
                    <Card className="lg:col-span-2 border border-slate-200 dark:border-white/5 shadow-sm bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xl font-black tracking-tight">Usage Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-48 flex items-end gap-1.5 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                {[40, 65, 45, 80, 55, 70, 90, 60, 50, 85, 75, 95, 80, 88, 100].map((h, i) => (
                                    <div 
                                        key={i} 
                                        style={{ height: `${h}%` }}
                                        className="flex-1 bg-indigo-600 dark:bg-indigo-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xl font-black tracking-tight">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-5">
                            {data.recentActivity?.map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 capitalize">
                                        {item.user.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                            {item.action} {item.target}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {item.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
