"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Trash2, ShieldCheck, UserCheck, ShieldAlert, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_approved: boolean;
  is_admin_approved: boolean;
  is_teacher_approved: boolean;
  school_id: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const { status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminSchoolId, setAdminSchoolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAdminProfile = useCallback(async () => {
    try {
      const res = await authedFetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setAdminSchoolId(data.school_id);
      }
    } catch (error) {
      console.error("Failed to fetch admin profile", error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        const userList = Array.isArray(data) ? data : (data.users || []);
        setUsers(userList);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
      fetchAdminProfile();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchUsers, fetchAdminProfile]);

  const handleApprove = async (userId: string, currentStatus: boolean) => {
    setProcessingId(userId);
    try {
      const res = await authedFetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          is_approved: !currentStatus
        })
      });

      if (res.ok) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? {
            ...u,
            is_approved: !currentStatus,
            is_admin_approved: !currentStatus,
            is_teacher_approved: !currentStatus
          } : u
        ));
      }
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleClaim = async (userId: string) => {
    if (!adminSchoolId) {
       alert("Please configure your school ID in Settings first.");
       return;
    }

    setProcessingId(userId);
    try {
      const res = await authedFetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          school_id: adminSchoolId
        })
      });

      if (res.ok) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, school_id: adminSchoolId } : u
        ));
      }
    } catch (error) {
      console.error("Claim failed", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action is non-reversible.")) return;

    setProcessingId(userId);
    try {
      const res = await authedFetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="User Control" role="admin">
      <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4">
        
        {/* 🌟 CLEAN HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System User Management</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Coordinate accounts and school affiliations across the institutional network.</p>
            </div>
        </div>

        {/* 📋 MAIN TABLE */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Comprehensive User List</CardTitle>
              <CardDescription className="text-xs font-medium">Overview of all active and pending accounts.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="Filter users..." 
                className="w-full h-11 bg-slate-50 dark:bg-slate-950 rounded-xl border-none pl-12 text-sm font-medium focus-visible:ring-2 focus-visible:ring-indigo-600/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 space-y-4">
                 {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-none">
                    <TableRow className="border-none">
                      <TableHead className="h-14 font-semibold text-xs text-slate-500 px-8">Full Name</TableHead>
                      <TableHead className="h-14 font-semibold text-xs text-slate-500">Classification</TableHead>
                      <TableHead className="h-14 font-semibold text-xs text-slate-500">School ID</TableHead>
                      <TableHead className="h-14 font-semibold text-xs text-slate-500">Status</TableHead>
                      <TableHead className="h-14 font-semibold text-xs text-slate-500 text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <TableCell className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                {user.full_name?.charAt(0)}
                             </div>
                             <div>
                               <div className="font-bold text-slate-900 dark:text-white tracking-tight">{user.full_name || "Guest Account"}</div>
                               <div className="text-[10px] text-slate-400 font-medium">{user.email}</div>
                             </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border-none transition-all",
                            user.role === 'teacher' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' :
                            user.role === 'admin' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          )}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.school_id === adminSchoolId ? (
                            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-3 h-3" /> MATCHED
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold uppercase px-2 py-0.5 bg-slate-50 dark:bg-slate-900 rounded-md">
                                {user.school_id ? user.school_id.substring(0,8) + '...' : 'EXTERNAL'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                           {(user.role === 'student' ? (user.is_admin_approved && user.is_teacher_approved) : user.is_approved) ? (
                              <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 border-none rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-widest">Active</Badge>
                           ) : (
                              <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-950/30 border-none rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-widest">Review</Badge>
                           )}
                        </TableCell>
                        <TableCell className="text-right px-8">
                           <div className="flex items-center justify-end gap-2">
                              {user.role !== 'admin' && (
                                <>
                                  {user.school_id !== adminSchoolId && (
                                     <Button
                                       onClick={() => handleClaim(user.id)}
                                       disabled={processingId === user.id}
                                       variant="ghost"
                                       className="h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all font-sans"
                                     >
                                       Link
                                     </Button>
                                  )}
                                  <Button
                                    onClick={() => handleApprove(user.id, user.is_approved)}
                                    disabled={processingId === user.id}
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                       "h-9 w-9 rounded-lg transition-all",
                                       user.is_approved ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "text-amber-500 bg-amber-50 dark:bg-amber-950/20"
                                    )}
                                  >
                                    {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                                      user.is_approved ? <UserCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />
                                    }
                                  </Button>
                                  <Button
                                    onClick={() => handleDelete(user.id)}
                                    disabled={processingId === user.id}
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg text-rose-500 bg-rose-50 dark:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-all font-sans"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                No active records found in secondary partition.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
