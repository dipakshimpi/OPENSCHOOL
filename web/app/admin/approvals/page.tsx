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

    async function handleApprove(id: string) {
        setProcessingId(id);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, is_admin_approved: true, is_approved: true }),
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
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Approvals</h2>
                    <p className="text-slate-500 text-sm">Review and approve new student registrations before they are sent to teachers.</p>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg">Pending Requests</CardTitle>
                        <CardDescription>
                            {pendingStudents.length} students waiting for administrative approval.
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
                                        <TableHead>Registered On</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
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
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                                        onClick={() => handleApprove(student.id)}
                                                        disabled={processingId === student.id}
                                                    >
                                                        {processingId === student.id ? "Processing..." : (
                                                            <>
                                                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                                                Approve
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                                                No pending approvals found. Great job!
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
