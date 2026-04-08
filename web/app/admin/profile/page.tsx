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
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                {/* HERO SECTION */}
                <div className="relative">
                    <Card className="relative border border-white/5 shadow-2xl bg-slate-950 text-white rounded-2xl overflow-hidden shadow-indigo-500/10">
                        <div className="h-24 bg-gradient-to-r from-indigo-500/10 to-slate-500/10" />
                        <CardContent className="px-6 pb-6 -mt-12">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-2xl bg-slate-900 p-1.5 shadow-2xl ring-2 ring-indigo-500/30">
                                        <div className="h-full w-full rounded-xl bg-gradient-to-br from-indigo-600 to-slate-800 flex items-center justify-center text-white text-3xl font-bold">
                                            {profile?.full_name?.charAt(0) || "A"}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-500 rounded-lg border-2 border-slate-950 shadow-md">
                                        <ShieldCheck className="h-3.5 w-3.5 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1 text-center md:text-left">
                                    <h1 className="text-2xl font-bold text-white tracking-tight">
                                        {profile?.full_name}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                        <Badge className="bg-indigo-500/20 text-indigo-400 border-none font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                            System Overlord
                                        </Badge>
                                        <Badge className="bg-slate-800 text-slate-400 border-none font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider gap-1">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                            Root Access
                                        </Badge>
                                    </div>
                                </div>
                                <Button className="bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-white/10 text-slate-950 dark:text-white font-bold uppercase text-[9px] tracking-widest px-6 h-10 rounded-xl shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center gap-2">
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Security Console
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SYSTEM STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-white/5 shadow-xl bg-slate-900/50 backdrop-blur-md rounded-xl p-4 text-center group">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 text-indigo-400">
                            <Cpu className="h-5 w-5" />
                        </div>
                        <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500">System Load</h3>
                        <p className="text-lg font-bold text-white mt-1">Normal / 12%</p>
                    </Card>

                    <Card className="border border-white/5 shadow-xl bg-slate-900/50 backdrop-blur-md rounded-xl p-4 text-center group">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 text-emerald-400">
                            <Lock className="h-5 w-5" />
                        </div>
                        <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Security Level</h3>
                        <p className="text-lg font-bold text-white mt-1">Maximum</p>
                    </Card>

                    <Card className="border border-white/5 shadow-xl bg-slate-900/50 backdrop-blur-md rounded-xl p-4 text-center group">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 text-rose-400">
                            <Activity className="h-5 w-5" />
                        </div>
                        <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Node Status</h3>
                        <p className="text-lg font-bold text-white mt-1">Active / 12</p>
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
