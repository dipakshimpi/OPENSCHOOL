"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { Users, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_approved: boolean;
  school_id: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminSchoolId, setAdminSchoolId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) {
        setAdminSchoolId(data.school_id);
      }
    } catch (error) {
      console.error("Failed to fetch admin profile", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        // Handle both older array format and new object format
        const userList = Array.isArray(data) ? data : (data.users || []);
        setUsers(userList);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, currentStatus: boolean) => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          is_approved: !currentStatus
        })
      });

      if (res.ok) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, is_approved: !currentStatus } : u
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
      alert("Please configure your school boundary in Settings first to generate a school ID.");
      return;
    }

    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          school_id: adminSchoolId
        })
      });

      if (res.ok) {
        setUsers(users.map(u =>
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

  return (
    <DashboardLayout title="User Management" role="admin">
      <div className="space-y-6">
        <PageHeader
          title="All Users"
          description="Manage teacher approvals and student accounts."
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
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-bold text-slate-900">Name</TableHead>
                    <TableHead className="font-bold text-slate-900">Role</TableHead>
                    <TableHead className="font-bold text-slate-900">Assignment</TableHead>
                    <TableHead className="font-bold text-slate-900">Status</TableHead>
                    <TableHead className="font-bold text-slate-900">Joined</TableHead>
                    <TableHead className="text-right font-bold text-slate-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-bold text-slate-900">{user.full_name || "Unknown Name"}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`uppercase text-[10px] tracking-widest ${user.role === 'teacher' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                          user.role === 'admin' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.school_id === adminSchoolId ? (
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px]">
                            My School
                          </Badge>
                        ) : user.school_id ? (
                          <div className="text-[10px] text-slate-400 italic">
                            Other School ({user.school_id.substring(0, 8)}...)
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 text-[10px]">
                            No School
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.is_approved ? (
                          <div className="flex items-center text-emerald-600 text-xs font-bold gap-1">
                            <CheckCircle className="w-4 h-4" /> Approved
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                            <Clock className="w-4 h-4" /> Pending
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2">
                        {user.role !== 'admin' && (
                          <>
                            {user.school_id !== adminSchoolId && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 px-3 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none"
                                onClick={() => handleClaim(user.id)}
                                disabled={processingId === user.id}
                              >
                                {processingId === user.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Claim"
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={user.is_approved ? "outline" : "default"}
                              className={`h-8 px-3 text-[10px] font-bold ${user.is_approved
                                ? "text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-none"}`}
                              onClick={() => handleApprove(user.id, user.is_approved)}
                              disabled={processingId === user.id}
                            >
                              {processingId === user.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : user.is_approved ? (
                                "Revoke"
                              ) : (
                                "Approve"
                              )}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center text-slate-500">
                No users found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
