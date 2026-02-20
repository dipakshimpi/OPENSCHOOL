"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    UsersIcon,
    AcademicCapIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    InboxIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
    const { status: authStatus } = useSession();
    const [data, setData] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authStatus === "authenticated") {
            fetchStats();
        } else if (authStatus === "unauthenticated") {
            setLoading(false);
        }
    }, [authStatus]);

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
            <DashboardLayout role="admin" title="System Booting...">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[500px] rounded-[3rem]" />
                    <Skeleton className="h-[500px] rounded-[3rem]" />
                </div>
            </DashboardLayout>
        );
    }

    const statsConfig = [
        { label: "Platform Students", value: data.stats.studentCount, alert: data.stats.pendingStudents, icon: UsersIcon, color: "text-blue-600", bg: "bg-blue-50/50" },
        { label: "Verified Faculty", value: data.stats.teacherCount, alert: data.stats.pendingTeachers, icon: AcademicCapIcon, color: "text-indigo-600", bg: "bg-indigo-50/50" },
        { label: "Active Modules", value: data.stats.courseCount, icon: AcademicCapIcon, color: "text-purple-600", bg: "bg-purple-50/50" },
        { label: "Geo-Compliance", value: data.stats.attendanceRate + "%", icon: ShieldCheckIcon, color: "text-emerald-600", bg: "bg-emerald-50/50" },
    ];

    return (
        <DashboardLayout role="admin" title="Nexus Command Center">
            <div className="space-y-10 pb-20">

                {/* 🛡️ SECURITY OVERLAY / ALERTS */}
                {(data.stats.pendingStudents > 0 || data.stats.pendingTeachers > 0) && (
                    <div className="flex flex-wrap gap-4 items-center bg-rose-50 dark:bg-rose-950/20 p-6 rounded-[2rem] border-2 border-rose-100 dark:border-rose-900 shadow-xl shadow-rose-100/20 dark:shadow-none animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="p-3 bg-rose-600 rounded-2xl shadow-lg ring-4 ring-rose-100 dark:ring-rose-900/40">
                            <ExclamationTriangleIcon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-black text-rose-900 dark:text-rose-400 uppercase italic tracking-tighter">Security Action Required</h4>
                            <p className="text-rose-700 dark:text-rose-500 font-bold text-xs uppercase tracking-widest mt-0.5">
                                {data.stats.pendingStudents} Students & {data.stats.pendingTeachers} Teachers awaiting protocol clearance
                            </p>
                        </div>
                        <Link href="/admin/approvals">
                            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-xl shadow-xl transition-all active:scale-95 flex items-center gap-2">
                                Execute Clearance <ArrowRightIcon className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                )}

                {/* KPI GRID - NEOMORPHIC AESTHETIC */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {statsConfig.map((stat) => (
                        <Card key={stat.label} className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group hover:ring-2 hover:ring-indigo-500 transition-all duration-500">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between">
                                    <div className={`p-5 rounded-3xl ${stat.bg} ${stat.color} transition-all duration-500 group-hover:scale-110 shadow-inner`}>
                                        <stat.icon className="w-8 h-8" />
                                    </div>
                                    {stat.alert ? (
                                        <Badge className="bg-rose-600 text-white border-none rounded-full px-2.5 py-0.5 font-bold text-[10px] animate-pulse">
                                            {stat.alert} PENDING
                                        </Badge>
                                    ) : null}
                                </div>
                                <div className="mt-8">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* COMMAND AREA - SPLIT VIEW */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <Card className="lg:col-span-2 border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border-t-8 border-indigo-600">
                        <CardHeader className="p-10 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Growth Matrix</CardTitle>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Orchestration Trends</p>
                                </div>
                                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl">
                                    <ArrowTrendingUpIcon className="w-4 h-4 text-indigo-600" />
                                    <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Optimized</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 pt-6">
                            <div className="h-72 flex items-end gap-3 px-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-[2rem] p-8 border border-white dark:border-slate-800 shadow-inner">
                                {[40, 65, 45, 80, 55, 70, 90, 60, 50, 85, 75, 95, 80, 88, 100].map((h, i) => (
                                    <div
                                        key={i}
                                        style={{ height: `${h}%` }}
                                        className="flex-1 bg-gradient-to-t from-indigo-700 via-indigo-600 to-indigo-400 rounded-2xl hover:scale-105 hover:from-purple-600 hover:to-indigo-500 transition-all duration-500 cursor-pointer relative group"
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-10">
                                            METRIC {i + 1}: {h}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl bg-slate-950 rounded-[3rem] overflow-hidden text-white border-b-8 border-indigo-500 ring-4 ring-slate-900/50">
                        <CardHeader className="p-10 pb-6 border-b border-white/5">
                            <CardTitle className="text-2xl font-black tracking-tighter uppercase italic">Registry Signals</CardTitle>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">Live Telemetry Transmissions</p>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            {data.recentActivity.length > 0 ? (
                                data.recentActivity.map((item, i) => (
                                    <div key={i} className="flex items-start gap-6 group relative">
                                        <div className="w-1.5 h-full absolute -left-4 bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                                            {item.user.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                {item.user} <span className="opacity-40 italic">triggered</span>
                                            </p>
                                            <div className="font-black text-white text-base tracking-tight leading-tight uppercase group-hover:text-indigo-400 transition-colors">
                                                {item.action} {item.target}
                                            </div>
                                            <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-tighter">{item.time}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 flex flex-col items-center gap-4 opacity-20">
                                    <InboxIcon className="w-16 h-16" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Flatline</p>
                                </div>
                            )}
                            <div className="pt-6">
                                <Link href="/admin/users" className="block">
                                    <Button variant="ghost" className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 font-black uppercase text-[10px] tracking-widest gap-2">
                                        Enter Registry Archive <ArrowRightIcon className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
