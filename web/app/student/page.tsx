"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AcademicCapIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton"; 
import Link from "next/link";
import { AnnouncementsWidget } from "@/components/common/AnnouncementsWidget";

interface EnrolledCourse {
    id: string;
    progress: number;
    courses: {
        id: string; // Assuming course has an ID for linking
        title: string;
        profiles: { full_name: string } | null;
    }
}

interface DashboardData {
    fullName: string;
    enrolledCourses: EnrolledCourse[];
    stats: { avgProgress: number };
}

export default function StudentDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/stats");
                if (!res.ok) {
                    throw new Error(`Failed to fetch stats: ${res.statusText}`);
                }
                const json = await res.json();
                setData(json);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                console.error("Stats fetch error:", errorMessage);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const courses = data?.enrolledCourses || [];
    const stats = data?.stats || { avgProgress: 0 };
    const firstName = data?.fullName?.split(" ")[0] || "Student";

    return (
        <DashboardLayout role="student" title="My Learning">
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-8 md:p-12 mb-8 shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <Badge className="bg-indigo-500 hover:bg-indigo-600 mb-4 px-3 py-1">Continue Learning</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {loading ? <Skeleton className="h-10 w-64 bg-slate-700" /> : `You're making great progress, ${firstName}!`}
                    </h2>
                    {!loading && !error && (
                        <p className="text-slate-300 text-lg mb-8">
                            You&apos;ve completed an average of {stats.avgProgress}% across your courses. Keep up the momentum!
                        </p>
                    )}
                    <Link href="/student/courses">
                        <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 shadow-xl hover:scale-105 transition-transform">
                            <AcademicCapIcon className="w-5 h-5 mr-2" />
                            Browse More Courses
                        </Button>
                    </Link>
                </div>
                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3" />
            </div>

            {/* 🔥 CAMPUS UPDATES / ANNOUNCEMENTS */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                    <h3 className="text-xl font-bold text-slate-800">Campus Updates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AnnouncementsWidget />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Enrolled Courses</h3>
                    <Link href="/student/videos">
                        <Button variant="outline" size="sm" className="border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                            <VideoCameraIcon className="w-4 h-4 mr-2" />
                            Recent Lessons
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)
                    ) : error ? (
                        <div className="col-span-full py-12 text-center bg-red-50 text-red-700 rounded-2xl border-2 border-dashed border-red-200">
                            <h3 className="text-lg font-semibold">Could not load courses</h3>
                            <p>{error}</p>
                        </div>
                    ) : courses.length > 0 ? (
                        courses.map((enrollment) => {
                            const course = enrollment.courses;
                            return (
                                <Card key={enrollment.id} className="border-none shadow-card hover:shadow-card-hover transition-all group cursor-pointer overflow-hidden bg-white/50 backdrop-blur-md border border-white/20">
                                    <div className={`h-32 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <Badge variant="secondary" className="bg-white/90 text-slate-900 border-none backdrop-blur-sm shadow-sm">
                                                {course.profiles?.full_name || "Instructor"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Link href={`/student/courses/${course.id}`}>
                                        <CardContent className="p-4 pt-4">
                                            <h4 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">{course.title}</h4>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-medium text-slate-600">
                                                        <span>Progress</span>
                                                        <span>{enrollment.progress}%</span>
                                                    </div>
                                                    <Progress value={enrollment.progress} className="h-2" />
                                                </div>
                                                <div className="w-full text-indigo-600 hover:text-indigo-700 p-0 h-auto justify-start font-bold text-sm">
                                                    Continue Study →
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <AcademicCapIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900">Enrolled in 0 courses</h3>
                            <p className="text-slate-500">Pick a course to start learning!</p>
                        </div>
                    )}
                </div>
            </div>

        </DashboardLayout>
    );
}
