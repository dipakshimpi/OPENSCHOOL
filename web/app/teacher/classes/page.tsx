"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherClass {
  id: string;
  title: string;
  schedule: string;
  time: string;
  studentCount: number;
  status: "Active" | "Scheduled";
}

const ClassItem = ({ class: cls }: { class: TeacherClass }) => (
  <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-slate-50/50 transition-colors">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-md bg-primary/10">
        <Clock className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-medium">{cls.title}</p>
        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {cls.schedule}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {cls.time}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {cls.studentCount} students
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {cls.status === "Active" ? (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Active
        </Badge>
      ) : (
        <Badge variant="outline">Scheduled</Badge>
      )}
      <Button size="sm" variant="outline">
        View Details
      </Button>
    </div>
  </div>
);

export default function TeacherClasses() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // NOTE: You will need to create this API endpoint
        const res = await fetch("/api/teacher/classes");
        if (!res.ok) throw new Error("Failed to fetch classes.");
        const data = await res.json();
        setClasses(data.classes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <DashboardLayout title="My Classes" role="teacher">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h2 className="text-lg font-semibold">Class Schedule</h2>
          <p className="text-sm text-gray-500">
            Manage your class periods and sessions
          </p>
        </div>

        {/* CLASSES LIST */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : error ? (
                <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">
                  <p>Error: {error}</p>
                </div>
              ) : classes.length > 0 ? (
                classes.map((cls) => <ClassItem key={cls.id} class={cls} />)
              ) : (
                <div className="text-center py-10 text-gray-500 bg-slate-50 rounded-lg">
                  <p>No upcoming classes found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
