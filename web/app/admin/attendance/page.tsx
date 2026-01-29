"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Calendar, Filter } from "lucide-react";

export default function AdminAttendancePage() {
  return (
    <DashboardLayout title="Attendance" role="admin">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h2 className="text-lg font-semibold">Attendance Overview</h2>
          <p className="text-sm text-gray-500">
            View attendance records submitted by teachers
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today’s Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">92%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classes Marked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">14</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geo Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <span className="font-medium text-green-600">
                  13 Valid
                </span>{" "}
                /{" "}
                <span className="font-medium text-red-600">
                  1 Invalid
                </span>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ATTENDANCE LOGS */}
        <Card className="border-2 border-gray-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              Attendance Logs
            </CardTitle>
            <Button variant="outline" size="sm" className="border-2">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Date
            </Button>
          </CardHeader>

          <CardContent className="pt-6">
            <EmptyState
              icon={Calendar}
              title="No attendance records available"
              description="Attendance logs will appear here once teachers start marking attendance for their classes."
            />
            {/*
              FUTURE TABLE (NEXT PHASE)
              -------------------------
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Students Present</TableHead>
                    <TableHead>Geo Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <TableRow>
                    <TableCell>12 Sep 2026</TableCell>
                    <TableCell>Mathematics</TableCell>
                    <TableCell>Mr. Sharma</TableCell>
                    <TableCell>28 / 30</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">
                        Verified
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
