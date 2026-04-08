"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
    Users, 
    ShieldCheck, 
    MapPin, 
    Clock, 
    Search
} from "lucide-react";
import { useState, useEffect } from "react";
import { authedFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface AttendanceLog {
    id: string;
    student_id: string;
    timestamp: string;
    status: 'present' | 'absent' | 'late';
    is_verified: boolean;
    accuracy_meters: number | null;
    profiles: {
        full_name: string | null;
    } | null;
}

interface Stats {
    totalStudents: number;
    presentToday: number;
    verifiedToday: number;
    overridesToday: number;
}

export default function AdminAttendancePage() {
    const { status } = useSession();
    const [stats, setStats] = useState<Stats | null>(null);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
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
            const [statsRes, logsRes] = await Promise.all([
                authedFetch("/api/admin/attendance/stats"),
                authedFetch("/api/admin/attendance/logs")
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (logsRes.ok) {
                const logsData = await logsRes.json();
                setLogs(Array.isArray(logsData) ? logsData : []);
            }
        } catch (error) {
            console.error("Data error", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <DashboardLayout role="admin" title="Attendance Records">
            <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4">
                
                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Institutional Attendance</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Daily compliance and verification records for current academic sessions.</p>
                    </div>
                </div>

                {/* 📊 KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                             <Users className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Present Today</p>
                            <h3 className="text-xl font-bold">{stats?.presentToday || 0}</h3>
                         </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                             <ShieldCheck className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified Logs</p>
                            <h3 className="text-xl font-bold">{stats?.verifiedToday || 0}</h3>
                         </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                             <MapPin className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Overrides</p>
                            <h3 className="text-xl font-bold">{stats?.overridesToday || 0}</h3>
                         </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                             <Clock className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Rate</p>
                            <h3 className="text-xl font-bold">100%</h3>
                         </div>
                    </Card>
                </div>

                {/* 📋 ATTENDANCE TABLE */}
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
                    <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold">Live Attendance Logs</CardTitle>
                            <p className="text-xs font-medium text-slate-400">Real-time participation tracking and verification status.</p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    placeholder="Search logs..." 
                                    className="w-full h-11 bg-slate-50 dark:bg-slate-950 rounded-xl border-none pl-12 text-sm font-medium focus-visible:ring-2 focus-visible:ring-indigo-600/30"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                          <div className="p-10 space-y-4">
                             {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                             <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-none">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="h-14 font-semibold text-xs text-slate-500 px-8">Student Identity</TableHead>
                                        <TableHead className="h-14 font-semibold text-xs text-slate-500">Log Timestamp</TableHead>
                                        <TableHead className="h-14 font-semibold text-xs text-slate-500">Location Delta</TableHead>
                                        <TableHead className="h-14 font-semibold text-xs text-slate-500 text-right px-8">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm">
                                                        {log.profiles?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white uppercase italic tracking-tighter">{log.profiles?.full_name || 'Anonymous Node'}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium">Record ID: {log.id.substring(0,8)}...</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <MapPin className="w-3 h-3" />
                                                    {log.accuracy_meters ? `${Math.round(log.accuracy_meters)}m Accuracy` : 'Override'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <Badge className={cn(
                                                    "rounded-md px-2 py-0.5 text-[10px] font-bold border-none",
                                                    log.is_verified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                                )}>
                                                    {log.is_verified ? "Verified" : "Manual Check"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                          </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
