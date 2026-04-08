"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeCheck } from "lucide-react";

interface Student {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    is_admin_approved: boolean;
    is_teacher_approved: boolean;
}

export default function TeacherApprovalsPage() {
    const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingStudents();
    }, []);

    async function fetchPendingStudents() {
        setLoading(true);
        try {
            // Fetch students pending teacher approval
            const res = await fetch("/api/teacher/students?teacher_approved=false");
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

    async function handleApprove(id: string) {
        setProcessingId(id);
        try {
            const res = await fetch("/api/teacher/students", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, is_teacher_approved: true }),
            });

            if (res.ok) {
                setPendingStudents(prev => prev.filter(s => s.id !== id));
            } else {
                const errData = await res.json();
                console.error("APPROVAL_FAILED_DATA:", errData);
                alert(`Failed to approve: ${errData.error || "Unknown error"}. Ensure they are Admin Approved.`);
            }
        } catch (err) {
            console.error("APPROVAL_REQUEST_ERROR:", err);
            alert("Error connecting to server. Please try again.");
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <DashboardLayout role="teacher" title="Enrollment Approvals">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Enrollment</h2>
                    <p className="text-slate-500 text-sm">Approve student access to your class dashboard. These students have already been verified by Admin.</p>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg">Classroom Requests</CardTitle>
                        <CardDescription>
                            {pendingStudents.length} students waiting for your approval.
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
                                        <TableHead>Verified By Admin</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingStudents.length > 0 ? (
                                        pendingStudents.map((student) => (
                                            <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                                                            {student.full_name?.charAt(0) || "U"}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900">{student.full_name || "Unnamed"}</div>
                                                            <div className="text-[10px] text-slate-500">Joined: {new Date(student.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-mono text-xs">{student.email}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        Verified
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                                                        onClick={() => handleApprove(student.id)}
                                                        disabled={processingId === student.id}
                                                    >
                                                        {processingId === student.id ? "Granting..." : (
                                                            <>
                                                                <BadgeCheck className="w-4 h-4 mr-1" />
                                                                Grant Access
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                                                No new requests. All students are settled in!
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
