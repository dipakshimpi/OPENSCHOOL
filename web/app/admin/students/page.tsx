"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Student {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStudents() {
            try {
                // Fetch all profiles with role 'student'
                const res = await fetch("/api/admin/users?role=student");
                if (res.ok) {
                    const data = await res.json();
                    setStudents(data);
                }
            } catch (err) {
                console.error("Failed to fetch students", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStudents();
    }, []);


    return (
        <DashboardLayout role="admin" title="Student Management">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Registered Students</h2>
                    <p className="text-slate-500 text-sm">View and manage all students currently enrolled in the platform.</p>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg">Student Directory</CardTitle>
                        <CardDescription>Total {students.length} registration records found.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="w-[300px]">Full Name</TableHead>
                                        <TableHead>Email ID</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Registration Date</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length > 0 ? (
                                        students.map((student) => (
                                            <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                            {student.full_name?.charAt(0)}
                                                        </div>
                                                        {student.full_name || "Unnamed User"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500 font-mono text-xs">{student.email || "N/A"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-slate-100">
                                                        {student.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-xs">
                                                    {new Date(student.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge className="bg-emerald-500">Active</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                                                No students found in the system.
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
