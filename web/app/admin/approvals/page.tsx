"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircleIcon,
    UserPlusIcon,
    AcademicCapIcon,
    IdentificationIcon,
    ArrowPathIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

interface Student {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    is_admin_approved: boolean;
    is_teacher_approved: boolean;
    school_id: string | null;
    grade_level: string | null;
    section: string | null;
}

export default function AdminApprovalsPage() {
    const { status } = useSession();
    const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedGrades, setSelectedGrades] = useState<Record<string, string>>({});
    const [selectedSections, setSelectedSections] = useState<Record<string, string>>({});

    const GRADES = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const SECTIONS = ["A", "B", "C", "D", "E"];

    const fetchPendingStudents = useCallback(async () => {
        try {
            // Fetch users who are students AND are NOT yet admin-approved
            const res = await authedFetch("/api/admin/users?role=student");
            if (res.ok) {
                const data = await res.json();
                const allStudents = Array.isArray(data) ? data : [];
                // Show students who are either not approved OR missing class assignment
                setPendingStudents(allStudents.filter(s =>
                    !s.is_admin_approved ||
                    !s.is_teacher_approved ||
                    !s.grade_level ||
                    !s.section
                ));
            }
        } catch (err) {
            console.error("Failed to fetch pending students", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchPendingStudents();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status, fetchPendingStudents]);

    useEffect(() => {
        const grades: Record<string, string> = {};
        const sections: Record<string, string> = {};
        pendingStudents.forEach(s => {
            if (s.grade_level) grades[s.id] = s.grade_level;
            if (s.section) sections[s.id] = s.section;
        });
        setSelectedGrades(prev => ({ ...grades, ...prev }));
        setSelectedSections(prev => ({ ...sections, ...prev }));
    }, [pendingStudents]);

    async function handleApprove(id: string) {
        const grade = selectedGrades[id];
        const section = selectedSections[id];
        if (!grade || !section) {
            alert("Security Protocol: Class assignment and Section mandatory for student onboarding.");
            return;
        }

        setProcessingId(id);
        try {
            const res = await authedFetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    is_approved: true,
                    is_admin_approved: true,
                    is_teacher_approved: true, // Admin override: fully approves
                    grade_level: grade,
                    section: section
                }),
            });

            if (res.ok) {
                setPendingStudents(prev => prev.filter(s => s.id !== id));
            } else {
                alert("Failed to finalize student approval.");
            }
        } catch (err) {
            console.error(err);
            alert("Error in approval transaction.");
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <DashboardLayout role="admin" title="Admission Control">
            <div className="space-y-8">
                {/* High-Fidelity Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Admission Queue</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-widest mt-1">Class Assignment & Security Clearance</p>
                    </div>
                </div>

                <Card className="border-none shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/20 dark:to-indigo-900/10 p-10 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none">
                                    <UserPlusIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Student Onboarding</CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                                        {pendingStudents.length} Profiles Awaiting Verification
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 space-y-6">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-3xl" />)}
                            </div>
                        ) : pendingStudents.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 dark:bg-slate-800/20 border-none">
                                        <TableHead className="px-10 py-6 font-black uppercase text-[11px] tracking-[0.2em] text-slate-400">Applicant Identity</TableHead>
                                        <TableHead className="font-black uppercase text-[11px] tracking-[0.2em] text-slate-400">Registry date</TableHead>
                                        <TableHead className="font-black uppercase text-[11px] tracking-[0.2em] text-slate-400">Assignment Protocols</TableHead>
                                        <TableHead className="text-right px-10 font-black uppercase text-[11px] tracking-[0.2em] text-slate-400">Clearance Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingStudents.map((student) => (
                                        <TableRow key={student.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all border-slate-50 dark:border-slate-800">
                                            <TableCell className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-3xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl shadow-inner group">
                                                        {student.full_name?.charAt(0) || "S"}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{student.full_name || "New Applicant"}</div>
                                                            {student.is_admin_approved && (
                                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest">Approved</Badge>
                                                            )}
                                                            {(!student.grade_level || !student.section) && (
                                                                <Badge className="bg-amber-50 text-amber-600 border-none font-bold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest">Assignment Needed</Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 uppercase mt-0.5">
                                                            <IdentificationIcon className="w-3.5 h-3.5" />
                                                            {student.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                    {new Date(student.created_at).toLocaleDateString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <select
                                                            className="h-12 w-32 appearance-none rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-1 text-xs font-black uppercase tracking-widest transition-all outline-none focus:border-indigo-600 focus:ring-0 cursor-pointer shadow-sm"
                                                            value={selectedGrades[student.id] || ""}
                                                            onChange={(e) => setSelectedGrades(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                        >
                                                            <option value="" disabled>Grade</option>
                                                            {GRADES.map(g => (
                                                                <option key={g} value={g}>Class {g}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="relative">
                                                        <select
                                                            className="h-12 w-32 appearance-none rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-1 text-xs font-black uppercase tracking-widest transition-all outline-none focus:border-indigo-600 focus:ring-0 cursor-pointer shadow-sm"
                                                            value={selectedSections[student.id] || ""}
                                                            onChange={(e) => setSelectedSections(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                        >
                                                            <option value="" disabled>Section</option>
                                                            {SECTIONS.map(s => (
                                                                <option key={s} value={s}>Sec {s}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-10">
                                                <Button
                                                    size="lg"
                                                    className="bg-slate-950 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-[0.2em] px-8 h-12 rounded-[1.25rem] shadow-xl transition-all active:scale-95 disabled:opacity-20 flex items-center gap-2 ml-auto"
                                                    onClick={() => handleApprove(student.id)}
                                                    disabled={processingId === student.id || !selectedGrades[student.id] || !selectedSections[student.id]}
                                                >
                                                    {processingId === student.id ? (
                                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            Finalize Clearance
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-32 text-center bg-slate-50/30 dark:bg-slate-900/30">
                                <div className="flex flex-col items-center justify-center gap-6">
                                    <div className="p-8 bg-white dark:bg-slate-800 rounded-full shadow-2xl">
                                        <CheckCircleIcon className="w-16 h-16 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">Cleared Registry</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">All pending admissions have been processed.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Rules & Security Policy Notice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-none shadow-xl bg-amber-50 dark:bg-amber-950/20 rounded-[2rem] overflow-hidden p-8 border-l-[6px] border-amber-400">
                        <div className="flex items-start gap-4">
                            <ExclamationCircleIcon className="w-8 h-8 text-amber-600" />
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-amber-900 dark:text-amber-400">Institutional Rule #1</h4>
                                <p className="text-sm text-amber-800 dark:text-amber-500/80 mt-2 font-medium">Existing email identifiers are automatically mapped to existing profiles. Double-registration is restricted to maintain platform integrity.</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="border-none shadow-xl bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] overflow-hidden p-8 border-l-[6px] border-indigo-400">
                        <div className="flex items-start gap-4">
                            <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-400">Onboarding Policy</h4>
                                <p className="text-sm text-indigo-800 dark:text-indigo-500/80 mt-2 font-medium">Students must be explicitly assigned to a designated Class and Section before dashboard orchestration is initialized.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
