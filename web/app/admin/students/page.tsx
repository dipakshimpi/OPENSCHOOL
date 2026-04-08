"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Users, 
    Search, 
    Mail, 
    ShieldCheck,
    CheckCircle2,
    GraduationCap,
    LayoutGrid,
    List
} from "lucide-react";
import { useState, useEffect } from "react";
import { authedFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Student {
    id: string;
    full_name: string;
    email: string;
    is_approved: boolean;
    is_admin_approved: boolean;
    created_at: string;
}

export default function AdminStudentsPage() {
    const { status } = useSession();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('list');

    useEffect(() => {
        if (status === "authenticated") {
            fetchStudents();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status]);

    async function fetchStudents() {
        setLoading(true);
        try {
            const res = await authedFetch("/api/admin/users?role=student");
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <DashboardLayout role="admin" title="Student Directory">
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20 px-4">
                
                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Student Directory</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Manage and review all enrolled students across the platform.</p>
                    </div>
                </div>

                {/* 📊 KPI OVERVIEW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <Users className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Students</p>
                            <div className="text-2xl font-bold">{students.length}</div>
                         </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Approved</p>
                            <div className="text-2xl font-bold">{students.filter(s => s.is_admin_approved).length}</div>
                         </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                            <GraduationCap className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Grades</p>
                            <div className="text-2xl font-bold">12</div>
                         </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                            <ShieldCheck className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified</p>
                            <div className="text-2xl font-bold">100%</div>
                         </div>
                    </Card>
                </div>

                {/* 📋 REGISTRY CARD */}
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
                    <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold">Enrollment List</CardTitle>
                            <CardDescription className="text-xs font-medium">{students.length} students currently registered.</CardDescription>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    placeholder="Search students..." 
                                    className="w-full h-11 bg-slate-50 dark:bg-slate-950 rounded-xl border-none pl-12 text-sm font-medium focus-visible:ring-2 focus-visible:ring-indigo-600/30"
                                />
                            </div>
                            <div className="flex bg-slate-100/50 dark:bg-slate-950/50 p-1 rounded-lg border border-slate-200 dark:border-white/5">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setView("grid")}
                                    className={cn("h-8 w-8 rounded-md transition-all", view === "grid" ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600" : "text-slate-400")}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setView("list")}
                                    className={cn("h-8 w-8 rounded-md transition-all", view === "list" ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600" : "text-slate-400")}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
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
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500 px-8">Student Name</TableHead>
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500">Contact</TableHead>
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500">Registration Date</TableHead>
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500 text-right px-8">Account Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => (
                                            <TableRow key={student.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                <TableCell className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                            {student.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white">{student.full_name}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium">ID: {student.id.substring(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                        <Mail className="w-3 h-3" />
                                                        {student.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm">
                                                    {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="text-right px-8">
                                                    <Badge className={cn(
                                                        "rounded-md px-2 py-0.5 text-[10px] font-bold border-none",
                                                        student.is_admin_approved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                                    )}>
                                                        {student.is_admin_approved ? "Approved" : "Pending"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                 {students.map((student) => (
                                     <Card key={student.id} className="p-6 border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 hover:shadow-lg transition-all rounded-2xl group">
                                         <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                                {student.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{student.full_name}</h4>
                                                <p className="text-xs text-slate-400 mt-1">{student.email}</p>
                                            </div>
                                            <Badge className={cn(
                                                "rounded-md px-2 py-0.5 text-[10px] font-bold border-none",
                                                student.is_admin_approved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                            )}>
                                                {student.is_admin_approved ? "Active" : "Review"}
                                            </Badge>
                                         </div>
                                     </Card>
                                 ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}


