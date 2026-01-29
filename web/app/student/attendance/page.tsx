"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Calendar, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceRecord {
  timestamp: string;
  status: string;
}

interface StudentStats {
  role: string;
  fullName: string;
  stats: {
    enrolledCount: number;
    avgProgress: number;
    attendanceRate: number;
  };
}

export default function StudentAttendance() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [history] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) setStats(await statsRes.json());

        // In a real app we'd have a specific student attendance endpoint
        // For now we fetch from the general stats or similar
      } catch (error) {
        console.error("Attendance fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const attendanceValue = stats?.stats?.attendanceRate || 0;

  return (
    <DashboardLayout title="Attendance" role="student">
      <div className="space-y-6">
        <PageHeader
          title="Attendance Records"
          description="View your verification history and statistics"
        />

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : (
            <>
              <MetricCard
                title="Overall Attendance"
                value={`${attendanceValue}%`}
                description="Cumulative score"
                icon={TrendingUp}
                iconColor="text-green-600"
                iconBg="bg-green-100"
              />
              <MetricCard
                title="Status"
                value={attendanceValue > 75 ? "Good" : "Warning"}
                description="Current standing"
                icon={CheckCircle2}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
              />
              <MetricCard
                title="Requirement"
                value="75%"
                description="Minimum needed"
                icon={Clock}
                iconColor="text-amber-600"
                iconBg="bg-amber-100"
              />
            </>
          )}
        </section>

        {/* ATTENDANCE RECORDS */}
        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Recent Verification Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : history.length > 0 ? (
                history.map((record, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border-2 border-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-50">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Verified Presence</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500">Verified</Badge>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 italic">
                  No recent attendance logs found in database.
                  <br />
                  Attendance will appear here once marked by your teacher.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

