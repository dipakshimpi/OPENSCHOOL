"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Users, UserPlus, GraduationCap } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <DashboardLayout title="Users" role="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <PageHeader
          title="All Users"
          description="Manage teachers and students"
          action={
            <div className="flex gap-2">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
              <Button
                variant="secondary"
                className="bg-green-100 hover:bg-green-200 text-green-900"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          }
        />

        {/* USERS TABLE */}
        <Card className="border-2 border-gray-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              User List
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <EmptyState
              icon={Users}
              title="No users added yet"
              description="Start building your school community by adding teachers and students to the system."
              action={{
                label: "Add Teacher",
                onClick: () => { },
              }}
            />
          </CardContent>

          {/* 
              FUTURE TABLE (FOR NEXT PHASE)
              -----------------------------
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <TableRow>
                    <TableCell>Ravi Kumar</TableCell>
                    <TableCell>ravi@school.com</TableCell>
                    <TableCell>
                      <Badge>Teacher</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            */}
        </Card>
      </div>
    </DashboardLayout>
  );
}
