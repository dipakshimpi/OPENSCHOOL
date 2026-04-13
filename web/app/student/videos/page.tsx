"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Video,
    PlayCircle,
    GraduationCap,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { authedFetch } from "@/lib/api";

interface Course {
    id: string;
    title: string;
    description: string;
    profiles: { full_name: string };
}

interface Video {
    id: string;
    title: string;
    course_id: string;
    thumbnail_url: string | null;
    duration: number;
}

export default function StudentVideosPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch enrolled courses first
                const statsRes = await authedFetch("/api/stats");
                if (!statsRes.ok) throw new Error("Failed to fetch stats");
                const statsData = await statsRes.json();

                if (statsData) {
                    const enrolledCourses = statsData.enrolledCourses || [];
                    const enrolled = Array.isArray(enrolledCourses)
                        ? enrolledCourses.map((e: { courses: Course }) => e.courses).filter(Boolean)
                        : [];
                    setCourses(enrolled);
                    console.log(`[StudentVideos] Found ${enrolled.length} enrolled courses`);

                    // Fetch all videos
                    const videoRes = await authedFetch("/api/videos");
                    if (videoRes.ok) {
                        const videoData = await videoRes.json();
                        const videoArray = Array.isArray(videoData) ? videoData : [];
                        setVideos(videoArray);
                        console.log(`[StudentVideos] Loaded ${videoArray.length} videos`);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch student data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <DashboardLayout role="student" title="Video Library">
            <div className="space-y-8">
                {/* Header Welcome */}
                <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <Badge className="bg-indigo-500/30 text-indigo-100 border-indigo-400/30 mb-4 px-3 py-1 backdrop-blur-sm">Video Lessons</Badge>
                        <h2 className="text-3xl font-bold mb-3">Watch & Learn</h2>
                        <p className="text-indigo-200">Access video content for all your enrolled courses in one place.</p>
                    </div>
                    <Video className="absolute right-0 bottom-0 w-64 h-64 text-white/5 -mb-12 -mr-12" />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="space-y-12">
                        {courses.map(course => {
                            const safeVideos = Array.isArray(videos) ? videos : [];
                            const courseVideos = safeVideos.filter(v => v.course_id === course.id);
                            return (
                                <section key={course.id} className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">{course.title}</h3>
                                            <p className="text-sm text-slate-500">By {course.profiles?.full_name}</p>
                                        </div>
                                        <Badge variant="outline" className="text-slate-500 bg-slate-50 px-3 py-1">
                                            {courseVideos.length} Lessons
                                        </Badge>
                                    </div>

                                    {courseVideos.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {courseVideos.map(video => (
                                                <Link key={video.id} href={`/student/videos/${video.id}`}>
                                                    <Card className="group border-none shadow-md hover:shadow-card-hover transition-all overflow-hidden bg-white hover:scale-[1.02] cursor-pointer ring-1 ring-slate-200">
                                                        <div className="h-32 bg-slate-800 flex items-center justify-center relative overflow-hidden">
                                                            {video.thumbnail_url ? (
                                                                <Image
                                                                    src={video.thumbnail_url}
                                                                    alt={video.title}
                                                                    fill
                                                                    className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                                                                />
                                                            ) : (
                                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
                                                                    <PlayCircle className="w-12 h-12 text-white/20 group-hover:scale-125 group-hover:text-white/50 transition-all duration-300" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                                <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
                                                            </div>
                                                        </div>
                                                        <CardContent className="p-4 flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{video.title}</h4>
                                                                <p className="text-xs text-slate-400 mt-1">Video Lesson</p>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                            <p className="text-slate-500">No videos available for this course yet.</p>
                                        </div>
                                    )}
                                </section>
                            );
                        })}

                        {/* 🚀 Diagnostics Section for Integration Testing */}
                        <section className="space-y-6 pt-12">
                            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/30 p-4 rounded-xl">
                                <div>
                                    <h3 className="text-xl font-bold text-rose-900 flex items-center gap-2">
                                        System Diagnostics
                                    </h3>
                                    <p className="text-sm text-rose-600 font-medium">Verified Integration Test Media</p>
                                </div>
                                <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                                    1 Test Module
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videos.filter(v => v.id === 'demo').map(video => (
                                    <Link key={video.id} href={`/student/videos/${video.id}`}>
                                        <Card className="group border-none shadow-md hover:shadow-card-hover transition-all overflow-hidden bg-white hover:scale-[1.02] cursor-pointer ring-1 ring-slate-200">
                                            <div className="h-32 bg-slate-800 flex items-center justify-center relative overflow-hidden">
                                                {video.thumbnail_url ? (
                                                    <Image
                                                        src={video.thumbnail_url}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
                                                        <PlayCircle className="w-12 h-12 text-white/20 group-hover:scale-125 group-hover:text-white/50 transition-all duration-300" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                    <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
                                                </div>
                                            </div>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">{video.title}</h4>
                                                    <p className="text-xs text-slate-400 mt-1">Diagnostic Stream</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-500 transition-colors" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
                        <GraduationCap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Not Enrolled in Any Courses</h3>
                        <p className="text-slate-500 mb-6 font-medium">Head over to the courses catalog to get started!</p>
                        <Link href="/student/courses">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                Browse Catalog
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
