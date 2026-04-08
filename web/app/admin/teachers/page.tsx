"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Users, 
    Search, 
    ShieldCheck, 
    ShieldAlert, 
    Trash2, 
    UserCheck,
    LayoutGrid,
    List,
    Mail,
    Activity,
    Loader2
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Teacher {
    id: string;
    full_name: string;
    email: string;
    is_approved: boolean;
    is_admin_approved: boolean;
    created_at: string;
}

export default function AdminTeachersPage() {
    const { status } = useSession();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<'grid' | 'list'>('list');

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authedFetch("/api/admin/users?role=teacher");
            if (res.ok) {
                const data = await res.json();
                setTeachers(data);
            }
        } catch (error) {
            console.error("Fetch error", error);
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
                setTeachers(prev => prev.map(t => t.id === id ? { ...t, is_approved: !currentStatus, is_admin_approved: !currentStatus } : t));
            }
        } catch (error) {
            console.error("Approval error", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently remove this user? This action is non-reversible.")) return;
        setProcessingId(id);
        try {
            const res = await authedFetch(`/api/admin/users?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setTeachers(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error("Removal error", error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredTeachers = teachers.filter(t => 
        t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout role="admin" title="Teacher Directory">
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20 px-4">
                
                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Faculty Directory</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Verify and manage certified instructors within the platform.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <Users className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Faculty</p>
                            <div className="text-2xl font-bold">{teachers.length}</div>
                         </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                            <UserCheck className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Approved</p>
                            <div className="text-2xl font-bold">{teachers.filter(t => t.is_admin_approved).length}</div>
                         </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                            <ShieldCheck className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified</p>
                            <div className="text-2xl font-bold">100%</div>
                         </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                            <Activity className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active</p>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{teachers.length}</div>
                         </div>
                    </Card>
                </div>

                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
                    <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold">Faculty Roster</CardTitle>
                            <CardDescription className="text-xs font-medium">{teachers.length} instructors currently registered.</CardDescription>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    placeholder="Search faculty..." 
                                    className="w-full h-11 bg-slate-50 dark:bg-slate-950 rounded-xl border-none pl-12 text-sm font-medium focus-visible:ring-2 focus-visible:ring-indigo-600/30"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500 px-8">Teacher Name</TableHead>
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500">Contact</TableHead>
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500">Member Since</TableHead>
                                            <TableHead className="h-14 font-semibold text-xs text-slate-500 text-right px-8">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTeachers.map((teacher) => (
                                            <TableRow key={teacher.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                <TableCell className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                            {teacher.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white tracking-tight">{teacher.full_name}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium">Verified Instructor</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                        <Mail className="w-3 h-3" />
                                                        {teacher.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm">
                                                    {new Date(teacher.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            onClick={() => handleApprove(teacher.id, teacher.is_admin_approved)}
                                                            disabled={processingId === teacher.id}
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn(
                                                                "h-9 w-9 rounded-lg transition-all",
                                                                teacher.is_admin_approved ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 shadow-sm" : "text-amber-500 bg-amber-50 dark:bg-amber-950/20 shadow-sm"
                                                            )}
                                                        >
                                                            {processingId === teacher.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                                                              teacher.is_admin_approved ? <UserCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />
                                                            }
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDelete(teacher.id)}
                                                            disabled={processingId === teacher.id}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-lg text-rose-500 bg-rose-50 dark:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredTeachers.map((teacher) => (
                                    <Card key={teacher.id} className="p-6 border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 hover:shadow-lg transition-all rounded-2xl group text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-xl mx-auto shadow-sm">
                                            {teacher.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white leading-tight tracking-tight">{teacher.full_name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{teacher.email}</p>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 pt-2">
                                            <Button
                                                onClick={() => handleApprove(teacher.id, teacher.is_admin_approved)}
                                                disabled={processingId === teacher.id}
                                                size="sm"
                                                variant="ghost"
                                                className={cn(
                                                    "rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest gap-2",
                                                    teacher.is_admin_approved ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                                                )}
                                            >
                                                {teacher.is_admin_approved ? "Verified" : "Approve"}
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(teacher.id)}
                                                disabled={processingId === teacher.id}
                                                size="sm"
                                                variant="ghost"
                                                className="bg-rose-50 text-rose-600 dark:bg-rose-950/30 rounded-lg px-2 py-1 font-bold"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
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


