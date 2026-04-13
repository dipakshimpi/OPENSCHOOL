"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Mail,
    ShieldCheck, Edit3, Key, Server,
    Lock, Activity, Cpu
} from "lucide-react";
import { authedFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

interface ProfileData {
    full_name: string;
    role: string;
    email: string;
    created_at: string;
    last_login?: string;
}

export default function AdminProfile() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await authedFetch("/api/profile?intendedRole=admin");
                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        ...data,
                        email: session?.user?.email || data.email || "admin@openschool.edu"
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [session]);

    if (loading) {
        return (
            <DashboardLayout title="System Administrator" role="admin">
                <div className="space-y-6 max-w-5xl mx-auto">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Nexus Identity" role="admin">
            <div className="max-w-[1200px] mx-auto space-y-10 pb-20 px-4">
                
                {/* 🌟 REFINED COMPACT HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                                {profile?.full_name?.charAt(0) || "A"}
                            </div>
                            <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-lg border-2 border-white dark:border-slate-950 shadow-md">
                                <ShieldCheck className="h-3 w-3 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{profile?.full_name}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 font-bold text-[8px] px-2 py-0.5 rounded-md uppercase tracking-widest">
                                    System Administrator
                                </Badge>
                                <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Platform Node
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" className="border-slate-200 dark:border-white/10 h-10 px-5 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                        <Edit3 className="w-3.5 h-3.5" />
                        Enter Console
                    </Button>
                </div>

                {/* 📊 COMPACT KPI GRID (Matching Teacher/Student Aesthetic) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-800/50">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Architecture Load</p>
                           <div className="text-xl font-black">{profile?.role === 'admin' ? '12%' : 'N/A'} <span className="text-[10px] text-emerald-500 uppercase ml-1">Nominal</span></div>
                        </div>
                    </Card>

                    <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Protocol</p>
                           <div className="text-xl font-black">Maximum <span className="text-[10px] text-slate-400 uppercase ml-1">RSA-4096</span></div>
                        </div>
                    </Card>

                    <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 border border-rose-100 dark:border-rose-800/50">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Synchronized Nodes</p>
                           <div className="text-xl font-black">12 <span className="text-[10px] text-slate-400 uppercase ml-1">Live</span></div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ADMIN CREDENTIALS */}
                    <Card className="border border-white/5 shadow-2xl bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-white/5">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <Key className="h-4 w-4 text-indigo-600" />
                                Access Credentials
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Admin Email</h4>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{profile?.email}</p>
                                    </div>
                                </div>
 
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Permissions</h4>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">Root Access</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
 
                    {/* INFRASTRUCTURE CONTEXT */}
                    <Card className="border border-white/5 shadow-2xl bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-white/5">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <Server className="h-4 w-4 text-emerald-600" />
                                Infrastructure
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Uptime SLA</span>
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase">99.9%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[99.9%]" />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {["AES-256", "RSA-4096", "TLS 1.3"].map((m) => (
                                    <span key={m} className="text-[8px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded uppercase tracking-tighter">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
