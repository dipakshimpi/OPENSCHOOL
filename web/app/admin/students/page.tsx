"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";
import { UsersIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface Student {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    is_admin_approved: boolean;
    is_teacher_approved: boolean;
    grade_level: string | null;
    section: string | null;
}

export default function AdminStudentsPage() {
    const { status } = useSession();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = useCallback(async () => {
        try {
            const res = await authedFetch("/api/admin/users?role=student");
            if (res.ok) {
                const data = await res.json();
                setStudents(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Failed to fetch students", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchStudents();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status, fetchStudents]);


    return (
        <DashboardLayout role="admin" title="Institutional Registry">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Student Registry</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Verified enrollment records and platform access logs.</p>
                    </div>
                </div>

                <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                    <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/30 p-8 px-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter">
                                    <UsersIcon className="w-5 h-5 text-indigo-600" />
                                    Student Directory
                                </CardTitle>
                                <CardDescription className="font-medium mt-1 uppercase text-[10px] tracking-widest text-slate-400">Total Platform Footprint: {students.length} Sign-ups</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-10 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-none">
                                        <TableHead className="px-10 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Enrollment Name</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Verified Email</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Class assignment</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Join date</TableHead>
                                        <TableHead className="text-right px-10 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Compliance Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length > 0 ? (
                                        students.map((student) => {
                                            const isApproved = student.is_admin_approved && student.is_teacher_approved;
                                            return (
                                                <TableRow key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-slate-100 dark:border-slate-800">
                                                    <TableCell className="px-10 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100 dark:shadow-none">
                                                                {student.full_name?.charAt(0) || "S"}
                                                            </div>
                                                            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{student.full_name || "Anonymous Entry"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-500 font-mono text-xs font-medium">{student.email || "NO_EMAIL_RECORDED"}</TableCell>
                                                    <TableCell>
                                                        {student.grade_level ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black text-slate-900">Class {student.grade_level}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section {student.section || 'N/A'}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest italic">Unassigned</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                                        {new Date(student.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right px-10">
                                                        {isApproved ? (
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest gap-1">
                                                                <CheckCircleIcon className="w-3.5 h-3.5" /> Fully Cleared
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest gap-1">
                                                                <ClockIcon className="w-3.5 h-3.5" /> Restricted Access
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-60 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-40">
                                                    <UsersIcon className="w-12 h-12" />
                                                    <p className="font-black uppercase text-xs tracking-[0.3em]">Registry Empty</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
