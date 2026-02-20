"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { Users, Loader2, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

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
      } else {
        alert("Failed to update user status");
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
      } else {
        alert("Failed to claim user");
      }
    } catch (error) {
      console.error("Claim failed", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user profile? This action cannot be undone.")) return;

    setProcessingId(userId);
    try {
      const res = await authedFetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        const err = await res.json();
        alert("Failed to delete user: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout title="User Management" role="admin">
      <div className="space-y-6">
        <PageHeader
          title="All Users"
          description="Manage teacher approvals and student accounts across the platform."
        />

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Users className="h-5 w-5 text-indigo-600" />
              Registered Users
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-slate-500">Scanning platform registry...</p>
              </div>
            ) : users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-bold text-slate-900">User Identification</TableHead>
                    <TableHead className="font-bold text-slate-900">Role</TableHead>
                    <TableHead className="font-bold text-slate-900">School Scope</TableHead>
                    <TableHead className="font-bold text-slate-900">Status</TableHead>
                    <TableHead className="font-bold text-slate-900">Access date</TableHead>
                    <TableHead className="text-right font-bold text-slate-900">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 leading-tight">{user.full_name || "New Registry"}</span>
                          <span className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`uppercase text-[10px] font-black tracking-[0.1em] px-2 py-0.5 ${user.role === 'teacher' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          user.role === 'admin' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.school_id === adminSchoolId ? (
                          <Badge className="bg-indigo-600 text-white border-none text-[9px] font-bold uppercase tracking-wider">
                            Verified Branch
                          </Badge>
                        ) : user.school_id ? (
                          <div className="text-[10px] text-slate-400 font-medium italic">
                            Org Reference: {user.school_id.substring(0, 8)}...
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[9px] font-bold uppercase tracking-wider">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {(user.role === 'student' ? (user.is_admin_approved && user.is_teacher_approved) : user.is_approved) ? (
                          <div className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ACTIVE
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-500 text-[10px] font-black uppercase tracking-widest gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-400" /> PENDING
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 text-[10px] font-bold">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role !== 'admin' && (
                            <>
                              {user.school_id !== adminSchoolId && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 px-2.5 text-[10px] font-black tracking-tighter uppercase transition-all"
                                  onClick={() => handleClaim(user.id)}
                                  disabled={processingId === user.id}
                                >
                                  Claim
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant={user.is_approved ? "outline" : "default"}
                                className={`h-7 px-3 text-[10px] font-black tracking-tighter uppercase transition-all ${user.is_approved
                                  ? "text-rose-600 hover:text-white hover:bg-rose-600 border-rose-200"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                                onClick={() => handleApprove(user.id, user.is_approved)}
                                disabled={processingId === user.id}
                              >
                                {user.is_approved ? "Revoke" : "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => handleDelete(user.id)}
                                disabled={processingId === user.id}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-20 text-center text-slate-400 italic">
                No users found in the system registry.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
