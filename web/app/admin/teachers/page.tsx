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
    UserPlusIcon,
    AcademicCapIcon,
    EnvelopeIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Teacher {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
    is_approved: boolean;
}

export default function AdminTeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    async function fetchTeachers() {
        try {
            const res = await fetch("/api/admin/users?role=teacher");
            if (res.ok) {
                const data = await res.json();
                setTeachers(data);
            }
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, is_approved: true })
            });

            if (res.ok) {
                fetchTeachers(); // Refresh list
            }
        } catch (error) {
            console.error("Failed to approve teacher", error);
        }
    }

    const filteredTeachers = teachers.filter(t =>
        t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Faculty Management" role="admin">
            <div className="space-y-6">
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Faculty Directory</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage your verified teachers and staff.</p>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all">
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        Invite Teacher
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white/50 backdrop-blur-md rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[300px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Teachers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)
                    ) : filteredTeachers.length > 0 ? (
                        filteredTeachers.map((teacher) => (
                            <Card key={teacher.id} className="group hover:shadow-xl transition-all duration-300 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all ${teacher.is_approved ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-amber-100 text-amber-600'}`}>
                                        {teacher.full_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <CardTitle className="text-base font-bold truncate group-hover:text-indigo-600 transition-colors uppercase">{teacher.full_name || "Unnamed Teacher"}</CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 mt-1 font-medium">
                                            <AcademicCapIcon className="w-4 h-4" />
                                            Professional Educator
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm mt-2">
                                    <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                                        <EnvelopeIcon className="w-4 h-4" />
                                        {teacher.email}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                        {teacher.is_approved ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 font-bold uppercase text-[10px] tracking-widest">
                                                VERIFIED
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-amber-100 text-amber-700 border-none px-3 font-bold uppercase text-[10px] tracking-widest">
                                                PENDING
                                            </Badge>
                                        )}
                                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Joined: {new Date(teacher.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        {!teacher.is_approved ? (
                                            <Button
                                                onClick={() => handleApprove(teacher.id)}
                                                className="col-span-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                            >
                                                Approve Account
                                            </Button>
                                        ) : (
                                            <>
                                                <Button variant="outline" size="sm" className="w-full font-bold">Message</Button>
                                                <Button size="sm" className="w-full bg-slate-900 text-white hover:bg-black font-bold">Permissions</Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <AcademicCapIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900">No teachers found</h3>
                            <p className="text-slate-500">Invite faculty members to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
