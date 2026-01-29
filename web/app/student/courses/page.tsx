"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, BookOpen, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  grade: string;
  videoCount: number;
}

export default function StudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses))
      .catch(() => setError("Failed to load courses."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Courses" role="student">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h2 className="text-lg font-semibold">Enrolled Courses</h2>
          <p className="text-sm text-gray-500">
            Access course content and videos
          </p>
        </div>

        {/* COURSES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
          ) : error ? (
            <div className="col-span-full text-center py-10 text-red-600 bg-red-50 rounded-lg">
              <p>Error: {error}</p>
            </div>
          ) : (
            courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <p className="text-sm text-gray-500">{course.grade}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Enrolled
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Video className="h-4 w-4" />
                    <span>{course.videoCount} videos available</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Link href={`/student/courses/${course.id}`}>
                      <Button variant="outline" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        View Content
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
