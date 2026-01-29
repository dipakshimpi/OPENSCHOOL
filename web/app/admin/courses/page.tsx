"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { BookOpen, Plus, Clock, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  created_at: string;
  profiles: {
    full_name: string;
  }
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <DashboardLayout title="Global Course Management" role="admin">
      <div className="space-y-6">
        <PageHeader
          title="All Courses"
          description="Manage and monitor all educational content across the platform."
          action={
            <Button className="bg-indigo-600 hover:bg-black shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Direct Add Course
            </Button>
          }
        />

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Platform Course Catalog
            </CardTitle>
            <CardDescription>Reviewing {courses.length} educational tracks.</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : courses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-bold text-slate-900">Course Title</TableHead>
                    <TableHead className="font-bold text-slate-900">Lead Instructor</TableHead>
                    <TableHead className="font-bold text-slate-900">Created On</TableHead>
                    <TableHead className="font-bold text-slate-900 text-right">Visibility</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-indigo-50/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{course.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter truncate max-w-[200px]">ID: {course.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {course.profiles?.full_name?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-600">{course.profiles?.full_name || "Unassigned"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs text-nowrap">
                        <div className="flex items-center gap-1.5 underline decoration-slate-200 underline-offset-4">
                          <Clock className="w-3 h-3" /> {new Date(course.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-0.5 text-[10px] font-black uppercase">
                          Public
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-20 text-center">
                <BookOpen className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Virtual Library is Empty</h3>
                <p className="text-slate-500 mb-6">No courses have been published to the platform yet.</p>
                <Button className="bg-indigo-600 hover:bg-black">Initialize First Course</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
