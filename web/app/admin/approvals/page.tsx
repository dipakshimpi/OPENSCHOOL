"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CheckCircle2,
    Clock,
    ShieldCheck,
    Search,
    LayoutGrid,
    List,
    UserCheck,
} from "lucide-react";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
    const [view, setView] = useState<'list' | 'grid'>('list');

    const GRADES = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const SECTIONS = ["A", "B", "C", "D", "E"];

    const fetchPendingStudents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authedFetch("/api/admin/users?role=student");
            if (res.ok) {
                const data = await res.json();
                const allStudents = Array.isArray(data) ? data : [];
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
            alert("Please assign a Grade and Section first.");
            return;
        }

        setProcessingId(id);
        try {
            const res = await authedFetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    is_admin_approved: true,
                    is_teacher_approved: true,
                    grade_level: grade,
                    section: section
                })
            });

            if (res.ok) {
                setPendingStudents(prev => prev.filter(s => s.id !== id));
            }
        } catch (err) {
            console.error("Approval sequence failed", err);
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <DashboardLayout role="admin" title="Direct Approvals">
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20 px-4">

                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pending Enrollments</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Verify student registrations and assign appropriate classroom parameters.</p>
                    </div>
                    <div className="flex bg-slate-100/50 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setView("grid")}
                            className={cn("h-9 w-9 rounded-lg transition-all", view === "grid" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600" : "text-slate-400")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setView("list")}
                            className={cn("h-9 w-9 rounded-lg transition-all", view === "list" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600" : "text-slate-400")}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* 📊 KPI OVERVIEW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600">
                           <Clock className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Awaiting Approval</p>
                           <div className="text-2xl font-bold">{pendingStudents.length} Students</div>
                        </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600">
                           <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Integrity</p>
                           <div className="text-2xl font-bold">Optimal</div>
                        </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                           <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Session Status</p>
                           <div className="text-2xl font-bold">Active</div>
                        </div>
                    </Card>
                </div>

                {/* 📋 MAIN TABLE */}
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
                    <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold">Registration Requests</CardTitle>
                            <CardDescription className="text-xs font-medium">Verify information and assign grade/sections for final approval.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                placeholder="Filter requests..." 
                                className="w-full h-11 bg-slate-50 dark:bg-slate-950 rounded-xl border-none pl-12 text-sm font-medium focus-visible:ring-2 focus-visible:ring-indigo-600/30"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                           <div className="p-10 space-y-4">
                               {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                           </div>
                        ) : view === 'list' ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-none">
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500 px-8">Student Identity</TableHead>
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500">Contact Details</TableHead>
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500">Academic Assignment</TableHead>
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500 text-right px-8">Verification Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {pendingStudents.map((student) => (
                                                <motion.tr 
                                                    layout
                                                    key={student.id} 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                                                >
                                                    <TableCell className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 font-bold text-sm">
                                                                {student.full_name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 dark:text-white">{student.full_name}</div>
                                                                <div className="text-[10px] text-slate-400 font-medium">Applied: {new Date(student.created_at).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-500 text-sm">{student.email}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <select 
                                                                className="h-9 rounded-lg bg-slate-100 dark:bg-slate-950 border-none text-[11px] font-bold px-3 focus:ring-2 focus:ring-indigo-600/20"
                                                                value={selectedGrades[student.id] || ""}
                                                                onChange={(e) => setSelectedGrades(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                            >
                                                                <option value="">GRADE</option>
                                                                {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                                                            </select>
                                                            <select 
                                                                className="h-9 rounded-lg bg-slate-100 dark:bg-slate-950 border-none text-[11px] font-bold px-3 focus:ring-2 focus:ring-indigo-600/20"
                                                                value={selectedSections[student.id] || ""}
                                                                onChange={(e) => setSelectedSections(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                            >
                                                                <option value="">SEC</option>
                                                                {SECTIONS.map(s => <option key={s} value={s}>Sec {s}</option>)}
                                                            </select>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right px-8">
                                                        <Button
                                                            onClick={() => handleApprove(student.id)}
                                                            disabled={processingId === student.id}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 px-6 font-bold text-[10px] uppercase tracking-widest gap-2"
                                                        >
                                                            {processingId === student.id ? <Clock className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                                                            Confirm Approval
                                                        </Button>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                        {pendingStudents.length === 0 && !loading && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-20 text-center">
                                                    <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No pending approvals remaining.</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {pendingStudents.map((student) => (
                                    <div key={student.id} className="p-6 border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 hover:shadow-lg transition-all rounded-3xl group">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 font-bold text-xl">
                                                {student.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{student.full_name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{student.email}</p>
                                            </div>
                                            <div className="w-full space-y-3 pt-2">
                                                <div className="flex gap-2">
                                                    <select 
                                                        className="flex-1 h-9 rounded-lg bg-white dark:bg-slate-900 border-none text-[10px] font-bold px-2 shadow-sm"
                                                        value={selectedGrades[student.id] || ""}
                                                        onChange={(e) => setSelectedGrades(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                    >
                                                        <option value="">GRADE</option>
                                                        {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                                                    </select>
                                                    <select 
                                                        className="flex-1 h-9 rounded-lg bg-white dark:bg-slate-900 border-none text-[10px] font-bold px-2 shadow-sm"
                                                        value={selectedSections[student.id] || ""}
                                                        onChange={(e) => setSelectedSections(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                    >
                                                        <option value="">SEC</option>
                                                        {SECTIONS.map(s => <option key={s} value={s}>Sec {s}</option>)}
                                                    </select>
                                                </div>
                                                <Button
                                                    onClick={() => handleApprove(student.id)}
                                                    disabled={processingId === student.id}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest gap-2"
                                                >
                                                    Verify Student
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
