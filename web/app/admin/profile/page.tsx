"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Mail, Calendar,
    ShieldCheck, Edit3, Key, Server,
    Globe, Lock, Activity, Cpu
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
                <div className="space-y-8 max-w-5xl mx-auto">
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Skeleton className="h-40 rounded-3xl" />
                        <Skeleton className="h-40 rounded-3xl" />
                        <Skeleton className="h-40 rounded-3xl" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : "January 2024";

    return (
        <DashboardLayout title="Nexus Identity" role="admin">
            <div className="space-y-8 pb-20">
                {/* HERO SECTION */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-950 rounded-[2.5rem] opacity-90 blur-xl transition-opacity duration-500" />
                    <Card className="relative border-none shadow-2xl bg-slate-950 text-white rounded-[2.5rem] overflow-hidden border-b-8 border-indigo-500">
                        <div className="h-32 bg-indigo-500/10" />
                        <CardContent className="px-10 pb-10 -mt-16">
                            <div className="flex flex-col md:flex-row items-end gap-8">
                                <div className="relative">
                                    <div className="h-32 w-32 rounded-[2rem] bg-slate-900 p-2 shadow-2xl ring-4 ring-slate-900">
                                        <div className="h-full w-full rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-slate-800 flex items-center justify-center text-white text-4xl font-black">
                                            {profile?.full_name?.charAt(0) || "A"}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 p-2 bg-indigo-500 rounded-xl border-4 border-slate-950 shadow-lg">
                                        <ShieldCheck className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                                        {profile?.full_name}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <Badge className="bg-indigo-500/20 text-indigo-400 border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                                            System Overlord
                                        </Badge>
                                        <Badge className="bg-slate-800 text-slate-400 border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Root Access
                                        </Badge>
                                    </div>
                                </div>
                                <Button className="bg-white hover:bg-slate-200 text-slate-950 font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2">
                                    <Edit3 className="h-4 w-4" />
                                    Security Console
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SYSTEM STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-xl bg-slate-900 rounded-[2rem] p-6 text-center group border-t-4 border-indigo-500">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Load</h3>
                        <p className="text-2xl font-black text-white mt-1">Normal / 12%</p>
                    </Card>

                    <Card className="border-none shadow-xl bg-slate-900 rounded-[2rem] p-6 text-center group border-t-4 border-emerald-500">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
                            <Lock className="h-6 w-6" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Security Level</h3>
                        <p className="text-2xl font-black text-white mt-1">Maximum</p>
                    </Card>

                    <Card className="border-none shadow-xl bg-slate-900 rounded-[2rem] p-6 text-center group border-t-4 border-rose-500">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-400">
                            <Activity className="h-6 w-6" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Node Status</h3>
                        <p className="text-2xl font-black text-white mt-1">Active / 12</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ADMIN CREDENTIALS */}
                    <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800 p-8 border-b dark:border-slate-800">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                <Key className="h-5 w-5 text-indigo-600" />
                                Access Credentials
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Email</h4>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Permissions</h4>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Full Read / Write / Execute</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Created</h4>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{memberSince}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* INFRASTRUCTURE CONTEXT */}
                    <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800 p-8 border-b dark:border-slate-800">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                <Server className="h-5 w-5 text-emerald-600" />
                                System Infrastructure
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deployment Zone</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full uppercase">Asia / AP-South-1</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[99.9%]" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase text-right">99.9% Uptime SLA</p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Modules</h4>
                                <div className="flex flex-wrap gap-2">
                                    {["AES-256", "RSA-4096", "TLS 1.3", "FIREWALL-X"].map((m) => (
                                        <span key={m} className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg uppercase tracking-widest">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
