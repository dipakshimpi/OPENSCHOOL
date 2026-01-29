"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    UsersIcon,
    CurrencyDollarIcon,
    AcademicCapIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/stats");
                const json = await res.json();
                if (res.ok) setData(json);
            } catch (error) {
                console.error("Stats fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="admin" title="Admin Overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
                    <Skeleton className="h-80 rounded-2xl" />
                </div>
            </DashboardLayout>
        );
    }

    const statsConfig = [
        { label: "Total Students", value: data.stats.studentCount, change: "+5%", icon: UsersIcon, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Total Teachers", value: data.stats.teacherCount, change: "+2%", icon: AcademicCapIcon, color: "text-emerald-600", bg: "bg-emerald-100" },
        { label: "Active Courses", value: data.stats.courseCount, change: "+12%", icon: AcademicCapIcon, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Registration Rate", value: data.stats.attendanceRate + "%", change: "+1%", icon: ChartBarIcon, color: "text-amber-600", bg: "bg-amber-100" },
    ];

    return (
        <DashboardLayout role="admin" title="Admin Control Center">
            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsConfig.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-xl bg-white/70 backdrop-blur-md hover:shadow-2xl transition-all duration-300">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} bg-opacity-40`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-100 px-2 py-0">
                                        {stat.change}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area - Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Platform Growth Chart Area */}
                <Card className="lg:col-span-2 border-none shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800">Platform Growth</CardTitle>
                                <p className="text-xs text-slate-500">Real-time enrollment activity visualized</p>
                            </div>
                            <Badge className="bg-indigo-600"><ArrowTrendingUpIcon className="w-3 h-3 mr-1" /> Trending</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-64 w-full flex items-end gap-3 px-2">
                            {[40, 60, 45, 70, 50, 60, 75, 50, 45, 80, 60, 90, 70, 85, 95].map((h, i) => (
                                <div
                                    key={i}
                                    style={{ height: `${h}%` }}
                                    className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg hover:from-purple-600 hover:to-purple-400 transition-all duration-300 cursor-pointer group relative"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h} units
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <span>Last 15 Days Performance</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Feed */}
                <Card className="border-none shadow-2xl bg-slate-900 text-white overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-white/5">
                        <CardTitle className="text-lg font-bold">Live Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {data.recentActivity.length > 0 ? (
                                data.recentActivity.map((item: any, i: number) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                            <UsersIcon className="w-4 h-4" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-200">
                                                {item.user} <span className="text-slate-500 text-xs font-normal">has</span> {item.action}
                                            </p>
                                            <p className="text-indigo-400 font-bold mt-0.5">{item.target}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">{item.time}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-40">
                                    <p className="text-sm">No recent signals recorded.</p>
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" className="w-full mt-8 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-xs">
                            View Security Audit Log
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
