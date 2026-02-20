"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  FunnelIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  UserCircleIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect, useCallback } from "react";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AttendanceLog {
  id: string;
  teacher_id: string;
  status: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  admin_override: boolean;
  override_reason: string | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface AttendanceStats {
  totalToday: number;
  overridesToday: number;
  verifiedToday: number;
}

export default function AdminAttendancePage() {
  const { status: authStatus } = useSession();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await authedFetch("/api/admin/attendance");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch attendance registry", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchAttendance();
    }
  }, [authStatus, fetchAttendance]);

  return (
    <DashboardLayout title="Security Compliance" role="admin">
      <div className="space-y-8">
        {/* Modernized Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Geo-Verification Logs</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-widest mt-1">Real-time Faculty Attendance Registry</p>
          </div>
        </div>

        {/* KPI SQUAD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <CalendarIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marked Today</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalToday || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trusted Geo-Verify</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.verifiedToday || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 border-b-4 border-amber-400">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400">
                <MapPinIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Overrides</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.overridesToday || 0}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registry Table */}
        <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 p-10 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Live Compliance Feed</CardTitle>
              <Button variant="outline" className="h-10 px-6 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest gap-2">
                <FunnelIcon className="w-4 h-4" /> Filter Protocols
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 space-y-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
              </div>
            ) : logs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-none">
                    <TableHead className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 transition-all">Verification Node</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Status Check</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Satellite Timestamp</TableHead>
                    <TableHead className="text-right px-10 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Registry Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all border-slate-50 dark:border-slate-800">
                      <TableCell className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <UserCircleIcon className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{log.profiles?.full_name || "System Actor"}</div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 uppercase">
                              <IdentificationIcon className="w-3 h-3" />
                              {log.profiles?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.admin_override ? (
                          <Badge className="bg-amber-100 text-amber-700 border-none px-3 font-black text-[9px] tracking-widest uppercase">
                            Manual Override
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 font-black text-[9px] tracking-widest uppercase">
                            Geo-Verified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-white font-black text-xs">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <div className="text-[10px] text-slate-400 font-mono tracking-tighter">
                          LAT: {log.latitude.toFixed(6)} | LNG: {log.longitude.toFixed(6)}
                        </div>
                        {log.override_reason && (
                          <div className="text-[9px] text-amber-600 font-bold truncate max-w-[200px] ml-auto mt-1 italic uppercase underline decoration-dotted">
                            Reason: {log.override_reason}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-32 text-center opacity-40">
                <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 animate-[spin_4s_linear_infinite]" />
                <h3 className="text-2xl font-black uppercase tracking-[0.3em]">No Signal Detected</h3>
                <p className="text-sm font-bold uppercase tracking-widest mt-2">Historical verification records cluster empty.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
