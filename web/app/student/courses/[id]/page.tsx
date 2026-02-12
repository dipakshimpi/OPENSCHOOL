"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    PlayCircle,
    BookOpen,
    Clock,
    ChevronLeft,
    Video as VideoIcon,
    ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface VideoData {
    id: string;
    title: string;
    description: string;
    peertube_url: string;
    thumbnail_url: string | null;
    duration: number;
}

interface CourseData {
    id: string;
    title: string;
    description: string;
    profiles: { full_name: string } | null;
}

function formatDuration(seconds: number) {
    if (!seconds) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<CourseData | null>(null);
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourseAndVideos() {
            try {
                // Fetch course details
                const courseId = params.id;
                const [courseRes, videoRes] = await Promise.all([
                    fetch("/api/courses"),
                    fetch(`/api/videos?courseId=${courseId}`)
                ]);

                if (courseRes.ok) {
                    const allCourses = await courseRes.json();
                    const found = allCourses.find((c: CourseData) => c.id === courseId);
                    setCourse(found || null);
                }

                if (videoRes.ok) {
                    const videoData = await videoRes.json();
                    setVideos(videoData);
                }
            } catch (err) {
                console.error("Failed to load course details", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCourseAndVideos();
    }, [params.id]);

    if (loading) {
        return (
            <DashboardLayout title="Loading Course..." role="student">
                <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!course) {
        return (
            <DashboardLayout title="Not Found" role="student">
                <div className="text-center py-32 space-y-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-12 h-12 text-slate-300" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">Course Not Found</h2>
                    <p className="text-slate-500 max-w-md mx-auto">The course you are looking for might have been moved or doesn&apos;t exist.</p>
                    <Button onClick={() => router.push("/student/courses")} className="bg-indigo-600 hover:bg-indigo-700">
                        Back to Catalog
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={course.title} role="student">
            <div className="max-w-7xl mx-auto space-y-10 pb-20">
                {/* Header Section */}
                <div className="relative rounded-[2.5rem] bg-slate-900 p-8 md:p-16 overflow-hidden shadow-2xl text-white">
                    <div className="relative z-10 space-y-6 max-w-3xl">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/student/courses")}
                            className="bg-white/10 text-white hover:bg-white/20 border-none px-4 py-2 h-auto text-xs font-black tracking-widest uppercase mb-4"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Catalog
                        </Button>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            {course.title}
                        </h2>
                        <p className="text-slate-300 text-lg font-medium opacity-90 leading-relaxed">
                            {course.description || "Master this subject with our structured curriculum and expert-led video instructions."}
                        </p>
                        <div className="flex flex-wrap gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Instructor</p>
                                    <p className="font-bold">{course.profiles?.full_name || "Faculty Member"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <VideoIcon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Curriculum</p>
                                    <p className="font-bold">{videos.length} Video Lessons</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Visual Decor */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Lesson Grid */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-glow" />
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">Start Learning</h3>
                    </div>

                    {videos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {videos.map((video, idx) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Link href={`/student/videos/${video.id}`}>
                                        <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 h-full flex flex-col">
                                            <div className="h-44 bg-slate-950 relative flex items-center justify-center group-hover:bg-slate-900 transition-colors overflow-hidden">
                                                {video.thumbnail_url ? (
                                                    <Image
                                                        src={video.thumbnail_url}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-80"
                                                    />
                                                ) : (
                                                    <PlayCircle className="w-16 h-16 text-white/30 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-500" />
                                                )}
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                    <PlayCircle className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300" />
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                                    <Badge className="bg-indigo-600 text-white border-none font-black text-[10px] tracking-widest px-3">
                                                        LESSON {idx + 1}
                                                    </Badge>
                                                    {video.duration > 0 && (
                                                        <span className="text-[10px] font-bold text-white/90 flex items-center gap-1 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                                                            <Clock className="w-3 h-3" /> {formatDuration(video.duration)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-8 flex-1 flex flex-col">
                                                <h4 className="font-black text-xl text-slate-800 dark:text-white mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                    {video.title}
                                                </h4>
                                                <p className="text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed mb-6">
                                                    {video.description || "Learn the key objectives and practical applications for this session."}
                                                </p>
                                                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                                    Watch Lecture <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                            <VideoIcon className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                            <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Curriculum Pending</h4>
                            <p className="text-slate-400 font-medium">The instructor hasn&apos;t uploaded any video lessons for this course yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
