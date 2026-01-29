"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPinIcon,
    PlusIcon,
    ClipboardDocumentCheckIcon,
    BookOpenIcon,
    UsersIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementsWidget } from "@/components/common/AnnouncementsWidget";

interface TeacherStats {
    fullName: string;
    stats: {
        activeCourses: number;
        totalStudents: number;
        attendanceRate: number;
    }
}

interface Course {
    id: string;
    title: string;
}

export default function TeacherDashboard() {
    const [data, setData] = useState<TeacherStats | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, coursesRes] = await Promise.all([
                    fetch("/api/stats"),
                    fetch("/api/courses")
                ]);

                if (statsRes.ok) setData(await statsRes.json());
                if (coursesRes.ok) setCourses(await coursesRes.json());
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const stats = data?.stats || { activeCourses: 0, totalStudents: 0, attendanceRate: 100 };

    return (
        <DashboardLayout role="teacher" title="Teacher Workspace">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">
                        {loading ? <Skeleton className="h-9 w-64 bg-white/20" /> : `Good Day, ${data?.fullName || "Teacher"}`}
                    </h2>
                    <p className="text-indigo-100 max-w-xl">
                        You have {stats.activeCourses} active courses and {stats.totalStudents} students currently enrolled.
                    </p>
                    <div className="mt-6 flex gap-3">
                        <Link href="/teacher/courses">
                            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50 border-none px-6">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Manage Courses
                            </Button>
                        </Link>
                        <Link href="/teacher/attendance">
                            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white px-6">
                                <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                                Take Attendance
                            </Button>
                        </Link>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
            </div>

            {/* 🔥 FACULTY NOTICES / ANNOUNCEMENTS */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-purple-600 rounded-full" />
                    <h3 className="text-xl font-bold text-slate-800">Faculty Notices</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AnnouncementsWidget role="teacher" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Courses List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">Your Active Courses</h3>
                        <Link href="/teacher/courses">
                            <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50">View All</Button>
                        </Link>
                    </div>

                    {loading ? (
                        [1, 2].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)
                    ) : courses.length > 0 ? (
                        courses.slice(0, 3).map((course) => (
                            <Card key={course.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border border-white/20">
                                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-5">
                                        <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <BookOpenIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                                            <div className="flex items-center gap-6 text-sm text-slate-500 mt-1.5">
                                                <span className="flex items-center gap-1.5"><UsersIcon className="w-4 h-4" /> Enrolled Students</span>
                                                <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> Academic Block</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium px-3 py-1">Active Now</Badge>
                                        <Link href={`/teacher/videos?courseId=${course.id}`}>
                                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-indigo-600 group-hover:translate-x-1 transition-transform">
                                                View Lessons →
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="py-16 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <BookOpenIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h4 className="font-bold text-slate-800">No courses published yet</h4>
                            <p className="text-slate-500 text-sm mb-6">Create your first course to start teaching!</p>
                            <Link href="/teacher/courses">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg">Create Course</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Performance Stats */}
                <div className="space-y-6">
                    <Card className="border-none shadow-2xl bg-slate-900 text-white overflow-hidden p-6 ring-1 ring-white/10">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-lg">Class Performance</CardTitle>
                            <CardDescription className="text-slate-400">Real-time attendance aggregate</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="flex items-baseline gap-2 mb-4">
                                <div className="text-5xl font-black text-white">{stats.attendanceRate}%</div>
                                <div className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" /> Optimal
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner font-mono">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${stats.attendanceRate}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-4 text-center uppercase tracking-[0.2em] font-bold">
                                System Health Status: Positive
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/teacher/videos" className="contents">
                            <Button variant="outline" className="h-32 flex flex-col items-center justify-center gap-3 border-2 border-slate-100 bg-white/50 backdrop-blur-sm hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-xl transition-all group">
                                <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <BookOpenIcon className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                                </div>
                                <span className="font-bold text-slate-600 text-sm">Lesson<br />Library</span>
                            </Button>
                        </Link>
                        <Link href="/teacher/attendance" className="contents">
                            <Button variant="outline" className="h-32 flex flex-col items-center justify-center gap-3 border-2 border-slate-100 bg-white/50 backdrop-blur-sm hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-xl transition-all group">
                                <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-purple-600 group-hover:text-white" />
                                </div>
                                <span className="font-bold text-slate-600 text-sm">Geo<br />Verify</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function ArrowTrendingUpIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307L20.25 7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.675 7.5H20.25V9.075" />
        </svg>
    )
}

