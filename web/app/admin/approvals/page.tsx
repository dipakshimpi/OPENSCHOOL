"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface Student {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    is_admin_approved: boolean;
    is_teacher_approved: boolean;
}

export default function AdminApprovalsPage() {
    const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingStudents();
    }, []);

    async function fetchPendingStudents() {
        setLoading(true);
        try {
            // Fetch students pending admin approval
            // Note: Our API returns all users matching the filter.
            // We specifically want students NOT approved by admin yet.
            const res = await fetch("/api/admin/users?role=student&admin_approved=false");
            if (res.ok) {
                const data = await res.json();
                setPendingStudents(data);
            }
        } catch (err) {
            console.error("Failed to fetch pending students", err);
        } finally {
            setLoading(false);
        }
    }

    const [selectedGrades, setSelectedGrades] = useState<Record<string, string>>({});
    const [selectedSections, setSelectedSections] = useState<Record<string, string>>({});

    const GRADES = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const SECTIONS = ["A", "B", "C", "D"];

    async function handleApprove(id: string) {
        const grade = selectedGrades[id];
        const section = selectedSections[id];
        if (!grade || !section) {
            alert("Please assign both Class and Section before approving.");
            return;
        }

        setProcessingId(id);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    is_approved: true, // Approves access to dashboard
                    grade_level: grade, // Assigns specific class access
                    section: section
                }),
            });

            if (res.ok) {
                // Remove from list or refresh
                setPendingStudents(prev => prev.filter(s => s.id !== id));
            } else {
                alert("Failed to approve student");
            }
        } catch (err) {
            console.error(err);
            alert("Error approving student");
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <DashboardLayout role="admin" title="Pending Approvals">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Approvals & Class Assignment</h2>
                    <p className="text-slate-500 text-sm">Review registrations and assign students to their respective classes. Access is restricted until approval.</p>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg">Pending Requests</CardTitle>
                        <CardDescription>
                            {pendingStudents.length} students waiting for class assignment and approval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead>Assign Class & Section</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingStudents.length > 0 ? (
                                        pendingStudents.map((student) => (
                                            <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                                                            {student.full_name?.charAt(0) || "U"}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900">{student.full_name || "Unnamed"}</div>
                                                            <div className="text-[10px] text-slate-500">ID: {student.id.substring(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-mono text-xs">{student.email}</TableCell>
                                                <TableCell className="text-slate-500 text-xs">
                                                    {new Date(student.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="h-9 w-24 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                                            value={selectedGrades[student.id] || ""}
                                                            onChange={(e) => setSelectedGrades(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                        >
                                                            <option value="" disabled>Grade</option>
                                                            {GRADES.map(g => (
                                                                <option key={g} value={g}>Class {g}</option>
                                                            ))}
                                                        </select>

                                                        <select
                                                            className="h-9 w-24 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                                            value={selectedSections[student.id] || ""}
                                                            onChange={(e) => setSelectedSections(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                        >
                                                            <option value="" disabled>Section</option>
                                                            {SECTIONS.map(s => (
                                                                <option key={s} value={s}>Sec {s}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105"
                                                        onClick={() => handleApprove(student.id)}
                                                        disabled={processingId === student.id || !selectedGrades[student.id] || !selectedSections[student.id]}
                                                    >
                                                        {processingId === student.id ? "Saving..." : (
                                                            <>
                                                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                                                Approve & Assign
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <CheckCircleIcon className="w-12 h-12 text-slate-200 mb-2" />
                                                    <p>All students managed correctly.</p>
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
