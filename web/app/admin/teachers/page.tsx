"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    MagnifyingGlassIcon,
    AcademicCapIcon,
    EnvelopeIcon,
    CheckBadgeIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

interface Teacher {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
    is_approved: boolean;
    is_admin_approved: boolean;
    is_teacher_approved: boolean;
}

export default function AdminTeachersPage() {
    const { status } = useSession();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchTeachers = useCallback(async () => {
        try {
            const res = await authedFetch("/api/admin/users?role=teacher");
            if (res.ok) {
                const data = await res.json();
                setTeachers(Array.isArray(data) ? data : (data.users || []));
            }
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchTeachers();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status, fetchTeachers]);

    const handleApprove = async (id: string, currentStatus: boolean) => {
        setProcessingId(id);
        try {
            const res = await authedFetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    is_approved: !currentStatus,
                    is_admin_approved: !currentStatus,
                    is_teacher_approved: !currentStatus
                })
            });

            if (res.ok) {
                await fetchTeachers(); // Refresh list
            }
        } catch (error) {
            console.error("Approval error", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this teacher? This will delete their profile registry.")) return;
        setProcessingId(id);
        try {
            const res = await authedFetch(`/api/admin/users?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setTeachers(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error("Delete error", error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = teachers.filter(t => !t.is_approved).length;

    return (
        <DashboardLayout title="Faculty Administration" role="admin">
            <div className="space-y-8">
                {/* Modernized Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Institutional Faculty</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Verified professional educators and academic staff.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-3 flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Directory</p>
                                <p className="text-xl font-black text-indigo-600">{teachers.length}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Action</p>
                                <p className="text-xl font-black text-rose-500">{pendingCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEARCH RIG */}
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] p-4 border border-white dark:border-slate-800 shadow-xl flex items-center gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Filter by name, specialized subject or email..."
                            className="h-14 pl-12 bg-transparent border-none focus-visible:ring-0 text-lg font-medium placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Teachers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-[2.5rem]" />)
                    ) : filteredTeachers.length > 0 ? (
                        filteredTeachers.map((teacher) => (
                            <Card key={teacher.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 rounded-[2.5rem]">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className={`h-16 w-16 rounded-3xl flex items-center justify-center font-black text-2xl transition-all shadow-lg ${teacher.is_approved ? 'bg-indigo-600 text-white rotate-3 group-hover:rotate-0' : 'bg-rose-100 text-rose-600 -rotate-3 group-hover:rotate-0'}`}>
                                            {teacher.full_name?.charAt(0) || "T"}
                                        </div>
                                        {teacher.is_approved ? (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-3 py-1 font-bold text-[10px] tracking-widest flex items-center gap-1">
                                                <CheckBadgeIcon className="w-4 h-4" /> VERIFIED
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-rose-50 text-rose-600 border-none rounded-full px-3 py-1 font-bold text-[10px] tracking-widest flex items-center gap-1">
                                                <ExclamationTriangleIcon className="w-4 h-4" /> PENDING
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="pt-6">
                                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white truncate tracking-tight uppercase tracking-tighter">
                                            {teacher.full_name || "New Educator"}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 w-fit px-3 py-1 rounded-lg">
                                            <AcademicCapIcon className="w-3.5 h-3.5" />
                                            Professional Faculty
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            <EnvelopeIcon className="w-4 h-4 opacity-50" />
                                            <span className="truncate">{teacher.email}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                                            Joined Repository: {new Date(teacher.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3">
                                        <Button
                                            onClick={() => handleApprove(teacher.id, teacher.is_approved)}
                                            disabled={processingId === teacher.id}
                                            className={`col-span-3 h-12 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${teacher.is_approved
                                                ? 'bg-slate-100 text-slate-600 hover:bg-rose-600 hover:text-white dark:bg-slate-800 dark:text-slate-400'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                                                }`}
                                        >
                                            {processingId === teacher.id ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> :
                                                teacher.is_approved ? "Revoke Access" : "Verify Educator"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all"
                                            onClick={() => handleDelete(teacher.id)}
                                            disabled={processingId === teacher.id}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                            <AcademicCapIcon className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">Registry Empty</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">No faculty records found matching your current filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
