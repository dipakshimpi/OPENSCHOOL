"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { Video, BookOpen, Upload } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherCourse {
  id: string;
  title: string;
  grade_level?: string;
  videoCount: number;
}

import { authedFetch } from "@/lib/api";

export default function TeacherCourses() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedFetch("/api/teacher/courses")
      .then(res => res.json())
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Courses" role="teacher">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <PageHeader
          title="Course Management"
          description="Manage your assigned courses and content."
          action={
            <Link href="/teacher/videos/upload">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </Link>
          }
        />

        {/* COURSES GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="border-2 border-slate-100 dark:border-slate-800 shadow-md hover:shadow-lg transition-all hover:border-indigo-200">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 shadow-sm">
                        <BookOpen className="h-6 w-6 text-indigo-700 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                        <p className="text-sm text-slate-500 font-medium">
                          {course.grade_level ? `Grade ${course.grade_level}` : 'General'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-600 text-white border-none shadow-sm">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Video className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {course.videoCount} videos uploaded
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link href={`/teacher/courses/${course.id}`}>
                      <Button variant="outline" className="w-full border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 font-bold">
                        Manage Content
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-white">No Courses Assigned</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              You haven&apos;t been assigned to any courses yet. Please contact the administrator.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
